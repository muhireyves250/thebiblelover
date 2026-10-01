import React from 'react';
import { motion } from 'framer-motion';

interface SlideUpSectionProps {
  children: React.ReactNode;
  className?: string;
}

// Pure vertical slide into place as a section scrolls into view - no
// fade, no scale, just a clean upward motion settled with a spring.
const SlideUpSection: React.FC<SlideUpSectionProps> = ({ children, className }) => (
  <motion.div
    initial={{ y: 56 }}
    whileInView={{ y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ type: 'spring', stiffness: 90, damping: 20, mass: 0.8 }}
    className={className}
  >
    {children}
  </motion.div>
);

export default SlideUpSection;
