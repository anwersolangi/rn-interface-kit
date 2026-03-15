import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width: SW } = Dimensions.get("window");

const BG = "#2E2E3D";
const LIGHT = "#3A3A4D";
const DARK = "#222232";
const ACCENT_TEAL = "#4AEDC4";
const ACCENT_CORAL = "#FF7A5C";
const SURFACE_PRESSED = "#28283A";

const GRID_PAD = 18;
const GAP = 12;
const MAIN_COLS = 4;
const SCI_COLS = 5;
const AVAIL = SW - GRID_PAD * 2;
const MAIN_BTN = (AVAIL - GAP * (MAIN_COLS - 1)) / MAIN_COLS;
const SCI_BTN = (AVAIL - GAP * (SCI_COLS - 1)) / SCI_COLS;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type BtnVariant = "number" | "operator" | "function" | "scientific" | "equals";

interface CalcBtn {
  label: string;
  variant: BtnVariant;
  wide?: boolean;
  scientific?: boolean;
}

const SCI_ROW_1: CalcBtn[] = [
  { label: "sin", variant: "scientific" },
  { label: "cos", variant: "scientific" },
  { label: "tan", variant: "scientific" },
  { label: "√", variant: "scientific" },
  { label: "^", variant: "scientific" },
];

const SCI_ROW_2: CalcBtn[] = [
  { label: "log", variant: "scientific" },
  { label: "ln", variant: "scientific" },
  { label: "(", variant: "scientific" },
  { label: ")", variant: "scientific" },
  { label: "π", variant: "scientific" },
];

const MAIN_ROWS: CalcBtn[][] = [
  [
    { label: "AC", variant: "function" },
    { label: "⌫", variant: "function" },
    { label: "%", variant: "function" },
    { label: "÷", variant: "operator" },
  ],
  [
    { label: "7", variant: "number" },
    { label: "8", variant: "number" },
    { label: "9", variant: "number" },
    { label: "×", variant: "operator" },
  ],
  [
    { label: "4", variant: "number" },
    { label: "5", variant: "number" },
    { label: "6", variant: "number" },
    { label: "−", variant: "operator" },
  ],
  [
    { label: "1", variant: "number" },
    { label: "2", variant: "number" },
    { label: "3", variant: "number" },
    { label: "+", variant: "operator" },
  ],
  [
    { label: "0", variant: "number", wide: true },
    { label: ".", variant: "number" },
    { label: "=", variant: "equals" },
  ],
];

const NeumorphicButton = ({
  btn,
  size,
  onPress,
}: {
  btn: CalcBtn;
  size: number;
  onPress: (label: string) => void;
}) => {
  const scale = useSharedValue(1);
  const shadowAnim = useSharedValue(1);

  const isSci = btn.variant === "scientific";
  const isOp = btn.variant === "operator";
  const isFn = btn.variant === "function";
  const isEq = btn.variant === "equals";
  const isWide = btn.wide;

  const btnWidth = isWide ? size * 2 + GAP : size;
  const btnHeight = isSci ? size * 0.72 : size;
  const radius = isSci ? 14 : size * 0.28;

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const outerShadow = useAnimatedStyle(() => ({
    shadowOpacity: 0.7 * shadowAnim.value,
  }));

  const innerShadow = useAnimatedStyle(() => ({
    shadowOpacity: 0.5 * shadowAnim.value,
  }));

  const pressedOverlay = useAnimatedStyle(() => ({
    opacity: 1 - shadowAnim.value,
  }));

  const handleIn = () => {
    scale.value = withSpring(0.92, { damping: 20, stiffness: 400 });
    shadowAnim.value = withTiming(0, { duration: 100 });
  };

  const handleOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 280 });
    shadowAnim.value = withTiming(1, { duration: 250 });
  };

  const textColor = isEq
    ? "#FFFFFF"
    : isOp
    ? ACCENT_CORAL
    : isSci
    ? ACCENT_TEAL
    : isFn
    ? "#A8A8BC"
    : "#E8E8F0";

  const textSize = isSci ? 14 : isOp || isEq ? 26 : isFn ? 20 : 24;

  return (
    <AnimatedTouchable
      activeOpacity={1}
      onPressIn={handleIn}
      onPressOut={handleOut}
      onPress={() => onPress(btn.label)}
      style={[animatedScale, { width: btnWidth, height: btnHeight }]}
    >
      <Animated.View
        style={[
          {
            width: btnWidth,
            height: btnHeight,
            borderRadius: radius,
            backgroundColor: BG,
            shadowColor: DARK,
            shadowOffset: { width: 6, height: 6 },
            shadowRadius: 10,
          },
          outerShadow,
        ]}
      >
        <Animated.View
          style={[
            {
              width: btnWidth,
              height: btnHeight,
              borderRadius: radius,
              backgroundColor: BG,
              shadowColor: LIGHT,
              shadowOffset: { width: -4, height: -4 },
              shadowRadius: 8,
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            },
            innerShadow,
          ]}
        >
          {isEq && (
            <LinearGradient
              colors={["#FF7A5C", "#FF5E3A", "#E8452D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
            />
          )}

          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "rgba(0,0,0,0.12)",
                borderRadius: radius,
              },
              pressedOverlay,
            ]}
          />

          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: radius,
                borderWidth: 1,
                borderTopColor: isSci
                  ? "rgba(74,237,196,0.06)"
                  : "rgba(255,255,255,0.05)",
                borderLeftColor: isSci
                  ? "rgba(74,237,196,0.04)"
                  : "rgba(255,255,255,0.04)",
                borderBottomColor: "rgba(0,0,0,0.15)",
                borderRightColor: "rgba(0,0,0,0.1)",
              },
            ]}
          />

          <Text
            style={{
              color: textColor,
              fontSize: textSize,
              fontWeight: isSci ? "600" : isEq ? "700" : isOp ? "400" : "500",
              letterSpacing: isSci ? 1 : 0.5,
              textTransform: isSci ? "none" : undefined,
            }}
          >
            {btn.label}
          </Text>
        </Animated.View>
      </Animated.View>
    </AnimatedTouchable>
  );
};

