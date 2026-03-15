import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInDown,
  ZoomIn,
} from "react-native-reanimated";
import Svg, {
  Circle as SvgCircle,
  Ellipse,
  Path as SvgPath,
  Defs,
  RadialGradient,
  Stop,
  Rect,
} from "react-native-svg";

const { width: SW } = Dimensions.get("window");
const PIZZA_SIZE = SW * 0.55;

const WARM = "#FF6B35";
const CRUST = "#D4A054";
const BG = "#F8F6F3";
const CARD = "#FFFFFF";
const BORDER = "#F0ECE6";
const TXT = "#1A1A1A";
const TXT2 = "#8A8680";
const GREEN = "#34C759";

type ToppingId =
  | "pepperoni"
  | "mushrooms"
  | "olives"
  | "onions"
  | "peppers"
  | "cheese";

interface ToppingDef {
  id: ToppingId;
  name: string;
  price: number;
  emoji: string;
  positions: { x: number; y: number; r: number; rot: number }[];
}

const TOPPINGS: ToppingDef[] = [
  {
    id: "pepperoni",
    name: "Pepperoni",
    price: 1.5,
    emoji: "🔴",
    positions: [
      { x: -0.22, y: -0.18, r: 13, rot: 0 },
      { x: 0.14, y: -0.25, r: 11, rot: 15 },
      { x: 0.28, y: 0.06, r: 12, rot: -10 },
      { x: -0.08, y: 0.2, r: 13, rot: 20 },
      { x: 0.04, y: -0.04, r: 10, rot: -5 },
      { x: -0.28, y: 0.06, r: 11, rot: 8 },
      { x: 0.18, y: 0.22, r: 12, rot: -15 },
    ],
  },
  {
    id: "mushrooms",
    name: "Mushrooms",
    price: 1.0,
    emoji: "🍄",
    positions: [
      { x: -0.18, y: -0.14, r: 10, rot: 30 },
      { x: 0.2, y: -0.08, r: 9, rot: -20 },
      { x: -0.04, y: 0.18, r: 10, rot: 45 },
      { x: 0.14, y: 0.14, r: 9, rot: -30 },
      { x: -0.22, y: 0.14, r: 8, rot: 10 },
    ],
  },
  {
    id: "olives",
    name: "Olives",
    price: 1.0,
    emoji: "🫒",
    positions: [
      { x: -0.16, y: -0.2, r: 7, rot: 0 },
      { x: 0.22, y: -0.12, r: 6, rot: 0 },
      { x: 0.08, y: 0.18, r: 7, rot: 0 },
      { x: -0.2, y: 0.08, r: 6, rot: 0 },
      { x: 0.0, y: -0.08, r: 5, rot: 0 },
      { x: -0.06, y: 0.26, r: 6, rot: 0 },
    ],
  },
  {
    id: "onions",
    name: "Onions",
    price: 0.75,
    emoji: "🧅",
    positions: [
      { x: -0.14, y: -0.18, r: 9, rot: 25 },
      { x: 0.18, y: 0.04, r: 8, rot: -15 },
      { x: -0.04, y: 0.16, r: 9, rot: 40 },
      { x: 0.1, y: -0.16, r: 7, rot: -30 },
    ],
  },
  {
    id: "peppers",
    name: "Peppers",
    price: 1.0,
    emoji: "🫑",
    positions: [
      { x: -0.18, y: -0.08, r: 9, rot: 20 },
      { x: 0.16, y: -0.18, r: 8, rot: -25 },
      { x: 0.04, y: 0.2, r: 9, rot: 35 },
      { x: -0.13, y: 0.16, r: 7, rot: -10 },
      { x: 0.22, y: 0.1, r: 8, rot: 15 },
    ],
  },
  {
    id: "cheese",
    name: "Extra Cheese",
    price: 1.25,
    emoji: "🧀",
    positions: [],
  },
];

const SIZES = [
  { id: "S" as const, label: 'Small 10"', price: 8.99, scale: 0.78 },
  { id: "M" as const, label: 'Medium 12"', price: 11.99, scale: 0.9 },
  { id: "L" as const, label: 'Large 14"', price: 14.99, scale: 1.0 },
];

