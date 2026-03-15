import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  withRepeat,
  withSequence,
  withDelay,
  Extrapolation,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

const quickActions = [
  { id: 1, icon: 'code-slash', title: 'Code Helper', color: '#06B6D4', gradient: ['#06B6D4', '#0891B2'] },
  { id: 2, icon: 'brush', title: 'Creative Writing', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
  { id: 3, icon: 'calculator', title: 'Math Solver', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
  { id: 4, icon: 'language', title: 'Translator', color: '#10B981', gradient: ['#10B981', '#059669'] },
];

const recentChats = [
  { id: 1, title: 'React Native Performance', time: '2 hours ago', icon: 'speedometer' },
  { id: 2, title: 'TypeScript Best Practices', time: '5 hours ago', icon: 'code-working' },
  { id: 3, title: 'UI Animation Tips', time: 'Yesterday', icon: 'color-wand' },
];

export default function AIAssistantHomeScreen() {
  const [inputFocused, setInputFocused] = useState(false);
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.9);
  const inputOpacity = useSharedValue(0);
  const inputTranslateY = useSharedValue(20);
  const fabScale = useSharedValue(0);
  const fabRotate = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    headerTranslateY.value = withDelay(100, withSpring(0, springConfig));
    
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    titleScale.value = withDelay(300, withSpring(1, springConfig));
    
    inputOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    inputTranslateY.value = withDelay(500, withSpring(0, springConfig));
    
    fabScale.value = withDelay(1200, withSpring(1, { damping: 12, stiffness: 100 }));
    
    pulseScale.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      )
    );
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
    transform: [{ translateY: inputTranslateY.value }],
  }));

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: fabScale.value },
      { rotate: `${fabRotate.value}deg` },
    ],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: interpolate(
      pulseScale.value,
      [1, 1.1],
      [0.5, 0],
      Extrapolation.CLAMP
    ),
  }));

  const scrollHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

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
          colors={['rgba(6,182,212,0.15)', 'transparent']}
          style={styles.glowTop}
        />
        <LinearGradient
          colors={['transparent', 'rgba(139,92,246,0.1)']}
          style={styles.glowBottom}
        />
      </View>

      <Animated.View style={[styles.scrollHeader, scrollHeaderStyle]}>
        <BlurView intensity={80} tint="dark" style={styles.scrollHeaderBlur}>
          <LinearGradient
            colors={['rgba(15,23,42,0.8)', 'rgba(15,23,42,0.6)']}
            style={styles.scrollHeaderGradient}
          >
            <Text style={styles.scrollHeaderText}>AI Assistant</Text>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#06B6D4', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>AS</Text>
                </View>
              </LinearGradient>
              <View style={styles.avatarGlow}>
                <LinearGradient
                  colors={['rgba(6,182,212,0.4)', 'transparent']}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: 35 }]}
                />
              </View>
            </View>
            <View>
              <Text style={styles.greeting}>Good Evening</Text>
              <Text style={styles.username}>Anwer Solangi</Text>
            </View>
          </View>
          
          <Pressable style={styles.settingsButton}>
            <BlurView intensity={30} tint="dark" style={styles.iconBlur}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.iconGradient}
              >
                <Ionicons name="settings-outline" size={22} color="#fff" />
              </LinearGradient>
            </BlurView>
          </Pressable>
        </Animated.View>

        <Animated.View style={titleAnimatedStyle}>
          <Text style={styles.title}>
            How can I{'\n'}
            <Text style={styles.titleAccent}>help you</Text> today?
          </Text>
        </Animated.View>

        <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
          <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.inputGradient}
            >
              <View style={styles.inputBorder}>
                <View style={styles.inputWrapper}>
                  <View style={styles.sparkleContainer}>
                    <LinearGradient
                      colors={['#06B6D4', '#0891B2']}
                      style={styles.sparkleGradient}
                    >
                      <Ionicons name="sparkles" size={18} color="#fff" />
                    </LinearGradient>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Ask me anything..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                  />
                  <MicButton />
                </View>
              </View>
            </LinearGradient>
          </BlurView>
          <View style={styles.inputShadow}>
            <LinearGradient
              colors={['rgba(6,182,212,0.3)', 'transparent']}
              style={styles.inputShadowGradient}
            />
          </View>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <QuickActionCard key={action.id} action={action} index={index} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Chats</Text>
            <Pressable>
              <BlurView intensity={20} tint="dark" style={styles.seeAllBlur}>
                <Text style={styles.seeAll}>See All</Text>
              </BlurView>
            </Pressable>
          </View>
          
          {recentChats.map((chat, index) => (
            <RecentChatCard key={chat.id} chat={chat} index={index} />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      <AnimatedPressable style={[styles.fabContainer, fabAnimatedStyle]}>
        <Animated.View style={[styles.fabPulse, pulseAnimatedStyle]}>
          <LinearGradient
            colors={['#06B6D4', 'transparent']}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 42 }]}
          />
        </Animated.View>
        <BlurView intensity={50} tint="dark" style={styles.fab}>
          <LinearGradient
            colors={['rgba(6,182,212,0.4)', 'rgba(6,182,212,0.2)']}
            style={styles.fabGradient}
          >
            <LinearGradient
              colors={['#06B6D4', '#0891B2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabInner}
            >
              <MaterialCommunityIcons name="robot-excited-outline" size={30} color="#fff" />
            </LinearGradient>
          </LinearGradient>
        </BlurView>
      </AnimatedPressable>
    </View>
  );
}

