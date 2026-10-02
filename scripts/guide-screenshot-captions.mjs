// New authoring outputs must bind every selected image to an explicit caption.
// Historical published records retain the builder's neutral-label fallback.
export function hasCompleteScreenshotCaptions(output) {
  return Array.isArray(output.screenshots) && Array.isArray(output.screenshotCaptions)
    && output.screenshotCaptions.length === output.screenshots.length
    && output.screenshotCaptions.every(caption => typeof caption === 'string' && caption.trim());
}
