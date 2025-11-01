'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from './Avatar';
import { VoiceWave } from './VoiceWave';
import { ChatBubble } from './ChatBubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface TranscriptItem {
  speaker: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface InterviewPanelProps {
  transcript: TranscriptItem[];
  isAISpeaking: boolean;
  isAIThinking: boolean;
  isUserSpeaking: boolean;
  userVideoRef: React.RefObject<HTMLVideoElement>;
  isCameraOff: boolean;
  userName?: string;
  currentUserText?: string;
}

export function InterviewPanel({
  transcript,
  isAISpeaking,
  isAIThinking,
  isUserSpeaking,
  userVideoRef,
  isCameraOff,
  userName = 'You',
  currentUserText,
}: InterviewPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
      {/* Left: AI Interviewer Zone */}
      <div className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#090E24] via-[#1A1F40] to-[#0F1629] border border-white/10 shadow-2xl">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -left-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity }}
          />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col">
          {/* AI Avatar Section */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-0">
            <Avatar isThinking={isAIThinking} isSpeaking={isAISpeaking} />

            {/* AI Status */}
            <motion.div
              className="mt-8 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className={`w-2 h-2 rounded-full ${
                    isAISpeaking ? 'bg-emerald-500' : isAIThinking ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}
                  animate={
                    isAISpeaking
                      ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }
                      : isAIThinking
                      ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }
                      : {}
                  }
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-sm text-white/80">
                  {isAISpeaking ? 'Speaking' : isAIThinking ? 'Thinking...' : 'Listening to you'}
                </span>
              </div>
            </motion.div>

            {/* Voice Wave (when speaking) */}
            {isAISpeaking && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mt-6"
              >
                <VoiceWave isActive={isAISpeaking} />
              </motion.div>
            )}
          </div>

          {/* Transcript Panel (bottom overlay) */}
          <motion.div
            className="h-64 bg-black/60 backdrop-blur-xl border-t border-white/10 flex-shrink-0"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-6 h-full flex flex-col">
              <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wide flex-shrink-0">
                Conversation
              </h3>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-3" ref={scrollRef}>
                  <AnimatePresence>
                    {transcript.map((item, index) => (
                      <ChatBubble
                        key={index}
                        speaker={item.speaker}
                        text={item.text}
                        timestamp={item.timestamp}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right: User Video Panel */}
      <div className="lg:col-span-4 relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 shadow-2xl h-full">
        {/* Video Stream */}
        <div className="absolute inset-0">
          {!isCameraOff ? (
            <video
              ref={userVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <p className="text-white/60">Camera Off</p>
              </div>
            </div>
          )}
        </div>

        {/* User Info Overlay */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <motion.div
            className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{userName}</h3>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isUserSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'
                    }`}
                  />
                  <span className="text-xs text-white/60">
                    {isUserSpeaking ? 'Speaking' : 'Waiting'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Current speech transcript (live) */}
        {currentUserText && isUserSpeaking && (
          <motion.div
            className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/50 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <p className="text-sm text-white/90 leading-relaxed line-clamp-3">{currentUserText}</p>
          </motion.div>
        )}

        {/* Mic indicator */}
        {isUserSpeaking && !currentUserText && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 backdrop-blur-sm border-2 border-emerald-500 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <VoiceWave isActive />
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
