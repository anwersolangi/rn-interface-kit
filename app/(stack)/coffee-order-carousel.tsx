import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.62;
const SPACING = 18;
const STEP = CARD_W + SPACING;

type Coffee = {
  name: string;
  sub: string;
  price: string;
  bg: [string, string];
  emoji: string;
};

const COFFEES: Coffee[] = [
  {
    name: 'Cappuccino',
    sub: 'Rich & foamy',
    price: '4.50',
    bg: ['#C68B59', '#8B5A2B'],
    emoji: '☕',
  },
  {
    name: 'Caramel Latte',
    sub: 'Sweet & smooth',
    price: '5.20',
    bg: ['#D9A066', '#A9743C'],
    emoji: '🍮',
  },
  {
    name: 'Espresso',
    sub: 'Bold & intense',
    price: '3.80',
    bg: ['#6F4E37', '#3E2A1C'],
    emoji: '⚡',
  },
  {
    name: 'Mocha',
    sub: 'Choco bliss',
    price: '5.50',
    bg: ['#7B4B2A', '#4A2C18'],
    emoji: '🍫',
  },
];

function Card({
  coffee,
  index,
  scrollX,
}: {
  coffee: Coffee;
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const pos = scrollX.get() / STEP;
    const dist = index - pos;
    const scale = interpolate(
      dist,
      [-1, 0, 1],
      [0.86, 1, 0.86],
      Extrapolation.CLAMP,
    );
    const ty = interpolate(
      Math.abs(dist),
      [0, 1],
      [0, 26],
      Extrapolation.CLAMP,
    );
    const rot = interpolate(dist, [-1, 0, 1], [8, 0, -8], Extrapolation.CLAMP);
    const op = interpolate(
      Math.abs(dist),
      [0, 1, 1.6],
      [1, 0.6, 0.2],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ scale }, { translateY: ty }, { rotate: `${rot}deg` }],
      opacity: op,
    };
  });
  const cupStyle = useAnimatedStyle(() => {
    const pos = scrollX.get() / STEP;
    const dist = Math.abs(index - pos);
    return {
      transform: [
        { scale: interpolate(dist, [0, 1], [1, 0.8], Extrapolation.CLAMP) },
        {
          rotate: `${interpolate(
            dist,
            [0, 1],
            [0, -20],
            Extrapolation.CLAMP,
          )}deg`,
        },
      ],
    };
  });
  return (
    <Animated.View style={[cf.card, style]}>
      <LinearGradient colors={coffee.bg} style={cf.cardInner}>
        <Animated.Text style={[cf.cardEmoji, cupStyle]}>
          {coffee.emoji}
        </Animated.Text>
        <View style={cf.steam}>
          <View style={[cf.steamLine, { height: 18 }]} />
          <View style={[cf.steamLine, { height: 26 }]} />
          <View style={[cf.steamLine, { height: 18 }]} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export default function CoffeeCarousel() {
  const [active, setActive] = useState(0);
  const [size, setSize] = useState(1);
  const scrollX = useSharedValue(0);
  const start = useSharedValue(0);

  const SIZES = ['S', 'M', 'L'];

  const settle = (i: number) => {
    setActive(i);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const go = (i: number) => {
    const clamped = Math.max(0, Math.min(COFFEES.length - 1, i));
    scrollX.set(withSpring(clamped * STEP, { damping: 16, stiffness: 120 }));
    settle(clamped);
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      start.set(scrollX.get());
    })
    .onUpdate(e => {
      'worklet';
      scrollX.set(start.get() - e.translationX);
    })
    .onEnd(e => {
      'worklet';
      const target = Math.round((scrollX.get() - e.velocityX * 0.05) / STEP);
      const clamped = Math.max(0, Math.min(COFFEES.length - 1, target));
      scrollX.set(withSpring(clamped * STEP, { damping: 16, stiffness: 120 }));
      runOnJS(settle)(clamped);
    });

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -scrollX.get() }],
  }));
  const cur = COFFEES[active];

  return (
    <GestureHandlerRootView style={cf.root}>
      <LinearGradient
        colors={['#2A1B10', '#1C120B']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={cf.glow} pointerEvents="none">
        <LinearGradient
          colors={['rgba(214,160,102,0.20)', 'transparent']}
          style={cf.glowInner}
        />
      </View>

      <Animated.View entering={FadeInDown.duration(600)} style={cf.header}>
        <Pressable
          style={cf.iconBtn}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="menu" size={22} color="#F0E2D2" />
        </Pressable>
        <View>
          <Text style={cf.kicker}>GOOD MORNING</Text>
          <Text style={cf.headTitle}>Pick your brew</Text>
        </View>
        <Pressable
          style={cf.iconBtn}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="cart" size={20} color="#F0E2D2" />
        </Pressable>
      </Animated.View>

      <View style={cf.carouselWrap}>
        <GestureDetector gesture={pan}>
          <View style={cf.carouselViewport}>
            <Animated.View style={[cf.track, trackStyle]}>
              {COFFEES.map((c, i) => (
                <Pressable key={c.name} onPress={() => go(i)}>
                  <Card coffee={c} index={i} scrollX={scrollX} />
                </Pressable>
              ))}
            </Animated.View>
          </View>
        </GestureDetector>

        <Animated.View
          key={active}
          entering={FadeIn.duration(350)}
          style={cf.info}
        >
          <Text style={cf.coffeeName}>{cur.name}</Text>
          <Text style={cf.coffeeSub}>{cur.sub}</Text>
          <Text style={cf.price}>${cur.price}</Text>
        </Animated.View>

        <View style={cf.dots}>
          {COFFEES.map((_, i) => (
            <View key={i} style={[cf.dot, active === i && cf.dotActive]} />
          ))}
        </View>

        <View style={cf.sizeRow}>
          {SIZES.map((sz, i) => (
            <Pressable
              key={sz}
              style={[cf.sizeBtn, size === i && cf.sizeActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setSize(i);
              }}
            >
              <Text style={[cf.sizeTxt, size === i && cf.sizeTxtActive]}>
                {sz}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Animated.View entering={FadeInDown.delay(500)} style={cf.footer}>
        <View style={cf.navRow}>
          <Pressable style={cf.navBtn} onPress={() => go(active - 1)}>
            <Ionicons name="chevron-back" size={22} color="#F0E2D2" />
          </Pressable>
          <Pressable
            style={cf.addBtn}
            onPress={() =>
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              )
            }
          >
            <Ionicons name="add" size={20} color="#1C120B" />
            <Text style={cf.addTxt}>Add to Cart</Text>
          </Pressable>
          <Pressable style={cf.navBtn} onPress={() => go(active + 1)}>
            <Ionicons name="chevron-forward" size={22} color="#F0E2D2" />
          </Pressable>
        </View>
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const cf = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1C120B' },

  glow: { position: 'absolute', top: 150, alignSelf: 'center' },
  glowInner: { width: width, height: 320, borderRadius: 200 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 66,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(240,226,210,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    color: '#B08D6A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  headTitle: {
    color: '#F0E2D2',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },

  carouselWrap: { flex: 1, marginTop: 10 },
  carouselViewport: { height: 320, justifyContent: 'center' },
  track: {
    flexDirection: 'row',
    paddingHorizontal: (width - CARD_W) / 2,
    gap: SPACING,
    alignItems: 'center',
  },
  card: {
    width: CARD_W,
    height: 280,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
  },
  cardInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 96 },
  steam: {
    position: 'absolute',
    top: 40,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  steamLine: {
    width: 4,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  info: { alignItems: 'center', marginTop: 14 },
  coffeeName: { color: '#F0E2D2', fontSize: 28, fontWeight: '800' },
  coffeeSub: { color: '#B08D6A', fontSize: 15, marginTop: 4 },
  price: { color: '#E8B981', fontSize: 30, fontWeight: '800', marginTop: 12 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    marginTop: 18,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(240,226,210,0.25)',
  },
  dotActive: { width: 22, backgroundColor: '#E8B981' },
  sizeRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 24,
  },
  sizeBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(240,226,210,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeActive: { backgroundColor: '#E8B981' },
  sizeTxt: { color: '#B08D6A', fontSize: 18, fontWeight: '800' },
  sizeTxtActive: { color: '#1C120B' },

  footer: { position: 'absolute', left: 22, right: 22, bottom: 44 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(240,226,210,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E8B981',
    paddingVertical: 17,
    borderRadius: 18,
  },
  addTxt: { color: '#1C120B', fontSize: 16, fontWeight: '800' },
});