
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  Dimensions, Pressable, ScrollView, StatusBar,
  StyleSheet, Text, View,
} from "react-native";
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Path,
  Rect,
  Skia,
  vec,
  RadialGradient,
} from "@shopify/react-native-skia";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Easing,
  FadeInRight,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";

const { width: SW } = Dimensions.get("window");

const CARD_W = SW - 40;
const CARD_H = CARD_W * 0.62;

const BG = "#020817";
const SURFACE = "#0F1B30";
const BORDER = "#283655";
const TEXT_W = "#F0F8FF";
const TEXT_S = "#94A8C8";
const TEXT_M = "#5C6E90";
const ACCENT = "#06B6D4";
const ACCENT_LT = "#22D3EE";
const HOLO_1 = "#7C3AED";
const HOLO_2 = "#22D3EE";
const HOLO_3 = "#F472B6";
const HOLO_4 = "#FCD34D";
const GREEN = "#10B981";
const PINK = "#EC4899";
const AMBER = "#F59E0B";

function HologramShimmer({ phase }: { phase: any }) {
  return (
    <Canvas style={{ width: CARD_W, height: CARD_H, position: "absolute" }}>
      <Group>
        <Circle cx={CARD_W * 0.25} cy={CARD_H * 0.3} r={80} opacity={0.7}>
          <RadialGradient
            c={vec(CARD_W * 0.25, CARD_H * 0.3)}
            r={80}
            colors={[HOLO_1, HOLO_2, "transparent"]}
          />
          <BlurMask blur={24} style="solid" />
        </Circle>
        <Circle cx={CARD_W * 0.75} cy={CARD_H * 0.65} r={90} opacity={0.7}>
          <RadialGradient
            c={vec(CARD_W * 0.75, CARD_H * 0.65)}
            r={90}
            colors={[HOLO_3, HOLO_4, "transparent"]}
          />
          <BlurMask blur={28} style="solid" />
        </Circle>
        <Circle cx={CARD_W * 0.55} cy={CARD_H * 0.35} r={70} opacity={0.6}>
          <RadialGradient
            c={vec(CARD_W * 0.55, CARD_H * 0.35)}
            r={70}
            colors={[HOLO_2, "transparent"]}
          />
          <BlurMask blur={22} style="solid" />
        </Circle>
      </Group>
    </Canvas>
  );
}

function HoloShine({ x }: { x: any }) {
  const shineX = useDerivedValue(() => x.value * CARD_W * 1.5 - CARD_W * 0.5);
  const path = useDerivedValue(() => {
    const p = Skia.Path.Make();
    p.moveTo(shineX.value, 0);
    p.lineTo(shineX.value + 60, 0);
    p.lineTo(shineX.value + 30, CARD_H);
    p.lineTo(shineX.value - 30, CARD_H);
    p.close();
    return p;
  });

  return (
    <Canvas style={{ width: CARD_W, height: CARD_H, position: "absolute" }}>
      <Path path={path} color="#FFF" opacity={0.15}>
        <BlurMask blur={12} style="solid" />
      </Path>
    </Canvas>
  );
}

function QRPattern({ size }: { size: number }) {
  const cellCount = 21;
  const cell = size / cellCount;
  const cells = [];
  for (let r = 0; r < cellCount; r++) {
    for (let c = 0; c < cellCount; c++) {
      const isFinderTL = r < 7 && c < 7;
      const isFinderTR = r < 7 && c > cellCount - 8;
      const isFinderBL = r > cellCount - 8 && c < 7;
      const isFinder = isFinderTL || isFinderTR || isFinderBL;
      if (isFinder) {
        const localR = isFinderTL ? r : isFinderTR ? r : r - (cellCount - 7);
        const localC = isFinderTL ? c : isFinderTR ? c - (cellCount - 7) : c;
        const isBorder = localR === 0 || localR === 6 || localC === 0 || localC === 6;
        const isInner = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4;
        if (isBorder || isInner) cells.push({ x: c * cell, y: r * cell, w: cell, h: cell });
      } else {
        const seed = (r * 31 + c * 17 + r * c * 3) % 100;
        if (seed < 48) cells.push({ x: c * cell, y: r * cell, w: cell, h: cell });
      }
    }
  }
  return (
    <Canvas style={{ width: size, height: size }}>
      <Rect x={0} y={0} width={size} height={size} color="#FFF" />
      {cells.map((c, i) => (
        <Rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} color="#000" />
      ))}
    </Canvas>
  );
}