function PizzaBase({ size, extraCheese }: { size: number; extraCheese: boolean }) {
  const r = size / 2;
  const cw = size * 0.058;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="sauce" cx="50%" cy="48%" r="46%">
          <Stop offset="0" stopColor="#E65100" stopOpacity="0.85" />
          <Stop offset="0.6" stopColor="#D84315" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#BF360C" stopOpacity="0.95" />
        </RadialGradient>
        <RadialGradient id="cheeseBase" cx="45%" cy="42%" r="48%">
          <Stop offset="0" stopColor="#FFEE58" stopOpacity="0.65" />
          <Stop offset="0.5" stopColor="#FFD54F" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#FFCA28" stopOpacity="0.45" />
        </RadialGradient>
        <RadialGradient id="cheeseExtra" cx="48%" cy="45%" r="44%">
          <Stop offset="0" stopColor="#FFF9C4" stopOpacity="0.45" />
          <Stop offset="0.4" stopColor="#FFEE58" stopOpacity="0.3" />
          <Stop offset="1" stopColor="#FFD54F" stopOpacity="0.15" />
        </RadialGradient>
        <RadialGradient id="crustG" cx="50%" cy="50%" r="50%">
          <Stop offset="0.84" stopColor={CRUST} stopOpacity="0" />
          <Stop offset="0.89" stopColor="#D4A054" stopOpacity="0.7" />
          <Stop offset="0.94" stopColor="#C49A3C" stopOpacity="0.85" />
          <Stop offset="1" stopColor="#B8860B" stopOpacity="1" />
        </RadialGradient>
        <RadialGradient id="innerShadow" cx="50%" cy="55%" r="52%">
          <Stop offset="0" stopColor="#000" stopOpacity="0" />
          <Stop offset="0.85" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.08" />
        </RadialGradient>
      </Defs>
      <SvgCircle cx={r} cy={r} r={r - 2} fill="url(#crustG)" />
      <SvgCircle cx={r} cy={r} r={r - cw} fill="url(#sauce)" />
      <SvgCircle cx={r} cy={r} r={r - cw - 1} fill="url(#cheeseBase)" />
      {extraCheese && (
        <SvgCircle cx={r} cy={r} r={r - cw - 3} fill="url(#cheeseExtra)" />
      )}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const dr = r - cw / 2;
        return (
          <SvgCircle
            key={i}
            cx={r + dr * Math.cos(a)}
            cy={r + dr * Math.sin(a)}
            r={cw * 0.28}
            fill="rgba(139,90,43,0.25)"
          />
        );
      })}
      <SvgCircle cx={r} cy={r} r={r - 2} fill="url(#innerShadow)" />
    </Svg>
  );
}