const evaluateExpression = (expr: string): string => {
  try {
    let sanitized = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/π/g, `(${Math.PI})`)
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/log\(/g, "Math.log10(")
      .replace(/ln\(/g, "Math.log(")
      .replace(/√\(/g, "Math.sqrt(")
      .replace(/\^/g, "**")
      .replace(/%/g, "/100");

    if (/[^0-9+\-*/().eE ,Math.sincotaglqrtp**\s]/.test(sanitized)) {
      return "Error";
    }

    const result = new Function(`"use strict"; return (${sanitized})`)();

    if (!isFinite(result)) return "Error";
    if (Number.isInteger(result)) return String(result);

    const formatted = parseFloat(result.toPrecision(10));
    return String(formatted);
  } catch {
    return "Error";
  }
};

export default function ScientificCalculator() {
  const [expression, setExpression] = useState("");
  const [display, setDisplay] = useState("0");
  const [hasResult, setHasResult] = useState(false);

  const liveResult = useMemo(() => {
    if (!expression || expression === "Error") return "";
    const result = evaluateExpression(expression);
    return result !== "Error" && result !== expression.replace(/[×÷−]/g, "")
      ? result
      : "";
  }, [expression]);

  const handlePress = useCallback(
    (label: string) => {
      switch (label) {
        case "AC":
          setExpression("");
          setDisplay("0");
          setHasResult(false);
          break;

        case "⌫":
          if (hasResult) {
            setExpression("");
            setDisplay("0");
            setHasResult(false);
          } else {
            setExpression((prev) => {
              const funcs = ["sin(", "cos(", "tan(", "log(", "ln("];
              for (const fn of funcs) {
                if (prev.endsWith(fn)) {
                  return prev.slice(0, -fn.length);
                }
              }
              if (prev.endsWith("√(")) return prev.slice(0, -2);
              const next = prev.slice(0, -1);
              return next;
            });
          }
          break;

        case "=":
          if (expression) {
            const result = evaluateExpression(expression);
            setDisplay(result);
            setExpression(result === "Error" ? "" : result);
            setHasResult(true);
          }
          break;

        case "sin":
        case "cos":
        case "tan":
        case "log":
        case "ln":
          if (hasResult) {
            setExpression(`${label}(${expression})`);
            setHasResult(false);
          } else {
            setExpression((prev) => prev + `${label}(`);
          }
          break;

        case "√":
          if (hasResult) {
            setExpression(`√(${expression})`);
            setHasResult(false);
          } else {
            setExpression((prev) => prev + "√(");
          }
          break;

        case "π":
          if (hasResult) {
            setExpression("π");
            setHasResult(false);
          } else {
            setExpression((prev) => prev + "π");
          }
          break;

        case "^":
        case "+":
        case "−":
        case "×":
        case "÷":
          setHasResult(false);
          setExpression((prev) => prev + label);
          break;

        case "(":
        case ")":
          setHasResult(false);
          setExpression((prev) => prev + label);
          break;

        case "%":
          setExpression((prev) => prev + "%");
          break;

        default:
          if (hasResult) {
            setExpression(label);
            setDisplay(label);
            setHasResult(false);
          } else {
            setExpression((prev) => prev + label);
          }
          break;
      }
    },
    [expression, hasResult]
  );

  const displayExpr = expression || "0";
  const exprFontSize =
    displayExpr.length > 20 ? 22 : displayExpr.length > 14 ? 28 : 34;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.topBar}>
        <Text style={styles.brandText}>CALC</Text>
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>RAD</Text>
        </View>
      </View>

      <View style={styles.displayOuter}>
        <View style={styles.displayInset}>
          <View style={styles.displayInsetInner}>
            <View style={styles.displayContent}>
              <Text
                style={[styles.expressionText, { fontSize: exprFontSize }]}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {displayExpr}
              </Text>
              {liveResult && !hasResult ? (
                <Text style={styles.liveResultText} numberOfLines={1}>
                  = {liveResult}
                </Text>
              ) : hasResult ? (
                <Text style={styles.resultText} numberOfLines={1}>
                  {display}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sciSection}>
        <View style={styles.sciRow}>
          {SCI_ROW_1.map((btn) => (
            <NeumorphicButton
              key={btn.label}
              btn={btn}
              size={SCI_BTN}
              onPress={handlePress}
            />
          ))}
        </View>
        <View style={styles.sciRow}>
          {SCI_ROW_2.map((btn) => (
            <NeumorphicButton
              key={btn.label}
              btn={btn}
              size={SCI_BTN}
              onPress={handlePress}
            />
          ))}
        </View>
      </View>

      <View style={styles.divider}>
        <LinearGradient
          colors={["transparent", "rgba(74,237,196,0.15)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.dividerLine}
        />
      </View>

      <View style={styles.mainSection}>
        {MAIN_ROWS.map((row, i) => (
          <View key={i} style={styles.mainRow}>
            {row.map((btn) => (
              <NeumorphicButton
                key={btn.label}
                btn={btn}
                size={MAIN_BTN}
                onPress={handlePress}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.homeIndicator}>
        <View style={styles.homeBar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: GRID_PAD + 4,
    marginBottom: 12,
  },
  brandText: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 6,
  },
  modeBadge: {
    backgroundColor: "rgba(74,237,196,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(74,237,196,0.15)",
  },
  modeText: {
    color: ACCENT_TEAL,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  displayOuter: {
    paddingHorizontal: GRID_PAD,
    marginBottom: 18,
  },
  displayInset: {
    borderRadius: 24,
    backgroundColor: BG,
    shadowColor: DARK,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  displayInsetInner: {
    borderRadius: 24,
    backgroundColor: SURFACE_PRESSED,
    shadowColor: LIGHT,
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 1,
    borderTopColor: "rgba(0,0,0,0.2)",
    borderLeftColor: "rgba(0,0,0,0.15)",
    borderBottomColor: "rgba(255,255,255,0.03)",
    borderRightColor: "rgba(255,255,255,0.02)",
  },
  displayContent: {
    paddingHorizontal: 24,
    paddingVertical: 22,
    minHeight: 120,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  expressionText: {
    color: "#E8E8F0",
    fontWeight: "300",
    letterSpacing: 0.5,
    textAlign: "right",
    width: "100%",
    fontVariant: ["tabular-nums"],
  },
  liveResultText: {
    color: "rgba(74,237,196,0.5)",
    fontSize: 18,
    fontWeight: "400",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  resultText: {
    color: ACCENT_TEAL,
    fontSize: 20,
    fontWeight: "500",
    marginTop: 6,
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  sciSection: {
    paddingHorizontal: GRID_PAD,
    gap: GAP,
    marginBottom: 10,
  },
  sciRow: {
    flexDirection: "row",
    gap: GAP,
  },
  divider: {
    paddingHorizontal: GRID_PAD + 10,
    marginBottom: 14,
  },
  dividerLine: {
    height: 1,
    borderRadius: 1,
  },
  mainSection: {
    paddingHorizontal: GRID_PAD,
    gap: GAP,
  },
  mainRow: {
    flexDirection: "row",
    gap: GAP,
  },
  homeIndicator: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: "auto",
  },
  homeBar: {
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});