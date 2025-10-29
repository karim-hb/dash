import fs from 'fs';
import path from 'path';
import { getSignaturesCacheCollection } from '@/lib/db/mongo';
import { getConfig } from '@/lib/config';

// ABI Registry for managing function signatures and caching
export class AbiRegistry {
  private signatures: Map<string, string> = new Map();
  private reverseSignatures: Map<string, string> = new Map();
  private loaded = false;

  constructor() {
    this.loadSignatures();
  }

  // Load signatures from JSON files
  private loadSignatures(): void {
    if (this.loaded) return;

    try {
      // Load main signatures
      const signaturesPath = path.join(process.cwd(), 'src/server/catalog/signatures.json');
      if (fs.existsSync(signaturesPath)) {
        const signaturesData = JSON.parse(fs.readFileSync(signaturesPath, 'utf8'));
        for (const [selector, signature] of Object.entries(signaturesData)) {
          const sel = selector.toLowerCase();
          this.signatures.set(sel, signature as string);
          this.reverseSignatures.set(signature as string, sel);
        }
      }

      // Load 4byte cache as additional signatures
      const cachePath = path.join(process.cwd(), 'src/server/catalog/4byte_cache.json');
      if (fs.existsSync(cachePath)) {
        const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        for (const [selector, signature] of Object.entries(cacheData)) {
          const sel = selector.toLowerCase();
          if (!this.signatures.has(sel)) { // Don't overwrite existing signatures
            this.signatures.set(sel, signature as string);
            this.reverseSignatures.set(signature as string, sel);
          }
        }
      }

      console.log(`✅ Loaded ${this.signatures.size} signatures (main + 4byte cache)`);
      this.loaded = true;
    } catch (error) {
      console.error('Failed to load signatures:', error);
    }
  }

  // Resolve signature from selector
  resolveSignature(selector: string): string | null {
    const sel = selector.toLowerCase();
    return this.signatures.get(sel) || null;
  }

  // Resolve via 4byte.directory if enabled and not present
  async resolveSignatureRemote(selector: string): Promise<string | null> {
    try {
      const { ENABLE_4BYTE } = getConfig();
      if (!ENABLE_4BYTE) return null;
      const sel = selector.toLowerCase().startsWith('0x') ? selector.toLowerCase() : `0x${selector.toLowerCase()}`;
      const url = `https://www.4byte.directory/api/v1/signatures/?hex_signature=${sel}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const results = data?.results || [];
      if (Array.isArray(results) && results.length > 0) {
        // Use the most common signature (first returned is fine)
        const signature = results[0]?.text_signature as string;
        if (signature) {
          await this.cacheDiscoveredSignature(sel.replace('0x', ''), signature);
          return signature;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  // Get selector from signature
  getSelector(signature: string): string | null {
    return this.reverseSignatures.get(signature) || null;
  }

  // Cache discovered signature (to MongoDB and optionally JSON)
  async cacheDiscoveredSignature(selector: string, signature: string): Promise<void> {
    const sel = selector.toLowerCase();
    const sig = signature.trim();

    if (!sel || !sig) return;

    // Don't overwrite existing signatures
    if (this.signatures.has(sel)) return;

    try {
      // Add to in-memory cache
      this.signatures.set(sel, sig);
      this.reverseSignatures.set(sig, sel);

      // Persist to MongoDB (optional)
      if (process.env.PERSIST_TO_MONGO === 'true') {
        const collection = getSignaturesCacheCollection();
        await collection.updateOne(
          { selector: sel },
          { $set: { selector: sel, signature: sig } },
          { upsert: true }
        );
      }

      // Optionally save to JSON file as backup
      this.saveToJsonFile(sel, sig);
    } catch (error) {
      console.error('Failed to cache signature:', error);
    }
  }

  // Load cached signatures from MongoDB
  async loadCachedSignatures(): Promise<void> {
    if (process.env.PERSIST_TO_MONGO !== 'true') {
      // Skip when persistence disabled
      return;
    }
    try {
      const collection = getSignaturesCacheCollection();
      const cached = await collection.find({}).toArray();

      for (const item of cached) {
        const sel = item.selector.toLowerCase();
        const sig = item.signature.trim();

        // Only add if not already in main signatures
        if (!this.signatures.has(sel)) {
          this.signatures.set(sel, sig);
          this.reverseSignatures.set(sig, sel);
        }
      }

      console.log(`✅ Loaded ${cached.length} cached signatures from MongoDB`);
    } catch (error) {
      console.error('Failed to load cached signatures:', error);
    }
  }

  // Save to JSON file as backup
  private saveToJsonFile(selector: string, signature: string): void {
    try {
      const cachePath = path.join(process.cwd(), 'src/server/catalog/4byte_cache.json');

      let cache: Record<string, string> = {};
      if (fs.existsSync(cachePath)) {
        cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      }

      cache[selector] = signature;
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    } catch (error) {
      // Ignore file write errors
    }
  }

  // Get all signatures (for debugging)
  getAllSignatures(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [sel, sig] of this.signatures) {
      result[sel] = sig;
    }
    return result;
  }

  // Get signature count
  getSignatureCount(): number {
    return this.signatures.size;
  }
}

// Global registry instance
let registry: AbiRegistry | null = null;

export function getAbiRegistry(): AbiRegistry {
  if (!registry) {
    registry = new AbiRegistry();
  }
  return registry;
}

// Initialize registry with cached signatures
export async function initAbiRegistry(): Promise<void> {
  const reg = getAbiRegistry();
  await reg.loadCachedSignatures();
}