function MicButton() {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, springConfig) }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: withTiming(glowOpacity.value, { duration: 200 }),
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = 0.85;
        glowOpacity.value = 1;
      }}
      onPressOut={() => {
        scale.value = 1;
        glowOpacity.value = 0;
      }}
    >
      <Animated.View style={styles.micButtonContainer}>
        <Animated.View style={[styles.micGlow, glowStyle]}>
          <LinearGradient
            colors={['rgba(6,182,212,0.6)', 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
        <Animated.View style={[styles.micButton, animatedStyle]}>
          <LinearGradient
            colors={['#06B6D4', '#0891B2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.micGradient}
          >
            <Ionicons name="mic" size={18} color="#fff" />
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

function QuickActionCard({ action, index }: { action: typeof quickActions[0]; index: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withDelay(700 + index * 100, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(700 + index * 100, withSpring(0, springConfig));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: withSpring(scale.value, springConfig) },
      { translateY: translateY.value },
    ],
  }));

  return (
    <AnimatedPressable
      style={[styles.quickActionCard, animatedStyle]}
      onPressIn={() => (scale.value = 0.92)}
      onPressOut={() => (scale.value = 1)}
    >
      <BlurView intensity={40} tint="dark" style={styles.cardBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardBorder}>
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: action.color + '15' }]}>
                <LinearGradient
                  colors={[...action.gradient, action.color]}
                  style={styles.iconInnerGradient}
                >
                  <Ionicons name={action.icon as any} size={22} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <View style={styles.cardArrow}>
                <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.4)" />
              </View>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
      <View style={styles.cardShadow}>
        <LinearGradient
          colors={[action.color + '30', 'transparent']}
          style={styles.cardShadowGradient}
        />
      </View>
    </AnimatedPressable>
  );
}

function RecentChatCard({ chat, index }: { chat: typeof recentChats[0]; index: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(1100 + index * 80, withTiming(1, { duration: 500 }));
    translateX.value = withDelay(1100 + index * 80, withSpring(0, springConfig));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: withSpring(scale.value, springConfig) },
      { translateX: translateX.value },
    ],
  }));

  return (
    <AnimatedPressable
      style={[styles.recentChatCard, animatedStyle]}
      onPressIn={() => (scale.value = 0.97)}
      onPressOut={() => (scale.value = 1)}
    >
      <BlurView intensity={30} tint="dark" style={styles.chatBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chatGradient}
        >
          <View style={styles.chatBorder}>
            <View style={styles.chatIconContainer}>
              <LinearGradient
                colors={['rgba(6,182,212,0.3)', 'rgba(6,182,212,0.15)']}
                style={styles.chatIconGradient}
              >
                <Ionicons name={chat.icon as any} size={18} color="#06B6D4" />
              </LinearGradient>
            </View>
            <View style={styles.chatContent}>
              <Text style={styles.chatTitle} numberOfLines={1}>{chat.title}</Text>
              <Text style={styles.chatTime}>{chat.time}</Text>
            </View>
            <View style={styles.chatArrowContainer}>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
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
  scrollHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: 100,
  },
  scrollHeaderBlur: {
    flex: 1,
  },
  scrollHeaderGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  scrollHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  scrollContent: {
    paddingTop: 70,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 36,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    position: 'relative',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
    padding: 2,
  },
  avatarInner: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  avatarGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    top: -8,
    left: -8,
    zIndex: -1,
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  username: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  settingsButton: {
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
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    paddingHorizontal: 24,
    marginBottom: 28,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  titleAccent: {
    color: '#06B6D4',
  },
  inputContainer: {
    marginHorizontal: 24,
    marginBottom: 40,
    position: 'relative',
  },
  inputBlur: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  inputGradient: {
    borderRadius: 28,
    padding: 2,
  },
  inputBorder: {
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  sparkleContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  sparkleGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  micButtonContainer: {
    position: 'relative',
  },
  micGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    top: -7,
    left: -7,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  micGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputShadow: {
    position: 'absolute',
    bottom: -8,
    left: 12,
    right: 12,
    height: 20,
    zIndex: -1,
  },
  inputShadowGradient: {
    flex: 1,
    borderRadius: 28,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
    marginBottom: 18,
    paddingHorizontal: 24,
  },
  seeAllBlur: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(6,182,212,0.15)',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: '#06B6D4',
    letterSpacing: 0.3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  quickActionCard: {
    width: (width - 64) / 2,
    height: 140,
    position: 'relative',
  },
  cardBlur: {
    flex: 1,
    borderRadius: 24,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 24,
    padding: 2,
  },
  cardBorder: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    borderRadius: 22,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
  },
  iconInnerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
  cardArrow: {
    alignSelf: 'flex-end',
  },
  cardShadow: {
    position: 'absolute',
    bottom: -6,
    left: 8,
    right: 8,
    height: 16,
    zIndex: -1,
  },
  cardShadowGradient: {
    flex: 1,
    borderRadius: 24,
  },
  recentChatCard: {
    marginHorizontal: 24,
    marginBottom: 14,
    borderRadius: 20,
    overflow: 'hidden',
  },
  chatBlur: {
    flex: 1,
    borderRadius: 20,
  },
  chatGradient: {
    borderRadius: 20,
    padding: 2,
  },
  chatBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(15,23,42,0.4)',
  },
  chatIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
  },
  chatIconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContent: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
    letterSpacing: 0.1,
  },
  chatTime: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  chatArrowContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 36,
    right: 24,
  },
  fabPulse: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    top: -7,
    left: -7,
    zIndex: -1,
  },
  fab: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  fabInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
});