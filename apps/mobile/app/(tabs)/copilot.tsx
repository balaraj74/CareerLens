import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../../src/components/GlassCard';
import NeuralThinking from '../../src/components/NeuralThinking';
import useChatStore from '../../src/store/useChatStore';
import useAuthStore from '../../src/store/useAuthStore';
import gemini from '../../src/services/gemini';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

const QUICK_PROMPTS = [
  'How can I improve my resume?',
  'Prepare me for a system design interview',
  'What skills should I learn for ML?',
  'Review my career roadmap',
];

/** Renders AI markdown response: strips ** for bold, renders bullet points */
function AIMessage({ text }: { text: string }) {
  // Split into lines and render each
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  return (
    <View>
      {lines.map((line, i) => {
        const isBullet = /^[-•*]\s/.test(line.trim());
        const isNumbered = /^\d+\.\s/.test(line.trim());

        // Strip markdown bold: **text** → text
        const clean = line
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .trim();

        return (
          <Text
            key={i}
            style={[
              styles.msgText,
              isBullet || isNumbered ? styles.bulletLine : null,
              i === 0 ? null : { marginTop: 4 },
            ]}
          >
            {isBullet ? '• ' : isNumbered ? '' : ''}{clean}
          </Text>
        );
      })}
    </View>
  );
}

export default function CopilotScreen() {
  const { messages, isThinking, addMessage, setThinking, clearChat } = useChatStore();
  const { profile } = useAuthStore();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // Tab bar is 56px + bottom inset
  const TAB_OFFSET = 56 + insets.bottom;

  const handleSend = async (text?: string) => {
    const msg = (text || inputText).trim();
    if (!msg) return;
    setInputText('');
    addMessage(msg, 'user');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    setThinking(true);
    try {
      const prompt = `You are the CareerLens AI Copilot. The user is a ${profile?.title || 'Developer'} with profile: ${JSON.stringify(profile)}. They said: "${msg}". Provide helpful, precise, action-oriented career guidance. Keep it under 200 words, formatted for mobile with clear bullet points.`;
      const reply = await gemini.generateContent(prompt);
      addMessage(reply, 'ai');
    } catch {
      addMessage('Sorry, I had trouble processing that. Please check your connection and try again.', 'ai');
    } finally {
      setThinking(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInputText('How do I improve my resume for a Senior React Native role?');
      }, 3000);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary[700]} />

      {/* ── HEADER ─────────────────────────────────────── */}
      <LinearGradient colors={['#1E3A8A', '#2563EB']} style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']} style={styles.aiBadge}>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>AI Co-Pilot</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Gemini • Online</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </LinearGradient>

      {/* ── CHAT + INPUT in one KeyboardAvoiding block ─── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <LinearGradient colors={['#F0F4FF', '#FAFAFA']} style={StyleSheet.absoluteFill} />

        {/* ── CHAT AREA ── */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.chatContent, { paddingBottom: 16 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {/* Empty state */}
          {!hasMessages && (
            <View style={styles.emptyState}>
              <LinearGradient colors={GRADIENTS.brand} style={styles.emptyIconWrap}>
                <Ionicons name="chatbubble-ellipses" size={30} color="#fff" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>How can I help you?</Text>
              <Text style={styles.emptySub}>
                Ask me anything about your career, resume, interviews, or skill development.
              </Text>
              <View style={styles.quickGrid}>
                {QUICK_PROMPTS.map((q, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.quickPrompt}
                    onPress={() => handleSend(q)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.quickText}>{q}</Text>
                    <Ionicons name="arrow-forward-outline" size={14} color={COLORS.primary[500]} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[styles.msgOuter, isUser ? styles.msgRight : styles.msgLeft]}
              >
                {!isUser && (
                  <LinearGradient colors={GRADIENTS.brand} style={styles.aiAvatar}>
                    <Ionicons name="sparkles" size={11} color="#fff" />
                  </LinearGradient>
                )}
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
                  {isUser ? (
                    <Text style={[styles.msgText, styles.msgTextUser]}>{msg.text}</Text>
                  ) : (
                    <AIMessage text={msg.text} />
                  )}
                  <Text style={[styles.msgTime, isUser && styles.msgTimeUser]}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          })}

          {isThinking && <NeuralThinking />}
        </ScrollView>

        {/* ── INPUT BAR ── */}
        <View style={[styles.inputWrap, { paddingBottom: TAB_OFFSET + 8 }]}>
          {isRecording ? (
            <View style={styles.recordCard}>
              <View style={styles.recordRow}>
                <View style={styles.pulseDot} />
                <Text style={styles.recordText}>Listening...</Text>
                <TouchableOpacity onPress={handleVoiceInput} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.inputCard}>
              <View style={styles.inputRow}>
                <TouchableOpacity style={styles.attachBtn}>
                  <Ionicons name="add-circle" size={24} color={COLORS.primary[500]} />
                </TouchableOpacity>
                <TextInput
                  style={styles.textField}
                  placeholder="Ask your AI co-pilot..."
                  placeholderTextColor="#94A3B8"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={() => handleSend()}
                  multiline
                  maxLength={1000}
                  returnKeyType="send"
                />
                {inputText.trim() ? (
                  <TouchableOpacity onPress={() => handleSend()} style={styles.sendBtn}>
                    <LinearGradient colors={GRADIENTS.brand} style={styles.sendGrad}>
                      <Ionicons name="send" size={16} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleVoiceInput} style={styles.sendBtn}>
                    <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.sendGrad}>
                      <Ionicons name="mic" size={16} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1E3A8A' },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34D399',
  },
  statusText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  clearBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  // Chat
  chatContent: {
    padding: 14,
    flexGrow: 1,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    elevation: 6,
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  quickGrid: { width: '100%', gap: 8 },
  quickPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  quickText: { color: COLORS.text.primary, fontSize: 13, fontWeight: '500', flex: 1, marginRight: 8 },

  // Messages
  msgOuter: {
    flexDirection: 'row',
    marginVertical: 5,
    maxWidth: '85%',
  },
  msgLeft: { alignSelf: 'flex-start', gap: 8 },
  msgRight: { alignSelf: 'flex-end' },
  aiAvatar: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    flexShrink: 0,
  },
  bubble: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 13,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
    backgroundColor: COLORS.primary[500],
  },
  bubbleAI: {
    borderBottomLeftRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  msgText: { color: COLORS.text.primary, fontSize: 14, lineHeight: 21 },
  bulletLine: { paddingLeft: 4 },
  msgTextUser: { color: '#FFF' },
  msgTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 5,
    textAlign: 'right',
  },
  msgTimeUser: { color: 'rgba(255,255,255,0.7)' },

  // Input
  inputWrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  recordText: { flex: 1, color: COLORS.text.primary, fontSize: 14, fontWeight: '500' },
  cancelBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  cancelText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  attachBtn: { padding: 2 },
  textField: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 5,
    lineHeight: 20,
  },
  sendBtn: { flexShrink: 0 },
  sendGrad: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
