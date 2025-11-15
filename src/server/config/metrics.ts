import { type MetricSettings } from "../aaveMetrics";

function numberFromEnv(name: string, fallback: number, env: NodeJS.ProcessEnv = process.env): number {
  const raw = env[name];
  if (raw === undefined) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadMetricSettings(env: NodeJS.ProcessEnv = process.env): MetricSettings {
  return {
    defaults: {
      liquiditySafetyBufferBps: numberFromEnv("LIQUIDITY_SAFETY_BUFFER_BPS", 1000, env),
      fallbackConfidencePenalty: numberFromEnv("FALLBACK_CONFIDENCE_PENALTY", 0.15, env),
      predictiveEwmaAlpha: numberFromEnv("PREDICTIVE_EWMA_ALPHA", 0.3, env),
      predictiveRecoveryTargetPct: numberFromEnv("PREDICTIVE_RECOVERY_TARGET_PCT", 80, env),
      highUtilizationThresholdPct: numberFromEnv("HIGH_UTILIZATION_THRESHOLD_PCT", 85, env),
      liquidityShockThresholdPct: numberFromEnv("LIQUIDITY_SHOCK_THRESHOLD_PCT", 5, env)
    }
  };
}

export function getMetricSettings(): MetricSettings {
  return loadMetricSettings();
}

