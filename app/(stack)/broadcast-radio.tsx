import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Canvas,
  Circle,
  Line,
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
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const { width } = Dimensions.get("window");

const BG         = "#E6E2D9";
const NEO_LIGHT  = "#FEFCF7";
const NEO_DARK   = "#BDB5A4";
const BODY       = "#E6E2D9";
const BODY_DEEP  = "#D4CDBF";
const AMBER      = "#F5A623";
const AMBER_BG   = "#120C00";
const COPPER     = "#A0522D";
const COPPER2    = "#CD7F32";
const COPPER3    = "#E8A24A";
const CHROME_A   = "#E8E4DE";
const CHROME_B   = "#9E9890";
const TEXT_MAIN  = "#2E2416";
const TEXT_SUB   = "#7A7060";
const TEXT_MUTED = "#ADA59A";
const GREEN_LED  = "#22C55E";
const RED_LED    = "#F43F5E";

type Band = "FM" | "AM" | "SW";

type Station = {
  id: string;
  name: string;
  freq: number;
  band: Band;
  genre: string;
  signal: number;
};

const STATIONS: Station[] = [
  { id: "1", name: "Jazz Noir",      freq: 88.1,  band: "FM", genre: "Jazz",       signal: 5 },
  { id: "2", name: "Velvet Soul",    freq: 91.7,  band: "FM", genre: "R&B",        signal: 4 },
  { id: "3", name: "Neon Classics",  freq: 95.3,  band: "FM", genre: "Classical",  signal: 5 },
  { id: "4", name: "Deep Static",    freq: 99.9,  band: "FM", genre: "Electronic", signal: 3 },
  { id: "5", name: "Copper Morning", freq: 104.5, band: "FM", genre: "Indie",      signal: 4 },
  { id: "6", name: "Gold Standard",  freq: 1020,  band: "AM", genre: "News",       signal: 4 },
  { id: "7", name: "Shortwave Echo", freq: 7.2,   band: "SW", genre: "World",      signal: 2 },
];

const BANDS: Band[] = ["FM", "AM", "SW"];

function freqLabel(freq: number, band: Band): string {
  if (band === "AM") return `${freq} kHz`;
  return `${freq.toFixed(1)} MHz`;
}

function SignalBars({ level, color }: { level: number; color: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <View
          key={n}
          style={{
            width: 4,
            height: 4 + n * 3,
            borderRadius: 1.5,
            backgroundColor: n <= level ? color : `${color}28`,
          }}
        />
      ))}
    </View>
  );
}

function LEDIndicator({ on, color }: { on: boolean; color: string }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (on) {
      pulse.value = withRepeat(withTiming(0.35, { duration: 900 }), -1, true);
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(0);
    }
  }, [on, pulse]);

  const style = useAnimatedStyle(() => ({
    shadowOpacity: pulse.value,
    opacity: on ? 0.9 + pulse.value * 0.1 : 0.2,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 9,
          height: 9,
          borderRadius: 4.5,
          backgroundColor: on ? color : TEXT_MUTED,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 8,
          elevation: 4,
        },
        style,
      ]}
    />
  );
}

