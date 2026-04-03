import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Canvas,
  RoundedRect,
  vec,
} from "@shopify/react-native-skia";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Svg, {
  Circle as SvgCircle,
} from "react-native-svg";

const { width: SW, height: SH } = Dimensions.get("window");

const SPOTIFY_GREEN = "#1DB954";
const SPOTIFY_BLACK = "#121212";
const CARD_RADIUS = 28;
const TEXT_W = "#FFFFFF";

type CardTheme = {
  bg: [string, string, string];
  accent: string;
  accent2: string;
};

const THEMES: Record<string, CardTheme> = {
  intro: {
    bg: ["#1A0533", "#2D1B69", "#1A0533"],
    accent: "#1DB954",
    accent2: "#1ED760",
  },
  minutes: {
    bg: ["#0B3D2E", "#145A3E", "#0B3D2E"],
    accent: "#1DB954",
    accent2: "#6BF5A5",
  },
  topGenre: {
    bg: ["#4A1942", "#7B2D6E", "#4A1942"],
    accent: "#F49FBC",
    accent2: "#FFD6E8",
  },
  topArtist: {
    bg: ["#1A1A2E", "#16213E", "#0F3460"],
    accent: "#E94560",
    accent2: "#FF6B81",
  },
  topSong: {
    bg: ["#2D1B00", "#5C3D1E", "#2D1B00"],
    accent: "#F59E0B",
    accent2: "#FCD34D",
  },
  personality: {
    bg: ["#0A2647", "#144272", "#205295"],
    accent: "#2CD3E1",
    accent2: "#A5F1E9",
  },
  finale: {
    bg: ["#1A0533", "#2D1B69", "#4A1F8E"],
    accent: "#1DB954",
    accent2: "#1ED760",
  },
};

const GENRE_DATA = [
  { name: "Hip-Hop", pct: 34, color: "#E94560" },
  { name: "R&B", pct: 22, color: "#F49FBC" },
  { name: "Pop", pct: 18, color: "#7B2D6E" },
  { name: "Electronic", pct: 15, color: "#2CD3E1" },
  { name: "Indie", pct: 11, color: "#F59E0B" },
];

const MONTHLY_MINUTES = [
  420, 380, 510, 460, 620, 580, 710, 680, 590, 640, 720, 850,
];

const MOOD_DATA = [
  { label: "Energetic", value: 78, color: "#E94560" },
  { label: "Chill", value: 65, color: "#2CD3E1" },
  { label: "Melancholic", value: 42, color: "#7B2D6E" },
  { label: "Hype", value: 88, color: "#F59E0B" },
];

function ProgressDots({
  total,
  current,
  accent,
}: {
  total: number;
  current: number;
  accent: string;
}) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            {
              width: i === current ? 24 : 6,
              backgroundColor: i === current ? accent : "rgba(255,255,255,0.2)",
            },
          ]}
        />
      ))}
    </View>
  );
}

function AnimatedCounter({
  target,
  suffix,
  style,
  duration,
  delay,
}: {
  target: number;
  suffix?: string;
  style: any;
  duration?: number;
  delay?: number;
}) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const d = delay || 0;
    const dur = duration || 2000;
    const timeout = setTimeout(() => {
      started.current = true;
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / dur, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.floor(eased * target));
        if (progress >= 1) clearInterval(interval);
      }, 30);
    }, d);
    return () => clearTimeout(timeout);
  }, [target]);

  const formatted = display.toLocaleString();

  return (
    <Text style={style}>
      {formatted}
      {suffix || ""}
    </Text>
  );
}

