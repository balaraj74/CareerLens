'use client';

import { motion } from 'framer-motion';

interface VoiceWaveProps {
  isActive?: boolean;
}

export function VoiceWave({ isActive }: VoiceWaveProps) {
  const bars = Array.from({ length: 5 });

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-violet-600 to-purple-400 rounded-full"
          animate={{
            height: isActive ? [10, 30, 10] : 10,
            opacity: isActive ? [0.5, 1, 0.5] : 0.3,
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
