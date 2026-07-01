import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CHART_TOP = 96;
const CHART_BOT = 280;
const SERIES = [
  171.2, 170.6, 172.4, 173.1, 172.0, 174.8, 176.2, 175.4, 177.9, 179.1, 178.3,
  180.6, 182.4, 181.2, 183.7, 185.1, 184.2, 186.8, 188.3, 187.1, 189.4, 190.2,
  189.0, 191.3, 192.6, 191.4, 193.2, 194.5,
];
const N = SERIES.length;
const LO = Math.min(...SERIES);
const HI = Math.max(...SERIES);
const PX = SERIES.map((_, i) => 16 + (i / (N - 1)) * (width - 32));
const PY = SERIES.map(
  v => CHART_BOT - ((v - LO) / (HI - LO)) * (CHART_BOT - CHART_TOP),
);
const DELTAS = [0.12, -0.07, 0.18, -0.05, 0.09, -0.11, 0.14, -0.06];
const SHARES = 65;

function linePath(k: number) {
  let d = `M ${PX[0]} ${PY[0]}`;
  for (let i = 1; i <= k; i++) d += ` L ${PX[i]} ${PY[i]}`;
  return d;
}
function areaPath(k: number) {
  return `${linePath(k)} L ${PX[k]} ${CHART_BOT} L ${PX[0]} ${CHART_BOT} Z`;
}

function LeadPulse() {
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(
      withRepeat(
        withTiming(1, { duration: 1400, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      ),
    );
  }, []);
  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(p.get(), [0, 1], [0.6, 2.6]) }],
    opacity: interpolate(p.get(), [0, 1], [0.6, 0]),
  }));
  return (
    <View style={s.lead}>
      <Animated.View style={[s.leadRing, ring]} />
      <View style={s.leadCore} />
    </View>
  );
}

export default function TickerLive() {
  const [k, setK] = useState(6);
  const [price, setPrice] = useState(SERIES[6]);

  useEffect(() => {
    let i = 6;
    let di = 0;
    const id = setInterval(() => {
      i += 1;
      if (i < N) {
        setK(i);
        setPrice(SERIES[i]);
      } else {
        setPrice(p => +(p + DELTAS[di % DELTAS.length]).toFixed(2));
        di += 1;
      }
    }, 120);
    return () => clearInterval(id);
  }, []);

  const pct = (((price - SERIES[0]) / SERIES[0]) * 100).toFixed(2);
  const value = (price * SHARES).toFixed(2);

  return (
    <View style={s.root}>
      <View style={s.hero}>
        <LinearGradient
          colors={['#0D1F14', '#08120C']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <Svg width={width} height={320} style={StyleSheet.absoluteFill}>
        <Path d={areaPath(k)} fill="rgba(34,197,94,0.14)" />
        <Path
          d={linePath(k)}
          stroke="#22C55E"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <View style={{ position: 'absolute', left: PX[k] - 25, top: PY[k] - 25 }}>
        <LeadPulse />
      </View>

      <Animated.View entering={FadeInDown.duration(600)} style={s.topBar}>
        <Pressable
          style={s.backBtn}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <View style={s.symWrap}>
          <Text style={s.sym}>NOVA</Text>
          <View style={s.livePill}>
            <View style={s.liveDot} />
            <Text style={s.liveTxt}>Live</Text>
          </View>
        </View>
        <Pressable style={s.backBtn}>
          <Ionicons name="star-outline" size={20} color="#fff" />
        </Pressable>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(200)} style={s.priceHead}>
        <Text style={s.priceTop}>${price.toFixed(2)}</Text>
        <View style={s.changePill}>
          <Ionicons name="caret-up" size={13} color="#22C55E" />
          <Text style={s.changeTxt}>+{pct}% today</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)} style={s.sheet}>
        <View style={s.handle} />
        <Text style={s.kicker}>YOUR POSITION</Text>
        <View style={s.valRow}>
          <Text style={s.valBig}>${value}</Text>
          <View style={s.plPill}>
            <Ionicons name="trending-up" size={14} color="#22C55E" />
            <Text style={s.plTxt}>+$842</Text>
          </View>
        </View>
        <View style={s.metaRow}>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Shares</Text>
            <Text style={s.metaValue}>{SHARES}</Text>
          </View>
          <View style={s.metaDivider} />
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Avg cost</Text>
            <Text style={s.metaValue}>$181.40</Text>
          </View>
          <View style={s.metaDivider} />
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Today</Text>
            <Text style={[s.metaValue, { color: '#22C55E' }]}>+{pct}%</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(600)} style={s.footer}>
        <Pressable
          style={s.sellBtn}
          onPress={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          }
        >
          <Text style={s.sellTxt}>Sell</Text>
        </Pressable>
        <Pressable
          style={s.buyBtn}
          onPress={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          }
        >
          <Text style={s.buyTxt}>Buy</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08120C' },

  hero: { height: 320, width: '100%', overflow: 'hidden' },

  lead: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#22C55E',
  },
  leadCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#fff',
  },

  topBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(13,31,20,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sym: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34,197,94,0.16)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  liveTxt: { color: '#22C55E', fontSize: 11, fontWeight: '800' },
  priceHead: { position: 'absolute', top: 114, left: 24 },
  priceTop: { color: '#fff', fontSize: 34, fontWeight: '800' },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  changeTxt: { color: '#22C55E', fontSize: 14, fontWeight: '700' },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0E1B13',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#284033',
    marginBottom: 16,
  },
  kicker: {
    color: '#6B8A78',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
    marginBottom: 20,
  },
  valBig: { color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  plPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34,197,94,0.14)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
  },
  plTxt: { color: '#22C55E', fontSize: 14, fontWeight: '800' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#08120C',
    borderRadius: 18,
    paddingVertical: 16,
  },
  metaItem: { flex: 1, alignItems: 'center' },
  metaLabel: { color: '#6B8A78', fontSize: 12, fontWeight: '600' },
  metaValue: { color: '#fff', fontSize: 17, fontWeight: '800', marginTop: 4 },
  metaDivider: { width: 1, height: 30, backgroundColor: '#1E3328' },

  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 44,
    flexDirection: 'row',
    gap: 12,
  },
  sellBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    backgroundColor: '#1C2A20',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#284033',
  },
  sellTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  buyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    backgroundColor: '#22C55E',
    borderRadius: 18,
  },
  buyTxt: { color: '#08120C', fontSize: 16, fontWeight: '800' },
});
