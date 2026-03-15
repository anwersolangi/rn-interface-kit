import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  Animated as RNAnimated,
  Easing as RNEasing,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width: SW, height: SH } = Dimensions.get('window');
const FONT = Platform.select({ ios: 'Courier', android: 'monospace' });
const SYMBOLS = ['⚡', '💀', '👁️', '✦', '⬢'];
const GLITCH_CHARS = '!@#$%^&*<>?|[]{}~';
const TITLE = 'SLOT_MACHINE.exe';
const REEL_WIDTH = (SW - 56) / 3;
const PARTICLE_COLORS = ['#00F5FF', '#FF006E', '#39FF14', '#FFFFFF'];
const SCANLINE_COUNT = Math.floor(SH / 4);

const WIN_AMOUNTS: Record<string, number> = {
  '⚡': 30,
  '✦': 50,
  '👁️': 75,
  '💀': 100,
  '⬢': 150,
};

const COLORS = {
  background: '#0A0A0F',
  primary: '#00F5FF',
  secondary: '#FF006E',
  win: '#39FF14',
  danger: '#FF003C',
  textPrimary: '#E0E0FF',
  reelBg: '#0D0D1A',
};

const randomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

type ReelState = { top: string; mid: string; bot: string };
type Result = 'jackpot' | 'near' | 'loss' | null;
type HistoryEntry = { symbols: string[]; isWin: boolean; amount: number };

const ScanlineOverlay = memo(() => {
  const lines = useMemo(() => Array.from({ length: SCANLINE_COUNT }, (_, i) => i), []);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {lines.map(i => (
        <View key={i} style={scanlineStyle} />
      ))}
    </View>
  );
});

const scanlineStyle = { height: 1, width: '100%' as const, backgroundColor: '#FFFFFF', opacity: 0.02, marginBottom: 3 };