export default function GymMembershipScreen() {
  
  const flip = useSharedValue(0);
  const shine = useSharedValue(0);
  const phase = useSharedValue(0);

  useEffect(() => {
    shine.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.cubic) }),
      -1,
      false,
    );
    phase.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const flipCard = () => {
    "worklet";
    flip.value = withSpring(flip.value === 0 ? 1 : 0, { damping: 14, stiffness: 90 });
  };

  const tap = Gesture.Tap().onStart(flipCard);

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity: flip.value < 0.5 ? 1 : 0,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity: flip.value > 0.5 ? 1 : 0,
    };
  });
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0A1635", BG, "#000"]} style={StyleSheet.absoluteFill} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={TEXT_W} />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.brand}>MEMBERSHIP</Text>
            <Text style={styles.brandSub}>BLACK · LIFETIME</Text>
          </View>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="share-outline" size={20} color={TEXT_W} />
          </Pressable>
        </View>

        <GestureDetector gesture={tap}>
          <View style={styles.cardWrap}>
            <Animated.View style={[styles.cardFace, frontStyle]}>
              <LinearGradient colors={["#0F172A", "#1E293B", "#020817"]} start={{ x: 0.1, y: 0.1 }} end={{ x: 0.9, y: 0.9 }} style={StyleSheet.absoluteFill} />
              <HologramShimmer phase={phase} />
              <HoloShine x={shine} />
              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <View>
                    <Text style={styles.cardBrandSmall}>★ APEX FITNESS</Text>
                    <View style={styles.cardTierRow}>
                      <Text style={styles.cardTier}>BLACK</Text>
                      <Text style={styles.cardTierLine}>·</Text>
                      <Text style={styles.cardTierSub}>LIFETIME</Text>
                    </View>
                  </View>
                  <View style={styles.cardLogo}>
                    <Ionicons name="barbell" size={22} color="#FFF" />
                  </View>
                </View>
                <View style={styles.cardMidRow}>
                  <View style={styles.chipDesign}>
                    <LinearGradient colors={["#FCD34D", "#D97706", "#78350F"]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: 5 }]} />
                    <View style={styles.chipGrid}>
                      <View style={styles.chipLineH} />
                      <View style={styles.chipLineH} />
                      <View style={[styles.chipLineV, { left: 8 }]} />
                      <View style={[styles.chipLineV, { left: 16 }]} />
                    </View>
                  </View>
                  <View style={styles.contactlessIcon}>
                    <View style={styles.contactlessArc} />
                    <View style={[styles.contactlessArc, { width: 18, height: 18, borderRadius: 9 }]} />
                    <View style={[styles.contactlessArc, { width: 28, height: 28, borderRadius: 14 }]} />
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  <View>
                    <Text style={styles.cardLbl}>MEMBER</Text>
                    <Text style={styles.cardName}>ANWER SOLANGI</Text>
                    <Text style={styles.cardMemberSince}>MEMBER SINCE 2021</Text>
                  </View>
                  <View style={styles.cardNumberWrap}>
                    <Text style={styles.cardLbl}>NO.</Text>
                    <Text style={styles.cardNumber}>#0482</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
            <Animated.View style={[styles.cardFace, styles.cardBack, backStyle]}>
              <LinearGradient colors={["#0F172A", "#020817"]} style={StyleSheet.absoluteFill} />
              <View style={styles.backContent}>
                <View style={styles.magstripe} />
                <View style={styles.backInfoRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.backLabel}>SCAN AT ENTRY</Text>
                    <Text style={styles.backDesc}>Show this code at any APEX location worldwide. Valid 24/7.</Text>
                    <View style={styles.backStatsRow}>
                      <View style={styles.backStatItem}>
                        <Ionicons name="checkmark-circle" size={11} color={GREEN} />
                        <Text style={styles.backStatText}>ACTIVE</Text>
                      </View>
                      <View style={styles.backStatItem}>
                        <Ionicons name="globe-outline" size={11} color={ACCENT_LT} />
                        <Text style={styles.backStatText}>14 CITIES</Text>
                      </View>
                    </View>
                    <View style={styles.signature}>
                      <Text style={styles.signatureText}>Anwer S.</Text>
                      <Text style={styles.signatureLbl}>SIGNATURE</Text>
                    </View>
                  </View>
                  <View style={styles.qrFrameSmall}>
                    <QRPattern size={86} />
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>
        </GestureDetector>

        <View style={styles.hintWrap}>
          <View style={styles.hintBadge}>
            <Ionicons name="finger-print" size={11} color={ACCENT_LT} />
            <Text style={styles.hintText}>TAP CARD TO FLIP · WATCH THE HOLOGRAM</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={16} color="#F97316" />
            <Text style={styles.statVal}>147</Text>
            <Text style={styles.statLbl}>DAY STREAK</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Ionicons name="checkmark-done" size={16} color={GREEN} />
            <Text style={styles.statVal}>284</Text>
            <Text style={styles.statLbl}>VISITS</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={16} color={AMBER} />
            <Text style={styles.statVal}>42</Text>
            <Text style={styles.statLbl}>PRs</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Ionicons name="people" size={16} color={ACCENT_LT} />
            <Text style={styles.statVal}>14</Text>
            <Text style={styles.statLbl}>REFERRALS</Text>
          </View>
        </View>

        <View style={styles.perksCard}>
          <View style={styles.perksHead}>
            <Text style={styles.perksTitle}>Black Member Perks</Text>
            <Text style={styles.perksCount}>8 ACTIVE</Text>
          </View>
          {[
            { icon: "infinite",         text: "Unlimited 24/7 access",                     color: ACCENT_LT },
            { icon: "person",           text: "2 free PT sessions monthly",                color: PINK      },
            { icon: "globe",            text: "Access to all 14 city locations",           color: HOLO_4    },
            { icon: "nutrition-outline", text: "Nutritionist consultation included",       color: GREEN     },
          ].map((p, i) => (
            <Animated.View key={i} entering={FadeInRight.delay(400 + i * 80)} style={styles.perkRow}>
              <View style={[styles.perkIcon, { backgroundColor: p.color + "15", borderColor: p.color + "40" }]}>
                <Ionicons name={p.icon as any} size={13} color={p.color} />
              </View>
              <Text style={styles.perkText}>{p.text}</Text>
              <Ionicons name="checkmark" size={14} color={GREEN} />
            </Animated.View>
          ))}
        </View>

      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { paddingTop: 60, paddingBottom: 30 },

  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 22, marginBottom: 30 },
  iconBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: SURFACE, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  brand: { color: TEXT_W, fontSize: 14, fontWeight: "900", letterSpacing: 4 },
  brandSub: { color: AMBER, fontSize: 10, marginTop: 3, fontWeight: "900", letterSpacing: 1.5 },

  cardWrap: { width: CARD_W, height: CARD_H, alignSelf: "center", position: "relative", marginBottom: 14 },

  cardFace: { ...StyleSheet.absoluteFillObject, borderRadius: 22, overflow: "hidden", backfaceVisibility: "hidden", borderWidth: 1, borderColor: BORDER, shadowColor: HOLO_1, shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  cardContent: { flex: 1, padding: 22, justifyContent: "space-between" },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardBrandSmall: { color: AMBER, fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  cardTierRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 4 },
  cardTier: { color: "#FFF", fontSize: 22, fontWeight: "900", letterSpacing: -0.5, fontStyle: "italic" },
  cardTierLine: { color: "rgba(255,255,255,0.5)", fontSize: 16 },
  cardTierSub: { color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  cardLogo: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.2)" },
  cardMidRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  chipDesign: { width: 36, height: 26, borderRadius: 5, overflow: "hidden", position: "relative" },
  chipGrid: { ...StyleSheet.absoluteFillObject },
  chipLineH: { position: "absolute", left: 4, right: 4, height: 1, backgroundColor: "rgba(0,0,0,0.4)", top: 8 },
  chipLineV: { position: "absolute", top: 4, bottom: 4, width: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  contactlessIcon: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  contactlessArc: { position: "absolute", width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: "#FFF", borderLeftColor: "transparent", borderBottomColor: "transparent", transform: [{ rotate: "45deg" }] },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  cardLbl: { color: "rgba(255,255,255,0.7)", fontSize: 8, letterSpacing: 1.5, fontWeight: "900" },
  cardName: { color: "#FFF", fontSize: 15, fontWeight: "900", letterSpacing: 1, marginTop: 4 },
  cardMemberSince: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontWeight: "700", marginTop: 4, fontFamily: "Courier" },
  cardNumberWrap: { alignItems: "flex-end" },
  cardNumber: { color: AMBER, fontSize: 18, fontWeight: "900", fontFamily: "Courier", letterSpacing: 1, marginTop: 4 },

  cardBack: { },
  backContent: { flex: 1, paddingTop: 22 },
  magstripe: { height: 36, backgroundColor: "#000", marginBottom: 18 },
  backInfoRow: { flex: 1, flexDirection: "row", gap: 14, padding: 16 },
  backLabel: { color: ACCENT_LT, fontSize: 10, letterSpacing: 1.5, fontWeight: "900", marginBottom: 6 },
  backDesc: { color: TEXT_S, fontSize: 11, lineHeight: 16, fontStyle: "italic", marginBottom: 10 },
  backStatsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  backStatItem: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.15)" },
  backStatText: { color: TEXT_W, fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  signature: { marginTop: 8 },
  signatureText: { color: "#FFF", fontSize: 18, fontStyle: "italic", fontWeight: "300" },
  signatureLbl: { color: TEXT_M, fontSize: 8, letterSpacing: 1.5, fontWeight: "900", marginTop: 4 },
  qrFrameSmall: { width: 100, height: 100, padding: 7, borderRadius: 12, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" },

  hintWrap: { alignItems: "center", marginBottom: 22 },
  hintBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: ACCENT + "12", borderWidth: 0.5, borderColor: ACCENT + "40" },
  hintText: { color: ACCENT_LT, fontSize: 10, fontWeight: "900", letterSpacing: 1 },

  statsCard: { flexDirection: "row", marginHorizontal: 20, padding: 14, borderRadius: 16, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, marginBottom: 18 },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statVal: { color: TEXT_W, fontSize: 20, fontWeight: "900", fontFamily: "Courier", letterSpacing: -0.3, marginTop: 2 },
  statLbl: { color: TEXT_M, fontSize: 8, letterSpacing: 1, fontWeight: "900" },
  statDiv: { width: 0.5, backgroundColor: BORDER },

  perksCard: { marginHorizontal: 20, padding: 16, borderRadius: 18, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER },
  perksHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  perksTitle: { color: TEXT_W, fontSize: 14, fontWeight: "900", letterSpacing: -0.3 },
  perksCount: { color: GREEN, fontSize: 10, fontWeight: "900", fontFamily: "Courier", letterSpacing: 0.5 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  perkIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 0.5 },
  perkText: { color: TEXT_W, fontSize: 12, fontWeight: "700", flex: 1 },

});


