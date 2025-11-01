'use client';

import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Brain, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ControlBarProps {
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndInterview: () => void;
  onAskHelp?: () => void;
  onSendMessage?: () => void;
  canSendMessage?: boolean;
}

export function ControlBar({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onEndInterview,
  onAskHelp,
  onSendMessage,
  canSendMessage = false,
}: ControlBarProps) {
  return (
    <motion.div
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl border border-white/20">
        <div className="flex items-center gap-3">
          {/* Mic Toggle */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onToggleMute}
              size="icon"
              className={`w-14 h-14 rounded-full ${
                isMuted
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-white/20 hover:bg-white/30'
              } border-2 border-white/30`}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </Button>
          </motion.div>

          {/* Camera Toggle */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onToggleCamera}
              size="icon"
              className={`w-14 h-14 rounded-full ${
                isCameraOff
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-white/20 hover:bg-white/30'
              } border-2 border-white/30`}
            >
              {isCameraOff ? (
                <VideoOff className="w-6 h-6 text-white" />
              ) : (
                <Video className="w-6 h-6 text-white" />
              )}
            </Button>
          </motion.div>

          {/* End Interview */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onEndInterview}
              size="icon"
              className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-2 border-white/30 shadow-lg shadow-red-500/50"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </Button>
          </motion.div>

          {/* Divider */}
          <div className="w-px h-10 bg-white/20 mx-2" />

          {/* Send Message (manual) */}
          {onSendMessage && (
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onSendMessage}
                disabled={!canSendMessage}
                size="icon"
                className={`w-14 h-14 rounded-full ${
                  canSendMessage
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/50'
                    : 'bg-white/10 opacity-50 cursor-not-allowed'
                } border-2 border-white/30`}
              >
                <Send className="w-6 h-6 text-white" />
              </Button>
            </motion.div>
          )}

          {/* AI Help */}
          {onAskHelp && (
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onAskHelp}
                size="icon"
                className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 border-2 border-white/30 shadow-lg shadow-violet-500/50"
              >
                <Brain className="w-6 h-6 text-white" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
