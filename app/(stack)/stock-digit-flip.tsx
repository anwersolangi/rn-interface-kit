import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  StatusBar,
  TextStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
  AnimatedStyle,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";

const { width } = Dimensions.get("window");

const CHART_W = width - 48;
const CHART_H = 180;
const DIGIT_H = 54;

const GREEN = "#00C087";
const RED = "#F03E3E";
const BG = "#FFFFFF";
const SURFACE = "#F7F8FA";
const TEXT_PRIMARY = "#0A0E1A";
const TEXT_SECONDARY = "#8892A4";
const BORDER = "#ECEEF2";

type Range = "1D" | "1W" | "1M" | "3M" | "1Y";

const CHART_DATA: Record<Range, number[]> = {
  "1D": [182.4, 183.1, 182.8, 183.6, 183.2, 184.5, 183.9, 185.2, 184.8,
         186.1, 185.7, 186.9, 187.2, 188.1, 187.6, 188.9, 189.3, 188.7, 190.1, 191.2],
  "1W": [175.2, 176.8, 178.1, 177.4, 179.3, 180.6, 179.8, 181.2, 180.5,
         182.4, 181.8, 183.5, 182.9, 184.2, 183.7, 185.1, 184.6, 186.2, 185.8, 187.4],
  "1M": [168.4, 170.2, 169.1, 171.8, 173.4, 172.6, 174.9, 174.1, 176.3,
         175.8, 177.2, 178.9, 178.1, 180.4, 179.6, 181.8, 180.9, 183.2, 182.4, 184.8],
  "3M": [155.2, 158.4, 157.1, 161.3, 163.8, 162.4, 165.9, 164.7, 168.2,
         167.5, 170.8, 169.4, 173.1, 172.6, 175.9, 174.8, 178.3, 177.2, 181.6, 184.8],
  "1Y": [128.4, 132.1, 129.8, 135.6, 138.2, 136.4, 141.8, 140.2, 145.6,
         143.8, 149.2, 147.6, 153.4, 151.8, 157.2, 155.8, 162.4, 160.8, 167.2, 184.8],
};

const RANGE_LABELS: Record<Range, string> = {
  "1D": "Today", "1W": "Past week", "1M": "Past month",
  "3M": "Past 3 months", "1Y": "Past year",
};

const STATS = [
  { label: "Open", value: "$182.40" },
  { label: "High", value: "$191.84" },
  { label: "Low", value: "$181.92" },
  { label: "Volume", value: "58.3M" },
  { label: "Mkt Cap", value: "$2.94T" },
  { label: "P/E", value: "30.12" },
];

interface DigitProps {
  char: string;
  textColorStyle?: AnimatedStyle<TextStyle>;
}

function Digit({ char, textColorStyle }: DigitProps) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    const n = parseInt(char);
    if (!isNaN(n)) {
      translateY.value = withSpring(-n * DIGIT_H, {
        damping: 18,
        stiffness: 200,
        mass: 0.8,
      });
    }
  }, [char]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (isNaN(parseInt(char))) {
    return <Animated.Text style={[styles.pricePunct, textColorStyle]}>{char}</Animated.Text>;
  }

  return (
    <View style={styles.digitClip}>
      <Animated.View style={animStyle}>
        {Array.from({ length: 10 }, (_, i) => (
          <Animated.Text key={i} style={[styles.priceDigit, textColorStyle]}>
            {i}
          </Animated.Text>
        ))}
      </Animated.View>
    </View>
  );
}

function buildPath(data: number[]): { line: string; area: string; up: boolean } {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 10;
  const xStep = CHART_W / (data.length - 1);
  const x = (i: number) => i * xStep;
  const y = (v: number) =>
    CHART_H - pad - ((v - min) / range) * (CHART_H - pad * 2);

  let line = `M ${x(0)} ${y(data[0])}`;
  for (let i = 1; i < data.length; i++) {
    const c1x = x(i - 1) + xStep * 0.45;
    const c2x = x(i) - xStep * 0.45;
    line += ` C ${c1x} ${y(data[i - 1])} ${c2x} ${y(data[i])} ${x(i)} ${y(data[i])}`;
  }

  const lastX = x(data.length - 1);
  const area = `${line} L ${lastX} ${CHART_H} L 0 ${CHART_H} Z`;
  const up = data[data.length - 1] >= data[0];
  return { line, area, up };
}

