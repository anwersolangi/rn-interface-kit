import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withDelay,
  withSequence,
  Easing,
  interpolate,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

type Step = {
  label: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const STEPS: Step[] = [
  {
    label: "Order Confirmed",
    sub: "Restaurant accepted",
    icon: "checkmark-circle",
  },
  { label: "Preparing", sub: "Chef is cooking", icon: "restaurant" },
  { label: "On the Way", sub: "Rider picked up", icon: "bicycle" },
  { label: "Delivered", sub: "Enjoy your meal", icon: "home" },
];

const CURRENT = 2;

function StepNode({
  step,
  index,
  active,
  done,
}: {
  step: Step;
  index: number;
  active: boolean;
  done: boolean;
}) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (active)
      pulse.set(withRepeat(withTiming(1, { duration: 1200 }), -1, true));
  }, [active]);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: active ? interpolate(pulse.get(), [0, 1], [0.3, 0]) : 0,
    transform: [{ scale: interpolate(pulse.get(), [0, 1], [1, 1.8]) }],
  }));
  const tint = done || active ? "#FF7A00" : "#3A3A42";
  return (
    <Animated.View
      entering={FadeInDown.delay(700 + index * 150)}
      style={f.step}
    >
      <View style={f.nodeCol}>
        <View style={[f.node, { backgroundColor: tint }]}>
          {active && <Animated.View style={[f.nodePulse, pulseStyle]} />}
          <Ionicons
            name={step.icon}
            size={18}
            color={done || active ? "#fff" : "#6B6B75"}
          />
        </View>
        {index < STEPS.length - 1 && (
          <View
            style={[
              f.connector,
              { backgroundColor: done ? "#FF7A00" : "#2A2A30" },
            ]}
          />
        )}
      </View>
      <View style={f.stepText}>
        <Text
          style={[f.stepLabel, { color: done || active ? "#fff" : "#6B6B75" }]}
        >
          {step.label}
        </Text>
        <Text style={f.stepSub}>{step.sub}</Text>
      </View>
      {active && <Text style={f.nowTag}>Now</Text>}
    </Animated.View>
  );
}

export default function OrderTracking() {
  const [eta] = useState(18);
  const bag = useSharedValue(0);

  useEffect(() => {
    bag.set(
      withDelay(
        400,
        withRepeat(
          withSequence(
            withTiming(-8, { duration: 600, easing: Easing.out(Easing.quad) }),
            withSpring(0, { damping: 4 }),
          ),
          -1,
          false,
        ),
      ),
    );
  }, []);

  const bagStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bag.get() }],
  }));

  return (
    <View style={f.root}>
      <LinearGradient colors={["#1A1208", "#0D0D12"]} style={f.topGlow} />

      <View style={f.ringDecor} pointerEvents="none">
        <View style={[f.ring, { width: 200, height: 200, opacity: 0.08 }]} />
        <View style={[f.ring, { width: 280, height: 280, opacity: 0.05 }]} />
      </View>

      <Animated.View entering={FadeInDown.duration(600)} style={f.header}>
        <Pressable
          style={f.iconBtn}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Animated.View style={[f.bag, bagStyle]}>
          <Text style={f.bagEmoji}>🍔</Text>
        </Animated.View>
        <Pressable style={f.iconBtn}>
          <Ionicons name="headset" size={20} color="#fff" />
        </Pressable>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(300)} style={f.etaBlock}>
        <Text style={f.etaLabel}>Arriving in</Text>
        <Text style={f.etaTime}>{eta} min</Text>
      </Animated.View>

      <View style={f.card}>
        {STEPS.map((st, i) => (
          <StepNode
            key={st.label}
            step={st}
            index={i}
            active={i === CURRENT}
            done={i < CURRENT}
          />
        ))}
      </View>

      <Animated.View entering={FadeInDown.delay(1400)} style={f.footer}>
        <View style={f.riderRow}>
          <View style={f.riderAvatar}>
            <Ionicons name="person" size={20} color="#FF7A00" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={f.riderName}>Bilal R.</Text>
            <Text style={f.riderRole}>Your rider</Text>
          </View>
          <Pressable
            style={f.callBtn}
            onPress={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            }
          >
            <Ionicons name="call" size={18} color="#fff" />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const f = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0D12" },

  topGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 360 },

  ringDecor: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderRadius: 200,
    borderWidth: 1,
    borderColor: "#FF7A00",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 66,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  bag: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,122,0,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  bagEmoji: { fontSize: 30 },
  etaBlock: { alignItems: "center", marginTop: 18 },
  etaLabel: { color: "#8A8A95", fontSize: 14 },
  etaTime: { color: "#FF7A00", fontSize: 40, fontWeight: "800", marginTop: 2 },

  card: {
    marginHorizontal: 24,
    marginTop: 30,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 24,
    padding: 24,
  },
  step: { flexDirection: "row", alignItems: "flex-start" },
  nodeCol: { alignItems: "center", width: 40 },
  node: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  nodePulse: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF7A00",
  },
  connector: { width: 3, height: 34, marginVertical: 2, borderRadius: 2 },
  stepText: { flex: 1, marginLeft: 14, paddingTop: 4 },
  stepLabel: { fontSize: 16, fontWeight: "600" },
  stepSub: { color: "#6B6B75", fontSize: 13, marginTop: 2 },
  nowTag: {
    color: "#FF7A00",
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: "rgba(255,122,0,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    marginTop: 6,
  },

  footer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 44,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 16,
  },
  riderRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  riderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,122,0,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  riderName: { color: "#fff", fontSize: 16, fontWeight: "600" },
  riderRole: { color: "#6B6B75", fontSize: 13, marginTop: 1 },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF7A00",
    alignItems: "center",
    justifyContent: "center",
  },
});
