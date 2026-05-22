import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Rect,
  RoundedRect,
} from '@shopify/react-native-skia';
import {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';

const { width: SW } = Dimensions.get('window');

const FLOOR_W = SW - 40;
const FLOOR_H = 280;

const BG = '#0E0C18';
const SURFACE = '#1A1626';
const CARD = '#231D38';
const BORDER = '#332B4A';
const TEXT_W = '#FAF8F0';
const TEXT_S = '#B8AEC2';
const TEXT_M = '#7C7290';
const ACCENT = '#D4A574';
const ACCENT_LT = '#E5BB91';
const ACCENT_DK = '#8B6843';
const GREEN = '#34D399';
const RED = '#F87171';
const AMBER = '#FCD34D';
const ROSE = '#FB7185';
const TEAL = '#2DD4BF';

type TableStatus = 'available' | 'selected' | 'reserved' | 'occupied';

type Table = {
  id: string;
  x: number;
  y: number;
  seats: number;
  shape: 'round' | 'square' | 'long';
  status: TableStatus;
};

const TABLES: Table[] = [
  {
    id: 'T01',
    x: 0.18,
    y: 0.22,
    seats: 2,
    shape: 'round',
    status: 'available',
  },
  { id: 'T02', x: 0.5, y: 0.22, seats: 4, shape: 'square', status: 'occupied' },
  {
    id: 'T03',
    x: 0.82,
    y: 0.22,
    seats: 2,
    shape: 'round',
    status: 'available',
  },
  { id: 'T04', x: 0.18, y: 0.5, seats: 4, shape: 'square', status: 'selected' },
  { id: 'T05', x: 0.5, y: 0.5, seats: 6, shape: 'long', status: 'reserved' },
  { id: 'T06', x: 0.82, y: 0.5, seats: 2, shape: 'round', status: 'available' },
  { id: 'T07', x: 0.3, y: 0.78, seats: 8, shape: 'long', status: 'available' },
  {
    id: 'T08',
    x: 0.75,
    y: 0.78,
    seats: 4,
    shape: 'square',
    status: 'occupied',
  },
];

const TIMES = ['6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00', '9:30'];
const PARTY_SIZES = [2, 3, 4, 5, 6, 8];

function TableShape({ table, pulse }: { table: Table; pulse: any }) {
  const config = {
    available: { color: GREEN, glow: 0.0 },
    selected: { color: ACCENT, glow: 0.8 },
    reserved: { color: AMBER, glow: 0.0 },
    occupied: { color: RED, glow: 0.0 },
  }[table.status];

  const x = table.x * FLOOR_W;
  const y = table.y * FLOOR_H;
  const size = table.shape === 'long' ? 60 : 38;
  const height = table.shape === 'long' ? 28 : 38;

  const glowOpacity = useDerivedValue(() => {
    if (table.status !== 'selected') return 0;
    return 0.5 + Math.sin(pulse.value * Math.PI * 2) * 0.3;
  });

  if (table.shape === 'round') {
    return (
      <Group>
        <Circle cx={x} cy={y} r={28} color={config.color} opacity={glowOpacity}>
          <BlurMask blur={16} style="solid" />
        </Circle>
        <Circle
          cx={x}
          cy={y}
          r={18}
          color={config.color}
          opacity={table.status === 'occupied' ? 0.4 : 1}
        />
        <Circle
          cx={x}
          cy={y}
          r={14}
          color={config.color}
          opacity={table.status === 'occupied' ? 0.6 : 0.5}
        />
        <Circle cx={x} cy={y} r={10} color="#FFF" opacity={0.15} />
      </Group>
    );
  }

  if (table.shape === 'long') {
    return (
      <Group>
        <RoundedRect
          x={x - size / 2}
          y={y - height / 2}
          width={size}
          height={height}
          r={6}
          color={config.color}
          opacity={glowOpacity}
        >
          <BlurMask blur={14} style="solid" />
        </RoundedRect>
        <RoundedRect
          x={x - size / 2}
          y={y - height / 2}
          width={size}
          height={height}
          r={6}
          color={config.color}
          opacity={table.status === 'occupied' ? 0.4 : 1}
        />
        <RoundedRect
          x={x - size / 2 + 4}
          y={y - height / 2 + 4}
          width={size - 8}
          height={height - 8}
          r={4}
          color={config.color}
          opacity={table.status === 'occupied' ? 0.6 : 0.5}
        />
      </Group>
    );
  }

  return (
    <Group>
      <RoundedRect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        r={6}
        color={config.color}
        opacity={glowOpacity}
      >
        <BlurMask blur={14} style="solid" />
      </RoundedRect>
      <RoundedRect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        r={6}
        color={config.color}
        opacity={table.status === 'occupied' ? 0.4 : 1}
      />
      <RoundedRect
        x={x - size / 2 + 4}
        y={y - size / 2 + 4}
        width={size - 8}
        height={size - 8}
        r={4}
        color={config.color}
        opacity={table.status === 'occupied' ? 0.6 : 0.5}
      />
    </Group>
  );
}

function FloorPlan({ pulse }: { pulse: any }) {
  return (
    <Canvas style={{ width: FLOOR_W, height: FLOOR_H }}>
      <Rect
        x={20}
        y={20}
        width={FLOOR_W - 40}
        height={FLOOR_H - 40}
        color="transparent"
      />
      <RoundedRect
        x={FLOOR_W * 0.7}
        y={20}
        width={FLOOR_W * 0.25}
        height={32}
        r={4}
        color={ACCENT_DK}
        opacity={0.5}
      />
      <RoundedRect
        x={20}
        y={FLOOR_H * 0.42}
        width={6}
        height={FLOOR_H * 0.16}
        r={3}
        color={ACCENT_DK}
        opacity={0.7}
      />
      <RoundedRect
        x={FLOOR_W - 26}
        y={FLOOR_H * 0.42}
        width={6}
        height={FLOOR_H * 0.16}
        r={3}
        color={ACCENT_DK}
        opacity={0.7}
      />
      {TABLES.map(t => (
        <TableShape key={t.id} table={t} pulse={pulse} />
      ))}
    </Canvas>
  );
}

function TableLabel({ table }: { table: Table }) {
  return (
    <View
      style={[
        styles.tableLabel,
        {
          left: table.x * FLOOR_W - 14,
          top: table.y * FLOOR_H + 22,
        },
      ]}
    >
      <Text style={styles.tableLabelText}>{table.id}</Text>
    </View>
  );
}

export default function RestaurantBookingScreen() {
  const [time, setTime] = useState('7:30');
  const [party, setParty] = useState(4);
  const [selectedTable, setSelectedTable] = useState('T04');

  const pulse = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      -1,
      false,
    );
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1A1626', BG, '#000']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.topBar}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={TEXT_W} />
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.brand}>RESERVE</Text>
            <Text style={styles.brandSub}>Live availability</Text>
          </View>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="heart-outline" size={20} color={TEXT_W} />
          </Pressable>
        </View>

        <View style={styles.restCard}>
          <View style={styles.restImage}>
            <LinearGradient
              colors={[ACCENT_DK, '#1F1A28']}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Canvas style={{ position: 'absolute', width: 80, height: 80 }}>
              <Circle cx={40} cy={28} r={20} color={ACCENT_LT} opacity={0.6}>
                <BlurMask blur={10} style="solid" />
              </Circle>
            </Canvas>
            <Text style={styles.restEmoji}>🍝</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.restNameRow}>
              <Text style={styles.restName}>Sumo Chef</Text>
              <View style={styles.michelinBadge}>
                <Text style={styles.michelinText}>★ ★</Text>
              </View>
            </View>
            <Text style={styles.restCuisine}>
              Modern Japanese · Italian fusion
            </Text>
            <View style={styles.restMeta}>
              <View style={styles.restMetaItem}>
                <Ionicons name="star" size={11} color={AMBER} />
                <Text style={styles.restMetaText}>4.8</Text>
                <Text style={styles.restMetaSub}>(2.1K)</Text>
              </View>
              <View style={styles.restMetaItem}>
                <Ionicons name="location" size={11} color={TEXT_S} />
                <Text style={styles.restMetaText}>Clifton</Text>
              </View>
              <View style={styles.restMetaItem}>
                <Text style={[styles.restMetaText, { color: GREEN }]}>$$$</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.dateRow}>
          {[
            { day: 'FRI', date: '2', enabled: true, full: false },
            { day: 'SAT', date: '3', enabled: true, full: false, active: true },
            { day: 'SUN', date: '4', enabled: true, full: true },
            { day: 'MON', date: '5', enabled: true, full: false },
            { day: 'TUE', date: '6', enabled: true, full: false },
            { day: 'WED', date: '7', enabled: true, full: false },
          ].map((d, i) => (
            <Pressable
              key={i}
              style={[
                styles.dateChip,
                d.active && styles.dateChipActive,
                d.full && styles.dateChipFull,
              ]}
            >
              <Text style={[styles.dateDay, d.active && { color: BG }]}>
                {d.day}
              </Text>
              <Text style={[styles.dateNum, d.active && { color: BG }]}>
                {d.date}
              </Text>
              {d.full && <Text style={styles.dateFullText}>FULL</Text>}
            </Pressable>
          ))}
        </View>

        <View style={styles.floorCard}>
          <View style={styles.floorHead}>
            <Text style={styles.floorTitle}>Floor Plan · Main Hall</Text>
            <View style={styles.floorZoomGroup}>
              <Pressable style={styles.floorZoomBtn}>
                <Ionicons name="add" size={12} color={TEXT_W} />
              </Pressable>
              <Pressable style={styles.floorZoomBtn}>
                <Ionicons name="remove" size={12} color={TEXT_W} />
              </Pressable>
            </View>
          </View>
          <View style={styles.floorFrame}>
            <FloorPlan pulse={pulse} />
            {TABLES.map(t => (
              <TableLabel key={t.id} table={t} />
            ))}
            <View style={styles.floorBadge}>
              <Ionicons name="restaurant-outline" size={9} color={ACCENT} />
              <Text style={styles.floorBadgeText}>BAR & KITCHEN</Text>
            </View>
            <View style={styles.entryBadge}>
              <Ionicons name="enter-outline" size={9} color={TEXT_S} />
              <Text style={styles.entryBadgeText}>ENTRY</Text>
            </View>
          </View>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: GREEN }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ACCENT }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: AMBER }]} />
            <Text style={styles.legendText}>Reserved</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: RED, opacity: 0.6 }]}
            />
            <Text style={styles.legendText}>Occupied</Text>
          </View>
        </View>

        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>PARTY SIZE</Text>
          <View style={styles.partyRow}>
            {PARTY_SIZES.map(p => (
              <Pressable
                key={p}
                onPress={() => setParty(p)}
                style={[
                  styles.partyChip,
                  party === p && styles.partyChipActive,
                ]}
              >
                <Ionicons
                  name="person"
                  size={11}
                  color={party === p ? BG : TEXT_S}
                />
                <Text
                  style={[
                    styles.partyText,
                    party === p && { color: BG, fontWeight: '900' },
                  ]}
                >
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>AVAILABLE TIMES</Text>
          <View style={styles.timesGrid}>
            {TIMES.map((t, i) => {
              const isFull = t === '7:00' || t === '8:00';
              return (
                <Pressable
                  key={t}
                  onPress={() => !isFull && setTime(t)}
                  style={[
                    styles.timeChip,
                    time === t && styles.timeChipActive,
                    isFull && styles.timeChipDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeText,
                      time === t && { color: BG },
                      isFull && { color: TEXT_M },
                    ]}
                  >
                    {t}
                  </Text>
                  <Text
                    style={[
                      styles.timeAmPm,
                      time === t && { color: BG },
                      isFull && { color: TEXT_M },
                    ]}
                  >
                    PM
                  </Text>
                  {isFull && (
                    <View style={styles.timeFullPill}>
                      <Text style={styles.timeFullPillText}>FULL</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHead}>
            <View style={styles.summaryStatus}>
              <Ionicons name="checkmark-circle" size={11} color={GREEN} />
              <Text style={styles.summaryStatusText}>YOUR SELECTION</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLbl}>TABLE</Text>
              <Text style={[styles.summaryVal, { color: ACCENT_LT }]}>
                {selectedTable}
              </Text>
            </View>
            <View style={styles.summaryDiv} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLbl}>DATE</Text>
              <Text style={styles.summaryVal}>SAT · MAY 3</Text>
            </View>
            <View style={styles.summaryDiv} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLbl}>TIME</Text>
              <Text style={styles.summaryVal}>{time} PM</Text>
            </View>
            <View style={styles.summaryDiv} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLbl}>PARTY</Text>
              <Text style={styles.summaryVal}>{party} ppl</Text>
            </View>
          </View>
          <Pressable style={styles.confirmBtn}>
            <LinearGradient
              colors={[ACCENT_LT, ACCENT, ACCENT_DK]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
            />
            <Ionicons name="restaurant" size={16} color="#FFF" />
            <Text style={styles.confirmText}>
              RESERVE TABLE · Rs 2,000 hold
            </Text>
          </Pressable>
          <Text style={styles.confirmHint}>
            Cancellation free up to 2 hours before
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { paddingTop: 60, paddingBottom: 30 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 18,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  brand: { color: TEXT_W, fontSize: 14, fontWeight: '900', letterSpacing: 4 },
  brandSub: {
    color: TEXT_S,
    fontSize: 10,
    marginTop: 3,
    fontWeight: '700',
    fontStyle: 'italic',
  },

  restCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 18,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
  },
  restImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  restEmoji: { fontSize: 32 },
  restNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  restName: {
    color: TEXT_W,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  michelinBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: AMBER + '15',
    borderWidth: 0.5,
    borderColor: AMBER + '50',
  },
  michelinText: { color: AMBER, fontSize: 9, fontWeight: '900' },
  restCuisine: { color: TEXT_S, fontSize: 11, fontWeight: '600', marginTop: 3 },
  restMeta: { flexDirection: 'row', gap: 12, marginTop: 8 },
  restMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  restMetaText: { color: TEXT_W, fontSize: 11, fontWeight: '800' },
  restMetaSub: { color: TEXT_M, fontSize: 10, fontWeight: '600' },

  dateRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 24,
  },
  dateChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  dateChipActive: { backgroundColor: ACCENT, borderColor: ACCENT_LT },
  dateChipFull: { opacity: 0.5 },
  dateDay: { color: TEXT_M, fontSize: 9, letterSpacing: 1, fontWeight: '900' },
  dateNum: {
    color: TEXT_W,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
    fontFamily: 'Courier',
  },
  dateFullText: {
    color: RED,
    fontSize: 7,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: 0.5,
  },

  floorCard: {
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 20,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 14,
  },
  floorHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  floorTitle: { color: TEXT_W, fontSize: 13, fontWeight: '900' },
  floorZoomGroup: { flexDirection: 'row', gap: 4 },
  floorZoomBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  floorFrame: {
    width: FLOOR_W - 28,
    height: FLOOR_H,
    borderRadius: 12,
    backgroundColor: BG,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  tableLabel: { position: 'absolute', width: 28, alignItems: 'center' },
  tableLabelText: {
    color: TEXT_W,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    fontFamily: 'Courier',
  },
  floorBadge: {
    position: 'absolute',
    top: 22,
    right: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  floorBadgeText: {
    color: ACCENT,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  entryBadge: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  entryBadgeText: {
    color: TEXT_S,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  legendRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 14,
    marginBottom: 22,
    flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: TEXT_S, fontSize: 11, fontWeight: '700' },

  sectionWrap: { paddingHorizontal: 20, marginBottom: 18 },
  sectionLabel: {
    color: TEXT_M,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '900',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  partyRow: { flexDirection: 'row', gap: 6 },
  partyChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  partyChipActive: { backgroundColor: ACCENT, borderColor: ACCENT_LT },
  partyText: {
    color: TEXT_W,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Courier',
  },

  timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  timeChip: {
    width: (SW - 40 - 18) / 4,
    paddingVertical: 12,
    borderRadius: 11,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    position: 'relative',
  },
  timeChipActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT_LT,
    shadowColor: ACCENT,
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  timeChipDisabled: { opacity: 0.5 },
  timeText: {
    color: TEXT_W,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'Courier',
  },
  timeAmPm: { color: TEXT_S, fontSize: 9, fontWeight: '700', marginTop: 2 },
  timeFullPill: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    backgroundColor: RED,
  },
  timeFullPillText: { color: '#FFF', fontSize: 7, fontWeight: '900' },

  summaryCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: ACCENT + '40',
  },
  summaryHead: { marginBottom: 12 },
  summaryStatus: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  summaryStatusText: {
    color: GREEN,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '900',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: CARD,
    marginBottom: 14,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLbl: {
    color: TEXT_M,
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: '900',
  },
  summaryVal: {
    color: TEXT_W,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
    fontFamily: 'Courier',
  },
  summaryDiv: { width: 0.5, backgroundColor: BORDER },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: ACCENT,
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  confirmText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  confirmHint: {
    color: TEXT_M,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});
