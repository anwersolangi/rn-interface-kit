import { StatusBar, Platform, StyleSheet } from "react-native";
import { useState, useCallback, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  interpolateColor,
  Extrapolation,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  FadeInDown,
  FadeIn,
  runOnJS,
} from "react-native-reanimated";
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

const SBH = Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 24;

const AVATAR =
  "https://images.unsplash.com/photo-1753545975907-dcb51efdd0d5?q=80&w=1598&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const LIGHT = {
  bg: "#F2F4F7",
  card: "#FFFFFF",
  cardBorder: "#EFF1F5",
  text: "#0F172A",
  textSec: "#64748B",
  textMuted: "#94A3B8",
  accent: "#6366F1",
  accentLight: "#EEF2FF",
  green: "#22C55E",
  greenBg: "#F0FDF4",
  greenBorder: "#BBF7D0",
  red: "#EF4444",
  redBg: "#FEF2F2",
  orange: "#F59E0B",
  orangeBg: "#FFFBEB",
  divider: "#F1F5F9",
  shadow: "#0F172A",
  switchTrack: "#E2E8F0",
  switchThumb: "#FFFFFF",
  switchActive: "#6366F1",
  statusBar: "dark-content" as const,
};

const DARK = {
  bg: "#0D1117",
  card: "#161B22",
  cardBorder: "#21262D",
  text: "#F0F6FC",
  textSec: "#8B949E",
  textMuted: "#484F58",
  accent: "#818CF8",
  accentLight: "#1E1B4B",
  green: "#22C55E",
  greenBg: "#052E16",
  greenBorder: "#166534",
  red: "#F87171",
  redBg: "#450A0A",
  orange: "#FBBF24",
  orangeBg: "#451A03",
  divider: "#21262D",
  shadow: "#010409",
  switchTrack: "#30363D",
  switchThumb: "#F0F6FC",
  switchActive: "#818CF8",
  statusBar: "light-content" as const,
};

type Theme = typeof LIGHT;

function AnimatedSwitch({
  value,
  onToggle,
  theme,
}: {
  value: boolean;
  onToggle: () => void;
  theme: Theme;
}) {
  const progress = useSharedValue(value ? 1 : 0);
  const thumbScale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 300 });
  }, [value]);

  const trackStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      progress.value,
      [0, 1],
      [theme.switchTrack, theme.switchActive]
    );
    return { backgroundColor: bgColor };
  });

  const thumbStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [2, 22]);
    return {
      transform: [{ translateX }, { scale: thumbScale.value }],
    };
  });

  const gesture = Gesture.Tap()
    .onBegin(() => {
      thumbScale.value = withSpring(0.85, { damping: 15 });
    })
    .onEnd(() => {
      thumbScale.value = withSpring(1, { damping: 12 });
      runOnJS(onToggle)();
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.switchTrack, trackStyle]}>
        <Animated.View
          style={[
            styles.switchThumb,
            { backgroundColor: theme.switchThumb },
            thumbStyle,
          ]}
        >
          {value ? (
            <Ionicons
              name="checkmark"
              size={12}
              color={theme.switchActive}
            />
          ) : null}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

