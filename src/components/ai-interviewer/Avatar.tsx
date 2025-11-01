'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AvatarProps {
  isThinking?: boolean;
  isSpeaking?: boolean;
}

export function Avatar({ isThinking, isSpeaking }: AvatarProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setParticles((prev) => [
          ...prev.slice(-5),
          { id: Date.now(), x: Math.random() * 100, y: Math.random() * 100 },
        ]);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setParticles([]);
    }
  }, [isSpeaking]);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-700/30 blur-2xl"
        animate={{
          scale: isSpeaking ? [1, 1.2, 1] : 1,
          opacity: isSpeaking ? [0.5, 0.8, 0.5] : 0.3,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute w-56 h-56 rounded-full border-2 border-violet-500/50"
        animate={{
          scale: isSpeaking ? [1, 1.1, 1] : 1,
          rotate: 360,
        }}
        transition={{
          scale: { duration: 1.5, repeat: Infinity },
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
        }}
      />

      {/* Avatar face */}
      <motion.div
        className="relative w-48 h-48 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 shadow-2xl shadow-violet-500/50 overflow-hidden"
        animate={{
          boxShadow: isSpeaking
            ? [
                '0 0 60px rgba(139, 92, 246, 0.8)',
                '0 0 80px rgba(139, 92, 246, 1)',
                '0 0 60px rgba(139, 92, 246, 0.8)',
              ]
            : '0 0 30px rgba(139, 92, 246, 0.5)',
        }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {/* Face features */}
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Eyes */}
          <g>
            {/* Left eye */}
            <circle cx="70" cy="80" r="8" fill="#E5E7EB" />
            <motion.circle
              cx="70"
              cy="80"
              r="4"
              fill="#1F2937"
              animate={{
                scaleY: isThinking ? [1, 0.1, 1] : 1,
              }}
              transition={{
                duration: 0.3,
                repeat: isThinking ? Infinity : 0,
                repeatDelay: 3,
              }}
            />

            {/* Right eye */}
            <circle cx="130" cy="80" r="8" fill="#E5E7EB" />
            <motion.circle
              cx="130"
              cy="80"
              r="4"
              fill="#1F2937"
              animate={{
                scaleY: isThinking ? [1, 0.1, 1] : 1,
              }}
              transition={{
                duration: 0.3,
                repeat: isThinking ? Infinity : 0,
                repeatDelay: 3,
              }}
            />
          </g>

          {/* Mouth */}
          <motion.path
            d={isSpeaking ? 'M 70 130 Q 100 145 130 130' : 'M 70 130 Q 100 135 130 130'}
            stroke="#E5E7EB"
            strokeWidth="3"
            fill="transparent"
            strokeLinecap="round"
            animate={{
              d: isSpeaking
                ? [
                    'M 70 130 Q 100 145 130 130',
                    'M 70 130 Q 100 120 130 130',
                    'M 70 130 Q 100 145 130 130',
                  ]
                : ['M 70 130 Q 100 135 130 130'],
            }}
            transition={{ duration: 0.6, repeat: isSpeaking ? Infinity : 0 }}
          />

          {/* Neural network effect */}
          {particles.map((particle) => (
            <motion.circle
              key={particle.id}
              cx={particle.x * 2}
              cy={particle.y * 2}
              r="2"
              fill="#A78BFA"
              initial={{ opacity: 0.8, scale: 0 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 1 }}
            />
          ))}
        </svg>

        {/* Thinking indicator */}
        {isThinking && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-violet-900/50 to-transparent flex items-end justify-center pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Confidence meter (subtle) */}
      {isSpeaking && (
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-violet-500"
            animate={{ width: ['0%', '85%'] }}
            transition={{ duration: 2 }}
          />
        </motion.div>
      )}
    </div>
  );
}
