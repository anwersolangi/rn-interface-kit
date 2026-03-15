import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Line,
  LinearGradient as SkiaGradient,
  Path,
  Rect,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Path as SvgPath,
  Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SW } = Dimensions.get('window');
const CS = SW * 0.54;

type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy' | 'windy';
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface Theme {
  bg: readonly [string, string, string];
  base: string;
  light: string;
  dark: string;
  text: string;
  sub: string;
  accent: string;
}

interface HourlyItem {
  time: string;
  temp: number;
  icon: IoniconName;
}

interface CityWeather {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: string;
  type: WeatherType;
  humidity: number;
  wind: number;
  uv: number;
  hourly: HourlyItem[];
}

const THEMES: Record<WeatherType, Theme> = {
  sunny: {
    bg: ['#FFF8D6', '#FFD740', '#FF9100'] as const,
    base: '#FFE57F', light: '#FFFDE7', dark: '#E8A000',
    text: '#3E2400', sub: '#7A5200', accent: '#FF6D00',
  },
  cloudy: {
    bg: ['#E8EDF2', '#CBD8E4', '#A8BBCC'] as const,
    base: '#D4DDE6', light: '#F0F5FA', dark: '#8AAFC4',
    text: '#1A2B38', sub: '#3C5565', accent: '#546E7A',
  },
  rainy: {
    bg: ['#6D90A8', '#3E5A70', '#1C3040'] as const,
    base: '#4E7089', light: '#698CAA', dark: '#28404E',
    text: '#E4F4FF', sub: '#A4C8DC', accent: '#64C8F8',
  },
  stormy: {
    bg: ['#3E1A80', '#200060', '#080020'] as const,
    base: '#2D1470', light: '#4A30A0', dark: '#10003A',
    text: '#EDE7F6', sub: '#9E88D0', accent: '#C0A0FF',
  },
  snowy: {
    bg: ['#DFF0FF', '#B8D8F8', '#88B8E8'] as const,
    base: '#C4DCED', light: '#EAF6FF', dark: '#78AACC',
    text: '#0A2030', sub: '#186090', accent: '#1E88E5',
  },
  foggy: {
    bg: ['#C0C0C0', '#989898', '#707070'] as const,
    base: '#AEAEAE', light: '#CACACA', dark: '#747474',
    text: '#181818', sub: '#404040', accent: '#5E5E5E',
  },
  windy: {
    bg: ['#A8E0D8', '#48B8AC', '#008878'] as const,
    base: '#7ACAC4', light: '#B8E8E4', dark: '#309890',
    text: '#001E18', sub: '#004840', accent: '#00897B',
  },
};

