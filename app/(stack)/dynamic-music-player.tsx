import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  TextInput,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  LogBox,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Canvas, Group, Circle, Blur, Path, Skia } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  useDerivedValue,
  useAnimatedProps,
  interpolate,
  Extrapolation,
  runOnJS,
  Easing,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Svg, { Path as SvgPath } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
LogBox.ignoreLogs(["THREE.WARNING: Multiple instances of Three.js being imported."]);

const COMPACT_WIDTH = 210;
const COMPACT_HEIGHT = 48; // Increased height
const EXPANDED_WIDTH = SCREEN_WIDTH - 24;
const EXPANDED_HEIGHT = 420;
const ISLAND_TOP = 11;
const ISLAND_CENTER_X = SCREEN_WIDTH / 2;

const SPRING_CONFIG = { damping: 18, stiffness: 140, mass: 1 };

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover: string;
}

const RECENT_TRACKS: Track[] = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: 214,
    cover: "https://upload.wikimedia.org/wikipedia/en/e/e6/The_Weeknd_-_Blinding_Lights.png",
  },
  {
    id: "2",
    title: "Starboy",
    artist: "The Weeknd",
    album: "Starboy",
    duration: 230,
    cover: "https://upload.wikimedia.org/wikipedia/en/3/39/The_Weeknd_-_Starboy.png",
  },
  {
    id: "3",
    title: "Die For You",
    artist: "The Weeknd",
    album: "Starboy",
    duration: 260,
    cover: "https://upload.wikimedia.org/wikipedia/en/3/39/The_Weeknd_-_Starboy.png",
  },
  {
    id: "4",
    title: "Save Your Tears",
    artist: "The Weeknd",
    album: "After Hours",
    duration: 215,
    cover: "https://upload.wikimedia.org/wikipedia/en/e/e6/The_Weeknd_-_Blinding_Lights.png",
  },
  {
    id: "5",
    title: "Can't Feel My Face",
    artist: "The Weeknd",
    album: "Beauty Behind the Madness",
    duration: 213,
    cover: "https://upload.wikimedia.org/wikipedia/en/b/b2/The_Weeknd_-_Beauty_Behind_the_Madness.png",
  },
];

const VISUALIZER_BARS = 64;

