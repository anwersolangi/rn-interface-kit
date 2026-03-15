import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  useAnimatedProps,
} from 'react-native-reanimated';
import Svg, { Circle, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

const habits = [
  { 
    id: 1, 
    title: 'Morning Workout', 
    icon: 'dumbbell', 
    color: '#06B6D4',
    gradient: ['#06B6D4', '#0891B2'],
    completed: true,
    streak: 12,
    time: '6:00 AM',
  },
  { 
    id: 2, 
    title: 'Read 30 Minutes', 
    icon: 'book', 
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
    completed: true,
    streak: 8,
    time: '8:00 PM',
  },
  { 
    id: 3, 
    title: 'Drink 8 Glasses', 
    icon: 'water', 
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
    completed: false,
    streak: 15,
    time: 'All Day',
  },
  { 
    id: 4, 
    title: 'Meditate', 
    icon: 'flower', 
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
    completed: false,
    streak: 5,
    time: '7:00 PM',
  },
];

const weekData = [
  { day: 'Mon', completed: 3, total: 4 },
  { day: 'Tue', completed: 4, total: 4 },
  { day: 'Wed', completed: 2, total: 4 },
  { day: 'Thu', completed: 4, total: 4 },
  { day: 'Fri', completed: 3, total: 4 },
  { day: 'Sat', completed: 4, total: 4 },
  { day: 'Sun', completed: 2, total: 4 },
];

export default function HabitTrackerHomeScreen() {
  const [completedCount, setCompletedCount] = useState(2);
  const totalHabits = habits.length;
  const completionPercentage = (completedCount / totalHabits) * 100;

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const progressOpacity = useSharedValue(0);
  const progressScale = useSharedValue(0.8);
  const chartOpacity = useSharedValue(0);
  const chartTranslateY = useSharedValue(30);

  useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    headerTranslateY.value = withDelay(100, withSpring(0, springConfig));
    
    progressOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    progressScale.value = withDelay(300, withSpring(1, springConfig));
    
    chartOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    chartTranslateY.value = withDelay(600, withSpring(0, springConfig));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
    transform: [{ scale: progressScale.value }],
  }));

  const chartAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
    transform: [{ translateY: chartTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#0A0F1E', '#0F172A', '#1E293B', '#0F172A']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.backgroundGlow}>
        <LinearGradient
          colors={['rgba(139,92,246,0.15)', 'transparent']}
          style={styles.glowTop}
        />
        <LinearGradient
          colors={['transparent', 'rgba(6,182,212,0.1)']}
          style={styles.glowBottom}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View>
            <Text style={styles.greeting}>Today's Progress</Text>
            <Text style={styles.date}>Monday, February 3</Text>
          </View>
          
          <Pressable style={styles.calendarButton}>
            <BlurView intensity={30} tint="dark" style={styles.iconBlur}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.iconGradient}
              >
                <Ionicons name="calendar-outline" size={22} color="#fff" />
              </LinearGradient>
            </BlurView>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.progressSection, progressAnimatedStyle]}>
          <BlurView intensity={40} tint="dark" style={styles.progressBlur}>
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.progressGradient}
            >
              <View style={styles.progressBorder}>
                <View style={styles.progressContent}>
                  <CircularProgress 
                    percentage={completionPercentage}
                    size={140}
                  />
                  <View style={styles.progressStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue} numberOfLines={1}>{completedCount}/{totalHabits}</Text>
                      <Text style={styles.statLabel} numberOfLines={1}>Completed</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue} numberOfLines={1}>12</Text>
                      <Text style={styles.statLabel} numberOfLines={1}>Day Streak</Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        <Animated.View style={[styles.chartSection, chartAnimatedStyle]}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <BlurView intensity={30} tint="dark" style={styles.chartBlur}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.chartGradient}
            >
              <View style={styles.chartBorder}>
                <WeeklyChart data={weekData} />
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        <View style={styles.habitsSection}>
          <View style={styles.habitsSectionHeader}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            <Pressable>
              <BlurView intensity={20} tint="dark" style={styles.addButtonBlur}>
                <LinearGradient
                  colors={['rgba(6,182,212,0.3)', 'rgba(6,182,212,0.15)']}
                  style={styles.addButton}
                >
                  <Ionicons name="add" size={18} color="#06B6D4" />
                </LinearGradient>
              </BlurView>
            </Pressable>
          </View>

          {habits.map((habit, index) => (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              index={index}
              onToggle={() => {
                setCompletedCount(prev => 
                  habit.completed ? prev - 1 : prev + 1
                );
              }}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function CircularProgress({ percentage, size }: { percentage: number; size: number }) {
  const progress = useSharedValue(0);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    progress.value = withDelay(
      800,
      withSpring(percentage / 100, {
        damping: 20,
        stiffness: 100,
      })
    );
  }, [percentage]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={styles.circularProgress}>
      <Svg width={size} height={size}>
        <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
        <Defs>
          <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#06B6D4" />
            <Stop offset="100%" stopColor="#8B5CF6" />
          </SvgLinearGradient>
        </Defs>
      </Svg>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
        <Text style={styles.progressLabel}>Complete</Text>
      </View>
    </View>
  );
}

function WeeklyChart({ data }: { data: typeof weekData }) {
  const maxHeight = 100;

  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => {
        const heightPercentage = (item.completed / item.total) * 100;
        const barHeight = (heightPercentage / 100) * maxHeight;
        
        return (
          <ChartBar
            key={item.day}
            day={item.day}
            height={barHeight}
            maxHeight={maxHeight}
            index={index}
            isToday={index === 6}
          />
        );
      })}
    </View>
  );
}

