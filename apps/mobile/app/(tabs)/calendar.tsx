import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../src/components/GlassCard';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

interface Event {
  id: string;
  title: string;
  time: string;
  type: 'interview' | 'learning' | 'deadline' | 'networking';
  duration: string;
}

const MOCK_EVENTS: Event[] = [
  { id: '1', title: 'System Design Mock', time: '10:00 AM', type: 'interview', duration: '1h' },
  { id: '2', title: 'React Native Skia Module', time: '01:00 PM', type: 'learning', duration: '2h' },
  { id: '3', title: 'Submit Target Application', time: '04:00 PM', type: 'deadline', duration: '30m' },
];

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(15);
  const dates = Array.from({ length: 14 }, (_, i) => i + 10);

  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case 'interview': return COLORS.amber[500];
      case 'learning': return COLORS.primary[500];
      case 'deadline': return COLORS.rose[500];
      case 'networking': return COLORS.emerald[500];
      default: return COLORS.secondary[500];
    }
  };

  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'interview': return 'videocam-outline';
      case 'learning': return 'book-outline';
      case 'deadline': return 'alert-circle-outline';
      case 'networking': return 'people-outline';
      default: return 'calendar-outline';
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={GRADIENTS.screenLight} style={StyleSheet.absoluteFill} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.monthText}>October 2026</Text>
          <Text style={styles.subText}>3 events today</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <LinearGradient colors={GRADIENTS.brand} style={styles.addBtnInner}>
            <Ionicons name="add" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── DATE STRIP ── */}
      <View style={styles.stripWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stripContent}>
          {dates.map((d) => {
            const isSelected = d === selectedDate;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setSelectedDate(d)}
                style={[styles.dateItem, isSelected && styles.dateItemActive]}
                activeOpacity={0.8}
              >
                {isSelected ? (
                  <LinearGradient colors={GRADIENTS.brand} style={styles.dateActiveBg}>
                    <Text style={styles.dayNameActive}>Mon</Text>
                    <Text style={styles.dayNumActive}>{d}</Text>
                    <View style={styles.activeDot} />
                  </LinearGradient>
                ) : (
                  <>
                    <Text style={styles.dayName}>Mon</Text>
                    <Text style={styles.dayNum}>{d}</Text>
                    <View style={d === 15 ? styles.hasEventDot : styles.emptyDot} />
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── EVENTS LIST ── */}
      <ScrollView contentContainerStyle={styles.eventsContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Schedule</Text>

        <View style={styles.timeline}>
          {MOCK_EVENTS.map((ev, i) => {
            const color = getEventColor(ev.type);
            const isLast = i === MOCK_EVENTS.length - 1;
            return (
              <View key={ev.id} style={styles.eventRow}>
                {/* Timeline left */}
                <View style={styles.timeWrap}>
                  <Text style={styles.timeText}>{ev.time.split(' ')[0]}</Text>
                  <Text style={styles.ampmText}>{ev.time.split(' ')[1]}</Text>
                </View>
                
                {/* Timeline line */}
                <View style={styles.lineWrap}>
                  <View style={[styles.timelineDot, { borderColor: color }]} />
                  {!isLast && <View style={styles.timelineLine} />}
                </View>

                {/* Event Card */}
                <View style={styles.cardWrap}>
                  <GlassCard style={styles.eventCard} gradientColors={GRADIENTS.cardNeutral} elevation="low">
                    <View style={styles.cardTop}>
                      <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                        <Ionicons name={getEventIcon(ev.type)} size={18} color={color} />
                      </View>
                      <View style={[styles.badge, { backgroundColor: `${color}10` }]}>
                        <Text style={[styles.badgeText, { color }]}>{ev.duration}</Text>
                      </View>
                    </View>
                    <Text style={styles.eventTitle}>{ev.title}</Text>
                    <Text style={styles.eventType}>{ev.type.toUpperCase()}</Text>
                  </GlassCard>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg.base },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: { flex: 1 },
  monthText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: 14,
    color: COLORS.primary[500],
    fontWeight: '600',
    marginTop: 4,
  },
  addBtn: {
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  addBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Dates
  stripWrap: {
    marginBottom: 20,
  },
  stripContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dateItem: {
    width: 60,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg.surface,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  dateItemActive: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  dateActiveBg: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayName: {
    fontSize: 12,
    color: COLORS.text.muted,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 20,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  dayNameActive: {
    fontSize: 12,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayNumActive: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '800',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFF',
    marginTop: 6,
  },
  hasEventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary[500],
    marginTop: 6,
  },
  emptyDot: {
    width: 4,
    height: 4,
    marginTop: 6,
  },

  // Events
  eventsContent: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  timeline: {
    flex: 1,
  },
  eventRow: {
    flexDirection: 'row',
    minHeight: 120,
  },
  timeWrap: {
    width: 60,
    paddingTop: 14,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  ampmText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.muted,
    marginTop: 2,
  },
  lineWrap: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    backgroundColor: COLORS.bg.base,
    marginTop: 18,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.glass.borderStrong,
    marginTop: -4,
    marginBottom: -18,
    zIndex: 1,
  },
  cardWrap: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 20,
  },
  eventCard: {
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  eventType: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text.muted,
    letterSpacing: 0.5,
  },
});
