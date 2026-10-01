import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

// Lets ArrowUp/ArrowDown move one full .snap-section at a time, smoothly.
// Deliberately NOT triggered by scroll/wheel/touch - only an explicit key
// press moves the page, so it never fights the user's own scrolling the
// way the earlier scroll-triggered snap did.
export function useKeyboardSectionNav(enabled: boolean) {
  const animationStop = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const headerOffset = () => (window.innerWidth >= 768 ? 104 : 64);

    const isTypingTarget = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      if (isTypingTarget(e.target)) return;

      const sections = Array.from(document.querySelectorAll<HTMLElement>('.snap-section'));
      if (sections.length === 0) return;

      const offset = headerOffset();
      const positions = sections.map(el => el.getBoundingClientRect().top - offset);

      let targetIndex: number;
      if (e.key === 'ArrowDown') {
        // First section whose top is meaningfully below the current
        // alignment point (skips the one we're already at).
        targetIndex = positions.findIndex(top => top > 8);
        if (targetIndex === -1) return; // already at/after the last section
      } else {
        // Last section whose top is meaningfully above the current point.
        let idx = -1;
        for (let i = 0; i < positions.length; i++) {
          if (positions[i] < -8) idx = i;
        }
        if (idx === -1) return; // already at/before the first section
        targetIndex = idx;
      }

      e.preventDefault();
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
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (animationStop.current) animationStop.current();
    };
  }, [enabled]);
}

export default useKeyboardSectionNav;
