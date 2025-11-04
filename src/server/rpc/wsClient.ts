import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { config } from '@/lib/config';
import { sleep } from '@/lib/util/time';
import { logErrorWithConsole, logWarningWithConsole } from '../utils/errorLogger';

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
  method?: string; // Store method name for error logging
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
        const j = this.jwtSecret;
        if (j && j.startsWith('0x')) {
          this.jwtSecret = j.slice(2);
        }
      } catch (error) {
        logWarningWithConsole(error, 'JWT load');
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
          logErrorWithConsole(error, 'WebSocket connection');
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

    // Store method name for error logging
    (request as any).method = method;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        const timeoutError = new Error(`RPC timeout: ${method}`);
        logErrorWithConsole(timeoutError, `RPC timeout ${method}`);
        reject(timeoutError);
      }, timeoutMs);

      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout,
        method
      });

      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(request));
        } else {
          clearTimeout(timeout);
          const error = new Error('WebSocket not connected');
          logErrorWithConsole(error, `RPC ${method}`);
          reject(error);
        }
      } catch (error) {
        clearTimeout(timeout);
        logErrorWithConsole(error, `RPC ${method}`);
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

  // Subscribe to logs with filter
  async subscribeLogs(filter: any, callback: (data: any) => void): Promise<string> {
    if (!this.connected) {
      await this.connect();
    }
    const subscriptionId = await this.rpc('eth_subscribe', ['logs', filter]);
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
        const requestId = message.id;
        this.pendingRequests.delete(requestId);
        clearTimeout(pending.timeout);

        if (message.error) {
          // Get method name from pending request
          const methodName = pending.method || 'unknown';
          
          // Log RPC errors to serverError.log
          const error = new Error(`RPC Error: ${message.error.message}`);
          (error as any).code = message.error.code;
          (error as any).rpcId = requestId;
          (error as any).method = methodName;
          
          // Check if this is an expected execution reverted error (don't spam logs for expected errors)
          const isExecutionReverted = message.error.code === -32000 || 
                                     message.error.code === -32001 ||
                                     message.error.message?.includes('execution reverted') ||
                                     message.error.message?.includes('execution revert');
          
          if (isExecutionReverted) {
            // Still log but as warning for expected errors (less verbose)
            logWarningWithConsole(error, `RPC ${methodName}`);
          } else {
            // Log unexpected errors
            logErrorWithConsole(error, `RPC ${methodName}`);
          }
          
          pending.reject(error);
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
      logErrorWithConsole(error, 'WebSocket message parsing');
    }
  }

  // Schedule reconnect with exponential backoff
  private scheduleReconnect(): void {
    setTimeout(() => {
      this.connect().catch((error) => {
        logWarningWithConsole(error, 'WebSocket reconnection');
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