export default function StockScreen() {
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<Range>("1D");
  const [price, setPrice] = useState(191.24);
  const BASE_PRICE = 182.40;

  const scaleAnim = useSharedValue(1);
  const colorAnim = useSharedValue(1);

  const data = CHART_DATA[range];
  const { line, area, up } = buildPath(data);
  const chartColor = up ? GREEN : RED;

  const change = price - BASE_PRICE;
  const changePct = (change / BASE_PRICE) * 100;
  const isPositive = change >= 0;
  const priceStr = price.toFixed(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrice((prev) => {
        const delta = (Math.random() - 0.47) * 0.9;
        const next = parseFloat(
          Math.max(186, Math.min(199, prev + delta)).toFixed(2)
        );
        const goingUp = next > prev;

        colorAnim.value = withSequence(
          withTiming(goingUp ? 2 : 0, { duration: 90 }),
          withTiming(1, { duration: 700 })
        );
        scaleAnim.value = withSequence(
          withSpring(1.03, { damping: 10, stiffness: 300 }),
          withSpring(1, { damping: 14 })
        );

        return next;
      });
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const priceFlashStyle = useAnimatedStyle(() => {
    const color =
      colorAnim.value >= 1
        ? interpolateColor(colorAnim.value, [1, 2], [TEXT_PRIMARY, GREEN])
        : interpolateColor(colorAnim.value, [0, 1], [RED, TEXT_PRIMARY]);
    return { color };
  });

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 88 },
        ]}
      >
        <View style={styles.header}>
          <Pressable style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTicker}>AAPL</Text>
            <View style={styles.exchangeBadge}>
              <Text style={styles.exchangeText}>NASDAQ</Text>
            </View>
          </View>
          <Pressable style={styles.headerBtn}>
            <Ionicons name="bookmark-outline" size={20} color={TEXT_PRIMARY} />
          </Pressable>
        </View>

        <View style={styles.companyRow}>
          <View style={styles.logoBox}>
            <Ionicons name="logo-apple" size={24} color={TEXT_PRIMARY} />
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Apple Inc.</Text>
            <Text style={styles.companySector}>Technology · Consumer Electronics</Text>
          </View>
          <View style={styles.liveDot}>
            <View style={styles.livePulse} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>

        <Animated.View style={[styles.priceRow, scaleStyle]}>
          <Animated.Text style={[styles.priceCurrency, priceFlashStyle]}>$
          </Animated.Text>
          {priceStr.split("").map((char, i) => (
            <Digit
              key={i}
              char={char}
              textColorStyle={char === "." ? undefined : priceFlashStyle}
            />
          ))}
        </Animated.View>

        <View style={styles.changeRow}>
          <View
            style={[
              styles.changeBadge,
              { backgroundColor: isPositive ? GREEN + "18" : RED + "18" },
            ]}
          >
            <Ionicons
              name={isPositive ? "trending-up" : "trending-down"}
              size={14}
              color={isPositive ? GREEN : RED}
            />
            <Text
              style={[
                styles.changeBadgeText,
                { color: isPositive ? GREEN : RED },
              ]}
            >
              {isPositive ? "+" : ""}
              {change.toFixed(2)} ({isPositive ? "+" : ""}
              {changePct.toFixed(2)}%)
            </Text>
          </View>
          <Text style={styles.changeTimeLabel}>{RANGE_LABELS[range]}</Text>
        </View>

        <View style={styles.chartContainer}>
          <Svg width={CHART_W} height={CHART_H}>
            <Defs>
              <SvgGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={chartColor} stopOpacity={0.18} />
                <Stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </SvgGradient>
            </Defs>
            <Path d={area} fill="url(#fill)" />
            <Path
              d={line}
              fill="none"
              stroke={chartColor}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <View style={styles.rangeRow}>
          {(["1D", "1W", "1M", "3M", "1Y"] as Range[]).map((r) => (
            <Pressable
              key={r}
              style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
              onPress={() => setRange(r)}
            >
              <Text
                style={[
                  styles.rangeBtnText,
                  range === r && styles.rangeBtnTextActive,
                ]}
              >
                {r}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.statsCard}>
          {STATS.map((stat, i) => (
            <View
              key={stat.label}
              style={[
                styles.statItem,
                i % 2 === 0 && styles.statItemLeft,
                i < STATS.length - 2 && styles.statItemBordered,
              ]}
            >
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>About</Text>
          <Text style={styles.aboutText}>
            Apple Inc. designs, manufactures, and markets smartphones, personal
            computers, tablets, wearables and accessories worldwide. The company
            offers iPhone, Mac, iPad, and wearables, home and accessories
            products.
          </Text>
          <Pressable>
            <Text style={styles.aboutMore}>Read more</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={styles.sellBtn}>
          <Text style={styles.sellBtnText}>Sell</Text>
        </Pressable>
        <Pressable style={styles.buyBtn}>
          <Text style={styles.buyBtnText}>Buy</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 24 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    marginBottom: 24,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTicker: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    letterSpacing: 0.5,
  },
  exchangeBadge: {
    backgroundColor: SURFACE,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
  },
  exchangeText: {
    fontSize: 10,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    letterSpacing: 0.5,
  },

  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  companyInfo: { flex: 1 },
  companyName: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  companySector: { fontSize: 12, color: TEXT_SECONDARY, fontWeight: "500" },
  liveDot: { flexDirection: "row", alignItems: "center", gap: 5 },
  livePulse: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  liveText: { fontSize: 12, fontWeight: "600", color: GREEN },

  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    height: DIGIT_H,
    overflow: "hidden",
  },
  priceCurrency: {
    fontSize: 28,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    lineHeight: DIGIT_H,
    marginBottom: 2,
    marginRight: 1,
  },
  digitClip: { height: DIGIT_H, overflow: "hidden" },
  priceDigit: {
    fontSize: 52,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    height: DIGIT_H,
    lineHeight: DIGIT_H,
    letterSpacing: -1,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  pricePunct: {
    fontSize: 40,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    height: DIGIT_H,
    lineHeight: DIGIT_H + 6,
    includeFontPadding: false,
  },

  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  changeBadgeText: { fontSize: 13, fontWeight: "700" },
  changeTimeLabel: { fontSize: 12, color: TEXT_SECONDARY, fontWeight: "500" },

  chartContainer: { marginBottom: 16, marginHorizontal: -0 },

  rangeRow: {
    flexDirection: "row",
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 3,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BORDER,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  rangeBtnActive: { backgroundColor: BG, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  rangeBtnText: { fontSize: 13, fontWeight: "500", color: TEXT_SECONDARY },
  rangeBtnTextActive: { color: TEXT_PRIMARY, fontWeight: "700" },

  statsCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  statItem: {
    width: "50%",
    padding: 16,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  statItemLeft: {
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  statItemBordered: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  statLabel: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    fontWeight: "500",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  statValue: { fontSize: 16, fontWeight: "700", color: TEXT_PRIMARY },

  aboutCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 8,
  },
  aboutMore: { fontSize: 13, fontWeight: "600", color: "#1A56FF" },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  sellBtn: {
    flex: 1,
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: RED + "14",
    borderWidth: 1,
    borderColor: RED + "30",
  },
  sellBtnText: { fontSize: 16, fontWeight: "700", color: RED },
  buyBtn: {
    flex: 1,
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: GREEN,
    shadowColor: GREEN,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buyBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});