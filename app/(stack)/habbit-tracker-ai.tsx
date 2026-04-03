import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const C = {
  bg: '#07070F',
  card: '#10101C',
  border: '#1C1C2E',
  violet: '#7C3AED',
  violetMid: '#8B5CF6',
  violetLight: '#A78BFA',
  mint: '#10B981',
  amber: '#F59E0B',
  sky: '#38BDF8',
  pink: '#F472B6',
  text: '#EEE8FF',
  muted: '#6B6890',
  dim: '#242438',
};

interface Habit {
  id: string;
  name: string;
  icon: string;
  progress: number;
  streak: number;
  color: string;
}

const HABITS: Habit[] = [
  { id: '1', name: 'Morning Meditation', icon: 'moon-outline', progress: 0.85, streak: 12, color: C.violetLight },
  { id: '2', name: 'Drink 2L Water', icon: 'water-outline', progress: 0.6, streak: 7, color: C.sky },
  { id: '3', name: 'Read 30 Pages', icon: 'book-outline', progress: 1.0, streak: 21, color: C.mint },
  { id: '4', name: 'Evening Run', icon: 'walk-outline', progress: 0.45, streak: 5, color: C.amber },
  { id: '5', name: 'No Social Media', icon: 'phone-portrait-outline', progress: 0.72, streak: 9, color: C.pink },
];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_DONE = [true, true, true, true, false, false, false];

const RS = 60;
const RK = 4.5;
const RR = (RS - RK * 2) / 2;
const RC = 2 * Math.PI * RR;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ProgressRing({ progress, color, delay = 0 }: { progress: number; color: string; delay?: number }) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withDelay(delay, withTiming(progress, { duration: 1100, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RC * (1 - p.value),
  }));

  return (
    <Svg width={RS} height={RS}>
      <Circle cx={RS / 2} cy={RS / 2} r={RR} stroke={C.dim} strokeWidth={RK} fill="none" />
      <AnimatedCircle
        cx={RS / 2} cy={RS / 2} r={RR}
        stroke={color} strokeWidth={RK} fill="none"
        strokeDasharray={RC}
        animatedProps={animatedProps}
        strokeLinecap="round"
        rotation="-90"
        origin={`${RS / 2}, ${RS / 2}`}
      />
    </Svg>
  );
}

function HabitCard({ habit, index }: { habit: Habit; index: number }) {
  const opacity = useSharedValue(0);
  const ty = useSharedValue(18);

  useEffect(() => {
    const d = 300 + index * 75;
    opacity.value = withDelay(d, withTiming(1, { duration: 450 }));
    ty.value = withDelay(d, withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }],
  }));

  const isComplete = habit.progress >= 1;

  return (
    <Animated.View style={[styles.habitCard, style]}>
      <View style={[styles.habitIcon, { backgroundColor: habit.color + '18' }]}>
        <Ionicons name={habit.icon as any} size={20} color={habit.color} />
      </View>
      <View style={styles.habitInfo}>
        <Text style={styles.habitName}>{habit.name}</Text>
        <View style={styles.habitMeta}>
          <Ionicons name="flame" size={11} color={C.amber} />
          <Text style={styles.habitStreak}>{habit.streak}d streak</Text>
          {isComplete && (
            <View style={styles.doneBadge}>
              <Text style={styles.doneText}>✓ Done</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.ringWrap}>
        <ProgressRing progress={habit.progress} color={habit.color} delay={400 + index * 75} />
        <Text style={[styles.ringLabel, { color: habit.color }]}>
          {Math.round(habit.progress * 100)}%
        </Text>
      </View>
    </Animated.View>
  );
}

