import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Defs, LinearGradient as SvgGradient, Stop, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function PlaceholderScreen() {
  const fade = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const pulse = useSharedValue(1);
  const rotate = useSharedValue(0);
  const cursor = useSharedValue(0);

  useEffect(() => {
    fade.value = withTiming(1, { duration: 600 });
    scale.value = withSpring(1, { damping: 12, stiffness: 120 });

    pulse.value = withRepeat(
      withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    rotate.value = withRepeat(
      withTiming(360, { duration: 6000, easing: Easing.linear }),
      -1,
      false
    );

    cursor.value = withRepeat(
      withTiming(1, { duration: 500 }),
      -1,
      true
    );
  }, []);

  const containerAnim = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ scale: scale.value }],
  }));

  const pulseAnim = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const rotateAnim = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const cursorAnim = useAnimatedStyle(() => ({
    opacity: cursor.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Grid Background */}
      <Svg style={styles.gridSvg} width={width} height={height}>
        <Defs>
          <SvgGradient id="fadeGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <Stop offset="70%" stopColor="white" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="white" stopOpacity="0" />
          </SvgGradient>
        </Defs>
        <G>
          {Array.from({ length: Math.ceil(width / 40) }).map((_, i) => (
            <Line key={`v-${i}`} x1={i * 40} y1={0} x2={i * 40} y2={height} stroke="url(#fadeGradient)" />
          ))}
          {Array.from({ length: Math.ceil(height / 40) }).map((_, i) => (
            <Line key={`h-${i}`} x1={0} y1={i * 40} x2={width} y2={i * 40} stroke="url(#fadeGradient)" />
          ))}
        </G>
      </Svg>

      {/* React Logo Loop */}
      <Animated.Image
        source={require('../../assets/images/react-logo.png')}
        style={[styles.rnWatermark, rotateAnim]}
        resizeMode="contain"
      />

      {/* Main Content */}
      <Animated.View style={[styles.content, containerAnim]}>
        <Text style={styles.hookText}>Building UI</Text>
        <Text style={styles.subHook}>from scratch — live</Text>

        <Animated.View style={[styles.logoWrap, pulseAnim]}>
          <Text style={styles.logoText}>AS</Text>
        </Animated.View>

        <Text style={styles.name}>Anwer Solangi</Text>
        <Text style={styles.title}>React Native • Mobile UI</Text>

        <View style={styles.fakeCodeLine}>
          <Text style={styles.codeText}>const Screen = () =&gt; {'{'}</Text>
          <Animated.Text style={[styles.cursor, cursorAnim]}>|</Animated.Text>
        </View>

        <Text style={styles.waitText}>typing…</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  gridSvg: {
    position: 'absolute',
    opacity: 0.5,
  },
  rnWatermark: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 120,
    height: 120,
    opacity: 0.08,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  hookText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1.2,
  },
  subHook: {
    fontSize: 18,
    color: '#38BDF8',
    marginBottom: 32,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#38BDF8',
    shadowOpacity: 0.6,
    shadowRadius: 18,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 2,
  },
  name: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
  },
  title: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 28,
  },
  fakeCodeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
  },
  codeText: {
    fontFamily: 'Courier',
    fontSize: 16,
    color: '#38BDF8',
  },
  cursor: {
    fontSize: 16,
    color: '#38BDF8',
    marginLeft: 4,
  },
  waitText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748B',
  },
});