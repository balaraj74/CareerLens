'use client';

import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  speaker: 'ai' | 'user';
  text: string;
  timestamp?: string;
  index: number;
}

export function ChatBubble({ speaker, text, timestamp, index }: ChatBubbleProps) {
  const isAI = speaker === 'ai';

  return (
    <motion.div
      className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <motion.div
        className={`max-w-[70%] p-4 rounded-2xl ${
          isAI
            ? 'bg-white/10 backdrop-blur-md border border-white/20 rounded-tl-none'
            : 'bg-gradient-to-br from-violet-600 to-purple-700 rounded-tr-none'
        }`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <p className="text-sm md:text-base text-white leading-relaxed">{text}</p>
        {timestamp && (
          <p className="text-xs text-white/60 mt-2">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </motion.div>

      {!isAI && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
}
