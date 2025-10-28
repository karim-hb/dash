import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { config } from '@/lib/config';
import { sleep } from '@/lib/util/time';

interface RpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: any[];
}

interface RpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

// WebSocket JSON-RPC client with concurrent request support
export class WsJsonRpc extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private jwtSecret: string | null = null;
  private connected = false;
  private connecting = false;
  private reconnectDelay = 2000;
  private maxReconnectDelay = 30000;
  private requestId = 1;
  private pendingRequests = new Map<number, PendingRequest>();
  private subscriptions = new Map<string, (data: any) => void>();

  constructor(url: string, jwtPath?: string) {
    super();
    this.url = url;

    // Load JWT if provided
    if (jwtPath) {
      try {
        const fs = require('fs');
        this.jwtSecret = fs.readFileSync(jwtPath, 'utf8').trim();
        if (this.jwtSecret.startsWith('0x')) {
          this.jwtSecret = this.jwtSecret.slice(2);
        }
      } catch (error) {
        console.warn('Failed to load JWT:', error);
      }
    }
  }

  // Connect to WebSocket
  async connect(): Promise<void> {
    if (this.connected || this.connecting) return;

    this.connecting = true;

    try {
      // Create JWT token if available
      let headers: Record<string, string> = {};
      if (this.jwtSecret) {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ iat: Math.floor(Date.now() / 1000) }, Buffer.from(this.jwtSecret, 'hex'), {
          algorithm: 'HS256'
        });
        headers['Authorization'] = `Bearer ${token}`;
      }

      this.ws = new WebSocket(this.url, { headers });

      return new Promise((resolve, reject) => {
        if (!this.ws) return reject(new Error('WebSocket creation failed'));

        const timeout = setTimeout(() => {
          this.ws?.close();
          reject(new Error('Connection timeout'));
        }, 10000);

        this.ws.on('open', () => {
          clearTimeout(timeout);
          this.connected = true;
          this.connecting = false;
          this.emit('connected');
          console.log('✅ WebSocket connected');
          resolve();
        });

        this.ws.on('message', (data: Buffer) => {
          this.handleMessage(data);
        });

        this.ws.on('error', (error) => {
          clearTimeout(timeout);
          this.connecting = false;
          console.error('WebSocket error:', error);
          reject(error);
        });

        this.ws.on('close', () => {
          this.connected = false;
          this.connecting = false;
          this.emit('disconnected');
          console.log('WebSocket disconnected, attempting reconnect...');
          this.scheduleReconnect();
        });
      });
    } catch (error) {
      this.connecting = false;
      throw error;
    }
  }

  // Send RPC request with timeout
  async rpc(method: string, params: any[] = [], timeoutMs: number = 10000): Promise<any> {
    if (!this.connected) {
      await this.connect();
    }

    const id = this.requestId++;
    const request: RpcRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`RPC timeout: ${method}`));
      }, timeoutMs);

      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout
      });

      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(request));
        } else {
          clearTimeout(timeout);
          reject(new Error('WebSocket not connected'));
        }
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  // Subscribe to events
  async subscribe(event: string, callback: (data: any) => void): Promise<string> {
    if (!this.connected) {
      await this.connect();
    }

    const subscriptionId = await this.rpc('eth_subscribe', [event]);
    this.subscriptions.set(subscriptionId, callback);
    return subscriptionId;
  }

  // Unsubscribe from events
  async unsubscribe(subscriptionId: string): Promise<boolean> {
    const result = await this.rpc('eth_unsubscribe', [subscriptionId]);
    this.subscriptions.delete(subscriptionId);
    return result;
  }

  // Handle incoming messages
  private handleMessage(data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());

      // Handle RPC responses
      if (message.id && this.pendingRequests.has(message.id)) {
        const pending = this.pendingRequests.get(message.id)!;
        this.pendingRequests.delete(message.id);
        clearTimeout(pending.timeout);

        if (message.error) {
          pending.reject(new Error(`RPC Error: ${message.error.message}`));
        } else {
          pending.resolve(message.result);
        }
        return;
      }

      // Handle subscriptions
      if (message.method === 'eth_subscription') {
        const params = message.params;
        if (params && params.subscription) {
          const callback = this.subscriptions.get(params.subscription);
          if (callback) {
            callback(params.result);
          }
        }
      }

      // Emit for external listeners
      this.emit('message', message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  // Schedule reconnect with exponential backoff
  private scheduleReconnect(): void {
    setTimeout(() => {
      this.connect().catch(() => {
        // Reconnect failed, will retry again
      });
    }, this.reconnectDelay);

    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
  }

  // Close connection
  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;

    // Reject all pending requests
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('WebSocket closed'));
    }
    this.pendingRequests.clear();
  }

  // Check if connected
  isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }
}

// Global WebSocket client instance
let wsClient: WsJsonRpc | null = null;

export function getWsClient(): WsJsonRpc {
  if (!wsClient) {
    wsClient = new WsJsonRpc(config.EXECUTION_WS_URL, config.JWT_PATH);
  }
  return wsClient;
}

export function closeWsClient(): void {
  if (wsClient) {
    wsClient.close();
    wsClient = null;
  }
}
