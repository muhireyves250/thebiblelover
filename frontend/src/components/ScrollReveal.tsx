import React from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

// Fades + slides a section up into place the first time it scrolls into
// view, instead of everything just being static on the page.
const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6, ease: 'easeOut', delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export default ScrollReveal;
