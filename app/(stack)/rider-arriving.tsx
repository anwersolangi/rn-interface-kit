import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  withSequence,
  Easing,
  interpolate,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const MAP_H = 420;
const ROUTE = `M40 ${MAP_H - 90} C ${width * 0.35} ${MAP_H - 160}, ${
  width * 0.55
} ${MAP_H - 60}, ${width - 60} 110`;

function PulseDot() {
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(
      withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      ),
    );
  }, []);
  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(p.get(), [0, 1], [0.4, 2.4]) }],
    opacity: interpolate(p.get(), [0, 1], [0.5, 0]),
  }));
  return (
    <View style={d.pickup}>
      <Animated.View style={[d.pickupRing, ring]} />
      <View style={d.pickupCore} />
    </View>
  );
}

export default function RideArriving() {
  const [eta, setEta] = useState(4);
  const carT = useSharedValue(0);

  useEffect(() => {
    carT.set(
      withDelay(
        500,
        withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.cubic) }),
      ),
    );
    const id = setInterval(() => setEta(e => (e > 1 ? e - 1 : 1)), 1300);

    return () => clearInterval(id);
  }, []);

  const carStyle = useAnimatedStyle(() => ({
    left: interpolate(carT.get(), [0, 1], [40, width - 60]) - 18,
    top: interpolate(carT.get(), [0, 1], [MAP_H - 90, 110]) - 18,
  }));

  return (
    <View style={d.root}>
      <View style={d.map}>
        <LinearGradient
          colors={['#13202B', '#0E1116']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={d.grid} pointerEvents="none">
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`h${i}`} style={[d.gline, { top: i * 70 + 30 }]} />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={`v${i}`}
            style={[d.gline, d.vline, { left: i * 90 + 20 }]}
          />
        ))}
      </View>
      <Svg width={width} height={MAP_H} style={StyleSheet.absoluteFill}>
        <Path
          d={ROUTE}
          stroke="#3A4754"
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="2 12"
        />
        <Path
          d={ROUTE}
          stroke="#FFD43B"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      <View style={[d.destPin, { right: 44, top: 92 }]}>
        <Ionicons name="location" size={28} color="#FFD43B" />
      </View>
      <View style={{ position: 'absolute', left: 22, top: MAP_H - 108 }}>
        <PulseDot />
      </View>
      <Animated.View style={[d.car, carStyle]}>
        <View style={d.carInner}>
          <Ionicons name="car-sport" size={20} color="#0E1116" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600)} style={d.topBar}>
        <Pressable
          style={d.backBtn}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <View style={d.etaPill}>
          <View style={d.etaPulse} />
          <Text style={d.etaPillTxt}>Driver arriving</Text>
        </View>
        <Pressable style={d.backBtn}>
          <Ionicons name="share-outline" size={20} color="#fff" />
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)} style={d.sheet}>
        <View style={d.handle} />
        <View style={d.etaRow}>
          <Text style={d.etaBig}>{eta}</Text>
          <Text style={d.etaMin}>min away</Text>
        </View>
        <View style={d.driverRow}>
          <View style={d.avatar}>
            <Text style={d.avatarTxt}>AK</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={d.driverName}>Adnan Khan</Text>
            <View style={d.rating}>
              <Ionicons name="star" size={13} color="#FFD43B" />
              <Text style={d.ratingTxt}>4.9 · Toyota Corolla</Text>
            </View>
          </View>
          <View style={d.plate}>
            <Text style={d.plateTxt}>BHX 4821</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(600)} style={d.footer}>
        <Pressable
          style={d.callBtn}
          onPress={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          }
        >
          <Ionicons name="call" size={20} color="#51CF66" />
        </Pressable>
        <Pressable
          style={d.msgBtn}
          onPress={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          }
        >
          <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
          <Text style={d.msgTxt}>Message driver</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const d = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E1116' },

  map: { height: MAP_H, width: '100%', overflow: 'hidden' },

  grid: { ...StyleSheet.absoluteFillObject },
  gline: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  vline: { width: 1, height: MAP_H },
  destPin: { position: 'absolute' },
  pickup: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4DABF7',
  },
  pickupCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4DABF7',
    borderWidth: 3,
    borderColor: '#fff',
  },
  car: { position: 'absolute', width: 36, height: 36 },
  carInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD43B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD43B',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
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
    backgroundColor: 'rgba(20,28,38,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(20,28,38,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 99,
  },
  etaPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#51CF66',
  },
  etaPillTxt: { color: '#fff', fontSize: 14, fontWeight: '600' },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#161B22',
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
    backgroundColor: '#3A4754',
    marginBottom: 18,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 18,
  },
  etaBig: { color: '#fff', fontSize: 48, fontWeight: '800' },
  etaMin: { color: '#8B98A5', fontSize: 18 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#264653',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  driverName: { color: '#fff', fontSize: 17, fontWeight: '600' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  ratingTxt: { color: '#8B98A5', fontSize: 13 },
  plate: {
    backgroundColor: '#0E1116',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  plateTxt: {
    color: '#FFD43B',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },

  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 44,
    flexDirection: 'row',
    gap: 12,
  },
  callBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(81,207,102,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFD43B',
    borderRadius: 18,
  },
  msgTxt: { color: '#0E1116', fontSize: 16, fontWeight: '700' },
});
