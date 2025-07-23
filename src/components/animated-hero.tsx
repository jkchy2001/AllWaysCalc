
'use client';

import { useState, useEffect } from 'react';
import {
  Banknote,
  GraduationCap,
  HeartPulse,
  FlaskConical,
  Ruler,
  Construction,
  Leaf,
  Monitor,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const icons = [
  Banknote,
  GraduationCap,
  HeartPulse,
  FlaskConical,
  Ruler,
  Construction,
  Leaf,
  Monitor,
];

export function AnimatedHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % icons.length);
    }, 2000); // Change icon every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = icons[index];

  return (
    <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5 }}
          className="absolute"
        >
          {CurrentIcon && <CurrentIcon className="size-32 md:size-48 text-primary" />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
