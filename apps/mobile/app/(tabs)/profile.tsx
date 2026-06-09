import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../src/components/GlassCard';
import useAuthStore from '../../src/store/useAuthStore';
import { auth } from '../../src/services/firebase';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

const { width } = Dimensions.get('window');
const AVATAR_SIZE = 80;

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, setUser, setProfile } = useAuthStore();
  const [biometrics, setBiometrics] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const name = profile?.name || 'Developer';
  const email = profile?.email || 'developer@careerlens.ai';
  const title = profile?.title || 'Full Stack Engineer';
  const skills: string[] = profile?.skills || ['React Native', 'TypeScript', 'Node.js', 'Firebase', 'Next.js'];

  const resumeScore = profile?.analytics?.resumeScore ?? 82;
  const skillScore = profile?.analytics?.skillScore ?? 74;
  const readiness = profile?.analytics?.readinessScore ?? 79;

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await auth.signOut();
            setUser(null);
            setProfile(null);
            router.replace('/(auth)/login');
          } catch (err) {
            Alert.alert('Error', 'Could not sign out. Check your connection.');
          }
        },
      },
    ]);
  };

  // Avatar initials
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={GRADIENTS.screenLight} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── PROFILE HERO ── */}
        <View style={styles.profileHero}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <LinearGradient colors={GRADIENTS.brand} style={styles.avatarInner}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <TouchableOpacity style={styles.avatarEditBtn}>
              <Ionicons name="camera" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileTitle}>{title}</Text>
          <Text style={styles.profileEmail}>{email}</Text>

          {/* Edit profile button */}
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil" size={14} color={COLORS.primary[500]} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── STATS ROW ── */}
        <GlassCard style={styles.statsCard} gradientColors={GRADIENTS.cardNeutral} elevation="medium">
          {[
            { label: 'Resume', value: resumeScore, color: COLORS.emerald[500] },
            { label: 'Skills', value: skillScore, color: COLORS.secondary[500] },
            { label: 'Readiness', value: readiness, color: COLORS.primary[500] },
          ].map((stat, i, arr) => (
            <View key={stat.label} style={[styles.statItem, i < arr.length - 1 && styles.statDivider]}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}%</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </GlassCard>

        {/* ── CORE SKILLS ── */}
        <Text style={styles.sectionTitle}>Core Skills</Text>
        <GlassCard style={styles.card} gradientColors={GRADIENTS.cardNeutral} elevation="low">
          <View style={styles.skillsWrap}>
            {skills.map((skill, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{skill}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addChip}>
              <Ionicons name="add" size={16} color={COLORS.primary[500]} />
              <Text style={styles.addChipText}>Add Skill</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* ── CAREER GOALS ── */}
        <Text style={styles.sectionTitle}>Career Goals</Text>
        <GlassCard style={styles.card} gradientColors={GRADIENTS.cardNeutral} elevation="low" accent="primary">
          {[
            { text: 'Secure a Senior Mobile Dev Role by Q4', done: true },
            { text: 'Add 3 production RN apps to portfolio', done: true },
            { text: 'Acquire Google Cloud Architect Certificate', done: false },
          ].map((g, i) => (
            <View key={i} style={[styles.goalRow, i > 0 && styles.goalDivider]}>
              <Ionicons
                name={g.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={g.done ? COLORS.emerald[500] : COLORS.text.faint}
              />
              <Text style={[styles.goalText, !g.done && { color: COLORS.text.secondary }]}>
                {g.text}
              </Text>
            </View>
          ))}
        </GlassCard>

        {/* ── SETTINGS ── */}
        <Text style={styles.sectionTitle}>Security & Preferences</Text>
        <GlassCard style={styles.card} gradientColors={GRADIENTS.cardNeutral} elevation="low">
          {[
            {
              icon: 'finger-print-outline',
              label: 'Biometric Auth',
              desc: 'Face ID / Touch ID',
              color: COLORS.primary[500],
              val: biometrics,
              set: setBiometrics,
              onColor: COLORS.primary[500],
            },
            {
              icon: 'notifications-outline',
              label: 'Push Notifications',
              desc: 'Career updates & alerts',
              color: COLORS.secondary[500],
              val: notifications,
              set: setNotifications,
              onColor: COLORS.secondary[500],
            },
          ].map((s, i, arr) => (
            <View key={s.label} style={[styles.settingRow, i < arr.length - 1 && styles.settingDivider]}>
              <View style={[styles.settingIconWrap, { backgroundColor: `${s.color}15` }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{s.label}</Text>
                <Text style={styles.settingDesc}>{s.desc}</Text>
              </View>
              <Switch
                value={s.val}
                onValueChange={s.set}
                trackColor={{ false: COLORS.glass.border, true: `${s.onColor}50` }}
                thumbColor={s.val ? s.onColor : COLORS.text.faint}
              />
            </View>
          ))}
        </GlassCard>

        {/* ── MENU ROWS ── */}
        <GlassCard style={styles.card} gradientColors={GRADIENTS.cardNeutral} elevation="low">
          {[
            { icon: 'document-text-outline', label: 'Privacy Policy', color: COLORS.text.secondary },
            { icon: 'help-circle-outline', label: 'Help & Support', color: COLORS.text.secondary },
            { icon: 'star-outline', label: 'Rate CareerLens', color: COLORS.amber[500] },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, i < arr.length - 1 && styles.settingDivider]}
            >
              <Ionicons name={item.icon as any} size={20} color={item.color} />
              <Text style={[styles.menuLabel, { color: item.color }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.text.faint} />
            </TouchableOpacity>
          ))}
        </GlassCard>

        {/* ── LOGOUT ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <View style={styles.logoutInner}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.rose[500]} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.versionText}>CareerLens v1.0.0 • Made with ❤️</Text>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg.base },
  scroll: { padding: 20, paddingTop: 20 },

  // Profile hero
  profileHero: {
    alignItems: 'center',
    paddingBottom: 28,
  },
  avatarWrap: {
    marginBottom: 16,
    position: 'relative',
    shadowColor: COLORS.primary[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  avatarInner: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.bg.elevated,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.bg.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -0.3,
  },
  profileTitle: {
    color: COLORS.primary[500],
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  profileEmail: {
    color: COLORS.text.muted,
    fontSize: 13,
    marginTop: 4,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 16,
    backgroundColor: COLORS.primary.subtle,
  },
  editBtnText: {
    color: COLORS.primary[500],
    fontSize: 13,
    fontWeight: '600',
  },

  // Stats
  statsCard: {
    flexDirection: 'row',
    marginBottom: 28,
    paddingVertical: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: COLORS.glass.border,
  },
  statValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { color: COLORS.text.muted, fontSize: 12, fontWeight: '600', marginTop: 4 },

  // Section
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.muted,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  card: { marginBottom: 24 },

  // Skills
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: COLORS.bg.base,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  chipText: { color: COLORS.text.primary, fontSize: 13, fontWeight: '500' },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.primary.border,
    backgroundColor: COLORS.primary.subtle,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  addChipText: { color: COLORS.primary[500], fontSize: 13, fontWeight: '600' },

  // Goals
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  goalDivider: { borderTopWidth: 1, borderTopColor: COLORS.glass.border },
  goalText: { flex: 1, color: COLORS.text.primary, fontSize: 14, fontWeight: '500' },

  // Settings
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  settingDivider: { borderBottomWidth: 1, borderBottomColor: COLORS.glass.border },
  settingIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: { flex: 1 },
  settingLabel: { color: COLORS.text.primary, fontSize: 15, fontWeight: '600' },
  settingDesc: { color: COLORS.text.muted, fontSize: 12, marginTop: 2 },

  // Menu
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.text.primary },

  // Logout
  logoutBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.rose.border,
    backgroundColor: COLORS.rose.subtle,
    marginBottom: 24,
  },
  logoutInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    gap: 8,
  },
  logoutText: {
    color: COLORS.rose[500],
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.text.muted,
    fontSize: 12,
    marginBottom: 8,
  },
});
