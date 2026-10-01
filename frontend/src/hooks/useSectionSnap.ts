import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

// Drives section-to-section snapping with a real spring animation instead
// of relying on native CSS scroll-snap, whose settle timing/easing isn't
// controllable and varies by browser - this is what made it feel "not
// smooth" no matter how the CSS was tuned.
//
// Behavior: after scrolling pauses briefly, find the .snap-section whose
// top edge is closest to the header-adjusted viewport top. If it's close
// enough to be "the section the user was heading toward" (but not already
// aligned, and not so far away that they're mid-scroll through a long
// section's content), spring-scroll it into place.
export function useSectionSnap(enabled: boolean) {
  const settleTimer = useRef<number>();
  const animationStop = useRef<(() => void) | null>(null);
  const userInteracting = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const headerOffset = () => (window.innerWidth >= 768 ? 104 : 64);

    const stopAnimation = () => {
      if (animationStop.current) {
        animationStop.current();
        animationStop.current = null;
      }
    };

    const scheduleSnap = () => {
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        if (userInteracting.current) return;

        const sections = Array.from(document.querySelectorAll<HTMLElement>('.snap-section'));
        if (sections.length === 0) return;

        const offset = headerOffset();
        let closest: HTMLElement | null = null;
        let closestDist = Infinity;
        for (const el of sections) {
          const dist = Math.abs(el.getBoundingClientRect().top - offset);
          if (dist < closestDist) {
            closestDist = dist;
            closest = el;
          }
        }
        if (!closest) return;

        // Already aligned (within a few px) - nothing to do.
        if (closestDist < 4) return;
        // Too far away - the user is reading through the middle of a tall
        // section, don't yank them to its start.
        if (closestDist > window.innerHeight * 0.55) return;

        const startY = window.scrollY;
        const targetY = Math.max(0, startY + closest.getBoundingClientRect().top - offset);

        stopAnimation();
        const controls = animate(startY, targetY, {
          type: 'spring',
          stiffness: 110,
          damping: 22,
          mass: 0.9,
          onUpdate: (v) => window.scrollTo(0, v),
        });
        animationStop.current = () => controls.stop();
      }, 140);
    };

    const onScroll = () => {
      // A real scroll event means the user (or our own animation) moved
      // the page - either way, reset the settle timer.
      scheduleSnap();
    };

    const onPointerDown = () => {
      userInteracting.current = true;
      stopAnimation();
    };
    const onPointerUp = () => {
      userInteracting.current = false;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', stopAnimation, { passive: true });
    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', stopAnimation);
      window.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchend', onPointerUp);
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      stopAnimation();
    };
  }, [enabled]);
}

export default useSectionSnap;
