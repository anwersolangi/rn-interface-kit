import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInDown,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Svg, {
  Path as SvgPath,
  Circle as SvgCircle,
  Rect,
} from "react-native-svg";

const { width: SW, height: SH } = Dimensions.get("window");
const CARD_W = SW - 32;
const CARD_H = SH * 0.62;
const SWIPE_THRESHOLD = SW * 0.25;
const ROTATION_DEG = 12;

const YT_RED = "#FF0033";
const TINDER_PINK = "#FE3C72";
const TINDER_ORANGE = "#FF6B2B";

const VIDEOS = [
  {
    id: "1",
    thumbnail: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=800&fit=crop",
    title: "I Built an AI That Codes Better Than Me",
    channel: "Fireship",
    channelAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
    views: "4.2M views",
    duration: "12:34",
    time: "2 days ago",
    verified: true,
    tags: ["AI", "Coding"],
  },
  {
    id: "2",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=800&fit=crop",
    title: "The Secret Design System Behind Every Top App",
    channel: "Juxtopposed",
    channelAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
    views: "1.8M views",
    duration: "8:21",
    time: "5 days ago",
    verified: true,
    tags: ["Design", "UI/UX"],
  },
  {
    id: "3",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=800&fit=crop",
    title: "React Native in 2025 — Is It Still Worth It?",
    channel: "Theo",
    channelAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    views: "2.1M views",
    duration: "15:07",
    time: "1 week ago",
    verified: true,
    tags: ["React Native", "Mobile"],
  },
  {
    id: "4",
    thumbnail: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=800&fit=crop",
    title: "I Mass Applied to 500 Jobs Using a Bot",
    channel: "Joshua Fluke",
    channelAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
    views: "890K views",
    duration: "10:45",
    time: "3 days ago",
    verified: false,
    tags: ["Career", "Tech"],
  },
  {
    id: "5",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=800&fit=crop",
    title: "This CSS Trick Will Blow Your Mind",
    channel: "Kevin Powell",
    channelAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop",
    views: "3.5M views",
    duration: "6:12",
    time: "4 days ago",
    verified: true,
    tags: ["CSS", "Frontend"],
  },
];

const PlayIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <SvgCircle cx={24} cy={24} r={24} fill="rgba(0,0,0,0.5)" />
    <SvgPath d="M19 15l14 9-14 9V15z" fill="#fff" />
  </Svg>
);

const YTLogo = () => (
  <Svg width={28} height={20} viewBox="0 0 28 20">
    <Rect rx={4} width={28} height={20} fill={YT_RED} />
    <SvgPath d="M11 5.5l7.5 4.5L11 14.5V5.5z" fill="#fff" />
  </Svg>
);

const VerifiedBadge = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <SvgPath
      d="M12 1L9.19 3.53 5.5 3 4.07 6.44 1 8.72l1.5 3.54L1 15.8l3.07 2.28L5.5 21.5l3.69-.53L12 23.5l2.81-2.53 3.69.53 1.43-3.42L23 15.8l-1.5-3.54L23 8.72l-3.07-2.28L18.5 3l-3.69.53L12 1z"
      fill="#aaa"
    />
    <SvgPath d="M10 15.17l-3.59-3.58L5 13l5 5 9-9-1.41-1.42L10 15.17z" fill="#fff" />
  </Svg>
);

const HeartIcon = ({ filled = false }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <SvgPath
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={filled ? TINDER_PINK : "none"}
      stroke={filled ? TINDER_PINK : "rgba(255,255,255,0.6)"}
      strokeWidth={2}
    />
  </Svg>
);

const XIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <SvgPath
      d="M18 6L6 18M6 6l12 12"
      stroke={TINDER_ORANGE}
      strokeWidth={3}
      strokeLinecap="round"
    />
  </Svg>
);

const SubscribeIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <SvgPath
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
      fill={YT_RED}
    />
  </Svg>
);

const StarIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <SvgPath
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill="#FFD700"
    />
  </Svg>
);