const CITIES: CityWeather[] = [
  {
    city: 'Los Angeles', country: 'US', temp: 28, feelsLike: 26,
    condition: 'Sunny & Clear', type: 'sunny', humidity: 45, wind: 12, uv: 8,
    hourly: [
      { time: '9AM', temp: 24, icon: 'sunny-outline' },
      { time: '12PM', temp: 28, icon: 'sunny' },
      { time: '3PM', temp: 30, icon: 'partly-sunny-outline' },
      { time: '6PM', temp: 27, icon: 'sunny-outline' },
      { time: '9PM', temp: 22, icon: 'moon-outline' },
    ],
  },
  {
    city: 'Seattle', country: 'US', temp: 12, feelsLike: 9,
    condition: 'Heavy Rain', type: 'rainy', humidity: 88, wind: 25, uv: 1,
    hourly: [
      { time: '9AM', temp: 10, icon: 'rainy-outline' },
      { time: '12PM', temp: 12, icon: 'rainy' },
      { time: '3PM', temp: 13, icon: 'rainy-outline' },
      { time: '6PM', temp: 11, icon: 'rainy' },
      { time: '9PM', temp: 9, icon: 'cloudy-night-outline' },
    ],
  },
  {
    city: 'Chicago', country: 'US', temp: -4, feelsLike: -10,
    condition: 'Light Snow', type: 'snowy', humidity: 75, wind: 35, uv: 2,
    hourly: [
      { time: '9AM', temp: -6, icon: 'snow-outline' },
      { time: '12PM', temp: -4, icon: 'snow' },
      { time: '3PM', temp: -2, icon: 'snow-outline' },
      { time: '6PM', temp: -5, icon: 'snow' },
      { time: '9PM', temp: -8, icon: 'moon-outline' },
    ],
  },
  {
    city: 'Miami', country: 'US', temp: 32, feelsLike: 38,
    condition: 'Thunderstorm', type: 'stormy', humidity: 92, wind: 45, uv: 3,
    hourly: [
      { time: '9AM', temp: 30, icon: 'thunderstorm-outline' },
      { time: '12PM', temp: 32, icon: 'thunderstorm' },
      { time: '3PM', temp: 31, icon: 'rainy' },
      { time: '6PM', temp: 28, icon: 'thunderstorm-outline' },
      { time: '9PM', temp: 27, icon: 'cloudy-night-outline' },
    ],
  },
  {
    city: 'San Francisco', country: 'US', temp: 16, feelsLike: 14,
    condition: 'Dense Fog', type: 'foggy', humidity: 82, wind: 18, uv: 3,
    hourly: [
      { time: '9AM', temp: 14, icon: 'cloudy-outline' },
      { time: '12PM', temp: 16, icon: 'partly-sunny-outline' },
      { time: '3PM', temp: 17, icon: 'partly-sunny-outline' },
      { time: '6PM', temp: 15, icon: 'cloudy-outline' },
      { time: '9PM', temp: 13, icon: 'moon-outline' },
    ],
  },
  {
    city: 'Denver', country: 'US', temp: 7, feelsLike: 2,
    condition: 'Windy Gusts', type: 'windy', humidity: 38, wind: 58, uv: 5,
    hourly: [
      { time: '9AM', temp: 4, icon: 'cloudy-outline' },
      { time: '12PM', temp: 7, icon: 'partly-sunny-outline' },
      { time: '3PM', temp: 9, icon: 'cloudy-outline' },
      { time: '6PM', temp: 6, icon: 'cloudy-outline' },
      { time: '9PM', temp: 3, icon: 'moon-outline' },
    ],
  },
  {
    city: 'Portland', country: 'US', temp: 14, feelsLike: 13,
    condition: 'Overcast', type: 'cloudy', humidity: 70, wind: 14, uv: 3,
    hourly: [
      { time: '9AM', temp: 12, icon: 'cloudy-outline' },
      { time: '12PM', temp: 14, icon: 'cloudy-outline' },
      { time: '3PM', temp: 15, icon: 'cloudy-outline' },
      { time: '6PM', temp: 13, icon: 'cloudy-night-outline' },
      { time: '9PM', temp: 11, icon: 'cloudy-night-outline' },
    ],
  },
];

interface NeuCardProps {
  theme: Theme;
  style?: object;
  children: React.ReactNode;
}

const NeuCard: React.FC<NeuCardProps> = ({ theme, style, children }) => (
  <View style={[styles.neuCard, { backgroundColor: theme.base }, style]}>
    <View
      style={[
        StyleSheet.absoluteFillObject,
        styles.neuHighlight,
        { shadowColor: theme.light },
      ]}
    />
    <View
      style={[
        StyleSheet.absoluteFillObject,
        styles.neuShadow,
        { shadowColor: theme.dark },
      ]}
    />
    {children}
  </View>
);

interface UVGaugeProps {
  value: number;
  theme: Theme;
}

