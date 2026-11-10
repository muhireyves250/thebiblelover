export function detectSwipe(
  startX: number, endX: number, startY: number, endY: number, threshold = 50
): 'left' | 'right' | null {
  const dx = endX - startX;
  const dy = Math.abs(endY - startY);
  // Require horizontal motion to clearly dominate (more than 2x vertical),
  // not just edge it out - a diagonal thumb drag while scrolling otherwise
  // reads as a deliberate swipe.
  if (Math.abs(dx) < threshold || Math.abs(dx) <= 2 * dy) return null;
  return dx < 0 ? 'left' : 'right';
}