export default function SlotMachine() {
  const [credits, setCredits] = useState(100);
  const [displayCredits, setDisplayCredits] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [titleText, setTitleText] = useState(TITLE);
  const [reels, setReels] = useState<ReelState[]>([
    { top: '⚡', mid: '💀', bot: '👁️' },
    { top: '✦', mid: '⬢', bot: '⚡' },
    { top: '💀', mid: '✦', bot: '⬢' },
  ]);
  const [borderFlash, setBorderFlash] = useState([false, false, false]);
  const [jackpotBorderColor, setJackpotBorderColor] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const spinIntervals = useRef<ReturnType<typeof setInterval>[]>([]);
  const jackpotFlashRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const displayRef = useRef(100);

  const r0ty = useSharedValue(0), r0op = useSharedValue(1), r0sy = useSharedValue(1);
  const r1ty = useSharedValue(0), r1op = useSharedValue(1), r1sy = useSharedValue(1);
  const r2ty = useSharedValue(0), r2op = useSharedValue(1), r2sy = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const resultOpacity = useSharedValue(0);
  const edgeGlowOpacity = useSharedValue(0);

  const TY = [r0ty, r1ty, r2ty];
  const OP = [r0op, r1op, r2op];
  const SY = [r0sy, r1sy, r2sy];

  const particles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      x: new RNAnimated.Value(0),
      y: new RNAnimated.Value(0),
      opacity: new RNAnimated.Value(0),
      shape: i % 2 === 0 ? 'square' : 'diamond',
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    }))
  ).current;

  const histAnim0 = useRef({ tx: new RNAnimated.Value(50), op: new RNAnimated.Value(0) }).current;
  const histAnim1 = useRef({ tx: new RNAnimated.Value(0), op: new RNAnimated.Value(0) }).current;
  const histAnim2 = useRef({ tx: new RNAnimated.Value(0), op: new RNAnimated.Value(0) }).current;
  const histAnims = [histAnim0, histAnim1, histAnim2];

  const reel0Style = useAnimatedStyle(() => ({
    transform: [{ translateY: r0ty.value }, { scaleY: r0sy.value }],
    opacity: r0op.value,
  }));
  const reel1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: r1ty.value }, { scaleY: r1sy.value }],
    opacity: r1op.value,
  }));
  const reel2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: r2ty.value }, { scaleY: r2sy.value }],
    opacity: r2op.value,
  }));
  const reelAnimStyles = [reel0Style, reel1Style, reel2Style];

  const buttonAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale.value }] }));
  const flashAnimStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));
  const resultAnimStyle = useAnimatedStyle(() => ({ opacity: resultOpacity.value }));
  const edgeGlowStyle = useAnimatedStyle(() => ({ opacity: edgeGlowOpacity.value }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTitleText(
        TITLE.split('').map(c =>
          c === '_' || c === '.' ? c : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        ).join('')
      );
      setTimeout(() => setTitleText(TITLE), 300);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (jackpotFlashRef.current) clearInterval(jackpotFlashRef.current);
    };
  }, []);

  useEffect(() => {
    const from = displayRef.current;
    const to = credits;
    if (from === to) return;
    let step = 0;
    const total = 20;
    const timer = setInterval(() => {
      step++;
      const val = Math.round(from + ((to - from) * step) / total);
      displayRef.current = val;
      setDisplayCredits(val);
      if (step >= total) {
        displayRef.current = to;
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [credits]);

  const triggerParticles = () => {
    particles.forEach((p, i) => {
      const angle = (i / 20) * Math.PI * 2 + (Math.random() - 0.5);
      const dist = 80 + Math.random() * 120;
      p.x.setValue(0);
      p.y.setValue(0);
      p.opacity.setValue(1);
      RNAnimated.parallel([
        RNAnimated.timing(p.x, {
          toValue: Math.cos(angle) * dist,
          duration: 1000,
          useNativeDriver: true,
          easing: RNEasing.out(RNEasing.quad),
        }),
        RNAnimated.timing(p.y, {
          toValue: Math.sin(angle) * dist,
          duration: 1000,
          useNativeDriver: true,
          easing: RNEasing.out(RNEasing.quad),
        }),
        RNAnimated.timing(p.opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]).start();
    });
  };

  const triggerJackpotEffects = () => {
    if (jackpotFlashRef.current) clearInterval(jackpotFlashRef.current);
    let tick = 0;
    setJackpotBorderColor(COLORS.secondary);
    jackpotFlashRef.current = setInterval(() => {
      tick++;
      setJackpotBorderColor(tick % 2 === 0 ? COLORS.secondary : COLORS.win);
      if (tick >= 7) {
        clearInterval(jackpotFlashRef.current!);
        jackpotFlashRef.current = null;
        setJackpotBorderColor(null);
      }
    }, 100);

    triggerParticles();

    edgeGlowOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 900 })
    );
  };

  const addHistory = (entry: HistoryEntry) => {
    histAnim0.tx.setValue(50);
    histAnim0.op.setValue(0);
    RNAnimated.parallel([
      RNAnimated.timing(histAnim0.tx, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: RNEasing.out(RNEasing.quad),
      }),
      RNAnimated.timing(histAnim0.op, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    RNAnimated.timing(histAnim1.op, { toValue: 0.75, duration: 300, useNativeDriver: true }).start();
    RNAnimated.timing(histAnim2.op, { toValue: 0.5, duration: 300, useNativeDriver: true }).start();
    setHistory(prev => [entry, ...prev].slice(0, 3));
  };

  const stopReel = (
    index: number,
    finalState: ReelState,
    isLast: boolean,
    midSymbols: string[]
  ) => {
    clearInterval(spinIntervals.current[index]);
    setReels(prev => {
      const next = [...prev];
      next[index] = finalState;
      return next;
    });
    TY[index].value = withSequence(
      withTiming(-22, { duration: 80, easing: Easing.out(Easing.quad) }),
      withSpring(0, { damping: 8, stiffness: 200 })
    );
    OP[index].value = withTiming(1, { duration: 120 });
    SY[index].value = withTiming(1, { duration: 120 });
    setBorderFlash(prev => { const n = [...prev]; n[index] = true; return n; });
    setTimeout(() => setBorderFlash(prev => { const n = [...prev]; n[index] = false; return n; }), 200);

    if (isLast) {
      setTimeout(() => {
        const uniqueCount = new Set(midSymbols).size;
        let outcome: Result;
        let winAmount = 0;

        if (uniqueCount === 1) {
          outcome = 'jackpot';
          winAmount = WIN_AMOUNTS[midSymbols[0]] ?? 50;
          setCredits(c => c + winAmount);
        } else if (uniqueCount === 2) {
          outcome = 'near';
        } else {
          outcome = 'loss';
        }

        setResult(outcome);
        resultOpacity.value = withTiming(1, { duration: 300 });

        if (outcome === 'jackpot') {
          triggerJackpotEffects();
        } else if (outcome === 'loss') {
          flashOpacity.value = withSequence(
            withTiming(0.15, { duration: 50 }),
            withTiming(0, { duration: 150 })
          );
        }

        addHistory({ symbols: midSymbols, isWin: outcome === 'jackpot', amount: winAmount });
        setSpinning(false);
      }, 300);
    }
  };

  const handleSpin = () => {
    if (spinning || credits < 10) return;
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 75 }),
      withTiming(1.0, { duration: 75 })
    );
    setCredits(c => c - 10);
    setSpinning(true);
    setResult(null);
    resultOpacity.value = 0;
    setJackpotBorderColor(null);

    const midSymbols = [randomSymbol(), randomSymbol(), randomSymbol()];
    const finalReels: ReelState[] = midSymbols.map(mid => ({
      top: randomSymbol(),
      mid,
      bot: randomSymbol(),
    }));

    [0, 1, 2].forEach(i => {
      OP[i].value = withTiming(0.3, { duration: 100 });
      SY[i].value = withTiming(1.1, { duration: 100 });
      spinIntervals.current[i] = setInterval(() => {
        setReels(prev => {
          const next = [...prev];
          next[i] = { top: randomSymbol(), mid: randomSymbol(), bot: randomSymbol() };
          return next;
        });
      }, 55);
    });

    setTimeout(() => stopReel(0, finalReels[0], false, midSymbols), 1000);
    setTimeout(() => stopReel(1, finalReels[1], false, midSymbols), 1400);
    setTimeout(() => stopReel(2, finalReels[2], true, midSymbols), 1800);
  };

  const handleReload = () => {
    setCredits(c => c + 100);
    setResult(null);
    resultOpacity.value = 0;
  };

  const isDepletedState = credits <= 0 && !spinning;
  const isDisabled = spinning || credits < 10;

  const getReelBorderColor = (i: number) => {
    if (jackpotBorderColor) return jackpotBorderColor;
    if (borderFlash[i]) return COLORS.secondary;
    return COLORS.primary;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScanlineOverlay />

      <Animated.View style={[styles.screenFlash, flashAnimStyle]} pointerEvents="none" />
      <Animated.View style={[styles.edgeGlow, edgeGlowStyle]} pointerEvents="none" />

      <View style={styles.particleContainer} pointerEvents="none">
        {particles.map((p, i) => (
          <RNAnimated.View
            key={i}
            style={[
              styles.particle,
              {
                backgroundColor: p.color,
                opacity: p.opacity,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  ...(p.shape === 'diamond' ? [{ rotate: '45deg' as const }] : []),
                ],
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titleText}>{titleText}</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.creditsContainer}>
          <Text style={styles.creditsLabel}>CREDITS:</Text>
          <Text style={styles.creditsValue}>{displayCredits}</Text>
        </View>

        <View style={styles.reelsContainer}>
          {([0, 1, 2] as const).map(i => (
            <Animated.View
              key={i}
              style={[
                styles.reel,
                reelAnimStyles[i],
                { borderColor: getReelBorderColor(i) },
              ]}
            >
              <Text style={styles.symbol}>{reels[i].top}</Text>
              <Text style={styles.symbol}>{reels[i].mid}</Text>
              <Text style={styles.symbol}>{reels[i].bot}</Text>
            </Animated.View>
          ))}
          <View style={styles.winLine} pointerEvents="none" />
        </View>

        <Text style={styles.matchLabel}>— MATCH MIDDLE ROW —</Text>

        {isDepletedState && (
          <View style={styles.depletedContainer}>
            <Text style={styles.depletedText}>CREDITS_DEPLETED — RELOAD?</Text>
            <TouchableOpacity style={styles.reloadButton} onPress={handleReload} activeOpacity={0.7}>
              <Text style={styles.reloadText}>RELOAD [+100]</Text>
            </TouchableOpacity>
          </View>
        )}

        <Animated.View style={buttonAnimStyle}>
          <TouchableOpacity
            style={[
              styles.button,
              isDepletedState && styles.buttonDepleted,
              spinning && !isDepletedState && styles.buttonDisabled,
            ]}
            onPress={handleSpin}
            disabled={isDisabled}
            activeOpacity={1}
          >
            <Text style={[styles.buttonText, (spinning || isDepletedState) && styles.buttonTextDisabled]}>
              {isDepletedState
                ? '[ INSUFFICIENT_CREDITS ]'
                : spinning
                ? '[ SPINNING... ]'
                : '[ EXECUTE ]'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.resultContainer, resultAnimStyle]}>
          {result === 'jackpot' && <Text style={styles.resultJackpot}>◈ JACKPOT DETECTED ◈</Text>}
          {result === 'near' && <Text style={styles.resultNear}>// ALMOST... //</Text>}
          {result === 'loss' && <Text style={styles.resultLoss}>ACCESS_DENIED</Text>}
        </Animated.View>

        {history.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyLabel}>RECENT_LOG:</Text>
            {history.map((entry, i) => (
              <RNAnimated.View
                key={i}
                style={{
                  opacity: histAnims[i].op,
                  transform: [{ translateX: histAnims[i].tx }],
                }}
              >
                <Text style={[styles.historyText, entry.isWin ? styles.historyWin : styles.historyLoss]}>
                  {`> ${entry.symbols.join(' ')} — ${entry.isWin ? `WIN +${entry.amount}` : 'LOSS'}`}
                </Text>
              </RNAnimated.View>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.danger,
    zIndex: 999,
  },
  edgeGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: COLORS.win,
    zIndex: 998,
    shadowColor: COLORS.win,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    left: SW / 2 - 2,
    top: SH * 0.38,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 18,
  },
  header: {
    alignItems: 'center',
    width: '100%',
    gap: 14,
  },
  titleText: {
    fontFamily: FONT,
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  creditsContainer: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 4,
    paddingHorizontal: 28,
    paddingVertical: 10,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  creditsLabel: {
    fontFamily: FONT,
    fontSize: 12,
    color: COLORS.secondary,
    letterSpacing: 2,
  },
  creditsValue: {
    fontFamily: FONT,
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.win,
    textShadowColor: COLORS.win,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  reelsContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  reel: {
    width: REEL_WIDTH,
    height: 180,
    backgroundColor: COLORS.reelBg,
    borderWidth: 1.5,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  symbol: {
    fontSize: 34,
    textAlign: 'center',
    height: 60,
    lineHeight: 60,
  },
  winLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 89,
    height: 2,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  matchLabel: {
    fontFamily: FONT,
    fontSize: 10,
    color: COLORS.secondary,
    letterSpacing: 2,
    textAlign: 'center',
  },
  depletedContainer: {
    alignItems: 'center',
    gap: 8,
  },
  depletedText: {
    fontFamily: FONT,
    fontSize: 11,
    color: COLORS.danger,
    letterSpacing: 1,
  },
  reloadButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 7,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
  },
  reloadText: {
    fontFamily: FONT,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 48,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  buttonDisabled: {
    backgroundColor: '#555555',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonDepleted: {
    backgroundColor: COLORS.danger,
    shadowColor: COLORS.danger,
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  buttonText: {
    fontFamily: FONT,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  buttonTextDisabled: {
    color: '#AAAAAA',
  },
  resultContainer: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultJackpot: {
    fontFamily: FONT,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.win,
    textShadowColor: COLORS.win,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  resultNear: {
    fontFamily: FONT,
    fontSize: 14,
    color: COLORS.secondary,
  },
  resultLoss: {
    fontFamily: FONT,
    fontSize: 14,
    color: COLORS.danger,
  },
  historyContainer: {
    width: '100%',
    gap: 5,
    borderTopWidth: 1,
    borderTopColor: '#1A1A2E',
    paddingTop: 10,
  },
  historyLabel: {
    fontFamily: FONT,
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  historyText: {
    fontFamily: FONT,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  historyWin: {
    color: COLORS.win,
  },
  historyLoss: {
    color: '#555555',
  },
});