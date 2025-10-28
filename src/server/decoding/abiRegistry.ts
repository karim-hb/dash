import fs from 'fs';
import path from 'path';
import { getSignaturesCacheCollection } from '@/lib/db/mongo';

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

      // Load selectors mapping
      const selectorsPath = path.join(process.cwd(), 'src/server/catalog/selectors.json');
      if (fs.existsSync(selectorsPath)) {
        const selectorsData = JSON.parse(fs.readFileSync(selectorsPath, 'utf8'));
        // Process selectors if needed
      }

      console.log(`✅ Loaded ${this.signatures.size} signatures`);
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
