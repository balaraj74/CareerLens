import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  isThinking: boolean;
  addMessage: (text: string, sender: 'user' | 'ai') => void;
  setThinking: (isThinking: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: 'welcome',
      text: "Hello! I am your CareerLens AI Co-Pilot. I can help analyze your skills, recommend learning roadmaps, optimize your resume, and conduct mock interviews. What are we working on today?",
      sender: 'ai',
      timestamp: Date.now(),
    },
  ],
  isThinking: false,
  addMessage: (text, sender) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Math.random().toString(36).substring(7),
          text,
          sender,
          timestamp: Date.now(),
        },
      ],
    })),
  setThinking: (isThinking) => set({ isThinking }),
  clearChat: () =>
    set({
      messages: [
        {
          id: 'welcome',
          text: "Hello! I am your CareerLens AI Co-Pilot. I can help analyze your skills, recommend learning roadmaps, optimize your resume, and conduct mock interviews. What are we working on today?",
          sender: 'ai',
          timestamp: Date.now(),
        },
      ],
    }),
}));
export default useChatStore;