function DarkModeToggle({
  isDark,
  onToggle,
  theme,
}: {
  isDark: boolean;
  onToggle: () => void;
  theme: Theme;
}) {
  const progress = useSharedValue(isDark ? 1 : 0);
  const iconScale = useSharedValue(1);
  const iconRotation = useSharedValue(isDark ? 180 : 0);
  const starsOpacity = useSharedValue(isDark ? 0.7 : 0);

  useEffect(() => {
    progress.value = withTiming(isDark ? 1 : 0, {
      duration: 500,
      easing: Easing.bezierFn(0.4, 0, 0.2, 1),
    });
    iconRotation.value = withTiming(isDark ? 180 : 0, { duration: 500 });
    starsOpacity.value = withTiming(isDark ? 0.7 : 0, { duration: 400 });
  }, [isDark]);

  const trackStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      progress.value,
      [0, 1],
      ["#FEF3C7", "#1E1B4B"]
    );
    return { backgroundColor: bg };
  });

  const thumbStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [3, 33]);
    return {
      transform: [
        { translateX },
        { scale: iconScale.value },
        { rotate: `${iconRotation.value}deg` },
      ],
    };
  });

  const sunMoonBg = useAnimatedStyle(() => {
    const bg = interpolateColor(
      progress.value,
      [0, 1],
      ["#F59E0B", "#818CF8"]
    );
    return { backgroundColor: bg };
  });

  const starsStyle = useAnimatedStyle(() => ({
    opacity: starsOpacity.value,
  }));

  const gesture = Gesture.Tap()
    .onBegin(() => {
      iconScale.value = withSequence(
        withTiming(0.7, { duration: 150 }),
        withSpring(1.1, { damping: 8, stiffness: 200 })
      );
    })
    .onEnd(() => {
      iconScale.value = withSpring(1, { damping: 10, stiffness: 180 });
      runOnJS(onToggle)();
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.darkToggleTrack, trackStyle]}>
        <Animated.View style={[styles.darkToggleStars, starsStyle]}>
          <Animated.View style={[styles.star, { top: 6, left: 8 }]} />
          <Animated.View style={[styles.star, { top: 16, left: 20 }]} />
          <Animated.View
            style={[styles.starSmall, { top: 8, left: 28 }]}
          />
          <Animated.View
            style={[styles.starSmall, { top: 20, left: 12 }]}
          />
        </Animated.View>
        <Animated.View style={thumbStyle}>
          <Animated.View style={[styles.darkToggleThumb, sunMoonBg]}>
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={16}
              color="#FFFFFF"
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

function SettingsRow({
  icon,
  iconColor,
  iconBg,
  label,
  sublabel,
  rightElement,
  theme,
  delay,
  onPress,
  isDestructive,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  sublabel?: string;
  rightElement?: React.ReactNode;
  theme: Theme;
  delay: number;
  onPress?: () => void;
  isDestructive?: boolean;
}) {
  const pressScale = useSharedValue(1);
  const pressOpacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
    opacity: pressOpacity.value,
  }));

  const gesture = Gesture.Tap()
    .onBegin(() => {
      pressScale.value = withTiming(0.97, { duration: 100 });
      pressOpacity.value = withTiming(0.7, { duration: 100 });
    })
    .onFinalize(() => {
      pressScale.value = withSpring(1, { damping: 15 });
      pressOpacity.value = withTiming(1, { duration: 200 });
      if (onPress) runOnJS(onPress)();
    });

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 14,
              paddingHorizontal: 16,
            },
            animStyle,
          ]}
        >
          <Animated.View
            style={[styles.rowIcon, { backgroundColor: iconBg }]}
          >
            <Ionicons
              name={icon as any}
              size={18}
              color={iconColor}
            />
          </Animated.View>
          <Animated.View style={{ flex: 1, marginLeft: 14 }}>
            <Animated.Text
              style={[
                styles.rowLabel,
                {
                  color: isDestructive ? theme.red : theme.text,
                },
              ]}
            >
              {label}
            </Animated.Text>
            {sublabel && (
              <Animated.Text
                style={[
                  styles.rowSublabel,
                  { color: theme.textMuted },
                ]}
              >
                {sublabel}
              </Animated.Text>
            )}
          </Animated.View>
          {rightElement || (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textMuted}
            />
          )}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

