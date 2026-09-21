import { CHECK_INTERVAL_MS, MAX_TIMEOUT_MS } from "./variables.ts";

export function checkIntervalSetup() {
  if (
    !Number.isFinite(CHECK_INTERVAL_MS) ||
    CHECK_INTERVAL_MS < 1 ||
    CHECK_INTERVAL_MS > MAX_TIMEOUT_MS
  ) {
    throw new Error(
      `CHECK_INTERVAL_MS must be between 1 and ${MAX_TIMEOUT_MS} milliseconds.`,
    );
  }
}
