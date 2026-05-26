import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
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
  Circle,
  Group,
  Path,
  Skia,
  vec,
} from "@shopify/react-native-skia";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle as SvgCircle,
  Defs,
  G,
  Line as SvgLine,
  LinearGradient as SvgGradient,
  Path as SvgPath,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const { width: SW, height: SH } = Dimensions.get("window");

const SKY_TOP = "#0B1A3B";
const SKY_MID = "#1A3A6B";
const SKY_BOT = "#2E5FA1";
const CARD_BG = "#FFFFFF";
const CARD_BACK = "#0F1B2D";
const ACCENT = "#FF6B35";
const ACCENT2 = "#F59E0B";
const TEXT_DARK = "#0A1628";
const TEXT_MID = "#5A6B82";
const TEXT_LIGHT = "#8A96A8";
const PERFORATED = "#E8ECF2";
const AIRLINE_BLUE = "#1E5CB3";
const GATE_GREEN = "#22C55E";
const BOARDING_RED = "#EF4444";

type FlightData = {
  airline: string;
  flightNo: string;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  date: string;
  departure: string;
  arrival: string;
  gate: string;
  seat: string;
  boardingTime: string;
  class: string;
  passenger: string;
  terminal: string;
  duration: string;
};

const FLIGHT: FlightData = {
  airline: "SKYLINE AIRWAYS",
  flightNo: "SL 2847",
  from: "KHI",
  fromCity: "Karachi",
  to: "DXB",
  toCity: "Dubai",
  date: "28 MAR 2026",
  departure: "14:30",
  arrival: "16:45",
  gate: "B7",
  seat: "12A",
  boardingTime: "13:50",
  class: "Business",
  passenger: "ANWER SOLANGI",
  terminal: "T1",
  duration: "2h 15m",
};

const STARS = Array.from({ length: 40 }, () => ({
  x: Math.random() * SW,
  y: Math.random() * SH * 0.45,
  r: Math.random() * 1.5 + 0.3,
  opacity: Math.random() * 0.6 + 0.2,
  phase: Math.random() * Math.PI * 2,
}));

const CLOUDS = Array.from({ length: 6 }, (_, i) => ({
  x: Math.random() * SW,
  y: 80 + Math.random() * 200,
  w: 60 + Math.random() * 80,
  h: 20 + Math.random() * 15,
  speed: 0.3 + Math.random() * 0.4,
  opacity: 0.08 + Math.random() * 0.12,
}));

function QRGrid({ size }: { size: number }) {
  const cellSize = size / 25;
  const pattern = React.useMemo(() => {
    const grid: boolean[][] = [];
    for (let r = 0; r < 25; r++) {
      grid[r] = [];
      for (let c = 0; c < 25; c++) {
        const isFinder =
          (r < 7 && c < 7) ||
          (r < 7 && c >= 18) ||
          (r >= 18 && c < 7);
        const isFinderInner =
          (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (r >= 2 && r <= 4 && c >= 20 && c <= 22) ||
          (r >= 20 && r <= 22 && c >= 2 && c <= 4);
        const isFinderBorder =
          isFinder &&
          !isFinderInner &&
          !(
            (r >= 1 && r <= 5 && c >= 1 && c <= 5) ||
            (r >= 1 && r <= 5 && c >= 19 && c <= 23) ||
            (r >= 19 && r <= 23 && c >= 1 && c <= 5)
          );
        if (isFinderInner || isFinderBorder) {
          grid[r][c] = true;
        } else if (isFinder) {
          grid[r][c] = false;
        } else {
          grid[r][c] = Math.random() > 0.45;
        }
      }
    }
    return grid;
  }, []);

  return (
    <Svg width={size} height={size}>
      <Rect x={0} y={0} width={size} height={size} fill="#FFFFFF" rx={4} />
      {pattern.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <Rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.5}
              height={cellSize + 0.5}
              fill={CARD_BACK}
            />
          ) : null
        )
      )}
    </Svg>
  );
}

