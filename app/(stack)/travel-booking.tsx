import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeInUp,
  Layout,
} from "react-native-reanimated";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#1A56FF";
const BG = "#F4F6FB";
const CARD = "#FFFFFF";
const TEXT_PRIMARY = "#0B0F1A";
const TEXT_SECONDARY = "#8891A5";
const BORDER = "#E8ECF4";

type TravelMode = "flight" | "bus" | "train";
type TripType = "one-way" | "round-trip";
type SortType = "best" | "cheapest" | "fastest";

interface Result {
  id: string;
  operator: string;
  operatorCode: string;
  operatorColor: string;
  depTime: string;
  arrTime: string;
  depCode: string;
  arrCode: string;
  duration: string;
  stops: number;
  stopCity?: string;
  price: number;
  seatsLeft?: number;
  tag?: string;
  mode: TravelMode;
  isNonstop: boolean;
  isMorning: boolean;
  isRefundable: boolean;
}

const ALL_RESULTS: Result[] = [
  {
    id: "f1", mode: "flight", operator: "Delta Air Lines", operatorCode: "DL",
    operatorColor: "#E31837", depTime: "06:20", arrTime: "09:05",
    depCode: "JFK", arrCode: "LAX", duration: "5h 45m",
    stops: 0, price: 189, tag: "Best value",
    isNonstop: true, isMorning: true, isRefundable: false,
  },
  {
    id: "f2", mode: "flight", operator: "United Airlines", operatorCode: "UA",
    operatorColor: "#1B4F9A", depTime: "10:15", arrTime: "14:40",
    depCode: "JFK", arrCode: "LAX", duration: "7h 25m",
    stops: 1, stopCity: "ORD", price: 134, seatsLeft: 3,
    isNonstop: false, isMorning: false, isRefundable: false,
  },
  {
    id: "f3", mode: "flight", operator: "American Airlines", operatorCode: "AA",
    operatorColor: "#0078D2", depTime: "14:50", arrTime: "18:30",
    depCode: "JFK", arrCode: "LAX", duration: "5h 40m",
    stops: 0, price: 212, isRefundable: true,
    isNonstop: true, isMorning: false,
  },
  {
    id: "f4", mode: "flight", operator: "JetBlue Airways", operatorCode: "B6",
    operatorColor: "#003876", depTime: "08:00", arrTime: "11:30",
    depCode: "JFK", arrCode: "LAX", duration: "5h 30m",
    stops: 0, price: 165, isRefundable: true, tag: "Cheapest",
    isNonstop: true, isMorning: true,
  },
  {
    id: "b1", mode: "bus", operator: "Greyhound", operatorCode: "GH",
    operatorColor: "#E2231A", depTime: "07:00", arrTime: "09:30",
    depCode: "NYC", arrCode: "PHI", duration: "2h 30m",
    stops: 0, price: 29, tag: "Best value", isRefundable: true,
    isNonstop: true, isMorning: true,
  },
  {
    id: "b2", mode: "bus", operator: "FlixBus", operatorCode: "FX",
    operatorColor: "#73D700", depTime: "09:45", arrTime: "12:45",
    depCode: "NYC", arrCode: "PHI", duration: "3h 00m",
    stops: 1, stopCity: "NWK", price: 19, seatsLeft: 5,
    isNonstop: false, isMorning: false, isRefundable: false,
  },
  {
    id: "b3", mode: "bus", operator: "BoltBus", operatorCode: "BB",
    operatorColor: "#FF6B00", depTime: "14:00", arrTime: "16:15",
    depCode: "NYC", arrCode: "PHI", duration: "2h 15m",
    stops: 0, price: 24, isRefundable: false,
    isNonstop: true, isMorning: false,
  },
  {
    id: "t1", mode: "train", operator: "Amtrak Acela", operatorCode: "AC",
    operatorColor: "#215BB5", depTime: "06:05", arrTime: "09:42",
    depCode: "NYP", arrCode: "WAS", duration: "3h 37m",
    stops: 0, price: 89, tag: "Best value", isRefundable: true,
    isNonstop: true, isMorning: true,
  },
  {
    id: "t2", mode: "train", operator: "Amtrak Northeast", operatorCode: "NE",
    operatorColor: "#215BB5", depTime: "08:25", arrTime: "12:55",
    depCode: "NYP", arrCode: "WAS", duration: "4h 30m",
    stops: 2, stopCity: "PHL", price: 54, seatsLeft: 8,
    isNonstop: false, isMorning: true, isRefundable: false,
  },
  {
    id: "t3", mode: "train", operator: "Amtrak Regional", operatorCode: "AR",
    operatorColor: "#215BB5", depTime: "13:10", arrTime: "17:45",
    depCode: "NYP", arrCode: "WAS", duration: "4h 35m",
    stops: 1, stopCity: "BAL", price: 44, isRefundable: true, tag: "Cheapest",
    isNonstop: false, isMorning: false,
  },
];