function SpeakerGrille({ size }: { size: number }) {
  const cols     = 9;
  const rows     = 6;
  const hSpacing = size / (cols + 1);
  const vSpacing = (size * 0.6) / (rows + 1);

  return (
    <View style={{ width: size, height: size * 0.6, justifyContent: "center" }}>
      {Array.from({ length: rows }).map((_, r) => (
        <View
          key={r}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: vSpacing * 0.35,
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <View
              key={c}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: BODY_DEEP,
                marginHorizontal: hSpacing * 0.24,
                shadowColor: NEO_LIGHT,
                shadowOffset: { width: -1, height: -1 },
                shadowOpacity: 1,
                shadowRadius: 1.5,
                elevation: 2,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function VUMeter({ isPlaying }: { isPlaying: boolean }) {
  const angle = useSharedValue(-50);

  useEffect(() => {
    if (isPlaying) {
      angle.value = withRepeat(
        withTiming(-5 + Math.random() * 28, {
          duration: 500 + Math.random() * 400,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      );
    } else {
      cancelAnimation(angle);
      angle.value = withSpring(-50, { damping: 10 });
    }
  }, [isPlaying, angle]);

  const W  = 128;
  const H  = 78;
  const cx = W / 2;
  const cy = H - 10;
  const R  = 58;

  const arcPath = Skia.Path.Make();
  arcPath.addArc({ x: cx - R, y: cy - R, width: R * 2, height: R * 2 }, 180, 180);

  const needlePath = useDerivedValue(() => {
    const rad = ((angle.value - 90) * Math.PI) / 180;
    const nx  = cx + R * 0.76 * Math.cos(rad);
    const ny  = cy + R * 0.76 * Math.sin(rad);
    const p   = Skia.Path.Make();
    p.moveTo(cx, cy);
    p.lineTo(nx, ny);
    return p;
  });

  return (
    <Canvas style={{ width: W, height: H }}>
      <Path path={arcPath} style="stroke" strokeWidth={3} strokeCap="round" color={`${AMBER_BG}cc`} />
      {Array.from({ length: 13 }).map((_, i) => {
        const tickAngle = 180 + i * 15;
        const rad       = (tickAngle * Math.PI) / 180;
        const isLong    = i % 3 === 0;
        const inner     = R - (isLong ? 10 : 6);
        const tx1       = cx + inner * Math.cos(rad);
        const ty1       = cy + inner * Math.sin(rad);
        const tx2       = cx + (R + 3) * Math.cos(rad);
        const ty2       = cy + (R + 3) * Math.sin(rad);
        const isRed     = i >= 10;
        return (
          <Line
            key={i}
            p1={vec(tx1, ty1)}
            p2={vec(tx2, ty2)}
            strokeWidth={isLong ? 2.5 : 1.2}
            color={isRed ? `${RED_LED}CC` : `${AMBER}70`}
          />
        );
      })}
      <Path path={needlePath} style="stroke" strokeWidth={2} strokeCap="round" color={COPPER3} />
      <Circle cx={cx} cy={cy} r={5.5} color={COPPER} />
      <Circle cx={cx} cy={cy} r={2.5} color={COPPER3} />
    </Canvas>
  );
}

function TuningDial({
  rotation,
  onDelta,
}: {
  rotation: SharedValue<number>;
  onDelta: (d: number) => void;
}) {
  const startAngle = useSharedValue(0);
  const baseAngle  = useSharedValue(0);
  const SIZE       = 148;
  const INNER      = SIZE - 14;
  const GRIP       = INNER - 16;
  const CORE       = GRIP - 22;

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      startAngle.value = Math.atan2(e.y - SIZE / 2, e.x - SIZE / 2) * (180 / Math.PI);
      baseAngle.value  = rotation.value;
    })
    .onUpdate((e) => {
      const cur   = Math.atan2(e.y - SIZE / 2, e.x - SIZE / 2) * (180 / Math.PI);
      let   delta = cur - startAngle.value;
      if (delta > 180)  delta -= 360;
      if (delta < -180) delta += 360;
      rotation.value = baseAngle.value + delta;
      scheduleOnRN(onDelta, delta * 0.045);
    });

  const dialStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const grooveCount = 32;

  return (
    <GestureDetector gesture={gesture}>
      <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            position: "absolute",
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            backgroundColor: CHROME_B,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.45,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          <LinearGradient
            colors={[NEO_LIGHT, CHROME_A, CHROME_B, CHROME_A, NEO_LIGHT, CHROME_B, CHROME_A]}
            style={{ ...StyleSheet.absoluteFillObject, borderRadius: SIZE / 2 }}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
          />
        </View>

        <View
          style={{
            position: "absolute",
            top: 6,
            width: 4,
            height: 14,
            borderRadius: 2,
            backgroundColor: AMBER,
            shadowColor: AMBER,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 6,
            zIndex: 10,
          }}
        />

        <Animated.View
          style={[
            {
              width: INNER,
              height: INNER,
              borderRadius: INNER / 2,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COPPER,
            },
            dialStyle,
          ]}
        >
          <LinearGradient
            colors={[COPPER3, COPPER, "#7A3A18", COPPER2, COPPER3, COPPER, "#6B3010"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
          />

          {Array.from({ length: grooveCount }).map((_, i) => {
            const angle   = (i / grooveCount) * 360;
            const rad     = (angle * Math.PI) / 180;
            const halfW   = INNER / 2;
            const isMajor = i % 4 === 0;
            const rInner  = halfW - (isMajor ? 18 : 12);
            const gx      = halfW + rInner * Math.sin(rad);
            const gy      = halfW - rInner * Math.cos(rad);
            return (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left:   gx - (isMajor ? 1.5 : 0.8),
                  top:    gy - (isMajor ? 6 : 4),
                  width:  isMajor ? 3 : 1.5,
                  height: isMajor ? 16 : 10,
                  borderRadius: 1.5,
                  backgroundColor: isMajor ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.35)",
                  transform: [{ rotate: `${angle}deg` }],
                }}
              />
            );
          })}

          <View
            style={{
              width: GRIP,
              height: GRIP,
              borderRadius: GRIP / 2,
              backgroundColor: "#2A1A0E",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.7,
              shadowRadius: 6,
            }}
          >
            <LinearGradient
              colors={["#3D2410", "#1A0E06", "#2A1A0E", "#0E0804"]}
              style={{ ...StyleSheet.absoluteFillObject, borderRadius: GRIP / 2 }}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
            />

            {Array.from({ length: 16 }).map((_, i) => {
              const a  = (i / 16) * 360;
              const hw = GRIP / 2;
              return (
                <View
                  key={i}
                  style={{
                    position: "absolute",
                    left: hw - 0.5,
                    top:  hw - GRIP * 0.36,
                    width: 1,
                    height: GRIP * 0.3,
                    borderRadius: 0.5,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    transformOrigin: `0.5px ${GRIP * 0.36}px`,
                    transform: [{ rotate: `${a}deg` }],
                  }}
                />
              );
            })}

            <View
              style={{
                width: CORE,
                height: CORE,
                borderRadius: CORE / 2,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 2, height: 3 },
                shadowOpacity: 0.5,
                shadowRadius: 5,
              }}
            >
              <LinearGradient
                colors={[COPPER3, COPPER2, COPPER, "#8B4513", COPPER2, COPPER3]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.1, y: 0.1 }}
                end={{ x: 0.9, y: 0.9 }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 4,
                  left: 6,
                  width: CORE * 0.45,
                  height: CORE * 0.35,
                  borderRadius: CORE * 0.2,
                  backgroundColor: "rgba(255,255,255,0.30)",
                  transform: [{ rotate: "-35deg" }],
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 4,
                  width: 2.5,
                  height: CORE * 0.35,
                  borderRadius: 1.5,
                  backgroundColor: "rgba(255,255,255,0.80)",
                  shadowColor: "#fff",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.7,
                  shadowRadius: 3,
                }}
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

function VolumeKnob({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const SIZE    = 96;
  const KNOB    = SIZE - 28;
  const MIN_DEG = -140;
  const MAX_DEG = 140;
  const rotation = useSharedValue(MIN_DEG + value * (MAX_DEG - MIN_DEG));
  const lastY    = useSharedValue(0);
  const lastX    = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      lastY.value = e.absoluteY;
      lastX.value = e.absoluteX;
    })
    .onUpdate((e) => {
      const dy    = lastY.value - e.absoluteY;
      const dx    = e.absoluteX - lastX.value;
      lastY.value = e.absoluteY;
      lastX.value = e.absoluteX;
      const delta  = (dy + dx) * 1.4;
      const newRot = Math.max(MIN_DEG, Math.min(MAX_DEG, rotation.value + delta));
      rotation.value = newRot;
      const newVal   = (newRot - MIN_DEG) / (MAX_DEG - MIN_DEG);
      scheduleOnRN(onChange, newVal);
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const ARC_W   = SIZE;
  const ARC_H   = SIZE;
  const ACX     = ARC_W / 2;
  const ACY     = ARC_H / 2;
  const ARC_R   = SIZE / 2 - 5;
  const arcDots = 25;

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
      <Canvas style={{ position: "absolute", width: ARC_W, height: ARC_H }}>
        {Array.from({ length: arcDots }).map((_, i) => {
          const pct   = i / (arcDots - 1);
          const degA  = MIN_DEG + pct * (MAX_DEG - MIN_DEG);
          const rad   = ((degA - 90) * Math.PI) / 180;
          const acx   = ACX + ARC_R * Math.cos(rad);
          const acy   = ACY + ARC_R * Math.sin(rad);
          const isLit = pct <= value;
          const isMaj = i % 5 === 0 || i === 0 || i === arcDots - 1;
          return (
            <Circle
              key={i}
              cx={acx}
              cy={acy}
              r={isMaj ? 2.5 : 1.6}
              color={isLit ? (isMaj ? COPPER3 : COPPER2) : `${NEO_DARK}80`}
            />
          );
        })}
      </Canvas>

      <View
        style={{
          position: "absolute",
          width: SIZE - 16,
          height: SIZE - 16,
          borderRadius: (SIZE - 16) / 2,
          backgroundColor: CHROME_B,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 12,
        }}
      >
        <LinearGradient
          colors={[NEO_LIGHT, CHROME_A, CHROME_B, NEO_LIGHT]}
          style={{ ...StyleSheet.absoluteFillObject, borderRadius: (SIZE - 16) / 2 }}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
        />
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            {
              width: KNOB,
              height: KNOB,
              borderRadius: KNOB / 2,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#2A1A0E",
            },
            knobStyle,
          ]}
        >
          <LinearGradient
            colors={["#3D2410", "#1A0E06", "#2A1508", "#0E0804"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
          />

          {Array.from({ length: 20 }).map((_, i) => {
            const a = (i / 20) * 360;
            return (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left: KNOB / 2 - 0.75,
                  top:  KNOB / 2 - KNOB * 0.42,
                  width: 1.5,
                  height: KNOB * 0.34,
                  borderRadius: 1,
                  backgroundColor: i % 5 === 0 ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.4)",
                  transformOrigin: `0.75px ${KNOB * 0.42}px`,
                  transform: [{ rotate: `${a}deg` }],
                }}
              />
            );
          })}

          <View
            style={{
              width: KNOB * 0.46,
              height: KNOB * 0.46,
              borderRadius: KNOB * 0.23,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LinearGradient
              colors={[COPPER3, COPPER2, COPPER, "#8B4513"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
            />
            <View
              style={{
                position: "absolute",
                top: 3,
                width: 2,
                height: KNOB * 0.16,
                borderRadius: 1,
                backgroundColor: "rgba(255,255,255,0.75)",
              }}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function RadioScreen() {
  const [activeStation, setActiveStation] = useState<Station>(STATIONS[0]);
  const [isPlaying,     setIsPlaying]     = useState(false);
  const [activeBand,    setActiveBand]    = useState<Band>("FM");
  const [volume,        setVolume]        = useState(0.6);
  const [freqOffset,    setFreqOffset]    = useState(0);

  const dialRotation = useSharedValue(0);
  const playBtnScale = useSharedValue(1);

  const bandStations = STATIONS.filter((s) => s.band === activeBand);

  const displayFreq = activeBand === "FM"
    ? Math.max(87.5, Math.min(108, activeStation.freq + freqOffset)).toFixed(1)
    : `${activeStation.freq}`;

  const handleDialDelta = useCallback((delta: number) => {
    setFreqOffset((prev) => Math.max(-10, Math.min(10, parseFloat((prev + delta).toFixed(2)))));
  }, []);

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
  }, []);

  const handlePlay = useCallback(() => {
    playBtnScale.value = withSpring(0.88, { damping: 8 }, () => {
      playBtnScale.value = withSpring(1, { damping: 12 });
    });
    setIsPlaying((p) => !p);
  }, [playBtnScale]);

  const handlePrev = useCallback(() => {
    const idx = bandStations.findIndex((s) => s.id === activeStation.id);
    setActiveStation(bandStations[(idx - 1 + bandStations.length) % bandStations.length]);
    setFreqOffset(0);
  }, [activeStation.id, bandStations]);

  const handleNext = useCallback(() => {
    const idx = bandStations.findIndex((s) => s.id === activeStation.id);
    setActiveStation(bandStations[(idx + 1) % bandStations.length]);
    setFreqOffset(0);
  }, [activeStation.id, bandStations]);

  const handleBandChange = useCallback((band: Band) => {
    setActiveBand(band);
    const first = STATIONS.find((s) => s.band === band);
    if (first) setActiveStation(first);
    setFreqOffset(0);
  }, []);

  const handleStationSelect = useCallback((station: Station) => {
    setActiveStation(station);
    setFreqOffset(0);
  }, []);

  const playBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playBtnScale.value }],
  }));

  const tunerPct = activeBand === "FM"
    ? (parseFloat(displayFreq) - 87.5) / 20.5
    : 0.5;

  return (
    <GestureHandlerRootView style={s.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <Animated.View entering={FadeInDown.duration(500).springify()} style={s.header}>
          <View>
            <Text style={s.headerEyebrow}>BROADCAST</Text>
            <Text style={s.headerTitle}>Radio</Text>
          </View>
          <View style={s.headerRight}>
            <LEDIndicator on={isPlaying} color={GREEN_LED} />
            <Text style={[s.onAirBadge, { color: isPlaying ? GREEN_LED : TEXT_MUTED }]}>
              {isPlaying ? "ON AIR" : "STANDBY"}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify()} style={s.radioBody}>

          <LinearGradient
            colors={[NEO_DARK, NEO_LIGHT, CHROME_A, NEO_LIGHT, CHROME_B, NEO_LIGHT, NEO_DARK]}
            style={s.chromeBar}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />

          <Animated.View entering={FadeIn.delay(200)} style={s.displayRow}>
            <View style={s.displayOuter}>
              <LinearGradient
                colors={[AMBER_BG, "#0D0800", "#140B00"]}
                style={StyleSheet.absoluteFill}
              />

              <View style={s.freqScale}>
                {["88", "92", "96", "100", "104", "108"].map((f) => (
                  <Text key={f} style={s.scaleTick}>{f}</Text>
                ))}
              </View>

              <View
                style={[
                  s.tuningLine,
                  { left: `${tunerPct * 88 + 6}%`, backgroundColor: AMBER },
                ]}
              />

              <View style={s.displayBody}>
                <Text style={s.displayFreq}>{displayFreq}</Text>
                <View style={s.displayUnits}>
                  <Text style={s.displayBand}>{activeBand}</Text>
                  <Text style={s.displayUnit}>
                    {activeBand === "AM" ? "kHz" : "MHz"}
                  </Text>
                </View>
              </View>

              <Text style={s.displayName} numberOfLines={1}>
                {activeStation.name.toUpperCase()}
              </Text>

              <View style={s.scanlines} pointerEvents="none">
                {Array.from({ length: 16 }).map((_, i) => (
                  <View key={i} style={s.scanline} />
                ))}
              </View>

              <View style={s.displayTopGlow} />

              <LinearGradient
                colors={["rgba(255,255,255,0.06)", "transparent"]}
                style={s.displayReflection}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>

            <View style={s.vuPanel}>
              <LinearGradient
                colors={[AMBER_BG, "#0A0600"]}
                style={StyleSheet.absoluteFill}
              />
              <Text style={s.vuLabel}>VU</Text>
              <VUMeter isPlaying={isPlaying} />
              <Text style={[s.vuPeak, { color: RED_LED }]}>◄ PEAK</Text>
            </View>
          </Animated.View>

          <View style={s.speakerDialRow}>
            <View style={s.speakerWell}>
              <LinearGradient
                colors={[BODY_DEEP, BODY, BODY_DEEP]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={s.speakerFabric}>
                <LinearGradient
                  colors={["#1A1510", "#2A2118"]}
                  style={StyleSheet.absoluteFill}
                />
                <SpeakerGrille size={width * 0.4} />
              </View>
              <Text style={s.speakerLabel}>◉ SPEAKER</Text>
            </View>

            <View style={s.dialColumn}>
              <Text style={s.knobLabel}>TUNING</Text>
              <TuningDial rotation={dialRotation} onDelta={handleDialDelta} />
              <Text style={s.knobSublabel}>← ROTATE →</Text>
            </View>
          </View>

          <View style={s.controlsRow}>
            <View style={s.knobSection}>
              <Text style={s.knobLabel}>VOLUME</Text>
              <VolumeKnob value={volume} onChange={handleVolumeChange} />
              <Text style={s.knobSublabel}>{Math.round(volume * 100)}%</Text>
            </View>

            <View style={s.transport}>
              <Pressable style={s.skipBtn} onPress={handlePrev}>
                <LinearGradient
                  colors={[BODY, BODY_DEEP]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Ionicons name="play-skip-back" size={16} color={TEXT_MAIN} />
              </Pressable>

              <Animated.View style={[s.playBtnWrap, playBtnStyle]}>
                <Pressable onPress={handlePlay} style={s.playBtn}>
                  <LinearGradient
                    colors={isPlaying ? [COPPER, COPPER2, COPPER3] : [BODY, BODY_DEEP]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View style={s.playBtnSheen} />
                  <View style={s.playBtnInnerRing} />
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={26}
                    color={isPlaying ? "#fff" : TEXT_MAIN}
                    style={!isPlaying ? { marginLeft: 3 } : undefined}
                  />
                </Pressable>
              </Animated.View>

              <Pressable style={s.skipBtn} onPress={handleNext}>
                <LinearGradient
                  colors={[BODY, BODY_DEEP]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Ionicons name="play-skip-forward" size={16} color={TEXT_MAIN} />
              </Pressable>
            </View>

            <View style={s.knobSection}>
              <Text style={s.knobLabel}>BAND</Text>
              <View style={s.bandStack}>
                {BANDS.map((b) => {
                  const active = b === activeBand;
                  return (
                    <Pressable
                      key={b}
                      style={[s.bandBtn, active && s.bandBtnActive]}
                      onPress={() => handleBandChange(b)}
                    >
                      {active && (
                        <LinearGradient
                          colors={[AMBER_BG, "#1A1000"]}
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                      {active && <View style={[s.bandLedDot, { backgroundColor: AMBER }]} />}
                      <Text style={[s.bandBtnText, active && { color: AMBER }]}>{b}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <LinearGradient
            colors={[NEO_DARK, NEO_LIGHT, CHROME_A, NEO_LIGHT, CHROME_B, NEO_LIGHT, NEO_DARK]}
            style={[s.chromeBar, { marginTop: 16 }]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />

          <View style={s.feet}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={s.foot}>
                <LinearGradient
                  colors={["#4A3020", "#2A1808"]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(220).springify()} style={s.presetsSection}>
          <View style={s.presetsHeader}>
            <View>
              <Text style={s.presetsEyebrow}>SAVED PRESETS</Text>
              <Text style={s.presetsTitle}>{bandStations.length} Stations</Text>
            </View>
            <SignalBars level={activeStation.signal} color={COPPER2} />
          </View>

          <View style={s.presetList}>
            {bandStations.map((station, i) => {
              const active = station.id === activeStation.id;
              return (
                <Pressable
                  key={station.id}
                  onPress={() => handleStationSelect(station)}
                  style={[s.presetCard, active && s.presetCardActive]}
                >
                  {active && (
                    <LinearGradient
                      colors={[`${COPPER}1A`, `${COPPER2}0D`]}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  )}
                  {active && <View style={[s.presetAccent, { backgroundColor: COPPER }]} />}

                  <View style={[s.presetNum, active && { backgroundColor: AMBER_BG, borderColor: `${AMBER}44` }]}>
                    <Text style={[s.presetNumText, active && { color: AMBER }]}>P{i + 1}</Text>
                  </View>

                  <View style={s.presetInfo}>
                    <Text style={[s.presetName, active && { color: TEXT_MAIN }]} numberOfLines={1}>
                      {station.name}
                    </Text>
                    <Text style={s.presetGenre}>{station.genre}</Text>
                  </View>

                  <View style={s.presetRight}>
                    <Text style={[s.presetFreq, active && { color: COPPER2 }]}>
                      {freqLabel(station.freq, station.band)}
                    </Text>
                    <SignalBars level={station.signal} color={active ? COPPER2 : TEXT_MUTED} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} style={s.infoBar}>
          {[
            { icon: <MaterialCommunityIcons name="antenna" size={13} color={TEXT_MUTED} />, label: "Stereo" },
            { icon: <Ionicons name="radio-outline" size={13} color={TEXT_MUTED} />, label: activeStation.genre },
            { icon: <Ionicons name="volume-medium-outline" size={13} color={TEXT_MUTED} />, label: `${Math.round(volume * 100)}%` },
            {
              icon: <LEDIndicator on={isPlaying} color={isPlaying ? GREEN_LED : TEXT_MUTED} />,
              label: isPlaying ? "Live" : "Off",
              color: isPlaying ? GREEN_LED : TEXT_MUTED,
            },
          ].map((item, i, arr) => (
            <React.Fragment key={i}>
              <View style={s.infoItem}>
                {item.icon}
                <Text style={[s.infoText, item.color ? { color: item.color } : undefined]}>
                  {item.label}
                </Text>
              </View>
              {i < arr.length - 1 && <View style={s.infoDivider} />}
            </React.Fragment>
          ))}
        </Animated.View>

      </ScrollView>
    </GestureHandlerRootView>
  );
}

const neoRaised = {
  backgroundColor: BODY,
  shadowColor:     NEO_DARK,
  shadowOffset:    { width: 6, height: 6 },
  shadowOpacity:   1,
  shadowRadius:    14,
  elevation:       8,
} as const;

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 18, paddingBottom: 48 },

  header: {
    flexDirection:  "row",
    alignItems:     "flex-end",
    justifyContent: "space-between",
    paddingTop:      60,
    paddingBottom:   22,
  },
  headerEyebrow: { color: TEXT_MUTED, fontSize: 10, fontWeight: "800", letterSpacing: 2.5, marginBottom: 2 },
  headerTitle:   { color: TEXT_MAIN, fontSize: 36, fontWeight: "900", letterSpacing: -1.4 },
  headerRight:   { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 6 },
  onAirBadge:    { fontSize: 10, fontWeight: "800", letterSpacing: 2.2 },

  radioBody: {
    ...neoRaised,
    borderRadius:      26,
    paddingHorizontal: 16,
    paddingTop:        14,
    paddingBottom:     16,
    marginBottom:      22,
    borderWidth:       1,
    borderColor:       `${NEO_LIGHT}90`,
  },
  chromeBar: { height: 7, borderRadius: 4, marginBottom: 14, opacity: 0.75 },

  displayRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  displayOuter: {
    flex:          1,
    height:        112,
    borderRadius:  10,
    overflow:      "hidden",
    borderWidth:   2,
    borderColor:   "#2E1C00",
    shadowColor:   "#000",
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius:  8,
    elevation:     6,
  },
  freqScale:  { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingTop: 8 },
  scaleTick:  { color: `${AMBER}48`, fontSize: 7, fontWeight: "600" },
  tuningLine: { position: "absolute", top: 0, bottom: 0, width: 2, opacity: 0.85 },
  displayBody: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 10, paddingTop: 6, gap: 6 },
  displayFreq: {
    color:            AMBER,
    fontSize:         38,
    fontWeight:       "900",
    letterSpacing:    -1.2,
    fontVariant:      ["tabular-nums"],
    textShadowColor:  `${AMBER}90`,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  displayUnits: { paddingBottom: 4, gap: 1 },
  displayBand: {
    color:            AMBER,
    fontSize:         13,
    fontWeight:       "900",
    letterSpacing:    0.8,
    textShadowColor:  `${AMBER}80`,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  displayUnit:        { color: `${AMBER}66`, fontSize: 9, fontWeight: "700", letterSpacing: 0.3 },
  displayName:        { color: `${AMBER}55`, fontSize: 8, fontWeight: "700", letterSpacing: 2, paddingHorizontal: 10, paddingBottom: 6 },
  scanlines:          { ...StyleSheet.absoluteFillObject, justifyContent: "space-around" },
  scanline:           { height: 1, backgroundColor: "#FFFFFF03" },
  displayTopGlow:     { position: "absolute", top: 0, left: 0, right: 0, height: 28, backgroundColor: `${AMBER}07` },
  displayReflection:  { position: "absolute", top: 0, left: 0, width: "40%", height: "100%" },

  vuPanel: {
    width:         128,
    height:        112,
    borderRadius:  10,
    overflow:      "hidden",
    borderWidth:   2,
    borderColor:   "#2E1C00",
    shadowColor:   "#000",
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius:  8,
    elevation:     5,
    alignItems:    "center",
    justifyContent:"flex-end",
    paddingBottom: 4,
  },
  vuLabel: { color: `${AMBER}60`, fontSize: 8, fontWeight: "800", letterSpacing: 2, marginBottom: 2 },
  vuPeak:  { fontSize: 6, fontWeight: "700", letterSpacing: 0.3, marginTop: 2 },

  speakerDialRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  speakerWell: {
    flex:          1,
    borderRadius:  14,
    overflow:      "hidden",
    padding:       10,
    alignItems:    "center",
    borderWidth:   1.5,
    borderColor:   NEO_DARK,
    shadowColor:   NEO_DARK,
    shadowOffset:  { width: -4, height: -4 },
    shadowOpacity: 0.9,
    shadowRadius:  8,
    elevation:     2,
  },
  speakerFabric: {
    width:             "100%",
    borderRadius:      10,
    overflow:          "hidden",
    paddingVertical:   8,
    paddingHorizontal: 4,
    alignItems:        "center",
    borderWidth:       1,
    borderColor:       "#3A2A1A",
  },
  speakerLabel: { color: TEXT_MUTED, fontSize: 7, fontWeight: "700", letterSpacing: 1.5, marginTop: 7 },
  dialColumn:   { alignItems: "center", gap: 6 },

  controlsRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  knobSection:  { alignItems: "center", gap: 6 },
  knobLabel:    { color: TEXT_MUTED, fontSize: 8, fontWeight: "800", letterSpacing: 2 },
  knobSublabel: { color: TEXT_MUTED, fontSize: 8, fontWeight: "500", letterSpacing: 0.5 },

  transport: { flexDirection: "row", alignItems: "center", gap: 10 },
  skipBtn: {
    width:          44,
    height:         44,
    borderRadius:   14,
    alignItems:     "center",
    justifyContent: "center",
    overflow:       "hidden",
    ...neoRaised,
    shadowOffset:  { width: 4, height: 4 },
    shadowRadius:  9,
    borderWidth:   1,
    borderColor:   `${NEO_LIGHT}70`,
  },
  playBtnWrap: {
    shadowColor:   "#000",
    shadowOffset:  { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius:  18,
    elevation:     16,
  },
  playBtn: {
    width:          72,
    height:         72,
    borderRadius:   24,
    alignItems:     "center",
    justifyContent: "center",
    overflow:       "hidden",
    borderWidth:    1.5,
    borderColor:    `${NEO_LIGHT}60`,
  },
  playBtnSheen: {
    position:             "absolute",
    top:                  0,
    left:                 0,
    right:                0,
    height:               "48%",
    backgroundColor:      "rgba(255,255,255,0.18)",
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
  },
  playBtnInnerRing: {
    position:     "absolute",
    width:        60,
    height:       60,
    borderRadius: 20,
    borderWidth:  1,
    borderColor:  "rgba(255,255,255,0.12)",
  },

  bandStack:    { gap: 5 },
  bandBtn: {
    paddingHorizontal: 16,
    paddingVertical:   6,
    borderRadius:      9,
    overflow:          "hidden",
    ...neoRaised,
    shadowOffset:  { width: 3, height: 3 },
    shadowRadius:  7,
    borderWidth:   1,
    borderColor:   `${NEO_DARK}55`,
    flexDirection: "row",
    alignItems:    "center",
    gap:           6,
  },
  bandBtnActive: { borderColor: `${AMBER}33` },
  bandLedDot:    { width: 5, height: 5, borderRadius: 3 },
  bandBtnText:   { color: TEXT_SUB, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },

  feet: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingHorizontal: 12 },
  foot: {
    width:         18,
    height:        8,
    borderRadius:  4,
    overflow:      "hidden",
    shadowColor:   "#000",
    shadowOffset:  { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius:  4,
    elevation:     3,
  },

  presetsSection: { marginBottom: 16 },
  presetsHeader:  { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 },
  presetsEyebrow: { color: TEXT_MUTED, fontSize: 10, fontWeight: "800", letterSpacing: 2.5, marginBottom: 3 },
  presetsTitle:   { color: TEXT_MAIN, fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  presetList:     { gap: 9 },
  presetCard: {
    flexDirection:  "row",
    alignItems:     "center",
    ...neoRaised,
    borderRadius:   16,
    padding:        13,
    gap:            12,
    overflow:       "hidden",
    borderWidth:    1,
    borderColor:    `${NEO_LIGHT}60`,
  },
  presetCardActive: { borderColor: `${COPPER}33`, shadowColor: COPPER, shadowOpacity: 0.35 },
  presetAccent:     { position: "absolute", left: 0, top: 14, bottom: 14, width: 3, borderRadius: 2 },
  presetNum: {
    width:           34,
    height:          34,
    borderRadius:    10,
    backgroundColor: BODY_DEEP,
    alignItems:      "center",
    justifyContent:  "center",
    borderWidth:     1,
    borderColor:     `${NEO_DARK}50`,
  },
  presetNumText: { color: TEXT_SUB, fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  presetInfo:    { flex: 1 },
  presetName:    { color: TEXT_SUB, fontSize: 14, fontWeight: "800", letterSpacing: -0.2, marginBottom: 2 },
  presetGenre:   { color: TEXT_MUTED, fontSize: 11, fontWeight: "500" },
  presetRight:   { alignItems: "flex-end", gap: 5 },
  presetFreq:    { color: TEXT_SUB, fontSize: 11, fontWeight: "700", fontVariant: ["tabular-nums"] },

  infoBar: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    ...neoRaised,
    borderRadius:    16,
    paddingVertical: 13,
    shadowOffset:    { width: 4, height: 4 },
    shadowRadius:    10,
    borderWidth:     1,
    borderColor:     `${NEO_LIGHT}60`,
  },
  infoItem:    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  infoText:    { color: TEXT_MUTED, fontSize: 11, fontWeight: "600", letterSpacing: 0.3 },
  infoDivider: { width: 1, height: 16, backgroundColor: NEO_DARK, opacity: 0.4 },
});