function ChartBar({ 
  day, 
  height: targetHeight, 
  maxHeight, 
  index,
  isToday 
}: { 
  day: string; 
  height: number; 
  maxHeight: number; 
  index: number;
  isToday: boolean;
}) {
  const height = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    height.value = withDelay(
      900 + index * 80,
      withSpring(targetHeight, springConfig)
    );
  }, [targetHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    transform: [{ scale: withSpring(scale.value, springConfig) }],
  }));

  return (
    <Pressable
      style={styles.chartBarContainer}
      onPressIn={() => (scale.value = 0.9)}
      onPressOut={() => (scale.value = 1)}
    >
      <View style={[styles.chartBarWrapper, { height: maxHeight }]}>
        <Animated.View style={[styles.chartBar, animatedStyle]}>
          <LinearGradient
            colors={isToday ? ['#06B6D4', '#0891B2'] : ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
            style={[styles.chartBarGradient, { borderRadius: 8 }]}
          />
        </Animated.View>
      </View>
      <Text style={[styles.chartDay, isToday && styles.chartDayActive]}>{day}</Text>
    </Pressable>
  );
}

function HabitCard({ 
  habit, 
  index,
  onToggle 
}: { 
  habit: typeof habits[0]; 
  index: number;
  onToggle: () => void;
}) {
  const [isCompleted, setIsCompleted] = useState(habit.completed);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(isCompleted ? 1 : 0);

  useEffect(() => {
    opacity.value = withDelay(1200 + index * 100, withTiming(1, { duration: 500 }));
    translateX.value = withDelay(1200 + index * 100, withSpring(0, springConfig));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { scale: withSpring(scale.value, springConfig) },
    ],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(checkScale.value, springConfig) }],
  }));

  const handleToggle = () => {
    setIsCompleted(!isCompleted);
    checkScale.value = !isCompleted ? 1 : 0;
    onToggle();
  };

  return (
    <AnimatedPressable
      style={[styles.habitCard, animatedStyle]}
      onPressIn={() => (scale.value = 0.97)}
      onPressOut={() => (scale.value = 1)}
      onPress={handleToggle}
    >
      <BlurView intensity={30} tint="dark" style={styles.habitBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.habitGradient}
        >
          <View style={styles.habitBorder}>
            <View style={styles.habitContent}>
              <View style={styles.habitLeft}>
                <View style={[styles.habitIconContainer, { backgroundColor: habit.color + '20' }]}>
                  <LinearGradient
                    colors={habit.gradient}
                    style={[styles.habitIconGradient, { borderRadius: 14 }]}
                  >
                    <MaterialCommunityIcons 
                      name={habit.icon as any} 
                      size={24} 
                      color="#fff" 
                    />
                  </LinearGradient>
                </View>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  <View style={styles.habitMeta}>
                    <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.habitTime}>{habit.time}</Text>
                    <View style={styles.streakBadge}>
                      <Ionicons name="flame" size={12} color="#F59E0B" />
                      <Text style={styles.streakText}>{habit.streak}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Pressable 
                style={[
                  styles.checkButton,
                  isCompleted && styles.checkButtonCompleted
                ]}
                onPress={handleToggle}
              >
                <BlurView intensity={20} tint="dark" style={styles.checkBlur}>
                  <LinearGradient
                    colors={
                      isCompleted 
                        ? habit.gradient
                        : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                    }
                    style={[styles.checkGradient, { borderRadius: 12 }]}
                  >
                    <Animated.View style={checkAnimatedStyle}>
                      <Ionicons 
                        name="checkmark" 
                        size={20} 
                        color={isCompleted ? "#fff" : "rgba(255,255,255,0.3)"} 
                      />
                    </Animated.View>
                  </LinearGradient>
                </BlurView>
              </Pressable>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  backgroundGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  glowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  glowBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  scrollContent: {
    paddingTop: 70,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  date: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  calendarButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
  },
  iconBlur: {
    flex: 1,
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 23,
  },
  progressSection: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 28,
    overflow: 'hidden',
  },
  progressBlur: {
    borderRadius: 28,
  },
  progressGradient: {
    borderRadius: 28,
    padding: 2,
  },
  progressBorder: {
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  progressContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  circularProgress: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  progressLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    marginTop: 2,
  },
  progressStats: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  statItem: {
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  chartSection: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
    marginBottom: 16,
  },
  chartBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  chartGradient: {
    borderRadius: 24,
    padding: 2,
  },
  chartBorder: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(15,23,42,0.4)',
    padding: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  chartBarWrapper: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartBarGradient: {
    flex: 1,
  },
  chartDay: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  chartDayActive: {
    color: '#06B6D4',
  },
  habitsSection: {
    paddingHorizontal: 24,
  },
  habitsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  addButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  habitCard: {
    marginBottom: 14,
    borderRadius: 20,
    overflow: 'hidden',
  },
  habitBlur: {
    flex: 1,
    borderRadius: 20,
  },
  habitGradient: {
    borderRadius: 20,
    padding: 2,
  },
  habitBorder: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(15,23,42,0.4)',
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  habitLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  habitIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
  },
  habitIconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  habitTime: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    marginRight: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '700',
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkButtonCompleted: {
    transform: [{ scale: 1.05 }],
  },
  checkBlur: {
    flex: 1,
  },
  checkGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});