const MODE_CONFIG: Record<TravelMode, {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  from: string; to: string;
  fromCode: string; toCode: string;
  searchLabel: string;
}> = {
  flight: {
    label: "Flights", icon: "airplane-outline",
    from: "New York", to: "Los Angeles", fromCode: "JFK", toCode: "LAX",
    searchLabel: "Search Flights",
  },
  bus: {
    label: "Buses", icon: "bus-outline",
    from: "New York", to: "Philadelphia", fromCode: "NYC", toCode: "PHI",
    searchLabel: "Search Buses",
  },
  train: {
    label: "Trains", icon: "train-outline",
    from: "New York Penn", to: "Washington DC", fromCode: "NYP", toCode: "WAS",
    searchLabel: "Search Trains",
  },
};

const FILTERS = ["Nonstop", "Morning", "Under $100", "Refundable"] as const;
type FilterType = typeof FILTERS[number];

export default function BookingScreen() {
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<TravelMode>("flight");
  const [tripType, setTripType] = useState<TripType>("one-way");
  const [sort, setSort] = useState<SortType>("best");
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSwapped, setIsSwapped] = useState(false);

  const swapAnim = useSharedValue(0);
  const swapStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swapAnim.value}deg` }],
  }));

  const cfg = MODE_CONFIG[mode];
  const fromCity = isSwapped ? cfg.to : cfg.from;
  const toCity = isSwapped ? cfg.from : cfg.to;
  const fromCode = isSwapped ? cfg.toCode : cfg.fromCode;
  const toCode = isSwapped ? cfg.fromCode : cfg.toCode;

  const handleSwap = () => {
    swapAnim.value = withSpring(swapAnim.value + 180, { damping: 14, stiffness: 200 });
    setIsSwapped((s) => !s);
    setSelectedId(null);
  };

  const handleModeChange = (m: TravelMode) => {
    setMode(m);
    setIsSwapped(false);
    setActiveFilters(new Set());
    setSelectedId(null);
    setSort("best");
  };

  const toggleFilter = (f: FilterType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
    setSelectedId(null);
  };

  const results = useMemo(() => {
    let list = ALL_RESULTS.filter((r) => r.mode === mode);

    if (activeFilters.has("Nonstop")) list = list.filter((r) => r.isNonstop);
    if (activeFilters.has("Morning")) list = list.filter((r) => r.isMorning);
    if (activeFilters.has("Under $100")) list = list.filter((r) => r.price < 100);
    if (activeFilters.has("Refundable")) list = list.filter((r) => r.isRefundable);

    return [...list].sort((a, b) => {
      if (sort === "cheapest") return a.price - b.price;
      if (sort === "fastest") {
        const toMins = (d: string) => {
          const [h, m] = d.replace("h", "").replace("m", "").trim().split(" ");
          return parseInt(h) * 60 + parseInt(m);
        };
        return toMins(a.duration) - toMins(b.duration);
      }
      return (a.tag ? -1 : 1) - (b.tag ? -1 : 1);
    });
  }, [mode, activeFilters, sort]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.topBarLabel}>Your trip</Text>
            <Text style={styles.topBarTitle}>Book Travel</Text>
          </View>
          <Pressable style={styles.profileBtn}>
            <Text style={styles.profileInitial}>AN</Text>
          </Pressable>
        </View>

        <View style={styles.modeRow}>
          {(["flight", "bus", "train"] as TravelMode[]).map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                style={[styles.modeBtn, active && styles.modeBtnActive]}
                onPress={() => handleModeChange(m)}
              >
                <Ionicons
                  name={MODE_CONFIG[m].icon}
                  size={16}
                  color={active ? ACCENT : TEXT_SECONDARY}
                />
                <Text style={[styles.modeBtnText, active && styles.modeBtnTextActive]}>
                  {MODE_CONFIG[m].label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.tripToggle}>
          {(["one-way", "round-trip"] as TripType[]).map((t) => (
            <Pressable
              key={t}
              style={[styles.toggleBtn, tripType === t && styles.toggleActive]}
              onPress={() => setTripType(t)}
            >
              <Text style={[styles.toggleText, tripType === t && styles.toggleTextActive]}>
                {t === "one-way" ? "One Way" : "Round Trip"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.searchCard}>
          <Pressable style={styles.airportRow}>
            <View style={styles.airportIconWrap}>
              <Ionicons name="airplane-outline" size={16} color={ACCENT} />
            </View>
            <View style={styles.airportInfo}>
              <Text style={styles.airportLabel}>From</Text>
              <Text style={styles.airportCity}>{fromCity}</Text>
            </View>
            <Text style={styles.airportCode}>{fromCode}</Text>
          </Pressable>

          <View style={styles.separatorRow}>
            <View style={styles.separatorLine} />
            <Pressable style={styles.swapBtn} onPress={handleSwap}>
              <Animated.View style={swapStyle}>
                <Ionicons name="swap-vertical" size={16} color={ACCENT} />
              </Animated.View>
            </Pressable>
            <View style={styles.separatorLine} />
          </View>

          <Pressable style={styles.airportRow}>
            <View style={styles.airportIconWrap}>
              <Ionicons name="location-outline" size={16} color={TEXT_SECONDARY} />
            </View>
            <View style={styles.airportInfo}>
              <Text style={styles.airportLabel}>To</Text>
              <Text style={styles.airportCity}>{toCity}</Text>
            </View>
            <Text style={styles.airportCode}>{toCode}</Text>
          </Pressable>

          <View style={styles.cardDivider} />

          <View style={styles.detailsRow}>
            <Pressable style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={15} color={TEXT_SECONDARY} />
              <View>
                <Text style={styles.detailLabel}>Departure</Text>
                <Text style={styles.detailValue}>Mon, 24 Mar</Text>
              </View>
            </Pressable>
            <View style={styles.detailDivider} />
            <Pressable style={styles.detailItem}>
              <Ionicons name="people-outline" size={15} color={TEXT_SECONDARY} />
              <View>
                <Text style={styles.detailLabel}>Passengers</Text>
                <Text style={styles.detailValue}>1 Adult</Text>
              </View>
            </Pressable>
            <View style={styles.detailDivider} />
            <Pressable style={styles.detailItem}>
              <MaterialCommunityIcons name="seat-outline" size={15} color={TEXT_SECONDARY} />
              <View>
                <Text style={styles.detailLabel}>Class</Text>
                <Text style={styles.detailValue}>Economy</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.searchBtn}>
          <Ionicons name={MODE_CONFIG[mode].icon} size={18} color="#fff" />
          <Text style={styles.searchBtnText}>{cfg.searchLabel}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>

        <View style={styles.resultsHeader}>
          <View>
            <Text style={styles.resultsTitle}>Available {cfg.label}</Text>
            <Text style={styles.resultsCount}>
              {results.length} result{results.length !== 1 ? "s" : ""} · {fromCode} → {toCode}
            </Text>
          </View>
          <Pressable
            style={styles.filterIconBtn}
            onPress={() => {
              setActiveFilters(new Set());
              setSort("best");
            }}
          >
            <Ionicons name="refresh-outline" size={16} color={TEXT_PRIMARY} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {FILTERS.map((f) => {
            const on = activeFilters.has(f);
            return (
              <Pressable
                key={f}
                style={[styles.filterChip, on && styles.filterChipActive]}
                onPress={() => toggleFilter(f)}
              >
                {on && (
                  <Ionicons name="checkmark" size={12} color={ACCENT} style={{ marginRight: 4 }} />
                )}
                <Text style={[styles.filterChipText, on && styles.filterChipTextActive]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sortRow}>
          {(["best", "cheapest", "fastest"] as SortType[]).map((s) => (
            <Pressable
              key={s}
              style={[styles.sortBtn, sort === s && styles.sortBtnActive]}
              onPress={() => setSort(s)}
            >
              <Text style={[styles.sortBtnText, sort === s && styles.sortBtnTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {results.length === 0 && (
          <Animated.View entering={FadeInDown.springify()} style={styles.emptyState}>
            <Ionicons name="search-outline" size={36} color={TEXT_SECONDARY} />
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptySubtitle}>Try removing some filters</Text>
          </Animated.View>
        )}

        {results.map((item, index) => {
          const isSelected = selectedId === item.id;
          return (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(index * 60).springify()}
              layout={Layout.springify()}
            >
              <Pressable
                style={[styles.resultCard, isSelected && styles.resultCardSelected]}
                onPress={() => setSelectedId(isSelected ? null : item.id)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.operatorRow}>
                    <View style={[styles.operatorBadge, { backgroundColor: item.operatorColor + "18" }]}>
                      <Text style={[styles.operatorCode, { color: item.operatorColor }]}>
                        {item.operatorCode}
                      </Text>
                    </View>
                    <Text style={styles.operatorName} numberOfLines={1}>{item.operator}</Text>
                    {item.tag && (
                      <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>{item.tag}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.price}>${item.price}</Text>
                </View>

                <View style={styles.timeline}>
                  <View style={styles.timeBlock}>
                    <Text style={styles.time}>{item.depTime}</Text>
                    <Text style={styles.code}>{item.depCode}</Text>
                  </View>

                  <View style={styles.timelineMiddle}>
                    <Text style={styles.duration}>{item.duration}</Text>
                    <View style={styles.timelineLine}>
                      <View style={styles.dot} />
                      <View style={styles.dash} />
                      {item.stops > 0 && <View style={styles.stopDot} />}
                      {item.stops > 0 && <View style={styles.dash} />}
                      <Ionicons
                        name={MODE_CONFIG[item.mode].icon}
                        size={13}
                        color={TEXT_SECONDARY}
                      />
                    </View>
                    <Text style={styles.stopsLabel}>
                      {item.stops === 0 ? "Direct" : `${item.stops} stop · ${item.stopCity}`}
                    </Text>
                  </View>

                  <View style={[styles.timeBlock, { alignItems: "flex-end" }]}>
                    <Text style={styles.time}>{item.arrTime}</Text>
                    <Text style={styles.code}>{item.arrCode}</Text>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <View style={styles.metaRow}>
                    {item.isRefundable && (
                      <View style={styles.metaChip}>
                        <Ionicons name="shield-checkmark-outline" size={11} color="#059669" />
                        <Text style={[styles.metaChipText, { color: "#059669" }]}>Refundable</Text>
                      </View>
                    )}
                    {item.seatsLeft && (
                      <View style={styles.metaChip}>
                        <Ionicons name="alert-circle-outline" size={11} color="#F59E0B" />
                        <Text style={[styles.metaChipText, { color: "#F59E0B" }]}>
                          {item.seatsLeft} left
                        </Text>
                      </View>
                    )}
                  </View>

                  {isSelected && (
                    <Animated.View entering={FadeInUp.springify()} style={styles.selectBtn}>
                      <Text style={styles.selectBtnText}>Select →</Text>
                    </Animated.View>
                  )}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 20 },

  topBar: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingTop: 16, marginBottom: 20,
  },
  topBarLabel: {
    fontSize: 12, color: TEXT_SECONDARY, fontWeight: "500",
    letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 2,
  },
  topBarTitle: { fontSize: 26, fontWeight: "700", color: TEXT_PRIMARY, letterSpacing: -0.4 },
  profileBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: ACCENT, alignItems: "center", justifyContent: "center",
  },
  profileInitial: { fontSize: 13, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },

  modeRow: {
    flexDirection: "row", backgroundColor: CARD,
    borderRadius: 16, padding: 4, marginBottom: 14,
    borderWidth: 1, borderColor: BORDER,
    gap: 4,
  },
  modeBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6, paddingVertical: 10,
    borderRadius: 12,
  },
  modeBtnActive: { backgroundColor: ACCENT + "12" },
  modeBtnText: { fontSize: 13, fontWeight: "600", color: TEXT_SECONDARY },
  modeBtnTextActive: { color: ACCENT },

  tripToggle: {
    flexDirection: "row", backgroundColor: "#E8ECF4",
    borderRadius: 12, padding: 3, marginBottom: 16, alignSelf: "flex-start",
  },
  toggleBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  toggleActive: {
    backgroundColor: CARD,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  toggleText: { fontSize: 13, fontWeight: "600", color: TEXT_SECONDARY },
  toggleTextActive: { color: TEXT_PRIMARY },

  searchCard: {
    backgroundColor: CARD, borderRadius: 20, padding: 4,
    marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.06,
    shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  airportRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  airportIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: BG, alignItems: "center", justifyContent: "center",
  },
  airportInfo: { flex: 1 },
  airportLabel: { fontSize: 11, color: TEXT_SECONDARY, fontWeight: "500", marginBottom: 2 },
  airportCity: { fontSize: 16, fontWeight: "600", color: TEXT_PRIMARY },
  airportCode: { fontSize: 15, fontWeight: "700", color: TEXT_SECONDARY, letterSpacing: 1 },

  separatorRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, gap: 10,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: BORDER },
  swapBtn: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1.5, borderColor: BORDER, backgroundColor: CARD,
    alignItems: "center", justifyContent: "center",
  },

  cardDivider: {
    height: 1, backgroundColor: BORDER,
    marginHorizontal: 16, marginVertical: 4,
  },
  detailsRow: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 10 },
  detailItem: {
    flex: 1, flexDirection: "row", alignItems: "center",
    gap: 8, paddingHorizontal: 4,
  },
  detailLabel: { fontSize: 10, color: TEXT_SECONDARY, fontWeight: "500", marginBottom: 1 },
  detailValue: { fontSize: 13, fontWeight: "600", color: TEXT_PRIMARY },
  detailDivider: { width: 1, height: 28, backgroundColor: BORDER },

  searchBtn: {
    backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 17,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginBottom: 28,
    shadowColor: ACCENT, shadowOpacity: 0.35, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  searchBtnText: { fontSize: 16, fontWeight: "700", color: "#fff", letterSpacing: 0.2 },

  resultsHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 14,
  },
  resultsTitle: { fontSize: 18, fontWeight: "700", color: TEXT_PRIMARY, letterSpacing: -0.3, marginBottom: 2 },
  resultsCount: { fontSize: 12, color: TEXT_SECONDARY, fontWeight: "500" },
  filterIconBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: CARD,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: BORDER,
  },

  filtersScroll: { gap: 8, marginBottom: 14, paddingRight: 4 },
  filterChip: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: CARD,
    borderWidth: 1, borderColor: BORDER,
  },
  filterChipActive: { backgroundColor: ACCENT + "12", borderColor: ACCENT },
  filterChipText: { fontSize: 13, fontWeight: "500", color: TEXT_SECONDARY },
  filterChipTextActive: { color: ACCENT, fontWeight: "600" },

  sortRow: {
    flexDirection: "row", backgroundColor: CARD,
    borderRadius: 12, padding: 3, marginBottom: 16,
    borderWidth: 1, borderColor: BORDER,
  },
  sortBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 10 },
  sortBtnActive: { backgroundColor: BG },
  sortBtnText: { fontSize: 13, fontWeight: "500", color: TEXT_SECONDARY },
  sortBtnTextActive: { color: TEXT_PRIMARY, fontWeight: "700" },

  emptyState: {
    alignItems: "center", paddingVertical: 48, gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: TEXT_PRIMARY },
  emptySubtitle: { fontSize: 13, color: TEXT_SECONDARY },

  resultCard: {
    backgroundColor: CARD, borderRadius: 18, padding: 16,
    marginBottom: 12, borderWidth: 1.5, borderColor: BORDER,
    shadowColor: "#000", shadowOpacity: 0.04,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  resultCardSelected: {
    borderColor: ACCENT,
    shadowColor: ACCENT, shadowOpacity: 0.14, shadowRadius: 14,
  },

  cardTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  operatorRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  operatorBadge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7 },
  operatorCode: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  operatorName: { fontSize: 13, fontWeight: "500", color: TEXT_SECONDARY, flex: 1 },
  tagBadge: { backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: "700", color: "#059669", letterSpacing: 0.3 },
  price: { fontSize: 22, fontWeight: "800", color: TEXT_PRIMARY, letterSpacing: -0.5 },

  timeline: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginBottom: 14, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  timeBlock: { alignItems: "flex-start" },
  time: { fontSize: 22, fontWeight: "700", color: TEXT_PRIMARY, letterSpacing: -0.5, lineHeight: 26 },
  code: { fontSize: 12, fontWeight: "600", color: TEXT_SECONDARY, letterSpacing: 0.5, marginTop: 2 },
  timelineMiddle: { flex: 1, alignItems: "center", gap: 4 },
  duration: { fontSize: 11, color: TEXT_SECONDARY, fontWeight: "600" },
  timelineLine: { flexDirection: "row", alignItems: "center", width: "100%", gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: TEXT_SECONDARY },
  dash: { flex: 1, height: 1.5, backgroundColor: BORDER },
  stopDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: "#F59E0B", borderWidth: 1.5, borderColor: "#fff",
  },
  stopsLabel: { fontSize: 11, color: TEXT_SECONDARY, fontWeight: "500" },

  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metaRow: { flexDirection: "row", gap: 8, flex: 1 },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaChipText: { fontSize: 11, fontWeight: "600" },
  selectBtn: {
    backgroundColor: ACCENT, paddingHorizontal: 16,
    paddingVertical: 7, borderRadius: 10,
  },
  selectBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});