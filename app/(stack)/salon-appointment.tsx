import { Ionicons } from "@expo/vector-icons";
import { Canvas, Skia, Path as SkiaPath } from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { height: SH } = Dimensions.get("window");

const RING_SZ = 56;
const AVATAR_SZ = 72;

const BG = "#FAFAFA";
const SURFACE = "#F4F4F5";
const CARD = "#FFFFFF";
const BORDER = "rgba(0,0,0,0.08)";
const TEXT_W = "#0A0A0A";
const TEXT_S = "rgba(0,0,0,0.52)";
const TEXT_M = "rgba(0,0,0,0.32)";
const ACCENT = "#18181B";
const ACCENT2 = "#3F3F46";
const GOLD = "#F59E0B";
const GREEN = "#16A34A";

type Stylist = {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  exp: string;
  avatar: string;
  color: string;
  slots: number;
};

type Service = {
  id: string;
  name: string;
  duration: string;
  price: number;
  icon: string;
};

const SERVICES: Service[] = [
  {
    id: "1",
    name: "Haircut & Style",
    duration: "45 min",
    price: 65,
    icon: "✂️",
  },
  {
    id: "2",
    name: "Color & Highlight",
    duration: "90 min",
    price: 140,
    icon: "🎨",
  },
  {
    id: "3",
    name: "Keratin Treatment",
    duration: "120 min",
    price: 220,
    icon: "✨",
  },
  { id: "4", name: "Blowout", duration: "30 min", price: 45, icon: "💨" },
];

const STYLISTS: Stylist[] = [
  {
    id: "1",
    name: "Sofia Reyes",
    role: "Senior Stylist",
    rating: 4.9,
    reviews: 312,
    exp: "8 yrs",
    avatar: "SR",
    color: "#BF5AF2",
    slots: 5,
  },
  {
    id: "2",
    name: "James Park",
    role: "Color Specialist",
    rating: 4.8,
    reviews: 198,
    exp: "6 yrs",
    avatar: "JP",
    color: "#0A84FF",
    slots: 3,
  },
  {
    id: "3",
    name: "Mia Chen",
    role: "Master Stylist",
    rating: 5.0,
    reviews: 427,
    exp: "11 yrs",
    avatar: "MC",
    color: "#FF375F",
    slots: 2,
  },
  {
    id: "4",
    name: "Lucas Moreau",
    role: "Texture Expert",
    rating: 4.7,
    reviews: 156,
    exp: "5 yrs",
    avatar: "LM",
    color: "#30D158",
    slots: 7,
  },
];

const TIMES = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
];

const BLOCKED = new Set([
  "10:00 AM",
  "11:30 AM",
  "1:30 PM",
  "3:00 PM",
  "4:30 PM",
]);

function buildDays(): {
  day: string;
  date: number;
  month: string;
  avail: boolean;
}[] {
  const now = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    return {
      day: days[d.getDay()],
      date: d.getDate(),
      month: months[d.getMonth()],
      avail: d.getDay() !== 0,
    };
  });
}

const DAYS = buildDays();

function AvailabilityRing({
  slots,
  color,
  size = RING_SZ,
}: {
  slots: number;
  color: string;
  size?: number;
}) {
  const pct = Math.min(slots / 8, 1);
  const bg = Skia.Path.Make();
  bg.arcToOval(
    { x: 5, y: 5, width: size - 10, height: size - 10 },
    -90,
    360,
    false,
  );
  const fg = Skia.Path.Make();
  fg.arcToOval(
    { x: 5, y: 5, width: size - 10, height: size - 10 },
    -90,
    360 * pct,
    false,
  );
  return (
    <Canvas style={{ width: size, height: size }}>
      <SkiaPath
        path={bg}
        style="stroke"
        strokeWidth={3}
        color="rgba(255,255,255,0.08)"
        strokeCap="round"
      />
      <SkiaPath
        path={fg}
        style="stroke"
        strokeWidth={3}
        color={color}
        strokeCap="round"
        opacity={0.9}
      />
    </Canvas>
  );
}