const UVGauge: React.FC<UVGaugeProps> = ({ value, theme }) => {
  const r = 24;
  const cx = 36;
  const cy = 34;
  const clamped = Math.min(Math.max(value, 0), 11);
  const angle = (clamped / 11) * Math.PI;
  const endX = cx + r * Math.cos(Math.PI - angle);
  const endY = cy - r * Math.sin(Math.PI - angle);

  return (
    <Svg width={72} height={42} viewBox="0 0 72 42">
      <Defs>
        <SvgGradient id="uvg" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#4CAF50" />
          <Stop offset="0.5" stopColor="#FF9800" />
          <Stop offset="1" stopColor="#F44336" />
        </SvgGradient>
      </Defs>
      <SvgPath
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`}
        stroke={`${theme.dark}55`}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      {clamped > 0 && (
        <SvgPath
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${endX.toFixed(2)} ${endY.toFixed(2)}`}
          stroke="url(#uvg)"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  icon: IoniconName;
  theme: Theme;
  children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, theme, children }) => (
  <NeuCard theme={theme} style={styles.statCard}>
    <Ionicons name={icon} size={20} color={theme.accent} />
    {children}
    <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: theme.sub }]}>{label}</Text>
  </NeuCard>
);

export default function WeatherApp() {
  const [cityIdx, setCityIdx] = useState(0);
  const cityIdxSV = useSharedValue(0);
  const slideX = useSharedValue(0);
  const alpha = useSharedValue(1);

  const sunRot = useSharedValue(0);
  const rainP = useSharedValue(0);
  const snowP = useSharedValue(0);
  const cloudD = useSharedValue(0.5);
  const fogD = useSharedValue(0.5);
  const windP = useSharedValue(0);
  const boltOp = useSharedValue(0);

  const weather = CITIES[cityIdx];
  const theme = THEMES[weather.type];

  const sunT = useDerivedValue(() => [{ rotate: sunRot.value }]);

  const r0t = useDerivedValue(() => [{ translateY: ((rainP.value + 0 / 6) % 1) * CS * 0.48 }]);
  const r1t = useDerivedValue(() => [{ translateY: ((rainP.value + 1 / 6) % 1) * CS * 0.48 }]);
  const r2t = useDerivedValue(() => [{ translateY: ((rainP.value + 2 / 6) % 1) * CS * 0.48 }]);
  const r3t = useDerivedValue(() => [{ translateY: ((rainP.value + 3 / 6) % 1) * CS * 0.48 }]);
  const r4t = useDerivedValue(() => [{ translateY: ((rainP.value + 4 / 6) % 1) * CS * 0.48 }]);
  const r5t = useDerivedValue(() => [{ translateY: ((rainP.value + 5 / 6) % 1) * CS * 0.48 }]);

  const s0t = useDerivedValue(() => [{ translateY: ((snowP.value + 0 / 5) % 1) * CS * 0.5 }]);
  const s1t = useDerivedValue(() => [{ translateY: ((snowP.value + 1 / 5) % 1) * CS * 0.5 }]);
  const s2t = useDerivedValue(() => [{ translateY: ((snowP.value + 2 / 5) % 1) * CS * 0.5 }]);
  const s3t = useDerivedValue(() => [{ translateY: ((snowP.value + 3 / 5) % 1) * CS * 0.5 }]);
  const s4t = useDerivedValue(() => [{ translateY: ((snowP.value + 4 / 5) % 1) * CS * 0.5 }]);

  const c1t = useDerivedValue(() => [{ translateX: (cloudD.value * 2 - 1) * 18 }]);
  const c2t = useDerivedValue(() => [{ translateX: -(cloudD.value * 2 - 1) * 11 }]);

  const f0t = useDerivedValue(() => [{ translateX: (fogD.value * 2 - 1) * 20 }]);
  const f1t = useDerivedValue(() => [{ translateX: -(fogD.value * 2 - 1) * 14 }]);
  const f2t = useDerivedValue(() => [{ translateX: (fogD.value * 2 - 1) * 10 }]);
  const f3t = useDerivedValue(() => [{ translateX: -(fogD.value * 2 - 1) * 7 }]);

  const w0o = useDerivedValue(() => Math.abs(Math.sin((windP.value + 0.0) * Math.PI * 2)));
  const w1o = useDerivedValue(() => Math.abs(Math.sin((windP.value + 0.25) * Math.PI * 2)));
  const w2o = useDerivedValue(() => Math.abs(Math.sin((windP.value + 0.5) * Math.PI * 2)));
  const w3o = useDerivedValue(() => Math.abs(Math.sin((windP.value + 0.75) * Math.PI * 2)));

  const rainXs = useMemo(() => [0.18, 0.32, 0.48, 0.63, 0.76, 0.38].map(f => f * CS), []);
  const snowXs = useMemo(() => [0.22, 0.38, 0.54, 0.70, 0.42].map(f => f * CS), []);

  const sunRaysPath = useMemo(() => {
    const p = Skia.Path.Make();
    const cx = CS / 2;
    const cy = CS / 2;
    const inner = 44;
    const outer = 72;
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
      const a2 = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
      const a3 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
      i === 0
        ? p.moveTo(cx + Math.cos(a1) * outer, cy + Math.sin(a1) * outer)
        : p.lineTo(cx + Math.cos(a1) * outer, cy + Math.sin(a1) * outer);
      p.lineTo(cx + Math.cos(a2) * inner, cy + Math.sin(a2) * inner);
      p.lineTo(cx + Math.cos(a3) * outer, cy + Math.sin(a3) * outer);
    }
    p.close();
    return p;
  }, []);

  const cloudBigPath = useMemo(() => {
    const p = Skia.Path.Make();
    const cx = CS / 2;
    const cy = CS * 0.36;
    p.moveTo(cx - 50, cy + 22);
    p.cubicTo(cx - 78, cy + 22, cx - 80, cy - 2, cx - 48, cy - 6);
    p.cubicTo(cx - 50, cy - 34, cx - 18, cy - 46, cx + 2, cy - 30);
    p.cubicTo(cx + 10, cy - 52, cx + 40, cy - 52, cx + 50, cy - 32);
    p.cubicTo(cx + 76, cy - 40, cx + 80, cy - 4, cx + 58, cy);
    p.cubicTo(cx + 82, cy + 6, cx + 80, cy + 26, cx + 58, cy + 26);
    p.lineTo(cx - 50, cy + 26);
    p.close();
    return p;
  }, []);

  const cloudSmallPath = useMemo(() => {
    const p = Skia.Path.Make();
    const cx = CS * 0.62;
    const cy = CS * 0.27;
    p.moveTo(cx - 28, cy + 14);
    p.cubicTo(cx - 44, cy + 14, cx - 46, cy - 2, cx - 26, cy - 4);
    p.cubicTo(cx - 28, cy - 22, cx - 10, cy - 30, cx + 2, cy - 20);
    p.cubicTo(cx + 6, cy - 32, cx + 26, cy - 32, cx + 32, cy - 18);
    p.cubicTo(cx + 48, cy - 24, cx + 50, cy - 4, cx + 36, cy);
    p.cubicTo(cx + 52, cy + 4, cx + 50, cy + 18, cx + 36, cy + 18);
    p.lineTo(cx - 28, cy + 18);
    p.close();
    return p;
  }, []);

  const boltPath = useMemo(() => {
    const p = Skia.Path.Make();
    const cx = CS / 2;
    const top = CS * 0.5;
    p.moveTo(cx + 8, top);
    p.lineTo(cx - 14, top + 30);
    p.lineTo(cx - 2, top + 30);
    p.lineTo(cx - 18, top + 62);
    p.lineTo(cx + 18, top + 22);
    p.lineTo(cx + 4, top + 22);
    p.close();
    return p;
  }, []);

  const fogPaths = useMemo(() =>
    [0, 1, 2, 3].map((i) => {
      const p = Skia.Path.Make();
      const y = CS * (0.3 + i * 0.12);
      const len = CS * (0.68 - Math.abs(i - 1.5) * 0.08);
      const sx = (CS - len) / 2;
      p.moveTo(sx, y);
      p.cubicTo(sx + len * 0.28, y - 9, sx + len * 0.62, y + 9, sx + len, y);
      return p;
    }),
  []);

  const windPaths = useMemo(() =>
    [0, 1, 2, 3].map((i) => {
      const p = Skia.Path.Make();
      const y = CS * (0.28 + i * 0.13);
      const sx = CS * 0.08;
      const len = CS * (0.52 + (i % 2 === 0 ? 0.18 : 0));
      p.moveTo(sx, y);
      p.cubicTo(sx + len * 0.3, y - 14, sx + len * 0.7, y + 14, sx + len, y);
      return p;
    }),
  []);

  const updateCity = useCallback((idx: number) => setCityIdx(idx), []);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      slideX.value = e.translationX;
    })
    .onEnd((e) => {
      const next =
        e.translationX < -80 && cityIdxSV.value < CITIES.length - 1
          ? cityIdxSV.value + 1
          : e.translationX > 80 && cityIdxSV.value > 0
          ? cityIdxSV.value - 1
          : cityIdxSV.value;
      if (next !== cityIdxSV.value) {
        cityIdxSV.value = next;
        runOnJS(updateCity)(next);
      }
      slideX.value = withSpring(0, { damping: 18 });
    });

  useEffect(() => {
    sunRot.value = 0;
    rainP.value = 0;
    snowP.value = 0;
    boltOp.value = 0;
    windP.value = 0;

    alpha.value = 0;
    alpha.value = withTiming(1, { duration: 380 });

    const type = CITIES[cityIdx].type;

    if (type === 'sunny') {
      sunRot.value = withRepeat(withTiming(Math.PI * 2, { duration: 8000 }), -1, false);
    } else if (type === 'rainy') {
      rainP.value = withRepeat(withTiming(1, { duration: 1100 }), -1, false);
    } else if (type === 'stormy') {
      rainP.value = withRepeat(withTiming(1, { duration: 720 }), -1, false);
      boltOp.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 1600 }),
          withTiming(1, { duration: 80 }),
          withTiming(0.1, { duration: 100 }),
          withTiming(1, { duration: 60 }),
          withTiming(0, { duration: 160 }),
        ),
        -1,
        false
      );
    } else if (type === 'snowy') {
      snowP.value = withRepeat(withTiming(1, { duration: 3800 }), -1, false);
    } else if (type === 'cloudy') {
      cloudD.value = withRepeat(withTiming(1, { duration: 5000 }), -1, true);
    } else if (type === 'foggy') {
      fogD.value = withRepeat(withTiming(1, { duration: 7000 }), -1, true);
    } else if (type === 'windy') {
      windP.value = withRepeat(withTiming(1, { duration: 1400 }), -1, false);
    }
  }, [cityIdx]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          slideX.value,
          [-SW, 0, SW],
          [-SW * 0.12, 0, SW * 0.12],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      Math.abs(slideX.value),
      [0, SW * 0.4],
      [1, 0.4],
      Extrapolation.CLAMP
    ),
  }));

  const fadeStyle = useAnimatedStyle(() => ({ opacity: alpha.value }));

  const isWet = weather.type === 'rainy' || weather.type === 'stormy';
  const rainColor = weather.type === 'stormy' ? 'rgba(180,140,255,0.9)' : 'rgba(140,210,255,0.9)';
  const bigCloudColor = weather.type === 'stormy' ? '#3A1880' : '#546E7A';
  const smallCloudColor = weather.type === 'stormy' ? '#240D60' : '#607D8B';

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <LinearGradient
        colors={theme.bg}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.75, y: 1 }}
      />

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.screen, slideStyle]}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={fadeStyle}>
              <View style={styles.header}>
                <View>
                  <Text style={[styles.cityText, { color: theme.text }]}>{weather.city}</Text>
                  <Text style={[styles.countryText, { color: theme.sub }]}>
                    {weather.country} · {dateStr}
                  </Text>
                </View>
                <Ionicons name="location-outline" size={22} color={theme.sub} />
              </View>

              <View style={styles.canvasRow}>
                <Canvas style={{ width: CS, height: CS }}>
                  <Rect x={0} y={0} width={CS} height={CS} opacity={0.06}>
                    <SkiaGradient
                      start={vec(0, 0)}
                      end={vec(CS, CS)}
                      colors={[theme.light, theme.dark]}
                    />
                  </Rect>

                  {weather.type === 'sunny' && (
                    <>
                      <Circle cx={CS / 2} cy={CS / 2} r={46} color={theme.accent} opacity={0.18}>
                        <BlurMask blur={28} style="normal" />
                      </Circle>
                      <Group transform={sunT} origin={vec(CS / 2, CS / 2)}>
                        <Path path={sunRaysPath} color="#FFD740" opacity={0.9} />
                      </Group>
                      <Circle cx={CS / 2} cy={CS / 2} r={34} color="#FFE57F" />
                      <Circle cx={CS / 2} cy={CS / 2} r={24} color="#FFFDE7" opacity={0.65} />
                    </>
                  )}

                  {isWet && (
                    <>
                      <Path path={cloudBigPath} color={bigCloudColor} />
                      {weather.type === 'stormy' && (
                        <Path path={cloudSmallPath} color={smallCloudColor} opacity={0.75} />
                      )}
                      <Group transform={r0t}>
                        <Line p1={vec(rainXs[0], CS * 0.52)} p2={vec(rainXs[0] - 4, CS * 0.52 + 16)} color={rainColor} strokeWidth={2.5} />
                      </Group>
                      <Group transform={r1t}>
                        <Line p1={vec(rainXs[1], CS * 0.52)} p2={vec(rainXs[1] - 4, CS * 0.52 + 16)} color={rainColor} strokeWidth={2.5} />
                      </Group>
                      <Group transform={r2t}>
                        <Line p1={vec(rainXs[2], CS * 0.52)} p2={vec(rainXs[2] - 4, CS * 0.52 + 16)} color={rainColor} strokeWidth={2.5} />
                      </Group>
                      <Group transform={r3t}>
                        <Line p1={vec(rainXs[3], CS * 0.52)} p2={vec(rainXs[3] - 4, CS * 0.52 + 16)} color={rainColor} strokeWidth={2.5} />
                      </Group>
                      <Group transform={r4t}>
                        <Line p1={vec(rainXs[4], CS * 0.52)} p2={vec(rainXs[4] - 4, CS * 0.52 + 16)} color={rainColor} strokeWidth={2.5} />
                      </Group>
                      <Group transform={r5t}>
                        <Line p1={vec(rainXs[5], CS * 0.52)} p2={vec(rainXs[5] - 4, CS * 0.52 + 16)} color={rainColor} strokeWidth={2.5} />
                      </Group>
                      {weather.type === 'stormy' && (
                        <Path path={boltPath} color="#FFE040" opacity={boltOp} />
                      )}
                    </>
                  )}

                  {weather.type === 'snowy' && (
                    <>
                      <Path path={cloudBigPath} color="#90CAF9" />
                      <Group transform={s0t}>
                        <Circle cx={snowXs[0]} cy={CS * 0.52} r={5} color="rgba(255,255,255,0.92)" />
                      </Group>
                      <Group transform={s1t}>
                        <Circle cx={snowXs[1]} cy={CS * 0.52} r={4} color="rgba(220,240,255,0.85)" />
                      </Group>
                      <Group transform={s2t}>
                        <Circle cx={snowXs[2]} cy={CS * 0.52} r={6} color="rgba(255,255,255,0.92)" />
                      </Group>
                      <Group transform={s3t}>
                        <Circle cx={snowXs[3]} cy={CS * 0.52} r={4} color="rgba(200,230,255,0.8)" />
                      </Group>
                      <Group transform={s4t}>
                        <Circle cx={snowXs[4]} cy={CS * 0.52} r={5} color="rgba(255,255,255,0.88)" />
                      </Group>
                    </>
                  )}

                  {weather.type === 'cloudy' && (
                    <>
                      <Group transform={c2t}>
                        <Path path={cloudSmallPath} color="#90A4AE" opacity={0.82} />
                      </Group>
                      <Group transform={c1t}>
                        <Path path={cloudBigPath} color="#B0BEC5" />
                      </Group>
                    </>
                  )}

                  {weather.type === 'foggy' && (
                    <>
                      <Group transform={f0t}>
                        <Path path={fogPaths[0]} color={`${theme.text}80`} style="stroke" strokeWidth={5} />
                      </Group>
                      <Group transform={f1t}>
                        <Path path={fogPaths[1]} color={`${theme.text}60`} style="stroke" strokeWidth={4} />
                      </Group>
                      <Group transform={f2t}>
                        <Path path={fogPaths[2]} color={`${theme.text}70`} style="stroke" strokeWidth={5} />
                      </Group>
                      <Group transform={f3t}>
                        <Path path={fogPaths[3]} color={`${theme.text}48`} style="stroke" strokeWidth={3.5} />
                      </Group>
                    </>
                  )}

                  {weather.type === 'windy' && (
                    <>
                      <Path path={windPaths[0]} color={theme.accent} style="stroke" strokeWidth={4} opacity={w0o} />
                      <Path path={windPaths[1]} color={theme.accent} style="stroke" strokeWidth={3} opacity={w1o} />
                      <Path path={windPaths[2]} color={theme.accent} style="stroke" strokeWidth={4.5} opacity={w2o} />
                      <Path path={windPaths[3]} color={theme.accent} style="stroke" strokeWidth={3} opacity={w3o} />
                    </>
                  )}
                </Canvas>
              </View>

              <View style={styles.tempBlock}>
                <Text style={[styles.tempText, { color: theme.text }]}>{weather.temp}°C</Text>
                <Text style={[styles.condText, { color: theme.sub }]}>{weather.condition}</Text>
                <Text style={[styles.feelsText, { color: theme.sub }]}>
                  Feels like {weather.feelsLike}°
                </Text>
              </View>

              <View style={styles.statsRow}>
                <StatCard label="Humidity" value={`${weather.humidity}%`} icon="water-outline" theme={theme} />
                <StatCard label="Wind" value={`${weather.wind} km/h`} icon="speedometer-outline" theme={theme} />
                <StatCard label={`UV ${weather.uv}`} value="" icon="sunny-outline" theme={theme}>
                  <UVGauge value={weather.uv} theme={theme} />
                </StatCard>
              </View>

              <NeuCard theme={theme} style={styles.hourlyCard}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Hourly</Text>
                <View style={styles.hourlyRow}>
                  {weather.hourly.map((h) => (
                    <View key={h.time} style={styles.hourlyItem}>
                      <Text style={[styles.hourlyTime, { color: theme.sub }]}>{h.time}</Text>
                      <Ionicons name={h.icon} size={22} color={theme.accent} style={styles.hourlyIcon} />
                      <Text style={[styles.hourlyTemp, { color: theme.text }]}>{h.temp}°</Text>
                    </View>
                  ))}
                </View>
              </NeuCard>

              <View style={styles.dots}>
                {CITIES.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: theme.text,
                        opacity: i === cityIdx ? 0.9 : 0.28,
                        transform: [{ scale: i === cityIdx ? 1.3 : 1 }],
                      },
                    ]}
                  />
                ))}
              </View>

              <Text style={[styles.swipeHint, { color: theme.sub }]}>
                ← swipe to change city →
              </Text>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const NEU_RADIUS = 20;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cityText: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  countryText: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  canvasRow: {
    alignItems: 'center',
    marginVertical: 8,
  },
  tempBlock: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  tempText: {
    fontSize: 74,
    fontWeight: '900',
    letterSpacing: -4,
    lineHeight: 80,
  },
  condText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  feelsText: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '400',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  hourlyCard: {
    padding: 18,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  hourlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hourlyItem: {
    alignItems: 'center',
    gap: 6,
  },
  hourlyTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  hourlyIcon: {
    marginVertical: 2,
  },
  hourlyTemp: {
    fontSize: 14,
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '400',
    opacity: 0.6,
  },
  neuCard: {
    borderRadius: NEU_RADIUS,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    overflow: 'hidden',
  },
  neuHighlight: {
    borderRadius: NEU_RADIUS,
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 0,
  },
  neuShadow: {
    borderRadius: NEU_RADIUS,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 0,
  },
});