export default function HabitTrackerScreen() {
  const headerOp = useSharedValue(0);
  const aiScale = useSharedValue(0.94);
  const aiGlow = useSharedValue(0.08);

  useEffect(() => {
    headerOp.value = withTiming(1, { duration: 550 });
    aiScale.value = withDelay(120, withTiming(1, { duration: 480, easing: Easing.out(Easing.back(1.3)) }));
    aiGlow.value = withRepeat(
      withSequence(
        withTiming(0.18, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.07, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOp.value }));
  const aiCardStyle = useAnimatedStyle(() => ({ transform: [{ scale: aiScale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: aiGlow.value }));

  const completed = HABITS.filter(h => h.progress >= 1).length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Animated.View style={[styles.header, headerStyle]}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>Anwer 👋</Text>
          </View>
          <Pressable style={styles.bell}>
            <Ionicons name="notifications-outline" size={21} color={C.text} />
            <View style={styles.bellDot} />
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.statsRow, headerStyle]}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>5</Text>
            <Text style={styles.statLbl}>Habits</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: C.mint }]}>{completed}</Text>
            <Text style={styles.statLbl}>Done today</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: C.amber }]}>21</Text>
            <Text style={styles.statLbl}>Best streak</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.weekRow, headerStyle]}>
          {DAYS.map((d, i) => {
            const isToday = i === 3;
            const done = DAY_DONE[i];
            return (
              <View key={i} style={styles.dayItem}>
                <View style={[styles.dayDot, done && styles.dayDotDone, isToday && styles.dayDotToday]}>
                  {done
                    ? <Ionicons name="checkmark" size={11} color="#fff" />
                    : isToday
                      ? <View style={styles.todayPulse} />
                      : null
                  }
                </View>
                <Text style={[styles.dayLbl, isToday && styles.dayLblToday]}>{d}</Text>
              </View>
            );
          })}
        </Animated.View>

        <Animated.View style={[styles.aiCard, aiCardStyle]}>
          <Animated.View style={[styles.aiGlowLayer, glowStyle]} />
          <LinearGradient
            colors={['#1B0D3D', '#0C0C1B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiGradient}
          >
            <View style={styles.aiTop}>
              <LinearGradient colors={[C.violetMid, '#5B21B6']} style={styles.aiIconBg}>
                <Ionicons name="sparkles" size={15} color="#fff" />
              </LinearGradient>
              <Text style={styles.aiTitle}>AI Insight</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveTxt}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.aiBody}>
              You complete habits{' '}
              <Text style={{ color: C.violetLight, fontWeight: '700' }}>47% faster</Text> on
              weekdays. Schedule your run before{' '}
              <Text style={{ color: C.amber, fontWeight: '700' }}>7 PM</Text> to protect your
              streak.
            </Text>
            <View style={styles.aiFooter}>
              <Text style={styles.aiFooterTxt}>3 more recommendations</Text>
              <Ionicons name="chevron-forward" size={13} color={C.violetLight} />
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Today's Habits</Text>
          <Text style={styles.sectionCount}>{completed} / {HABITS.length} complete</Text>
        </View>

        {HABITS.map((habit, i) => (
          <HabitCard key={habit.id} habit={habit} index={i} />
        ))}

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  blob1: {
    position: 'absolute',
    top: -100,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: C.violet,
    opacity: 0.07,
  },
  blob2: {
    position: 'absolute',
    top: 240,
    right: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#3B82F6',
    opacity: 0.05,
  },
  scroll: {
    paddingTop: 62,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 26,
  },
  greeting: {
    fontSize: 13,
    color: C.muted,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  name: {
    fontSize: 27,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.6,
  },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.violet,
    borderWidth: 1.5,
    borderColor: C.bg,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.5,
  },
  statLbl: {
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },
  statSep: {
    width: 1,
    backgroundColor: C.border,
    marginVertical: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 22,
  },
  dayItem: {
    alignItems: 'center',
    gap: 5,
  },
  dayDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotDone: {
    backgroundColor: C.mint,
    borderColor: C.mint,
  },
  dayDotToday: {
    borderColor: C.violetLight,
    borderWidth: 2,
  },
  todayPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.violet,
  },
  dayLbl: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '500',
  },
  dayLblToday: {
    color: C.violetLight,
    fontWeight: '700',
  },
  aiCard: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.violet + '55',
    marginBottom: 28,
  },
  aiGlowLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.violet,
  },
  aiGradient: {
    padding: 20,
  },
  aiTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 13,
  },
  aiIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    letterSpacing: 0.1,
  },
  liveBadge: {
    backgroundColor: C.mint + '25',
    borderWidth: 1,
    borderColor: C.mint + '50',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: C.mint,
    letterSpacing: 0.8,
  },
  aiBody: {
    fontSize: 14,
    lineHeight: 22,
    color: C.text,
    opacity: 0.88,
    marginBottom: 14,
  },
  aiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiFooterTxt: {
    fontSize: 12,
    color: C.violetLight,
    fontWeight: '500',
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 12,
    color: C.muted,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 13,
    marginBottom: 10,
    gap: 13,
  },
  habitIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    letterSpacing: -0.1,
    marginBottom: 5,
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  habitStreak: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '500',
  },
  doneBadge: {
    backgroundColor: C.mint + '22',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 4,
  },
  doneText: {
    fontSize: 10,
    color: C.mint,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ringWrap: {
    width: RS,
    height: RS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '700',
  },
});