function StylistCard({
  stylist,
  selected,
  onSelect,
}: {
  stylist: Stylist;
  selected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const border = useSharedValue(0);

  useEffect(() => {
    border.value = withTiming(selected ? 1 : 0, { duration: 240 });
    scale.value = selected
      ? withSequence(
          withSpring(0.96, { damping: 10 }),
          withSpring(1, { damping: 14 }),
        )
      : withSpring(1, { damping: 14 });
  }, [selected]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor:
      interpolate(border.value, [0, 1], [0.07, 1]) > 0.5
        ? stylist.color + "88"
        : BORDER,
    borderWidth: interpolate(border.value, [0, 1], [0.5, 1.5]),
    backgroundColor:
      interpolate(border.value, [0, 1], [0, 1]) > 0.5
        ? stylist.color + "12"
        : CARD,
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onSelect();
      }}
    >
      <Animated.View style={[styles.stylistCard, cardStyle]}>
        <View style={styles.stylistAvatarWrap}>
          <View
            style={[
              styles.stylistAvatar,
              { backgroundColor: stylist.color + "18" },
            ]}
          >
            <Text style={[styles.stylistInitials, { color: stylist.color }]}>
              {stylist.avatar}
            </Text>
          </View>
          <View style={styles.availRingWrap}>
            <AvailabilityRing
              slots={stylist.slots}
              color={stylist.color}
              size={RING_SZ}
            />
            <View style={styles.slotBadge}>
              <Text style={[styles.slotNum, { color: stylist.color }]}>
                {stylist.slots}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.stylistName}>{stylist.name}</Text>
        <Text style={styles.stylistRole}>{stylist.role}</Text>
        <View style={styles.stylistMeta}>
          <Ionicons name="star" size={10} color={GOLD} />
          <Text style={styles.stylistRating}>{stylist.rating}</Text>
          <Text style={styles.stylistDot}>·</Text>
          <Text style={styles.stylistExp}>{stylist.exp}</Text>
        </View>
        {selected && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[styles.selectedTick, { backgroundColor: stylist.color }]}
          >
            <Ionicons name="checkmark" size={10} color={TEXT_W} />
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function SalonBookingScreen() {
  const [serviceIdx, setServiceIdx] = useState(0);
  const [stylistId, setStylistId] = useState("1");
  const [dayIdx, setDayIdx] = useState(0);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const sheetY = useSharedValue(SH);
  const overlayO = useSharedValue(0);
  const btnScale = useSharedValue(1);

  const stylist = STYLISTS.find((s) => s.id === stylistId)!;
  const service = SERVICES[serviceIdx];
  const day = DAYS[dayIdx];
  const canBook = !!timeSlot;

  const handleConfirm = useCallback(() => {
    if (!canBook) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    btnScale.value = withSequence(
      withSpring(0.94, { damping: 10 }),
      withSpring(1, { damping: 12 }),
    );
    sheetY.value = withSpring(0, { damping: 22, stiffness: 180 });
    overlayO.value = withTiming(1, { duration: 260 });
    setConfirmed(true);
  }, [canBook]);

  const handleClose = useCallback(() => {
    sheetY.value = withSpring(SH, { damping: 22, stiffness: 180 });
    overlayO.value = withTiming(0, { duration: 260 });
    setTimeout(() => setConfirmed(false), 320);
  }, []);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayO.value }));
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: BG }]} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <Pressable style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={TEXT_W} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerEye}>BOOK APPOINTMENT</Text>
            <Text style={styles.headerTitle}>Lumière Studio</Text>
          </View>
          <Pressable style={styles.backBtn}>
            <Ionicons name="heart-outline" size={20} color={TEXT_S} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SELECT SERVICE</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.serviceRow}
          >
            {SERVICES.map((svc, i) => (
              <Pressable
                key={svc.id}
                style={[
                  styles.serviceCard,
                  i === serviceIdx && styles.serviceCardActive,
                ]}
                onPress={() => {
                  setServiceIdx(i);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={styles.serviceIcon}>{svc.icon}</Text>
                <Text
                  style={[
                    styles.serviceName,
                    i === serviceIdx && { color: TEXT_W },
                  ]}
                >
                  {svc.name}
                </Text>
                <Text
                  style={[
                    styles.serviceDur,
                    i === serviceIdx && { color: ACCENT2 },
                  ]}
                >
                  {svc.duration}
                </Text>
                <Text
                  style={[
                    styles.servicePrice,
                    i === serviceIdx && { color: ACCENT2 },
                  ]}
                >
                  ${svc.price}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CHOOSE STYLIST</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stylistRow}
          >
            {STYLISTS.map((st) => (
              <StylistCard
                key={st.id}
                stylist={st}
                selected={stylistId === st.id}
                onSelect={() => setStylistId(st.id)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PICK A DATE</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calRow}
          >
            {DAYS.map((d, i) => (
              <Pressable
                key={i}
                style={[
                  styles.dayCard,
                  i === dayIdx && styles.dayCardActive,
                  !d.avail && styles.dayCardBlocked,
                ]}
                disabled={!d.avail}
                onPress={() => {
                  setDayIdx(i);
                  setTimeSlot(null);
                  Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[styles.dayName, i === dayIdx && { color: "#FFFFFF" }]}
                >
                  {d.day}
                </Text>
                <Text
                  style={[styles.dayNum, i === dayIdx && { color: "#FFFFFF" }]}
                >
                  {d.date}
                </Text>
                {i === 0 && <View style={styles.todayDot} />}
                {!d.avail && <Text style={styles.closedText}>—</Text>}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.timesHeader}>
            <Text style={styles.sectionLabel}>AVAILABLE TIMES</Text>
            <Text style={styles.timesDay}>
              {day.day}, {day.date} {day.month}
            </Text>
          </View>
          <View style={styles.timesGrid}>
            {TIMES.map((t) => {
              const isBlocked = BLOCKED.has(t);
              const isActive = timeSlot === t;
              return (
                <Pressable
                  key={t}
                  disabled={isBlocked}
                  style={[
                    styles.timeChip,
                    isActive && styles.timeChipActive,
                    isBlocked && styles.timeChipBlocked,
                  ]}
                  onPress={() => {
                    setTimeSlot(t);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      isActive && styles.timeChipTextAct,
                      isBlocked && styles.timeChipTextBlk,
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
      <View style={styles.bookBar}>
        <View style={styles.bookSummary}>
          <Text style={styles.bookSummaryService}>{service.name}</Text>
          <Text style={styles.bookSummaryMeta}>
            {stylist.name} · {service.duration} · ${service.price}
          </Text>
        </View>
        <Animated.View
          style={[styles.bookBtn, btnStyle, !canBook && styles.bookBtnDim]}
        >
          <Pressable disabled={!canBook} onPress={handleConfirm}>
            <LinearGradient
              colors={canBook ? ["#18181B", "#000000"] : ["#E4E4E7", "#E4E4E7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bookBtnGrad}
            >
              <Text style={styles.bookBtnText}>
                {canBook ? `Book ${timeSlot}` : "Pick a time"}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>

      {confirmed && (
        <>
          <Animated.View style={[styles.overlay, overlayStyle]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
          </Animated.View>
          <Animated.View style={[styles.confirmSheet, sheetStyle]}>
            <View style={styles.sheetHandle} />
            <View style={styles.confirmContent}>
              <View style={styles.confirmTopRow}>
                <Animated.View
                  entering={FadeIn.delay(200).springify()}
                  style={styles.confirmCheck}
                >
                  <Ionicons name="checkmark" size={28} color={GREEN} />
                </Animated.View>
                <Animated.View entering={FadeInLeft.delay(280).springify()}>
                  <Text style={styles.confirmTitle}>Booking Confirmed!</Text>
                  <Text style={styles.confirmSub}>See you soon ✨</Text>
                </Animated.View>
              </View>
              <Animated.View
                entering={FadeInDown.delay(340).springify()}
                style={styles.confirmCard}
              >
                {[
                  {
                    icon: "cut-outline",
                    label: "SERVICE",
                    value: service.name,
                  },
                  {
                    icon: "person-outline",
                    label: "STYLIST",
                    value: stylist.name,
                  },
                  {
                    icon: "calendar-outline",
                    label: "DATE",
                    value: `${day.day}, ${day.date} ${day.month}`,
                  },
                  {
                    icon: "time-outline",
                    label: "TIME",
                    value: timeSlot ?? "",
                  },
                  {
                    icon: "pricetag-outline",
                    label: "TOTAL",
                    value: `$${service.price}`,
                  },
                ].map((row, i, arr) => (
                  <View key={row.label}>
                    <View style={styles.confirmRow}>
                      <View style={styles.confirmIcon}>
                        <Ionicons
                          name={row.icon as any}
                          size={16}
                          color="#18181B"
                        />
                      </View>
                      <View>
                        <Text style={styles.confirmRowLabel}>{row.label}</Text>
                        <Text style={styles.confirmRowValue}>{row.value}</Text>
                      </View>
                    </View>
                    {i < arr.length - 1 && (
                      <View
                        style={[
                          styles.confirmDivider,
                          { marginLeft: 48, marginTop: 10 },
                        ]}
                      />
                    )}
                  </View>
                ))}
              </Animated.View>
              <Animated.View
                entering={FadeInDown.delay(440).springify()}
                style={styles.qrWrap}
              >
                <View style={styles.qrBox}>
                  <Ionicons name="qr-code-outline" size={68} color="#FAFAFA" />
                </View>
                <Text style={styles.qrText}>SHOW AT RECEPTION</Text>
              </Animated.View>
            </View>
            <Pressable style={styles.closeBtn} onPress={handleClose}>
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </Animated.View>
        </>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  headerCenter: { alignItems: "center", gap: 3 },
  headerEye: {
    fontSize: 9,
    fontWeight: "700",
    color: TEXT_M,
    letterSpacing: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_W,
    letterSpacing: -0.3,
  },

  section: { gap: 14, marginBottom: 28, paddingHorizontal: 20 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: TEXT_M,
    letterSpacing: 2.5,
  },
  serviceRow: { gap: 10 },
  serviceCard: {
    width: 130,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    gap: 4,
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  serviceCardActive: {
    backgroundColor: "#18181B0F",
    borderColor: "#18181B55",
  },
  serviceIcon: { fontSize: 22, marginBottom: 4 },
  serviceName: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_S,
    lineHeight: 17,
  },
  serviceDur: { fontSize: 10, fontWeight: "500", color: TEXT_M },
  servicePrice: {
    fontSize: 16,
    fontWeight: "800",
    color: TEXT_S,
    marginTop: 4,
  },

  stylistRow: { gap: 12 },
  stylistCard: {
    width: 130,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 5,
    position: "relative",
  },
  stylistAvatarWrap: {
    position: "relative",
    width: RING_SZ + 4,
    height: RING_SZ + 4,
  },
  availRingWrap: { position: "absolute", top: 0, left: 0 },
  stylistAvatar: {
    position: "absolute",
    top: (RING_SZ - AVATAR_SZ / 1.4) / 2,
    left: (RING_SZ - AVATAR_SZ / 1.4) / 2,
    width: AVATAR_SZ / 1.4,
    height: AVATAR_SZ / 1.4,
    borderRadius: AVATAR_SZ / 2.8,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  stylistInitials: { fontSize: 14, fontWeight: "800" },
  slotBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: "#FAFAFA",
    zIndex: 3,
  },
  slotNum: { fontSize: 9, fontWeight: "800" },
  stylistName: {
    fontSize: 12,
    fontWeight: "800",
    color: TEXT_W,
    textAlign: "center",
  },
  stylistRole: {
    fontSize: 9,
    fontWeight: "600",
    color: TEXT_M,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  stylistMeta: { flexDirection: "row", alignItems: "center", gap: 3 },
  stylistRating: { fontSize: 10, fontWeight: "700", color: GOLD },
  stylistDot: { fontSize: 10, color: TEXT_M },
  stylistExp: { fontSize: 10, fontWeight: "500", color: TEXT_M },
  selectedTick: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  calRow: { gap: 8 },
  dayCard: {
    width: 52,
    height: 70,
    borderRadius: 14,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  dayCardActive: { backgroundColor: "#18181B", borderColor: "#18181B" },
  dayCardBlocked: { opacity: 0.32 },
  dayName: {
    fontSize: 10,
    fontWeight: "700",
    color: TEXT_M,
    letterSpacing: 0.5,
  },
  dayNum: { fontSize: 18, fontWeight: "800", color: TEXT_S },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: ACCENT },
  closedText: { fontSize: 10, color: TEXT_M },
  timesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: BORDER,
    backgroundColor: CARD,
  },
  timeChipActive: { backgroundColor: "#18181B12", borderColor: "#18181BAA" },
  timeChipBlocked: { opacity: 0.26, backgroundColor: SURFACE },
  timeChipText: { fontSize: 12, fontWeight: "700", color: TEXT_S },
  timeChipTextAct: { color: "#18181B" },
  timeChipTextBlk: { color: TEXT_M },

  timesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timesDay: { fontSize: 11, fontWeight: "600", color: TEXT_S },
  bookBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.08)",
    backgroundColor: "rgba(250,250,250,0.96)",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  bookSummary: { flex: 1, gap: 2 },
  bookSummaryService: { fontSize: 13, fontWeight: "700", color: TEXT_W },
  bookSummaryMeta: { fontSize: 11, fontWeight: "500", color: TEXT_S },
  bookBtn: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookBtnGrad: { paddingHorizontal: 24, paddingVertical: 16 },
  bookBtnText: { fontSize: 14, fontWeight: "800", color: "#FFFFFF" },
  bookBtnDim: { opacity: 0.38 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.40)",
    zIndex: 10,
  },
  confirmSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 11,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 25,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignSelf: "center",
    marginTop: 12,
  },
  confirmContent: { padding: 24, gap: 20 },
  confirmTopRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  confirmCheck: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#16A34A18",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#16A34A44",
  },
  confirmTitle: { fontSize: 22, fontWeight: "800", color: "#0A0A0A" },
  confirmSub: { fontSize: 13, fontWeight: "500", color: TEXT_S, marginTop: 3 },
  confirmCard: {
    backgroundColor: "#F4F4F5",
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: BORDER,
    gap: 12,
  },
  confirmRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  confirmIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: ACCENT + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmRowLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: TEXT_M,
    letterSpacing: 1.5,
  },
  confirmRowValue: { fontSize: 14, fontWeight: "700", color: TEXT_W },
  confirmDivider: { height: 0.5, backgroundColor: BORDER },
  qrWrap: { alignItems: "center", gap: 10, paddingVertical: 8 },
  qrBox: {
    width: 90,
    height: 90,
    backgroundColor: "#18181B",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  qrText: { fontSize: 9, fontWeight: "600", color: TEXT_M, letterSpacing: 1 },
  closeBtn: {
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: BORDER,
    paddingVertical: 15,
    alignItems: "center",
  },
  closeBtnText: { fontSize: 14, fontWeight: "700", color: TEXT_S },
});