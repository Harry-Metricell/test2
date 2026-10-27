/** Image-rich reports need more verification time, but never an unbounded wait. */
export function reportVerificationTimeout(evidenceImages) {
  if (!Number.isSafeInteger(evidenceImages) || evidenceImages < 0) {
    throw new TypeError('Expected a non-negative evidence image count');
  }
  return Math.min(600_000, 120_000 + Math.min(evidenceImages, 480) * 1_000);
}