const PauseIcon = ({ size = 24, color = "#fff" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <SvgPath d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </Svg>
);

const SkipForwardIcon = ({ size = 20, color = "#fff" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <SvgPath d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
  </Svg>
);

const SkipBackIcon = ({ size = 20, color = "#fff" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <SvgPath d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
  </Svg>
);

const ShuffleIcon = ({ size = 18, color = "rgba(255,255,255,0.5)" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <SvgPath d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </Svg>
);

const RepeatIcon = ({ size = 18, color = "rgba(255,255,255,0.5)" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <SvgPath d="M17 1l4 4-4 4" />
    <SvgPath d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4" />
    <SvgPath d="M21 13v2a4 4 0 01-4 4H3" />
  </Svg>
);


function generateWavePath(
  barCount: number,
  width: number,
  height: number,
  progress: number,
  seed: number
): string {
  "worklet";
  const barWidth = width / barCount;
  const gap = 2;
  let path = "";
  for (let i = 0; i < barCount; i++) {
    const x = i * barWidth + gap / 2;
    const w = barWidth - gap;
    const noise = Math.sin(i * 0.8 + seed) * 0.4 + Math.cos(i * 1.3 + seed * 0.7) * 0.3 + 0.5;
    const isPlayed = i / barCount < progress;
    const h = noise * height * (isPlayed ? 0.9 : 0.5);
    const y = (height - h) / 2;
    path += `M${x},${y + h / 2} L${x},${y + h / 2 - h / 2} L${x + w},${y + h / 2 - h / 2} L${x + w},${y + h / 2 + h / 2} L${x},${y + h / 2 + h / 2} Z `;
  }
  return path;
}

const formatTime = (seconds: number) => {
  "worklet";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function DynamicIslandMusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track>(RECENT_TRACKS[0]);
  const expanded = useSharedValue(0);
  const isExpanded = useSharedValue(false);
  const progress = useSharedValue(0.35);
  const wavePhase = useSharedValue(0);
  const compactWave = useSharedValue(0);
  const albumScale = useSharedValue(0);
  const controlsOpacity = useSharedValue(0);

  useEffect(() => {
    wavePhase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
    compactWave.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const toggleExpand = useCallback(() => {
    const next = !isExpanded.value;
    isExpanded.value = next;
    expanded.value = withSpring(next ? 1 : 0, SPRING_CONFIG);
    if (next) {
      albumScale.value = withDelay(150, withSpring(1, { damping: 14, stiffness: 120 }));
      controlsOpacity.value = withDelay(250, withTiming(1, { duration: 300 }));
    } else {
      albumScale.value = withTiming(0, { duration: 200 });
      controlsOpacity.value = withTiming(0, { duration: 150 });
    }
  }, []);

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(toggleExpand)();
  });

  const seekGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (isExpanded.value) {
        const seekWidth = EXPANDED_WIDTH - 48;
        const newProgress = Math.max(0, Math.min(1, (e.x - 24) / seekWidth));
        progress.value = newProgress;
      }
    });

  const composedGesture = Gesture.Race(seekGesture, tapGesture);

  const islandStyle = useAnimatedStyle(() => {
    const w = interpolate(expanded.value, [0, 1], [COMPACT_WIDTH, EXPANDED_WIDTH]);
    const h = interpolate(expanded.value, [0, 1], [COMPACT_HEIGHT, EXPANDED_HEIGHT]);
    const borderRadius = interpolate(expanded.value, [0, 1], [22, 42]);
    const left = interpolate(expanded.value, [0, 1], [ISLAND_CENTER_X - COMPACT_WIDTH / 2, 16]);
    const top = interpolate(expanded.value, [0, 1], [ISLAND_TOP, ISLAND_TOP]);

    return {
      width: w,
      height: h,
      borderRadius,
      left,
      top,
      position: "absolute" as const,
      zIndex: 100,
      overflow: "hidden" as const,
    };
  });

  const compactContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expanded.value, [0, 0.3], [1, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(expanded.value, [0, 0.3], [1, 0.8], Extrapolation.CLAMP) }],
  }));

  const expandedContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expanded.value, [0.4, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(expanded.value, [0.4, 1], [0.9, 1], Extrapolation.CLAMP) }],
  }));

  const albumArtStyle = useAnimatedStyle(() => ({
    transform: [{ scale: albumScale.value }],
    opacity: albumScale.value,
  }));

  const controlsPanelStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
    transform: [
      { translateY: interpolate(controlsOpacity.value, [0, 1], [20, 0]) },
    ],
  }));

  const compactBarsAnimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expanded.value, [0, 0.2], [1, 0], Extrapolation.CLAMP),
  }));

  const progressDerived = useDerivedValue(() => progress.value);
  const wavePhaseDerived = useDerivedValue(() => wavePhase.value);

  const playedPath = useDerivedValue(() => {
    const w = EXPANDED_WIDTH - 48;
    const h = 60;
    return Skia.Path.MakeFromSVGString(
      generateWavePath(VISUALIZER_BARS, w, h, progressDerived.value, wavePhaseDerived.value)
    ) || Skia.Path.Make();
  });

  const currentTime = useDerivedValue(() =>
    formatTime(progressDerived.value * currentTrack.duration)
  );

  const remainingTime = useDerivedValue(() =>
    `-${formatTime((1 - progressDerived.value) * currentTrack.duration)}`
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#1a0a2e", "#16213e", "#0a0a1a"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.orbContainer}>
        <LinearGradient
          colors={["#e94560", "#c23616", "transparent"]}
          style={[styles.orb, { width: 280, height: 280, top: "8%", left: "-10%" }]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={["#8b5cf6", "#6d28d9", "transparent"]}
          style={[styles.orb, { width: 220, height: 220, top: "45%", right: "-8%" }]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={["#f59e0b", "#d97706", "transparent"]}
          style={[styles.orb, { width: 200, height: 200, bottom: "15%", left: "20%" }]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <View style={styles.fakeContent}>
        <View style={styles.fakeStatusBar}>
          <Text style={styles.fakeTime}>9:41</Text>
        </View>
        <View style={{ height: 80 }} />
        <Text style={styles.screenTitle}>Listen Now</Text>
        <Text style={styles.screenSubtitle}>Recently Played</Text>

        {RECENT_TRACKS.map((track) => (
          <TouchableOpacity
            key={track.id}
            style={styles.trackRow}
            onPress={() => setCurrentTrack(track)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: track.cover }} style={styles.trackListCover} />
            <View style={styles.trackListInfo}>
              <Text style={styles.trackListTitle}>{track.title}</Text>
              <Text style={styles.trackListArtist}>{track.artist}</Text>
            </View>
            {currentTrack.id === track.id && (
              <View style={styles.playingIndicator}>
                <View style={styles.playingDot} />
                <View style={[styles.playingDot, { height: 6 }]} />
                <View style={styles.playingDot} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <GestureDetector gesture={composedGesture}>
        <Animated.View style={islandStyle}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }]} />

          <Animated.View style={[styles.compactContent, compactContentStyle]}>
            <View style={styles.compactLeft}>
              <Image
                source={{ uri: currentTrack.cover }}
                style={styles.compactAlbum}
              />
              <View style={styles.compactInfo}>
                <Text style={styles.compactTitle} numberOfLines={1}>{currentTrack.title}</Text>
                <Text style={styles.compactArtist} numberOfLines={1}>{currentTrack.artist}</Text>
              </View>
            </View>
            <Animated.View style={[styles.compactBars, compactBarsAnimStyle]}>
              {[0, 1, 2, 3].map((i) => (
                <CompactBar key={i} index={i} phase={compactWave} />
              ))}
            </Animated.View>
          </Animated.View>

          <Animated.View style={[styles.expandedContent, expandedContentStyle]}>
            <View style={styles.expandedHandle}>
              <View style={styles.handleBar} />
            </View>

            <Animated.View style={[styles.albumArtContainer, albumArtStyle]}>
              <Image
                source={{ uri: currentTrack.cover }}
                style={styles.albumArt}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.6)"]}
                style={styles.albumOverlay}
              />
            </Animated.View>

            <Animated.View style={controlsPanelStyle}>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{currentTrack.title}</Text>
                <Text style={styles.trackArtist}>{currentTrack.artist} — {currentTrack.album}</Text>
              </View>

              <View style={styles.visualizerContainer}>
                <Canvas style={styles.visualizerCanvas}>
                  <Group>
                    <Path path={playedPath} color="#e94560" opacity={0.9} />
                    <Path path={playedPath} color="#e94560" opacity={0.3}>
                      <Blur blur={6} />
                    </Path>
                  </Group>
                  <ProgressIndicator progress={progressDerived} width={EXPANDED_WIDTH - 48} height={60} />
                </Canvas>
              </View>

              <View style={styles.timeRow}>
                <AnimatedTimeText value={currentTime} style={styles.timeText} />
                <AnimatedTimeText value={remainingTime} style={styles.timeText} />
              </View>

              <View style={styles.controlsRow}>
                <View style={styles.controlBtn}>
                  <ShuffleIcon />
                </View>
                <View style={styles.controlBtn}>
                  <SkipBackIcon />
                </View>
                <View style={styles.playBtn}>
                  <PauseIcon size={28} />
                </View>
                <View style={styles.controlBtn}>
                  <SkipForwardIcon />
                </View>
                <View style={styles.controlBtn}>
                  <RepeatIcon />
                </View>
              </View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

function CompactBar({ index, phase }: { index: number; phase: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const offset = index * 0.25;
    const h = interpolate(
      Math.sin(phase.value * Math.PI + offset * Math.PI * 2),
      [-1, 1],
      [6, 18]
    );
    return {
      height: h,
      width: 3,
      borderRadius: 1.5,
      backgroundColor: "#e94560",
      marginHorizontal: 1.5,
    };
  });

  return <Animated.View style={style} />;
}

function ProgressIndicator({
  progress,
  width,
  height,
}: {
  progress: SharedValue<number>;
  width: number;
  height: number;
}) {
  const cx = useDerivedValue(() => progress.value * width);
  const cy = height / 2;

  return (
    <Group>
      <Circle cx={cx} cy={cy} r={5} color="#fff" />
      <Circle cx={cx} cy={cy} r={8} color="rgba(233,69,96,0.3)" />
    </Group>
  );
}

const AnimatedTextInput = Animated.createAnimatedComponent(
  React.forwardRef<any, any>((props, ref) => {
    return <TextInput ref={ref} {...props} />;
  })
);

function AnimatedTimeText({
  value,
  style,
}: {
  value: SharedValue<string>;
  style: StyleProp<TextStyle>;
}) {
  const animatedProps = useAnimatedProps(() => {
    return {
      text: value.value,
    } as unknown as { text: string };
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      value={value.value}
      style={[style, { color: styles.timeText.color }]} // Ensure color is passed
      animatedProps={animatedProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a1a",
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.4,
  },
  fakeContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40, // Add padding to avoid island blocking
  },
  fakeStatusBar: {
    paddingTop: 16,
    alignItems: "center",
  },
  fakeTime: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontWeight: "600",
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 28,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    gap: 16,
  },
  trackListCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  trackListInfo: {
    flex: 1,
    gap: 4,
  },
  trackListTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  trackListArtist: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
  playingIndicator: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: 12,
  },
  playingDot: {
    width: 3,
    height: 12,
    backgroundColor: "#e94560",
    borderRadius: 1.5,
  },
  compactContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    width: "100%",
    height: "100%", // Fill the island container
    position: "absolute",
    zIndex: 10, // Ensure high zIndex
  },
  compactLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  compactAlbum: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  compactArtist: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 9,
    fontWeight: "400",
  },
  compactBars: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    paddingRight: 8,
  },
  expandedContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
  expandedHandle: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  albumArtContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  albumArt: {
    width: EXPANDED_WIDTH - 80,
    height: EXPANDED_WIDTH - 80,
    maxWidth: 240,
    maxHeight: 240,
    borderRadius: 16,
  },
  albumOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  trackInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  trackTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  trackArtist: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "400",
    marginTop: 4,
  },
  visualizerContainer: {
    height: 60,
    marginBottom: 4,
  },
  visualizerCanvas: {
    flex: 1,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  timeText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  controlBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
});