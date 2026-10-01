import { useRef } from 'react';
import { useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';

interface TiltHandlers {
  ref: React.RefObject<HTMLDivElement>;
  style: { rotateX: MotionValue<number>; rotateY: MotionValue<number>; transformPerspective: number };
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
}

// A subtle mouse-tracked 3D tilt, the kind used on premium product/portfolio
// cards (Stripe, Linear, etc.) - the card leans slightly toward the cursor
// instead of sitting completely flat, then springs back to neutral on
// mouse-leave. Kept gentle (+/-6deg) so it reads as polish, not a gimmick.
export function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [6, -6]), { stiffness: 220, damping: 20 });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-6, 6]), { stiffness: 220, damping: 20 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const handlers: TiltHandlers = {
    ref,
    style: { rotateX, rotateY, transformPerspective: 800 },
    onMouseMove,
    onMouseLeave,
  };
  return handlers;
}

export default useTilt;
