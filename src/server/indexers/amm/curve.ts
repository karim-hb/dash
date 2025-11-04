import { config } from '@/lib/config';

export async function startCurveIndexer(): Promise<void> {
  if (!config.ENABLE_CURVE) return;
  // Placeholder: implement Curve registry discovery in phase 2
}


