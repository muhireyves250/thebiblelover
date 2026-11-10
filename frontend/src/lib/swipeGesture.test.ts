import { describe, it, expect } from 'vitest';
import { detectSwipe } from './swipeGesture';

describe('detectSwipe', () => {
  it('returns "left" for a swipe past the threshold moving left', () => {
    expect(detectSwipe(200, 100, 50, 55)).toBe('left');
  });

  it('returns "right" for a swipe past the threshold moving right', () => {
    expect(detectSwipe(100, 200, 50, 55)).toBe('right');
  });

  it('returns null when the horizontal distance is under the threshold', () => {
    expect(detectSwipe(100, 130, 50, 50)).toBeNull();
  });

  it('returns null for a mostly-vertical drag even if horizontal distance clears the threshold', () => {
    expect(detectSwipe(100, 160, 50, 300)).toBeNull(); // 60px horizontal, 250px vertical
  });

  it('respects a custom threshold', () => {
    expect(detectSwipe(100, 170, 50, 51, 100)).toBeNull(); // 70px < 100px threshold
  });
});
