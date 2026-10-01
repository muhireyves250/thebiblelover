import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

// Moves one full .snap-section at a time, smoothly, from either
// ArrowUp/ArrowDown or the mouse/trackpad wheel. Wheel events are
// intercepted and preventDefault'd *before* any native scrolling
// happens, so our own animation is the only thing ever moving the
// page - there's no native momentum scroll left to fight it the way
// the earlier scroll-position-reactive snap did. A short cooldown
// after each jump treats one wheel gesture (which fires many small
// delta events in a row) as a single step instead of several.
export function useSectionNavigation(enabled: boolean) {
  const animationStop = useRef<(() => void) | null>(null);
  const cooldownUntil = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const headerOffset = () => (window.innerWidth >= 768 ? 104 : 64);

    const isTypingTarget = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };

    const getVisibleSections = () =>
      // offsetParent is null for display:none elements - the mobile
      // welcome banner and desktop Hero wrapper both carry .snap-section
      // but only one is ever actually rendered at a given breakpoint,
      // and a hidden element's getBoundingClientRect() is all zeros,
      // which would corrupt the position math below.
      Array.from(document.querySelectorAll<HTMLElement>('.snap-section'))
        .filter(el => el.offsetParent !== null);

    const goToSection = (direction: 'down' | 'up') => {
      const sections = getVisibleSections();
      if (sections.length === 0) return false;

      const offset = headerOffset();
      const positions = sections.map(el => el.getBoundingClientRect().top - offset);

      let targetIndex: number;
      if (direction === 'down') {
        // First section whose top is meaningfully below the current
        // alignment point (skips the one we're already at).
        targetIndex = positions.findIndex(top => top > 8);
        if (targetIndex === -1) return false; // already at/after the last section
      } else {
        // Last section whose top is meaningfully above the current point.
        let idx = -1;
        for (let i = 0; i < positions.length; i++) {
          if (positions[i] < -8) idx = i;
        }
        if (idx === -1) return false; // already at/before the first section
        targetIndex = idx;
      }

      const target = sections[targetIndex];
      const startY = window.scrollY;
      const targetY = Math.max(0, startY + target.getBoundingClientRect().top - offset);

      if (animationStop.current) animationStop.current();
      const controls = animate(startY, targetY, {
        type: 'spring',
        stiffness: 120,
        damping: 24,
        mass: 0.9,
        onUpdate: (v) => window.scrollTo(0, v),
      });
      animationStop.current = () => controls.stop();
      return true;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      if (isTypingTarget(e.target)) return;
      if (goToSection(e.key === 'ArrowDown' ? 'down' : 'up')) {
        e.preventDefault();
      }
    };

    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now < cooldownUntil.current) {
        e.preventDefault();
        return;
      }
      const moved = goToSection(e.deltaY > 0 ? 'down' : 'up');
      if (moved) {
        e.preventDefault();
        // Spring settles in well under a second; lock out further
        // wheel-triggered jumps until it's done so one gesture = one step.
        cooldownUntil.current = now + 650;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('wheel', onWheel);
      if (animationStop.current) animationStop.current();
    };
  }, [enabled]);
}

export default useSectionNavigation;
