export function detectSwipe(
  startX: number, endX: number, startY: number, endY: number, threshold = 50
): 'left' | 'right' | null {
  const dx = endX - startX;
  const dy = Math.abs(endY - startY);
  if (Math.abs(dx) < threshold || dy >= Math.abs(dx)) return null;
  return dx < 0 ? 'left' : 'right';
}