function ToppingPiece({
  toppingId,
  pos,
  pizzaSize,
  delay,
}: {
  toppingId: ToppingId;
  pos: { x: number; y: number; r: number; rot: number };
  pizzaSize: number;
  delay: number;
}) {
  const translateY = useSharedValue(-200);
  const translateX = useSharedValue((Math.random() - 0.5) * 80);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1.6);
  const rotate = useSharedValue(Math.random() * 120 - 60);

  const fx = pos.x * pizzaSize;
  const fy = pos.y * pizzaSize;

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    translateY.value = withDelay(delay, withSpring(fy, { damping: 15, stiffness: 140, mass: 0.5 }));
    translateX.value = withDelay(delay, withSpring(fx, { damping: 17, stiffness: 150 }));
    scale.value = withDelay(delay, withSequence(
      withSpring(1.1, { damping: 12, stiffness: 180 }),
      withSpring(1, { damping: 14, stiffness: 200 })
    ));
    rotate.value = withDelay(delay, withTiming(pos.rot, { duration: 280, easing: Easing.out(Easing.cubic) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    position: "absolute" as const,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return <Animated.View style={style}>{renderTopping(toppingId, pos.r, delay)}</Animated.View>;
}

function renderTopping(id: ToppingId, r: number, key: number) {
  const d = r * 2;
  switch (id) {
    case "pepperoni":
      return (
        <Svg width={d} height={d} style={{ marginLeft: -r, marginTop: -r }}>
          <Defs>
            <RadialGradient id={`pep${key}`} cx="40%" cy="35%" r="55%">
              <Stop offset="0" stopColor="#EF5350" />
              <Stop offset="0.6" stopColor="#C62828" />
              <Stop offset="1" stopColor="#8E1318" />
            </RadialGradient>
          </Defs>
          <SvgCircle cx={r} cy={r} r={r} fill={`url(#pep${key})`} />
          <SvgCircle cx={r * 0.65} cy={r * 0.7} r={r * 0.12} fill="rgba(0,0,0,0.1)" />
          <SvgCircle cx={r * 1.3} cy={r * 0.85} r={r * 0.1} fill="rgba(0,0,0,0.08)" />
          <SvgCircle cx={r} cy={r} r={r * 0.55} fill="rgba(180,30,30,0.12)" />
        </Svg>
      );
    case "mushrooms":
      return (
        <Svg width={r * 2.4} height={r * 2} style={{ marginLeft: -r * 1.2, marginTop: -r }}>
          <Ellipse cx={r * 1.2} cy={r * 0.65} rx={r * 1.05} ry={r * 0.55} fill="#D7CCC8" />
          <Ellipse cx={r * 1.2} cy={r * 0.65} rx={r * 0.7} ry={r * 0.28} fill="rgba(161,136,127,0.25)" />
          <Rect x={r * 0.82} y={r * 0.65} width={r * 0.76} height={r * 0.95} rx={r * 0.12} fill="#BCAAA4" />
          <Rect x={r * 0.95} y={r * 0.75} width={r * 0.2} height={r * 0.7} rx={2} fill="rgba(0,0,0,0.05)" />
        </Svg>
      );
    case "olives":
      return (
        <Svg width={d} height={d} style={{ marginLeft: -r, marginTop: -r }}>
          <SvgCircle cx={r} cy={r} r={r} fill="#2E7D32" />
          <SvgCircle cx={r} cy={r} r={r * 0.55} fill="#1B5E20" />
          <SvgCircle cx={r} cy={r} r={r * 0.28} fill="#689F38" opacity={0.45} />
        </Svg>
      );
    case "onions":
      return (
        <Svg width={r * 2.4} height={r * 1.4} style={{ marginLeft: -r * 1.2, marginTop: -r * 0.7 }}>
          <SvgPath
            d={`M ${r * 0.25} ${r * 1.1} Q ${r * 0.5} ${r * 0.15} ${r * 1.2} ${r * 0.15} Q ${r * 1.9} ${r * 0.15} ${r * 2.15} ${r * 1.1}`}
            fill="none" stroke="#CE93D8" strokeWidth={3.5} strokeLinecap="round" opacity={0.85}
          />
          <SvgPath
            d={`M ${r * 0.5} ${r * 1.0} Q ${r * 0.7} ${r * 0.35} ${r * 1.2} ${r * 0.35} Q ${r * 1.7} ${r * 0.35} ${r * 1.9} ${r * 1.0}`}
            fill="none" stroke="#E1BEE7" strokeWidth={2.5} strokeLinecap="round" opacity={0.65}
          />
        </Svg>
      );
    case "peppers":
      return (
        <Svg width={r * 2.4} height={r * 1.6} style={{ marginLeft: -r * 1.2, marginTop: -r * 0.8 }}>
          <SvgPath
            d={`M ${r * 0.3} ${r * 0.8} Q ${r * 1.2} ${r * -0.15} ${r * 2.1} ${r * 0.8} Q ${r * 1.2} ${r * 0.55} ${r * 0.3} ${r * 0.8} Z`}
            fill="#43A047"
          />
          <SvgPath
            d={`M ${r * 0.6} ${r * 0.72} Q ${r * 1.2} ${r * 0.25} ${r * 1.8} ${r * 0.72}`}
            fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={0.8}
          />
        </Svg>
      );
    default:
      return null;
  }
}

function renderStaticTopping(id: ToppingId, r: number) {
  const d = r * 2;
  switch (id) {
    case "pepperoni":
      return (
        <Svg width={d} height={d} style={{ marginLeft: -r, marginTop: -r }}>
          <SvgCircle cx={r} cy={r} r={r} fill="#C62828" />
          <SvgCircle cx={r} cy={r} r={r * 0.55} fill="rgba(180,30,30,0.15)" />
        </Svg>
      );
    case "mushrooms":
      return (
        <Svg width={r * 2.4} height={r * 2} style={{ marginLeft: -r * 1.2, marginTop: -r }}>
          <Ellipse cx={r * 1.2} cy={r * 0.65} rx={r * 1.05} ry={r * 0.55} fill="#D7CCC8" />
          <Rect x={r * 0.82} y={r * 0.65} width={r * 0.76} height={r * 0.95} rx={r * 0.12} fill="#BCAAA4" />
        </Svg>
      );
    case "olives":
      return (
        <Svg width={d} height={d} style={{ marginLeft: -r, marginTop: -r }}>
          <SvgCircle cx={r} cy={r} r={r} fill="#2E7D32" />
          <SvgCircle cx={r} cy={r} r={r * 0.28} fill="#689F38" opacity={0.45} />
        </Svg>
      );
    case "onions":
      return (
        <Svg width={r * 2.4} height={r * 1.4} style={{ marginLeft: -r * 1.2, marginTop: -r * 0.7 }}>
          <SvgPath
            d={`M ${r * 0.25} ${r * 1.1} Q ${r * 0.5} ${r * 0.15} ${r * 1.2} ${r * 0.15} Q ${r * 1.9} ${r * 0.15} ${r * 2.15} ${r * 1.1}`}
            fill="none" stroke="#CE93D8" strokeWidth={3} strokeLinecap="round"
          />
        </Svg>
      );
    case "peppers":
      return (
        <Svg width={r * 2.4} height={r * 1.6} style={{ marginLeft: -r * 1.2, marginTop: -r * 0.8 }}>
          <SvgPath
            d={`M ${r * 0.3} ${r * 0.8} Q ${r * 1.2} ${r * -0.15} ${r * 2.1} ${r * 0.8} Q ${r * 1.2} ${r * 0.55} ${r * 0.3} ${r * 0.8} Z`}
            fill="#43A047"
          />
        </Svg>
      );
    default:
      return null;
  }
}

function StaticToppingPiece({
  toppingId,
  pos,
  pizzaSize,
}: {
  toppingId: ToppingId;
  pos: { x: number; y: number; r: number; rot: number };
  pizzaSize: number;
}) {
  return (
    <View
      style={{
        position: "absolute",
        transform: [
          { translateX: pos.x * pizzaSize },
          { translateY: pos.y * pizzaSize },
          { rotate: `${pos.rot}deg` },
        ],
      }}
    >
      {renderStaticTopping(toppingId, pos.r)}
    </View>
  );
}

function PizzaBoxAnim({
  activeToppings,
  extraCheese,
  onDone,
}: {
  activeToppings: ToppingId[];
  extraCheese: boolean;
  onDone: () => void;
}) {
  const pizzaY = useSharedValue(0);
  const pizzaScale = useSharedValue(0.65);
  const lidAngle = useSharedValue(-75);
  const containerOpacity = useSharedValue(1);
  const boxScale = useSharedValue(0);

  const miniSize = SW * 0.32;

  useEffect(() => {
    boxScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    pizzaY.value = withDelay(300, withTiming(50, { duration: 300, easing: Easing.in(Easing.quad) }));
    pizzaScale.value = withDelay(300, withTiming(0.45, { duration: 300 }));
    lidAngle.value = withDelay(680, withSpring(0, { damping: 14, stiffness: 100 }));
    containerOpacity.value = withDelay(1500, withTiming(0, { duration: 250 }));
    const t = setTimeout(onDone, 1750);
    return () => clearTimeout(t);
  }, []);

  const pizzaStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pizzaY.value }, { scale: pizzaScale.value }],
  }));

  const lidStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 600 }, { rotateX: `${lidAngle.value}deg` }],
  }));

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: boxScale.value }],
  }));

  const fadeStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));

  return (
    <Animated.View style={[styles.boxOverlay, fadeStyle]}>
      <View style={styles.boxCenter}>
        <Animated.View style={pizzaStyle}>
          <View style={{ width: miniSize, height: miniSize, alignItems: "center", justifyContent: "center" }}>
            <PizzaBase size={miniSize} extraCheese={extraCheese} />
            {activeToppings
              .filter((id) => id !== "cheese")
              .map((tid) => {
                const topping = TOPPINGS.find((t) => t.id === tid)!;
                return topping.positions.map((pos, pi) => (
                  <StaticToppingPiece
                    key={`${tid}-${pi}`}
                    toppingId={tid}
                    pos={{ ...pos, r: pos.r * 0.65 }}
                    pizzaSize={miniSize}
                  />
                ));
              })}
          </View>
        </Animated.View>

        <Animated.View style={[styles.boxGroup, boxStyle]}>
          <Animated.View style={[styles.lidWrap, lidStyle]}>
            <Svg width={180} height={30} viewBox="0 0 180 30">
              <SvgPath d="M4 30 L16 3 L164 3 L176 30 Z" fill="#A1887F" stroke="#8D6E63" strokeWidth={1} />
              <SvgPath d="M65 14 L90 9 L115 14" fill="none" stroke="#795548" strokeWidth={1.5} strokeLinecap="round" />
              <SvgCircle cx={90} cy={19} r={3.5} fill="#795548" opacity={0.4} />
            </Svg>
          </Animated.View>
          <Svg width={180} height={44} viewBox="0 0 180 44">
            <Rect x={6} y={0} width={168} height={44} rx={5} fill="#8D6E63" />
            <Rect x={6} y={0} width={168} height={5} rx={2} fill="#A1887F" />
            <Rect x={6} y={39} width={168} height={5} rx={2} fill="#6D4C41" />
          </Svg>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

function OrderConfirmed({
  total,
  toppingCount,
  sizeName,
}: {
  total: number;
  toppingCount: number;
  sizeName: string;
}) {
  return (
    <View style={styles.confirmedRoot}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.confirmedContent}>
        <Animated.View entering={ZoomIn.delay(100).duration(350).springify()} style={styles.checkOuter}>
          <LinearGradient colors={[GREEN, "#2ECC71"]} style={StyleSheet.absoluteFill} />
          <Svg width={44} height={44} viewBox="0 0 24 24" fill="#fff">
            <SvgPath d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </Svg>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(300).duration(250)} style={styles.confirmedTitle}>
          Order Confirmed!
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(400).duration(250)} style={styles.confirmedSub}>
          Your pizza is being prepared
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(500).duration(300)} style={styles.receiptCard}>
          <ReceiptRow label="Size" value={sizeName} />
          <View style={styles.receiptDiv} />
          <ReceiptRow label="Toppings" value={`${toppingCount} selected`} />
          <View style={styles.receiptDiv} />
          <ReceiptRow label="Total" value={`$${total.toFixed(2)}`} bold />
          <View style={styles.receiptDiv} />
          <ReceiptRow label="Order #" value="#PZ-4829" />
          <View style={styles.receiptDiv} />
          <ReceiptRow label="Est. Delivery" value="25-35 min" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(650).duration(250)} style={styles.stepsRow}>
          {["Confirmed", "Preparing", "Baking", "Delivery"].map((s, i) => (
            <View key={s} style={styles.step}>
              <View style={[styles.stepDot, i === 0 && { backgroundColor: GREEN, borderColor: GREEN }]}>
                {i === 0 && (
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="#fff">
                    <SvgPath d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </Svg>
                )}
              </View>
              <Text style={[styles.stepLabel, i === 0 && { color: GREEN }]}>{s}</Text>
              {i < 3 && <View style={styles.stepLine} />}
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

function ReceiptRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={[styles.receiptValue, bold && { fontWeight: "800", color: TXT, fontSize: 16 }]}>{value}</Text>
    </View>
  );
}

export default function PizzaOrderScreen() {
  const [selectedSize, setSelectedSize] = useState<"S" | "M" | "L">("M");
  const [activeToppings, setActiveToppings] = useState<ToppingId[]>([]);
  const [phase, setPhase] = useState<"build" | "boxing" | "done">("build");
  const [toppingKey, setToppingKey] = useState(0);

  const pizzaScale = useSharedValue(0);
  const pizzaRotate = useSharedValue(0);

  useEffect(() => {
    pizzaScale.value = withSpring(1, { damping: 12, stiffness: 80 });
  }, []);

  const sizeData = SIZES.find((s) => s.id === selectedSize)!;

  const toppingsTotal = useMemo(
    () =>
      activeToppings.reduce((s, id) => {
        const t = TOPPINGS.find((tp) => tp.id === id);
        return s + (t?.price ?? 0);
      }, 0),
    [activeToppings]
  );

  const total = sizeData.price + toppingsTotal;
  const extraCheese = activeToppings.includes("cheese");

  const toggleTopping = useCallback((id: ToppingId) => {
    setActiveToppings((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
    setToppingKey((k) => k + 1);
    pizzaRotate.value = withSequence(
      withTiming(pizzaRotate.value - 5, { duration: 80 }),
      withSpring(pizzaRotate.value, { damping: 12, stiffness: 160 })
    );
  }, []);

  const pizzaStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pizzaScale.value * sizeData.scale },
      { rotate: `${pizzaRotate.value}deg` },
    ],
  }));

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handleOrder = useCallback(() => {
    btnScale.value = withSequence(
      withTiming(0.93, { duration: 80 }),
      withSpring(1, { damping: 10 })
    );
    setPhase("boxing");
  }, []);

  if (phase === "done") {
    return (
      <OrderConfirmed
        total={total}
        toppingCount={activeToppings.length}
        sizeName={sizeData.label}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Animated.View entering={FadeIn.delay(50).duration(250)} style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Build Your</Text>
          <Text style={styles.headerTitle}>Perfect Pizza</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} activeOpacity={0.7}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill={TXT}>
            <SvgPath d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </Svg>
          {activeToppings.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{activeToppings.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.pizzaStage}>
          <View style={styles.pizzaShadow} />
          <Animated.View style={[styles.pizzaWrap, pizzaStyle]}>
            <PizzaBase size={PIZZA_SIZE} extraCheese={extraCheese} />
            {activeToppings
              .filter((id) => id !== "cheese")
              .map((tid) => {
                const topping = TOPPINGS.find((t) => t.id === tid)!;
                return topping.positions.map((pos, pi) => (
                  <ToppingPiece
                    key={`${tid}-${pi}-${toppingKey}`}
                    toppingId={tid}
                    pos={pos}
                    pizzaSize={PIZZA_SIZE}
                    delay={pi * 40}
                  />
                ));
              })}
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(150).duration(250)}>
          <Text style={styles.sectionTitle}>Choose Size</Text>
          <View style={styles.sizeRow}>
            {SIZES.map((size, i) => {
              const active = selectedSize === size.id;
              return (
                <Animated.View key={size.id} entering={FadeInUp.delay(180 + i * 50).duration(200).springify()} style={{ flex: 1 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedSize(size.id);
                      pizzaScale.value = withSpring(1, { damping: 12, stiffness: 100 });
                    }}
                    activeOpacity={0.8}
                    style={[styles.sizeBtn, active && styles.sizeBtnActive]}
                  >
                    <Text style={[styles.sizeId, active && { color: WARM }]}>{size.id}</Text>
                    <Text style={[styles.sizeLabel, active && { color: TXT }]}>{size.label}</Text>
                    <Text style={[styles.sizePrice, active && { color: WARM }]}>${size.price.toFixed(2)}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).duration(250)}>
          <Text style={styles.sectionTitle}>Add Toppings</Text>
          <View style={styles.toppingsGrid}>
            {TOPPINGS.map((topping, i) => {
              const active = activeToppings.includes(topping.id);
              return (
                <Animated.View key={topping.id} entering={FadeInDown.delay(300 + i * 40).duration(250).springify()}>
                  <TouchableOpacity
                    onPress={() => toggleTopping(topping.id)}
                    activeOpacity={0.8}
                    style={[styles.toppingBtn, active && styles.toppingBtnActive]}
                  >
                    <Text style={styles.toppingEmoji}>{topping.emoji}</Text>
                    <View style={styles.toppingTextCol}>
                      <Text style={[styles.toppingName, active && { color: TXT }]}>{topping.name}</Text>
                      <Text style={styles.toppingPrice}>+${topping.price.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.toppingCheck, active && { backgroundColor: WARM, borderColor: WARM }]}>
                      {active && (
                        <Svg width={12} height={12} viewBox="0 0 24 24" fill="#fff">
                          <SvgPath d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </Svg>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        <View style={{ height: 110 }} />
      </ScrollView>

      <Animated.View entering={SlideInDown.delay(400).duration(300).springify()} style={styles.bottomBar}>
        <View style={styles.bottomInner}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity onPress={handleOrder} activeOpacity={0.9}>
            <Animated.View style={btnStyle}>
              <LinearGradient colors={[WARM, "#FF8A50"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.orderBtn}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="#fff">
                  <SvgPath d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                </Svg>
                <Text style={styles.orderBtnText}>Place Order</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {phase === "boxing" && (
        <PizzaBoxAnim
          activeToppings={activeToppings}
          extraCheese={extraCheese}
          onDone={() => setPhase("done")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 58, paddingBottom: 4,
    backgroundColor: BG, zIndex: 50,
  },
  headerSub: { fontSize: 13, color: TXT2, fontWeight: "500" },
  headerTitle: { fontSize: 26, fontWeight: "800", color: TXT, letterSpacing: -0.5 },
  cartBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: CARD, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: BORDER,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cartBadge: {
    position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: 8,
    backgroundColor: WARM, alignItems: "center", justifyContent: "center",
  },
  cartBadgeText: { fontSize: 9, color: "#fff", fontWeight: "700" },
  scroll: { paddingHorizontal: 16 },
  pizzaStage: { height: PIZZA_SIZE + 30, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  pizzaShadow: {
    position: "absolute", bottom: 4, width: PIZZA_SIZE * 0.6, height: 16,
    borderRadius: 100, backgroundColor: "rgba(0,0,0,0.06)", alignSelf: "center",
  },
  pizzaWrap: { width: PIZZA_SIZE, height: PIZZA_SIZE, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: TXT, marginBottom: 10, paddingHorizontal: 4 },
  sizeRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  sizeBtn: {
    borderRadius: 14, padding: 14, alignItems: "center", gap: 3,
    backgroundColor: CARD, borderWidth: 1.5, borderColor: BORDER,
    shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  sizeBtnActive: { borderColor: WARM, backgroundColor: "#FFF8F4" },
  sizeId: { fontSize: 22, fontWeight: "800", color: TXT2 },
  sizeLabel: { fontSize: 11, color: TXT2, fontWeight: "500" },
  sizePrice: { fontSize: 13, color: TXT, fontWeight: "700", fontVariant: ["tabular-nums"], marginTop: 2 },
  toppingsGrid: { gap: 8, marginBottom: 8 },
  toppingBtn: {
    flexDirection: "row", alignItems: "center", padding: 14, gap: 12,
    borderRadius: 14, backgroundColor: CARD, borderWidth: 1.5, borderColor: BORDER,
    shadowColor: "#000", shadowOpacity: 0.02, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  toppingBtnActive: { borderColor: WARM, backgroundColor: "#FFF8F4" },
  toppingEmoji: { fontSize: 24 },
  toppingTextCol: { flex: 1, gap: 2 },
  toppingName: { fontSize: 14, color: TXT2, fontWeight: "600" },
  toppingPrice: { fontSize: 12, color: "#B0ACA6", fontWeight: "500" },
  toppingCheck: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: BORDER, alignItems: "center", justifyContent: "center",
  },
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: CARD,
  },
  bottomInner: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 24, paddingTop: 14, paddingBottom: 34,
  },
  totalLabel: { fontSize: 12, color: TXT2, fontWeight: "500" },
  totalValue: { fontSize: 28, fontWeight: "800", color: TXT, letterSpacing: -0.5, fontVariant: ["tabular-nums"] },
  orderBtn: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 26, paddingVertical: 15, borderRadius: 16 },
  orderBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  boxOverlay: {
    ...StyleSheet.absoluteFillObject, zIndex: 200,
    backgroundColor: "rgba(248,246,243,0.97)",
    alignItems: "center", justifyContent: "center",
  },
  boxCenter: { alignItems: "center" },
  boxGroup: { marginTop: -16 },
  lidWrap: { marginBottom: -1, zIndex: 3 },
  confirmedRoot: { flex: 1, backgroundColor: BG },
  confirmedContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  checkOuter: {
    width: 80, height: 80, borderRadius: 40, overflow: "hidden",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
    shadowColor: GREEN, shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  confirmedTitle: { fontSize: 26, fontWeight: "800", color: TXT, marginBottom: 6 },
  confirmedSub: { fontSize: 14, color: TXT2, marginBottom: 28 },
  receiptCard: {
    width: "100%", borderRadius: 16, padding: 20,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    marginBottom: 28,
  },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  receiptLabel: { fontSize: 13, color: TXT2, fontWeight: "500" },
  receiptValue: { fontSize: 14, color: TXT, fontWeight: "600" },
  receiptDiv: { height: 1, backgroundColor: BORDER, marginVertical: 12 },
  stepsRow: { flexDirection: "row", alignItems: "center" },
  step: { alignItems: "center", flexDirection: "row" },
  stepDot: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: BORDER, alignItems: "center", justifyContent: "center",
  },
  stepLabel: { fontSize: 9, color: TXT2, fontWeight: "600", marginLeft: 3, marginRight: 3 },
  stepLine: { width: 18, height: 1.5, backgroundColor: BORDER, borderRadius: 1 },
});