function RouteMap() {
  const planeProgress = useSharedValue(0);
  const dashOffset = useSharedValue(0);

  useEffect(() => {
    planeProgress.value = withDelay(
      800,
      withTiming(1, { duration: 3000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    dashOffset.value = withRepeat(
      withTiming(20, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const routePath = `M 60 90 Q ${SW / 2} -10 ${SW - 60} 90`;

  const planeX = useDerivedValue(() => {
    const t = planeProgress.value;
    const x0 = 60, x1 = SW / 2, x2 = SW - 60;
    const y0 = 90, y1 = -10, y2 = 90;
    return (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
  });

  const planeY = useDerivedValue(() => {
    const t = planeProgress.value;
    const y0 = 90, y1 = -10, y2 = 90;
    return (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
  });

  const planeRotation = useDerivedValue(() => {
    const t = planeProgress.value;
    const x0 = 60, x1 = SW / 2, x2 = SW - 60;
    const y0 = 90, y1 = -10, y2 = 90;
    const dx = 2 * (1 - t) * (x1 - x0) + 2 * t * (x2 - x1);
    const dy = 2 * (1 - t) * (y1 - y0) + 2 * t * (y2 - y1);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  });

  const planeStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: planeX.value - 14,
    top: planeY.value - 14,
    transform: [{ rotate: `${planeRotation.value}deg` }],
  }));

  return (
    <View style={styles.routeContainer}>
      <Svg width={SW} height={120} style={styles.routeSvg}>
        <Defs>
          <SvgGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={ACCENT} />
            <Stop offset="1" stopColor={ACCENT2} />
          </SvgGradient>
        </Defs>
        <SvgPath
          d={routePath}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={2}
          strokeDasharray="8 6"
          fill="none"
        />
        <SvgPath
          d={routePath}
          stroke="url(#routeGrad)"
          strokeWidth={2.5}
          strokeDasharray="8 6"
          fill="none"
          opacity={0.8}
        />
        <SvgCircle cx={60} cy={90} r={5} fill={ACCENT} opacity={0.9} />
        <SvgCircle cx={60} cy={90} r={8} fill={ACCENT} opacity={0.25} />
        <SvgCircle cx={SW - 60} cy={90} r={5} fill={ACCENT2} opacity={0.9} />
        <SvgCircle cx={SW - 60} cy={90} r={8} fill={ACCENT2} opacity={0.25} />
        <SvgText
          x={60}
          y={115}
          textAnchor="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize={13}
          fontWeight="800"
          letterSpacing={2}
        >
          {FLIGHT.from}
        </SvgText>
        <SvgText
          x={SW - 60}
          y={115}
          textAnchor="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize={13}
          fontWeight="800"
          letterSpacing={2}
        >
          {FLIGHT.to}
        </SvgText>
      </Svg>
      <Animated.View style={planeStyle}>
        <Ionicons name="airplane" size={28} color={ACCENT} />
      </Animated.View>
    </View>
  );
}

function PerforatedEdge() {
  const dots = Array.from({ length: Math.floor((SW - 64) / 12) }, (_, i) => i);
  return (
    <View style={styles.perforatedRow}>
      {dots.map((i) => (
        <View key={i} style={styles.perforatedDot} />
      ))}
    </View>
  );
}

function BoardingPassFront() {
  return (
    <View style={styles.cardFront}>
      <View style={styles.airlineRow}>
        <View style={styles.airlineBadge}>
          <Ionicons name="airplane" size={14} color="#FFF" />
        </View>
        <View>
          <Text style={styles.airlineName}>{FLIGHT.airline}</Text>
          <Text style={styles.flightNo}>{FLIGHT.flightNo}</Text>
        </View>
        <View style={styles.classBadge}>
          <Text style={styles.classText}>{FLIGHT.class}</Text>
        </View>
      </View>

      <View style={styles.citiesRow}>
        <View style={styles.cityBlock}>
          <Text style={styles.cityCode}>{FLIGHT.from}</Text>
          <Text style={styles.cityName}>{FLIGHT.fromCity}</Text>
          <Text style={styles.timeLabel}>{FLIGHT.departure}</Text>
        </View>
        <View style={styles.flightPath}>
          <View style={styles.pathLine} />
          <View style={styles.pathPlane}>
            <Ionicons name="airplane" size={18} color={ACCENT} />
          </View>
          <View style={styles.pathLine} />
          <Text style={styles.durationText}>{FLIGHT.duration}</Text>
        </View>
        <View style={[styles.cityBlock, { alignItems: "flex-end" }]}>
          <Text style={styles.cityCode}>{FLIGHT.to}</Text>
          <Text style={styles.cityName}>{FLIGHT.toCity}</Text>
          <Text style={styles.timeLabel}>{FLIGHT.arrival}</Text>
        </View>
      </View>

      <PerforatedEdge />

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>PASSENGER</Text>
          <Text style={styles.detailValue}>{FLIGHT.passenger}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>DATE</Text>
          <Text style={styles.detailValue}>{FLIGHT.date}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>GATE</Text>
          <Text style={[styles.detailValueLarge, { color: GATE_GREEN }]}>
            {FLIGHT.gate}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>SEAT</Text>
          <Text style={styles.detailValueLarge}>{FLIGHT.seat}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>TERMINAL</Text>
          <Text style={styles.detailValue}>{FLIGHT.terminal}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>BOARDING</Text>
          <Text style={[styles.detailValue, { color: BOARDING_RED }]}>
            {FLIGHT.boardingTime}
          </Text>
        </View>
      </View>

      <View style={styles.barcodeRow}>
        {Array.from({ length: 40 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.barcodeLine,
              {
                height: 28 + Math.random() * 14,
                width: Math.random() > 0.3 ? 2.5 : 1.5,
                opacity: 0.7 + Math.random() * 0.3,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function BoardingPassBack() {
  return (
    <View style={styles.cardBack}>
      <LinearGradient
        colors={[CARD_BACK, "#162236"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Text style={styles.backTitle}>SCAN TO BOARD</Text>
      <View style={styles.qrWrapper}>
        <View style={styles.qrBorder}>
          <QRGrid size={180} />
        </View>
      </View>
      <Text style={styles.backFlightNo}>{FLIGHT.flightNo}</Text>
      <Text style={styles.backRoute}>
        {FLIGHT.fromCity} → {FLIGHT.toCity}
      </Text>
      <View style={styles.backInfoRow}>
        <View style={styles.backInfoItem}>
          <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.5)" />
          <Text style={styles.backInfoText}>{FLIGHT.date}</Text>
        </View>
        <View style={styles.backInfoItem}>
          <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.5)" />
          <Text style={styles.backInfoText}>{FLIGHT.departure}</Text>
        </View>
        <View style={styles.backInfoItem}>
          <Ionicons name="navigate-outline" size={14} color="rgba(255,255,255,0.5)" />
          <Text style={styles.backInfoText}>
            Gate {FLIGHT.gate}
          </Text>
        </View>
      </View>
      <Text style={styles.backHint}>Tap to flip back</Text>
    </View>
  );
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ h: 1, m: 20, s: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        if (s > 0) {
          s--;
        } else if (m > 0) {
          m--;
          s = 59;
        } else if (h > 0) {
          h--;
          m = 59;
          s = 59;
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <Animated.View entering={FadeInDown.delay(1200).springify()} style={styles.countdownCard}>
      <BlurView intensity={40} tint="dark" style={styles.countdownBlur}>
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
          style={styles.countdownGradient}
        >
          <View style={styles.countdownHeader}>
            <View style={styles.countdownDot} />
            <Text style={styles.countdownLabel}>BOARDING IN</Text>
          </View>
          <View style={styles.countdownTimerRow}>
            <View style={styles.countdownUnit}>
              <Text style={styles.countdownNumber}>{pad(timeLeft.h)}</Text>
              <Text style={styles.countdownUnitLabel}>HRS</Text>
            </View>
            <Text style={styles.countdownSeparator}>:</Text>
            <View style={styles.countdownUnit}>
              <Text style={styles.countdownNumber}>{pad(timeLeft.m)}</Text>
              <Text style={styles.countdownUnitLabel}>MIN</Text>
            </View>
            <Text style={styles.countdownSeparator}>:</Text>
            <View style={styles.countdownUnit}>
              <Text style={styles.countdownNumber}>{pad(timeLeft.s)}</Text>
              <Text style={styles.countdownUnitLabel}>SEC</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: "rgba(34,197,94,0.15)" }]}>
              <View style={[styles.statusDotSmall, { backgroundColor: GATE_GREEN }]} />
              <Text style={[styles.statusText, { color: GATE_GREEN }]}>On Time</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: "rgba(255,107,53,0.15)" }]}>
              <Ionicons name="navigate" size={11} color={ACCENT} />
              <Text style={[styles.statusText, { color: ACCENT }]}>
                Gate {FLIGHT.gate}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
}

function StarsCanvas() {
  const twinkle = useSharedValue(0);

  useEffect(() => {
    twinkle.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  return (
    <Canvas style={styles.starsCanvas}>
      {STARS.map((star, i) => (
        <Circle
          key={i}
          cx={star.x}
          cy={star.y}
          r={star.r}
          color={`rgba(255,255,255,${star.opacity})`}
        />
      ))}
    </Canvas>
  );
}

function CloudsLayer() {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(
      withTiming(SW, { duration: 30000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  return (
    <Canvas style={styles.cloudsCanvas}>
      {CLOUDS.map((cloud, i) => {
        const skPath = Skia.Path.Make();
        const cx = cloud.x;
        const cy = cloud.y;
        skPath.addOval({
          x: cx - cloud.w / 2,
          y: cy - cloud.h / 2,
          width: cloud.w,
          height: cloud.h,
        });
        skPath.addOval({
          x: cx - cloud.w / 3,
          y: cy - cloud.h,
          width: cloud.w * 0.6,
          height: cloud.h * 0.9,
        });
        return (
          <Path
            key={i}
            path={skPath}
            color={`rgba(255,255,255,${cloud.opacity})`}
          />
        );
      })}
    </Canvas>
  );
}

export default function BoardingPassScreen() {
  const isFlipped = useSharedValue(false);
  const flipProgress = useSharedValue(0);

  const handleFlip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !isFlipped.value;
    isFlipped.value = next;
    flipProgress.value = withSpring(next ? 1 : 0, {
      damping: 15,
      stiffness: 100,
      mass: 0.8,
    });
  }, []);

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleFlip)();
  });

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: "hidden" as const,
      opacity: flipProgress.value > 0.5 ? 0 : 1,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: "hidden" as const,
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      opacity: flipProgress.value > 0.5 ? 1 : 0,
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[SKY_TOP, SKY_MID, SKY_BOT, "#4A7FBF"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <StarsCanvas />
      <CloudsLayer />

      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
        <Pressable style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Boarding Pass</Text>
        <Pressable style={styles.headerBtn}>
          <Ionicons name="share-outline" size={20} color="#FFF" />
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <RouteMap />
      </Animated.View>

      <GestureDetector gesture={tapGesture}>
        <Animated.View
          entering={FadeInDown.delay(600).springify()}
          style={styles.cardContainer}
        >
          <Animated.View style={[styles.cardWrapper, frontStyle]}>
            <BoardingPassFront />
          </Animated.View>
          <Animated.View style={[styles.cardWrapper, backStyle]}>
            <BoardingPassBack />
          </Animated.View>
          <View style={styles.flipHint}>
            <Ionicons name="sync-outline" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={styles.flipHintText}>Tap to flip</Text>
          </View>
        </Animated.View>
      </GestureDetector>

      <CountdownTimer />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  starsCanvas: {
    ...StyleSheet.absoluteFillObject,
    height: SH * 0.5,
  },
  cloudsCanvas: {
    ...StyleSheet.absoluteFillObject,
    height: SH * 0.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  routeContainer: {
    height: 130,
    marginTop: 4,
  },
  routeSvg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  cardContainer: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  cardWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
  },
  cardFront: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
  },
  airlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  airlineBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: AIRLINE_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  airlineName: {
    fontSize: 11,
    fontWeight: "800",
    color: TEXT_MID,
    letterSpacing: 2,
  },
  flightNo: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
    marginTop: 1,
  },
  classBadge: {
    marginLeft: "auto",
    backgroundColor: "rgba(255,107,53,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  classText: {
    fontSize: 11,
    fontWeight: "700",
    color: ACCENT,
    letterSpacing: 0.5,
  },
  citiesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  cityBlock: {
    gap: 3,
  },
  cityCode: {
    fontSize: 32,
    fontWeight: "900",
    color: TEXT_DARK,
    letterSpacing: -1,
  },
  cityName: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_MID,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
    marginTop: 2,
  },
  flightPath: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 4,
  },
  pathLine: {
    height: 1.5,
    width: "30%",
    backgroundColor: PERFORATED,
    borderRadius: 1,
  },
  pathPlane: {
    transform: [{ rotate: "90deg" }],
  },
  durationText: {
    fontSize: 10,
    fontWeight: "600",
    color: TEXT_LIGHT,
    marginTop: 2,
  },
  perforatedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
    marginHorizontal: -20,
    paddingHorizontal: 8,
  },
  perforatedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PERFORATED,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
  },
  detailItem: {
    width: "33.33%",
    marginBottom: 16,
    gap: 3,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: TEXT_LIGHT,
    letterSpacing: 1.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  detailValueLarge: {
    fontSize: 22,
    fontWeight: "900",
    color: TEXT_DARK,
  },
  barcodeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 2,
    marginTop: 4,
    height: 42,
  },
  barcodeLine: {
    backgroundColor: TEXT_DARK,
    borderRadius: 1,
  },
  cardBack: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    overflow: "hidden",
    minHeight: 380,
    justifyContent: "center",
  },
  backTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 3,
    marginBottom: 20,
  },
  qrWrapper: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  qrBorder: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  backFlightNo: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 2,
    marginTop: 20,
  },
  backRoute: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
  },
  backInfoRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 20,
  },
  backInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  backInfoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  backHint: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.25)",
    marginTop: 20,
  },
  flipHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
  },
  flipHintText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
  },
  countdownCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  countdownBlur: {
    borderRadius: 16,
    overflow: "hidden",
  },
  countdownGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  countdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  countdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GATE_GREEN,
  },
  countdownLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 2,
  },
  countdownTimerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 12,
  },
  countdownUnit: {
    alignItems: "center",
    gap: 2,
  },
  countdownNumber: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFF",
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
  },
  countdownUnitLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 1,
  },
  countdownSeparator: {
    fontSize: 28,
    fontWeight: "300",
    color: "rgba(255,255,255,0.3)",
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
});