function SwipeableCard({
  video,
  isTop,
  onSwipe,
}: {
  video: (typeof VIDEOS)[0];
  isTop: boolean;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardScale = useSharedValue(isTop ? 1 : 0.95);
  const cardOpacity = useSharedValue(isTop ? 1 : 0.7);

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      onSwipe(direction);
    },
    [onSwipe]
  );

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.4;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const dir = e.translationX > 0 ? "right" : "left";
        translateX.value = withTiming(
          dir === "right" ? SW * 1.5 : -SW * 1.5,
          { duration: 300 },
          () => runOnJS(handleSwipe)(dir)
        );
        translateY.value = withTiming(e.translationY * 2, { duration: 300 });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SW / 2, 0, SW / 2],
      [-ROTATION_DEG, 0, ROTATION_DEG],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: isTop ? 1 : cardScale.value },
      ],
      opacity: cardOpacity.value,
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [0, SWIPE_THRESHOLD],
          [0.5, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [-SWIPE_THRESHOLD, 0],
          [1, 0.5],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Image source={{ uri: video.thumbnail }} style={styles.cardImage} />

        <LinearGradient
          colors={["transparent", "transparent", "rgba(0,0,0,0.85)", "rgba(0,0,0,0.98)"]}
          locations={[0, 0.35, 0.7, 1]}
          style={styles.cardGradient}
        />

        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>

        <View style={styles.playBtnWrap}>
          <PlayIcon />
        </View>

        <View style={styles.tagRow}>
          {video.tags.map((tag) => (
            <BlurView key={tag} intensity={30} tint="dark" style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </BlurView>
          ))}
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.channelRow}>
            <Image source={{ uri: video.channelAvatar }} style={styles.avatar} />
            <View style={styles.channelInfo}>
              <View style={styles.channelNameRow}>
                <Text style={styles.channelName} numberOfLines={1}>
                  {video.channel}
                </Text>
                {video.verified && <VerifiedBadge />}
              </View>
              <Text style={styles.meta}>
                {video.views} · {video.time}
              </Text>
            </View>
          </View>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {video.title}
          </Text>
        </View>

        <Animated.View style={[styles.stampOverlay, styles.stampSubscribe, likeOpacity]}>
          <LinearGradient
            colors={["rgba(255,0,51,0.15)", "rgba(255,0,51,0.05)"]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.stampText}>SUBSCRIBE</Text>
        </Animated.View>

        <Animated.View style={[styles.stampOverlay, styles.stampSkip, nopeOpacity]}>
          <LinearGradient
            colors={["rgba(255,107,43,0.15)", "rgba(255,107,43,0.05)"]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={[styles.stampText, { color: TINDER_ORANGE }]}>SKIP</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

function ActionButton({
  children,
  size = 56,
  borderColor = "rgba(255,255,255,0.1)",
  onPress,
  delay = 0,
}: {
  children: React.ReactNode;
  size?: number;
  borderColor?: string;
  onPress?: () => void;
  delay?: number;
}) {
  return (
    <Animated.View
      entering={SlideInDown.delay(delay).duration(400).springify()}
    >
      <BlurView
        intensity={20}
        tint="dark"
        style={[
          styles.actionBtn,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor,
          },
        ]}
      >
        {children}
      </BlurView>
    </Animated.View>
  );
}