function DonutChart({
  data,
  size,
  thickness,
}: {
  data: { name: string; pct: number; color: string }[];
  size: number;
  thickness: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      400,
      withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.85, 1]) }],
  }));

  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let accumulated = 0;
  const segments = data.map((d) => {
    const segLength = (d.pct / 100) * circumference;
    const offset = circumference - (accumulated / 100) * circumference;
    accumulated += d.pct;
    return { ...d, segLength, offset };
  });

  return (
    <Animated.View style={animStyle}>
      <Svg width={size} height={size}>
        <SvgCircle
          cx={cx}
          cy={cy}
          r={r}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={thickness}
          fill="none"
        />
        {segments.map((seg, i) => (
          <SvgCircle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            stroke={seg.color}
            strokeWidth={thickness}
            fill="none"
            strokeDasharray={`${seg.segLength} ${circumference - seg.segLength}`}
            strokeDashoffset={seg.offset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${cx}, ${cy}`}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

function MonthlyBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <View style={styles.barChartContainer}>
      {data.map((val, i) => {
        const h = (val / max) * 100;
        const isHighest = val === max;
        return (
          <Animated.View
            key={i}
            entering={FadeInDown.delay(500 + i * 60)
              .duration(400)
              .easing(Easing.out(Easing.back(1.5)))}
            style={styles.barCol}
          >
            <View style={styles.barTrack}>
              <LinearGradient
                colors={
                  isHighest
                    ? [SPOTIFY_GREEN, "#6BF5A5"]
                    : ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.08)"]
                }
                style={[
                  styles.barFill,
                  {
                    height: `${h}%`,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.barLabel,
                isHighest && { color: SPOTIFY_GREEN, fontWeight: "800" },
              ]}
            >
              {months[i]}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

function MoodBar({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(value, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.moodRow}>
      <Text style={styles.moodLabel}>{label}</Text>
      <View style={styles.moodTrack}>
        <Animated.View style={[styles.moodFill, { backgroundColor: color }, barStyle]}>
          <LinearGradient
            colors={[color, color + "80"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <Text style={[styles.moodValue, { color }]}>{value}%</Text>
    </View>
  );
}

function ConfettiCanvas({ colors }: { colors: string[] }) {
  const [pieces, setPieces] = useState<
    { x: number; y: number; w: number; h: number; color: string; rot: number; vy: number; vx: number }[]
  >([]);
  const frameRef = useRef(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    const initial = Array.from({ length: 60 }, () => ({
      x: SW * 0.2 + Math.random() * SW * 0.6,
      y: -20 - Math.random() * 200,
      w: 4 + Math.random() * 6,
      h: 8 + Math.random() * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      vy: 1.5 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 2,
    }));
    setPieces(initial);

    const id = setInterval(() => {
      frameRef.current += 1;
      setPieces((prev) =>
        prev.map((p) => ({
          ...p,
          y: p.y + p.vy,
          x: p.x + p.vx + Math.sin(frameRef.current * 0.05 + p.rot) * 0.5,
          rot: p.rot + 2,
          vy: p.vy + 0.02,
        }))
      );
      setTick((t) => t + 1);
    }, 30);

    return () => clearInterval(id);
  }, []);

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <RoundedRect
          key={i}
          x={p.x}
          y={p.y}
          width={p.w}
          height={p.h}
          r={2}
          color={p.color}
          opacity={p.y > SH ? 0 : 0.8}
          transform={[{ rotate: (p.rot * Math.PI) / 180 }]}
          origin={vec(p.x + p.w / 2, p.y + p.h / 2)}
        />
      ))}
    </Canvas>
  );
}

function CardIntro({ theme }: { theme: CardTheme }) {
  const scale = useSharedValue(0.8);
  const rotate = useSharedValue(-5);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 80 });
    rotate.value = withSpring(0, { damping: 14 });
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <View style={styles.cardContent}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Animated.View style={logoStyle}>
          <MaterialCommunityIcons name="spotify" size={80} color={SPOTIFY_GREEN} />
        </Animated.View>
        <Animated.Text
          entering={FadeInDown.delay(300).springify()}
          style={styles.introYear}
        >
          2025
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(500).springify()}
          style={styles.introTitle}
        >
          WRAPPED
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(700).springify()}
          style={styles.introSub}
        >
          Your year in music
        </Animated.Text>
      </View>
      <Animated.Text
        entering={FadeIn.delay(1000)}
        style={styles.swipeHint}
      >
        Swipe to begin →
      </Animated.Text>
    </View>
  );
}

function CardMinutes({ theme }: { theme: CardTheme }) {
  return (
    <View style={styles.cardContent}>
      <Animated.Text entering={FadeInDown.delay(200)} style={styles.cardLabel}>
        You listened to
      </Animated.Text>
      <View style={styles.bigNumberRow}>
        <AnimatedCounter
          target={42847}
          style={[styles.bigNumber, { color: theme.accent2 }]}
          duration={2500}
          delay={400}
        />
      </View>
      <Animated.Text entering={FadeInDown.delay(600)} style={styles.bigNumberUnit}>
        minutes of music
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(800)} style={styles.statComparison}>
        {"That's more than 94% of listeners"}
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(900)} style={styles.monthlySection}>
        <Text style={styles.monthlyTitle}>Your monthly breakdown</Text>
        <MonthlyBarChart data={MONTHLY_MINUTES} />
      </Animated.View>

      <Animated.View entering={FadeIn.delay(1200)} style={styles.funFact}>
        <MaterialCommunityIcons name="clock-outline" size={16} color={theme.accent} />
        <Text style={styles.funFactText}>
          {"That's 29 days, 17 hours of music"}
        </Text>
      </Animated.View>
    </View>
  );
}

function CardTopGenre({ theme }: { theme: CardTheme }) {
  return (
    <View style={styles.cardContent}>
      <Animated.Text entering={FadeInDown.delay(200)} style={styles.cardLabel}>
        Your top genre was
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(400).springify()}
        style={[styles.genreTitle, { color: theme.accent }]}
      >
        Sufi Rock
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(500)} style={styles.genreSub}>
        You explored 122 SufiRock tracks this year
      </Animated.Text>

      <Animated.View
        entering={FadeIn.delay(600)}
        style={styles.donutRow}
      >
        <DonutChart data={GENRE_DATA} size={140} thickness={14} />
        <View style={styles.genreLegend}>
          {GENRE_DATA.map((g, i) => (
            <Animated.View
              key={g.name}
              entering={FadeInDown.delay(800 + i * 100)}
              style={styles.legendItem}
            >
              <View style={[styles.legendDot, { backgroundColor: g.color }]} />
              <Text style={styles.legendName}>{g.name}</Text>
              <Text style={[styles.legendPct, { color: g.color }]}>{g.pct}%</Text>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

function CardTopArtist({ theme }: { theme: CardTheme }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={styles.cardContent}>
      <Animated.Text entering={FadeInDown.delay(200)} style={styles.cardLabel}>
        Your top artist was
      </Animated.Text>

      <Animated.View entering={FadeIn.delay(400)} style={styles.artistSection}>
        <Animated.View style={[styles.artistAvatar, pulseStyle]}>
          <LinearGradient
            colors={[theme.accent, theme.accent2]}
            style={styles.avatarGradient}
          >
            <MaterialCommunityIcons name="account-music" size={48} color="#FFF" />
          </LinearGradient>
        </Animated.View>
        <Animated.Text
          entering={FadeInDown.delay(600).springify()}
          style={[styles.artistName, { color: theme.accent }]}
        >
          Junoon
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(700)} style={styles.artistSub}>
          You streamed them 342 times
        </Animated.Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(900)} style={styles.topArtistStats}>
        {[
          { label: "Hours", value: "128", icon: "clock-outline" as const },
          { label: "Songs", value: "67", icon: "music-note" as const },
          { label: "Top 1%", value: "Fan", icon: "star" as const },
        ].map((stat, i) => (
          <Animated.View
            key={stat.label}
            entering={FadeInDown.delay(1000 + i * 120)}
            style={styles.artistStatItem}
          >
            <MaterialCommunityIcons
              name={stat.icon}
              size={18}
              color={theme.accent}
            />
            <Text style={styles.artistStatValue}>{stat.value}</Text>
            <Text style={styles.artistStatLabel}>{stat.label}</Text>
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );
}

function CardTopSong({ theme }: { theme: CardTheme }) {
  const barHeights = [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3, 0.7, 0.5, 0.85, 0.45, 0.65];

  return (
    <View style={styles.cardContent}>
      <Animated.Text entering={FadeInDown.delay(200)} style={styles.cardLabel}>
        Your most played song
      </Animated.Text>

      <Animated.View entering={FadeIn.delay(400)} style={styles.songSection}>
        <View style={[styles.songCover, { borderColor: theme.accent + "40" }]}>
          <LinearGradient
            colors={[theme.accent + "30", theme.accent2 + "15"]}
            style={styles.songCoverInner}
          >
            <MaterialCommunityIcons name="music" size={36} color={theme.accent} />
          </LinearGradient>
        </View>
        <Animated.Text
          entering={FadeInDown.delay(600).springify()}
          style={[styles.songTitle, { color: theme.accent }]}
        >
          Not Like Us
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(700)} style={styles.songArtist}>
          Junoon
        </Animated.Text>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(800)} style={styles.waveformRow}>
        {barHeights.map((h, i) => (
          <Animated.View
            key={i}
            entering={FadeInDown.delay(900 + i * 50)
              .duration(400)
              .easing(Easing.out(Easing.back(2)))}
            style={[
              styles.waveBar,
              {
                height: h * 40,
                backgroundColor: theme.accent,
                opacity: 0.5 + h * 0.5,
              },
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(1200)} style={styles.playCountRow}>
        <AnimatedCounter
          target={287}
          style={[styles.playCountNumber, { color: theme.accent2 }]}
          duration={1500}
          delay={1300}
        />
        <Text style={styles.playCountLabel}> times played</Text>
      </Animated.View>
    </View>
  );
}

function CardPersonality({ theme }: { theme: CardTheme }) {
  return (
    <View style={styles.cardContent}>
      <Animated.Text entering={FadeInDown.delay(200)} style={styles.cardLabel}>
        Your listening personality
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(400).springify()}
        style={[styles.personalityTitle, { color: theme.accent }]}
      >
        The Explorer
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(500)} style={styles.personalitySub}>
        You discovered 312 new artists and dove into 5 genres this year
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(700)} style={styles.moodSection}>
        <Text style={styles.moodTitle}>Your mood spectrum</Text>
        {MOOD_DATA.map((m, i) => (
          <MoodBar
            key={m.label}
            label={m.label}
            value={m.value}
            color={m.color}
            delay={800 + i * 150}
          />
        ))}
      </Animated.View>
    </View>
  );
}

function CardFinale({ theme }: { theme: CardTheme }) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowConfetti(true), 600);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.cardContent}>
      {showConfetti && (
        <ConfettiCanvas
          colors={[SPOTIFY_GREEN, "#E94560", "#F59E0B", "#2CD3E1", "#F49FBC", "#7B2D6E"]}
        />
      )}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Animated.View entering={FadeIn.delay(300)}>
          <MaterialCommunityIcons name="spotify" size={56} color={SPOTIFY_GREEN} />
        </Animated.View>
        <Animated.Text
          entering={FadeInDown.delay(500).springify()}
          style={styles.finaleTitle}
        >
          {"That's a wrap!"}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(700)} style={styles.finaleSub}>
          Thanks for listening in 2025
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(900)} style={styles.finaleStats}>
          {[
            { value: "42,847", label: "Minutes" },
            { value: "2,184", label: "Songs" },
            { value: "312", label: "Artists" },
          ].map((stat, i) => (
            <Animated.View
              key={stat.label}
              entering={FadeInDown.delay(1000 + i * 120)}
              style={styles.finaleStatItem}
            >
              <Text style={[styles.finaleStatValue, { color: theme.accent }]}>
                {stat.value}
              </Text>
              <Text style={styles.finaleStatLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1400)} style={styles.shareBtn}>
          <LinearGradient
            colors={[SPOTIFY_GREEN, "#1ED760"]}
            style={styles.shareBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="share-outline" size={18} color="#000" />
            <Text style={styles.shareBtnText}>Share your Wrapped</Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </View>
  );
}

const CARDS = [
  { id: "intro", Component: CardIntro, theme: THEMES.intro },
  { id: "minutes", Component: CardMinutes, theme: THEMES.minutes },
  { id: "topGenre", Component: CardTopGenre, theme: THEMES.topGenre },
  { id: "topArtist", Component: CardTopArtist, theme: THEMES.topArtist },
  { id: "topSong", Component: CardTopSong, theme: THEMES.topSong },
  { id: "personality", Component: CardPersonality, theme: THEMES.personality },
  { id: "finale", Component: CardFinale, theme: THEMES.finale },
];

export default function SpotifyWrappedScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const cardKey = useRef(0);

  const currentCard = CARDS[currentIndex];

  const goTo = useCallback(
    (direction: "next" | "prev") => {
      const nextIdx =
        direction === "next"
          ? Math.min(currentIndex + 1, CARDS.length - 1)
          : Math.max(currentIndex - 1, 0);
      if (nextIdx === currentIndex) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      cardKey.current += 1;
      setCurrentIndex(nextIdx);
    },
    [currentIndex]
  );

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX * 0.4;
    })
    .onEnd((e) => {
      if (e.translationX < -60 || e.velocityX < -500) {
        runOnJS(goTo)("next");
      } else if (e.translationX > 60 || e.velocityX > 500) {
        runOnJS(goTo)("prev");
      }
      translateX.value = withSpring(0, { damping: 20 });
    });

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      {
        scale: interpolate(
          Math.abs(translateX.value),
          [0, 150],
          [1, 0.95]
        ),
      },
    ],
  }));

  const bgColors = currentCard.theme.bg;

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      <View style={styles.topBar}>
        <Pressable
          style={styles.topBarBtn}
          onPress={() => goTo("prev")}
          disabled={currentIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={currentIndex === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)"}
          />
        </Pressable>
        <ProgressDots
          total={CARDS.length}
          current={currentIndex}
          accent={currentCard.theme.accent}
        />
        <Pressable style={styles.topBarBtn}>
          <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
        </Pressable>
      </View>

      <GestureDetector gesture={swipeGesture}>
        <Animated.View
          key={`card-${currentIndex}-${cardKey.current}`}
          style={[styles.cardOuter, cardAnimStyle]}
        >
          <currentCard.Component theme={currentCard.theme} />
        </Animated.View>
      </GestureDetector>

      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.navArrow, { opacity: currentIndex === 0 ? 0.2 : 0.7 }]}
          onPress={() => goTo("prev")}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </Pressable>
        <Text style={styles.pageIndicator}>
          {currentIndex + 1} / {CARDS.length}
        </Text>
        <Pressable
          style={[
            styles.navArrow,
            { opacity: currentIndex === CARDS.length - 1 ? 0.2 : 0.7 },
          ]}
          onPress={() => goTo("next")}
          disabled={currentIndex === CARDS.length - 1}
        >
          <Ionicons name="chevron-forward" size={28} color="#FFF" />
        </Pressable>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPOTIFY_BLACK,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 58,
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  topBarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  progressDot: {
    height: 4,
    borderRadius: 2,
  },
  cardOuter: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: CARD_RADIUS,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
    padding: 28,
    justifyContent: "center",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 8,
  },
  navArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.35)",
    fontVariant: ["tabular-nums"],
  },
  introYear: {
    fontSize: 72,
    fontWeight: "900",
    color: TEXT_W,
    letterSpacing: -3,
    marginTop: 16,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: SPOTIFY_GREEN,
    letterSpacing: 10,
    marginTop: -4,
  },
  introSub: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
    marginTop: 12,
  },
  swipeHint: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.25)",
    textAlign: "center",
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
    marginBottom: 8,
  },
  bigNumberRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  bigNumber: {
    fontSize: 64,
    fontWeight: "900",
    letterSpacing: -3,
    fontVariant: ["tabular-nums"],
  },
  bigNumberUnit: {
    fontSize: 18,
    fontWeight: "600",
    color: TEXT_W,
    marginTop: 4,
  },
  statComparison: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.4)",
    marginTop: 8,
    marginBottom: 24,
  },
  monthlySection: {
    marginTop: 8,
  },
  monthlyTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1,
    marginBottom: 12,
  },
  barChartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 80,
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  barTrack: {
    width: "100%",
    height: 65,
    justifyContent: "flex-end",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(255,255,255,0.3)",
  },
  funFact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  funFactText: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
  },
  genreTitle: {
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -2,
  },
  genreSub: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.4)",
    marginTop: 4,
    marginBottom: 28,
  },
  donutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  genreLegend: {
    flex: 1,
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_W,
  },
  legendPct: {
    fontSize: 13,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  artistSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  artistAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    overflow: "hidden",
  },
  avatarGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  artistName: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    textAlign: "center",
  },
  artistSub: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.4)",
    marginTop: 6,
  },
  topArtistStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    paddingVertical: 18,
  },
  artistStatItem: {
    alignItems: "center",
    gap: 6,
  },
  artistStatValue: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_W,
  },
  artistStatLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.35)",
  },
  songSection: {
    alignItems: "center",
    marginVertical: 16,
  },
  songCover: {
    width: 110,
    height: 110,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    marginBottom: 16,
  },
  songCoverInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  songTitle: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
    textAlign: "center",
  },
  songArtist: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 24,
    marginBottom: 16,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
  },
  playCountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  playCountNumber: {
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -2,
    fontVariant: ["tabular-nums"],
  },
  playCountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
  },
  personalityTitle: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 4,
  },
  personalitySub: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.45)",
    lineHeight: 20,
    marginBottom: 28,
  },
  moodSection: {
    gap: 14,
  },
  moodTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1,
    marginBottom: 4,
  },
  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_W,
    width: 80,
  },
  moodTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  moodFill: {
    height: "100%",
    borderRadius: 5,
    overflow: "hidden",
  },
  moodValue: {
    fontSize: 13,
    fontWeight: "700",
    width: 38,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  finaleTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: TEXT_W,
    marginTop: 20,
    letterSpacing: -1,
  },
  finaleSub: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
    marginTop: 8,
  },
  finaleStats: {
    flexDirection: "row",
    gap: 28,
    marginTop: 36,
    marginBottom: 36,
  },
  finaleStatItem: {
    alignItems: "center",
    gap: 4,
  },
  finaleStatValue: {
    fontSize: 22,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  finaleStatLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.35)",
  },
  shareBtn: {
    borderRadius: 30,
    overflow: "hidden",
  },
  shareBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
  },
});