function SectionCard({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Theme;
}) {
  return (
    <Animated.View
      style={[
        styles.sectionCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
          shadowColor: theme.shadow,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function Divider({ theme }: { theme: Theme }) {
  return (
    <Animated.View
      style={{
        height: 1,
        backgroundColor: theme.divider,
        marginLeft: 62,
      }}
    />
  );
}

export default function SettingsScreen() {
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [haptics, setHaptics] = useState(true);

  const scrollY = useSharedValue(0);
  const themeProgress = useSharedValue(0);

  const theme = isDark ? DARK : LIGHT;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerBg = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, 60],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const toggleDark = useCallback(() => {
    setIsDark((p) => !p);
  }, []);

  useEffect(() => {
    themeProgress.value = withTiming(isDark ? 1 : 0, {
      duration: 500,
      easing: Easing.bezierFn(0.4, 0, 0.2, 1),
    });
  }, [isDark]);

  const bgStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.bg, DARK.bg]
    );
    return { backgroundColor: bg };
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View style={[{ flex: 1 }, bgStyle]}>
        <StatusBar
          barStyle={theme.statusBar}
          translucent
          backgroundColor="transparent"
        />

        <Animated.View
          style={[
            styles.stickyHeader,
            headerBg,
            {
              backgroundColor: isDark
                ? "rgba(13,17,23,0.96)"
                : "rgba(242,244,247,0.96)",
              borderBottomColor: theme.divider,
            },
          ]}
        >
          <Animated.Text
            style={[styles.stickyTitle, { color: theme.text }]}
          >
            Settings
          </Animated.Text>
        </Animated.View>

        <Animated.View style={styles.topBar}>
          <Animated.View
            style={[
              styles.topBtn,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Animated.View>
          <Animated.Text
            style={[styles.topTitle, { color: theme.text }]}
          >
            Settings
          </Animated.Text>
          <Animated.View style={{ width: 40 }} />
        </Animated.View>

        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: SBH + 56,
            paddingBottom: 40,
            paddingHorizontal: 20,
          }}
        >
          <Animated.View
            entering={FadeIn.delay(100).duration(500)}
            style={[
              styles.profileCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
                shadowColor: theme.shadow,
              },
            ]}
          >
            <Animated.View style={styles.profileRow}>
              <Animated.View style={styles.profileAvatarWrap}>
                <Image
                  source={{ uri: AVATAR }}
                  style={styles.profileAvatar}
                  contentFit="cover"
                  transition={400}
                />
                <Animated.View
                  style={[
                    styles.profileOnline,
                    { borderColor: theme.card },
                  ]}
                />
              </Animated.View>
              <Animated.View style={{ flex: 1, marginLeft: 14 }}>
                <Animated.View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Animated.Text
                    style={[
                      styles.profileName,
                      { color: theme.text },
                    ]}
                  >
                    Anwer Solangi
                  </Animated.Text>
                  <Animated.View
                    style={[
                      styles.proBadge,
                      {
                        backgroundColor: theme.greenBg,
                        borderColor: theme.greenBorder,
                      },
                    ]}
                  >
                    <Animated.Text
                      style={[
                        styles.proText,
                        { color: theme.green },
                      ]}
                    >
                      PRO
                    </Animated.Text>
                  </Animated.View>
                </Animated.View>
                <Animated.Text
                  style={[
                    styles.profileEmail,
                    { color: theme.textSec },
                  ]}
                >
                  @anwersolangidev
                </Animated.Text>
              </Animated.View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.textMuted}
              />
            </Animated.View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={[
              styles.darkModeCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
                shadowColor: theme.shadow,
              },
            ]}
          >
            <Animated.View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
              }}
            >
              <Animated.View
                style={[
                  styles.rowIcon,
                  {
                    backgroundColor: isDark
                      ? "#1E1B4B"
                      : "#FFFBEB",
                  },
                ]}
              >
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={18}
                  color={isDark ? "#A5B4FC" : "#F59E0B"}
                />
              </Animated.View>
              <Animated.View style={{ marginLeft: 14 }}>
                <Animated.Text
                  style={[styles.rowLabel, { color: theme.text }]}
                >
                  Dark Mode
                </Animated.Text>
                <Animated.Text
                  style={[
                    styles.rowSublabel,
                    { color: theme.textMuted },
                  ]}
                >
                  {isDark ? "Easier on the eyes" : "Light & bright"}
                </Animated.Text>
              </Animated.View>
            </Animated.View>
            <DarkModeToggle
              isDark={isDark}
              onToggle={toggleDark}
              theme={theme}
            />
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(280).duration(400)}
            style={[
              styles.sectionLabel,
              { color: theme.textMuted },
            ]}
          >
            GENERAL
          </Animated.Text>
          <SectionCard theme={theme}>
            <SettingsRow
              icon="notifications-outline"
              iconColor="#6366F1"
              iconBg={theme.accentLight}
              label="Notifications"
              sublabel="Push, email & in-app"
              rightElement={
                <AnimatedSwitch
                  value={notifications}
                  onToggle={() => setNotifications((p) => !p)}
                  theme={theme}
                />
              }
              theme={theme}
              delay={320}
            />
            <Divider theme={theme} />
            <SettingsRow
              icon="globe-outline"
              iconColor="#0EA5E9"
              iconBg={isDark ? "#0C2D48" : "#F0F9FF"}
              label="Language"
              sublabel="English (US)"
              theme={theme}
              delay={360}
            />
            <Divider theme={theme} />
            <SettingsRow
              icon="phone-portrait-outline"
              iconColor="#8B5CF6"
              iconBg={isDark ? "#2E1065" : "#F5F3FF"}
              label="Haptic Feedback"
              rightElement={
                <AnimatedSwitch
                  value={haptics}
                  onToggle={() => setHaptics((p) => !p)}
                  theme={theme}
                />
              }
              theme={theme}
              delay={400}
            />
            <Divider theme={theme} />
            <SettingsRow
              icon="cloud-download-outline"
              iconColor="#22C55E"
              iconBg={theme.greenBg}
              label="Auto Update"
              sublabel="Keep app up to date"
              rightElement={
                <AnimatedSwitch
                  value={autoUpdate}
                  onToggle={() => setAutoUpdate((p) => !p)}
                  theme={theme}
                />
              }
              theme={theme}
              delay={440}
            />
          </SectionCard>

          <Animated.Text
            entering={FadeInDown.delay(460).duration(400)}
            style={[
              styles.sectionLabel,
              { color: theme.textMuted },
            ]}
          >
            PRIVACY & SECURITY
          </Animated.Text>
          <SectionCard theme={theme}>
            <SettingsRow
              icon="finger-print-outline"
              iconColor="#EC4899"
              iconBg={isDark ? "#4A1942" : "#FDF2F8"}
              label="Biometrics"
              sublabel="Face ID / Fingerprint"
              rightElement={
                <AnimatedSwitch
                  value={biometrics}
                  onToggle={() => setBiometrics((p) => !p)}
                  theme={theme}
                />
              }
              theme={theme}
              delay={500}
            />
            <Divider theme={theme} />
            <SettingsRow
              icon="lock-closed-outline"
              iconColor="#F59E0B"
              iconBg={theme.orangeBg}
              label="Change Password"
              theme={theme}
              delay={540}
            />
            <Divider theme={theme} />
            <SettingsRow
              icon="shield-checkmark-outline"
              iconColor="#10B981"
              iconBg={theme.greenBg}
              label="Two-Factor Auth"
              sublabel="Enabled"
              theme={theme}
              delay={580}
            />
            <Divider theme={theme} />
            <SettingsRow
              icon="analytics-outline"
              iconColor="#6366F1"
              iconBg={theme.accentLight}
              label="Usage Analytics"
              rightElement={
                <AnimatedSwitch
                  value={analytics}
                  onToggle={() => setAnalytics((p) => !p)}
                  theme={theme}
                />
              }
              theme={theme}
              delay={620}
            />
          </SectionCard>

          <Animated.Text
            entering={FadeInDown.delay(640).duration(400)}
            style={[
              styles.sectionLabel,
              { color: theme.textMuted },
            ]}
          >
            DEVELOPER
          </Animated.Text>
          <SectionCard theme={theme}>
            <SettingsRow
              icon="code-slash-outline"
              iconColor="#3B82F6"
              iconBg={isDark ? "#172554" : "#EFF6FF"}
              label="API Keys"
              sublabel="Manage access tokens"
              theme={theme}
              delay={680}
            />
            <Divider theme={theme} />
            <SettingsRow
              icon="git-branch-outline"
              iconColor="#A855F7"
              iconBg={isDark ? "#3B0764" : "#FAF5FF"}
              label="GitHub Integration"
              sublabel="Connected"
              rightElement={
                <Animated.View
                  style={[
                    styles.connectedBadge,
                    {
                      backgroundColor: theme.greenBg,
                      borderColor: theme.greenBorder,
                    },
                  ]}
                >
                  <Animated.View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: theme.green,
                    }}
                  />
                  <Animated.Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: theme.green,
                    }}
                  >
                    Connected
                  </Animated.Text>
                </Animated.View>
              }
              theme={theme}
              delay={720}
            />
            <Divider theme={theme} />
            <SettingsRow
              icon="terminal-outline"
              iconColor="#14B8A6"
              iconBg={isDark ? "#042F2E" : "#F0FDFA"}
              label="Debug Console"
              theme={theme}
              delay={760}
            />
          </SectionCard>

          <Animated.Text
            entering={FadeInDown.delay(780).duration(400)}
            style={[
              styles.sectionLabel,
              { color: theme.textMuted },
            ]}
          >
            SUPPORT
          </Animated.Text>
          <SectionCard theme={theme}>
            <SettingsRow
              icon="help-circle-outline"
              iconColor="#0EA5E9"
              iconBg={isDark ? "#0C2D48" : "#F0F9FF"}
              label="Help Center"
              theme={theme}
              delay={820}
            />
            <Divider theme={theme} />
            <SettingsRow
              icon="chatbubbles-outline"
              iconColor="#6366F1"
              iconBg={theme.accentLight}
              label="Contact Support"
              theme={theme}
              delay={860}
            />
            <Divider theme={theme} />
            <SettingsRow
              icon="star-outline"
              iconColor="#F59E0B"
              iconBg={theme.orangeBg}
              label="Rate the App"
              theme={theme}
              delay={900}
            />
            <Divider theme={theme} />
            <SettingsRow
              icon="document-text-outline"
              iconColor={theme.textSec}
              iconBg={isDark ? "#21262D" : "#F1F5F9"}
              label="Terms & Privacy"
              theme={theme}
              delay={940}
            />
          </SectionCard>

          <Animated.View
            entering={FadeInDown.delay(980).duration(400)}
            style={{ marginTop: 12 }}
          >
            <SectionCard theme={theme}>
              <SettingsRow
                icon="log-out-outline"
                iconColor={theme.red}
                iconBg={theme.redBg}
                label="Log Out"
                isDestructive
                theme={theme}
                delay={1000}
              />
            </SectionCard>
          </Animated.View>

          <Animated.View
            entering={FadeIn.delay(1050).duration(400)}
            style={styles.footer}
          >
            <Animated.Text
              style={[styles.footerText, { color: theme.textMuted }]}
            >
              Version 2.4.1 (Build 847)
            </Animated.Text>
            <Animated.Text
              style={[styles.footerSub, { color: theme.textMuted }]}
            >
              Made with ❤️ by Anwer Solangi
            </Animated.Text>
          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9,
    height: SBH + 44,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  stickyTitle: { fontSize: 17, fontWeight: "700" },
  topBar: {
    position: "absolute",
    top: SBH,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 44,
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  topTitle: { fontSize: 18, fontWeight: "700" },
  profileCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 5,
  },
  profileRow: { flexDirection: "row", alignItems: "center" },
  profileAvatarWrap: { position: "relative" },
  profileAvatar: { width: 56, height: 56, borderRadius: 18 },
  profileOnline: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#22C55E",
    borderWidth: 3,
  },
  profileName: { fontSize: 18, fontWeight: "700" },
  profileEmail: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  proText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  darkModeCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 5,
  },
  darkToggleTrack: {
    width: 64,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    overflow: "hidden",
  },
  darkToggleStars: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  star: {
    position: "absolute" as const,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#E2E8F0",
  },
  starSmall: {
    position: "absolute" as const,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#E2E8F0",
  },
  darkToggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  rowSublabel: { fontSize: 12, fontWeight: "400", marginTop: 1 },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  footer: { alignItems: "center", marginTop: 24, marginBottom: 10 },
  footerText: { fontSize: 13, fontWeight: "500" },
  footerSub: { fontSize: 12, fontWeight: "400", marginTop: 4 },
});