export default function YouTubeTinderScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeAction, setSwipeAction] = useState<string | null>(null);

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      setSwipeAction(direction === "right" ? "SUBSCRIBED!" : "SKIPPED");
      setTimeout(() => setSwipeAction(null), 800);
      setCurrentIndex((prev) => prev + 1);
    },
    []
  );

  const visibleCards = VIDEOS.slice(currentIndex, currentIndex + 2);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#0f0f0f", "#1a1a1a", "#0f0f0f"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        entering={FadeIn.delay(100).duration(500)}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <YTLogo />
          <View style={styles.headerDivider} />
          <LinearGradient
            colors={[TINDER_PINK, TINDER_ORANGE]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.tinderBadge}
          >
            <Text style={styles.tinderBadgeText}>SWIPE</Text>
          </LinearGradient>
        </View>
        <View style={styles.headerRight}>
          <BlurView intensity={20} tint="dark" style={styles.headerBtn}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="#fff">
              <SvgPath d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34A6.505 6.505 0 003.03 10c.01 2.17 1.07 4.09 2.7 5.27L5.45 14H4.66l-3.5 3.5a.996.996 0 101.41 1.41L6 15.5v-.79l.27-.28A6.471 6.471 0 0010.5 16c3.59 0 6.5-2.91 6.5-6.5S14.09 3 10.5 3" />
            </Svg>
          </BlurView>
        </View>
      </Animated.View>

      <View style={styles.cardStack}>
        {visibleCards
          .map((video, idx) => (
            <SwipeableCard
              key={video.id}
              video={video}
              isTop={idx === 0}
              onSwipe={handleSwipe}
            />
          ))
          .reverse()}
        {visibleCards.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎬</Text>
            <Text style={styles.emptyTitle}>No More Videos</Text>
            <Text style={styles.emptySub}>You've swiped through everything!</Text>
          </View>
        )}
      </View>

      {swipeAction && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.actionToast}
        >
          <BlurView intensity={40} tint="dark" style={styles.toastBlur}>
            <LinearGradient
              colors={
                swipeAction === "SUBSCRIBED!"
                  ? ["rgba(255,0,51,0.2)", "rgba(255,0,51,0.05)"]
                  : ["rgba(255,107,43,0.2)", "rgba(255,107,43,0.05)"]
              }
              style={StyleSheet.absoluteFill}
            />
            <Text
              style={[
                styles.toastText,
                {
                  color:
                    swipeAction === "SUBSCRIBED!" ? YT_RED : TINDER_ORANGE,
                },
              ]}
            >
              {swipeAction}
            </Text>
          </BlurView>
        </Animated.View>
      )}

      <Animated.View
        entering={FadeInUp.delay(300).duration(500)}
        style={styles.actionsRow}
      >
        <ActionButton size={48} borderColor="rgba(255,107,43,0.2)" delay={400}>
          <XIcon />
        </ActionButton>
        <ActionButton size={48} borderColor="rgba(255,215,0,0.2)" delay={500}>
          <StarIcon />
        </ActionButton>
        <ActionButton size={64} borderColor="rgba(255,0,51,0.3)" delay={600}>
          <SubscribeIcon />
        </ActionButton>
        <ActionButton size={48} borderColor="rgba(254,60,114,0.2)" delay={700}>
          <HeartIcon />
        </ActionButton>
        <ActionButton size={48} borderColor="rgba(0,200,255,0.2)" delay={800}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="#00c8ff">
            <SvgPath d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
          </Svg>
        </ActionButton>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
        style={styles.bottomNav}
      >
        <BlurView intensity={25} tint="dark" style={styles.bottomBlur}>
          <View style={styles.bottomContent}>
            {[
              { icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z", label: "Home", active: false },
              { icon: "M17.77 3.77l-1.77 1.77-2-2L12 5.54 10 3.54l-2 2L6.23 3.77 4 6v14h16V6l-2.23-2.23zM18 18H6V7.23l2.23-2.23 2 2L12 5.23 13.77 7l2-2L18 7.23V18z", label: "Shorts", active: false },
              { icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z", label: "Swipe", active: true },
              { icon: "M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z", label: "Library", active: false },
              { icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z", label: "You", active: false },
            ].map((item) => (
              <View key={item.label} style={styles.navItem}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill={item.active ? YT_RED : "rgba(255,255,255,0.5)"}>
                  <SvgPath d={item.icon} />
                </Svg>
                <Text style={[styles.navLabel, item.active && { color: "#fff" }]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </BlurView>
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 10,
    zIndex: 50,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerDivider: {
    width: 1.5,
    height: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 1,
  },
  tinderBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tinderBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1.5,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardStack: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
  },
  card: {
    position: "absolute",
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  durationBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  playBtnWrap: {
    position: "absolute",
    top: "35%",
    alignSelf: "center",
    opacity: 0.9,
  },
  tagRow: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    gap: 6,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tagText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  cardInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: YT_RED,
  },
  channelInfo: {
    flex: 1,
  },
  channelNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  channelName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  meta: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    marginTop: 2,
  },
  videoTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  stampOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    overflow: "hidden",
  },
  stampSubscribe: {
    borderWidth: 3,
    borderColor: "rgba(255,0,51,0.4)",
  },
  stampSkip: {
    borderWidth: 3,
    borderColor: "rgba(255,107,43,0.4)",
  },
  stampText: {
    fontSize: 36,
    fontWeight: "900",
    color: YT_RED,
    letterSpacing: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingBottom: 16,
    zIndex: 50,
  },
  actionBtn: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  actionToast: {
    position: "absolute",
    top: SH * 0.4,
    alignSelf: "center",
    zIndex: 200,
  },
  toastBlur: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  toastText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
  },
  bottomNav: {
    paddingBottom: 30,
    paddingHorizontal: 0,
  },
  bottomBlur: {
    overflow: "hidden",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  bottomContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "rgba(15,15,15,0.5)",
  },
  navItem: {
    alignItems: "center",
    gap: 4,
  },
  navLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  emptySub: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
  },
});