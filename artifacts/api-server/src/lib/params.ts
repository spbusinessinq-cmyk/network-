/**
 * Normalizes a route/query param that Express may type as `string | string[]`
 * down to a single `string | undefined`.
 */
export function takeFirst(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Convenience wrapper: normalize + parseInt in one call.
 * Returns NaN if value is undefined (same contract as parseInt(undefined)).
 */
export function takeFirstInt(value: string | string[] | undefined): number {
  return parseInt(takeFirst(value) ?? "", 10);
}
