import React, { useMemo, useCallback } from "react";
import {
  View,
  useWindowDimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Share,
  Platform,
} from "react-native";
import {
  Canvas,
  Path,
  Skia,
  Circle,
  Rect,
  Group,
  LinearGradient,
  RadialGradient,
  vec,
  Line,
  Oval,
} from "@shopify/react-native-skia";
import {
  useSharedValue,
  useDerivedValue,
  useFrameCallback,
  withSpring,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

function mulberry32(seed: number): () => number {
  "worklet";
  let s = seed | 0;
  return () => {
    "worklet";
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;

function clamp(v: number, lo: number, hi: number): number {
  "worklet";
  return Math.max(lo, Math.min(hi, v));
}

function smoothstep(lo: number, hi: number, x: number): number {
  "worklet";
  const t = clamp((x - lo) / (hi - lo), 0, 1);
  return t * t * (3 - 2 * t);
}


interface SafeMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface Props {
  seed?: number;
  safeMargins?: SafeMargins;
}

function exportToSVG(W: number, H: number, seed: number): string {
  const groundY = H * 0.66;

  function mountainPathD(
    peakX: number,
    peakY: number,
    baseY: number,
    spread: number
  ): string {
    let d = `M 0 ${baseY}`;
    for (let x = 0; x <= W; x += 3) {
      const dx = (x - peakX) / spread;
      const gaussian = Math.exp(-dx * dx * 1.05);
      const noise =
        Math.sin(x * 0.055 + seed * 0.7) * 3.5 +
        Math.sin(x * 0.14 + seed * 1.3) * 1.8;
      const y = baseY - (baseY - peakY) * gaussian + noise * gaussian * 0.45;
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    d += ` L ${W} ${baseY} Z`;
    return d;
  }

  const m1 = mountainPathD(W * 0.28, groundY - H * 0.42, groundY, W * 0.26);
  const m2 = mountainPathD(W * 0.72, groundY - H * 0.4, groundY, W * 0.24);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  svg += `<defs>`;
  svg += `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="${H * 0.72}" gradientUnits="userSpaceOnUse">`;
  svg += `<stop offset="0%" stop-color="#4a8ad4"/><stop offset="35%" stop-color="#78b8e8"/>`;
  svg += `<stop offset="65%" stop-color="#a8d4f0"/><stop offset="100%" stop-color="#d4eaf8"/>`;
  svg += `</linearGradient>`;
  svg += `<radialGradient id="sun" cx="${W * 0.5}" cy="${H * 0.22}" r="${H * 0.06}" gradientUnits="userSpaceOnUse">`;
  svg += `<stop offset="0%" stop-color="#fffef2"/><stop offset="35%" stop-color="#ffe680"/>`;
  svg += `<stop offset="100%" stop-color="#ffcc33"/>`;
  svg += `</radialGradient>`;
  svg += `<linearGradient id="mt1" x1="0" y1="${groundY - H * 0.42}" x2="0" y2="${groundY}" gradientUnits="userSpaceOnUse">`;
  svg += `<stop offset="0%" stop-color="#6882a8"/><stop offset="100%" stop-color="#4a6488"/>`;
  svg += `</linearGradient>`;
  svg += `<linearGradient id="mt2" x1="0" y1="${groundY - H * 0.4}" x2="0" y2="${groundY}" gradientUnits="userSpaceOnUse">`;
  svg += `<stop offset="0%" stop-color="#5a7a68"/><stop offset="100%" stop-color="#3a5a48"/>`;
  svg += `</linearGradient>`;
  svg += `<linearGradient id="grass" x1="0" y1="${groundY}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">`;
  svg += `<stop offset="0%" stop-color="#55aa48"/><stop offset="100%" stop-color="#2a6a1e"/>`;
  svg += `</linearGradient>`;
  svg += `</defs>`;
  svg += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  svg += `<circle cx="${W * 0.5}" cy="${H * 0.22}" r="${H * 0.06}" fill="url(#sun)"/>`;
  svg += `<path d="${m1}" fill="url(#mt1)"/>`;
  svg += `<path d="${m2}" fill="url(#mt2)"/>`;
  svg += `<rect x="0" y="${groundY}" width="${W}" height="${H - groundY}" fill="url(#grass)"/>`;


  for (let i = 0; i < 7; i++) {
    const bx = W * 0.35 + (i < 3 ? -(3 - i) : i === 3 ? 0 : i - 3) * 22;
    const by = H * 0.135 + Math.abs(i - 3) * 9;
    svg += `<path d="M ${bx - 7} ${by + 2} Q ${bx - 2.5} ${by - 3} ${bx} ${by} Q ${bx + 2.5} ${by - 3} ${bx + 7} ${by + 2}" fill="none" stroke="#2d261e" stroke-width="1.8" stroke-linecap="round"/>`;
  }


  const hx = W * 0.68,
    hy = groundY - 4,
    hw = 58,
    hh = 48;
  svg += `<rect x="${hx}" y="${hy}" width="${hw}" height="${hh}" fill="#f5e8d0" stroke="#b09060" stroke-width="0.5"/>`;
  svg += `<polygon points="${hx - 9},${hy} ${hx + hw / 2},${hy - 32} ${hx + hw + 9},${hy}" fill="#c84538" stroke="#8a2820" stroke-width="1.2"/>`;
  svg += `<path d="M ${hx + hw * 0.5 - 7.5} ${hy + hh} L ${hx + hw * 0.5 - 7.5} ${hy + hh - 20} A 7.5 7.5 0 0 1 ${hx + hw * 0.5 + 7.5} ${hy + hh - 20} L ${hx + hw * 0.5 + 7.5} ${hy + hh} Z" fill="#5a381c"/>`;
  svg += `<rect x="${hx + 6}" y="${hy + 10}" width="14" height="12" fill="rgba(155,210,240,0.55)" stroke="#8a7040" stroke-width="1"/>`;
  svg += `<rect x="${hx + hw - 20}" y="${hy + 10}" width="14" height="12" fill="rgba(155,210,240,0.55)" stroke="#8a7040" stroke-width="1"/>`;

  svg += `</svg>`;
  return svg;
}

function buildMountainPath(
  W: number,
  H: number,
  peakX: number,
  peakY: number,
  baseY: number,
  spread: number,
  seed: number,
  px: number
): any {
  "worklet";
  const path = Skia.Path.Make();
  path.moveTo(-30, baseY + 5);
  for (let x = -30; x <= W + 30; x += 3) {
    const dx = (x + px - peakX) / spread;
    const gaussian = Math.exp(-dx * dx * 1.05);
    const noise =
      Math.sin(x * 0.055 + seed * 0.7) * 3.5 +
      Math.sin(x * 0.14 + seed * 1.3) * 1.8;
    const y = baseY - (baseY - peakY) * gaussian + noise * gaussian * 0.45;
    path.lineTo(x, y);
  }
  path.lineTo(W + 30, baseY + 5);
  path.close();
  return path;
}


function buildSnowPath(
  W: number,
  peakX: number,
  peakY: number,
  baseY: number,
  spread: number,
  seed: number,
  snowAmt: number,
  px: number
): any {
  "worklet";
  const path = Skia.Path.Make();
  for (let x = -30; x <= W + 30; x += 3) {
    const dx = (x + px - peakX) / spread;
    const gaussian = Math.exp(-dx * dx * 1.05);
    const noise =
      Math.sin(x * 0.055 + seed * 0.7) * 3.5 +
      Math.sin(x * 0.14 + seed * 1.3) * 1.8;
    const y = baseY - (baseY - peakY) * gaussian + noise * gaussian * 0.45;
    const snowThresh = peakY + (baseY - peakY) * snowAmt;
    if (y < snowThresh) {
      const alpha = smoothstep(snowThresh, peakY, y);
      path.moveTo(x, y);
      path.lineTo(x, y + alpha * 7);
    }
  }
  return path;
}


function buildGroundPath(
  W: number,
  H: number,
  groundY: number,
  fgP: number
): any {
  "worklet";
  const path = Skia.Path.Make();
  path.moveTo(-30, groundY);
  for (let x = -30; x <= W + 30; x += 3) {
    const gx = x + fgP;
    const gy =
      groundY +
      Math.sin(gx * 0.011 + 0.4) * 7 +
      Math.sin(gx * 0.032) * 3.5 +
      Math.cos(gx * 0.007) * 4.5;
    path.lineTo(x, gy);
  }
  path.lineTo(W + 30, H + 20);
  path.lineTo(-30, H + 20);
  path.close();
  return path;
}


function buildBirdPath(
  bx: number,
  by: number,
  size: number,
  flap: number
): any {
  "worklet";
  const path = Skia.Path.Make();
  path.moveTo(bx - size, by + size * flap * 0.6);
  path.quadTo(bx - size * 0.32, by - size * (0.38 + flap), bx, by);
  path.quadTo(
    bx + size * 0.32,
    by - size * (0.38 + flap),
    bx + size,
    by + size * flap * 0.6
  );
  return path;
}


function buildRoofPath(hx: number, hy: number, hw: number): any {
  "worklet";
  const path = Skia.Path.Make();
  path.moveTo(hx - 9, hy);
  path.lineTo(hx + hw * 0.5, hy - 32);
  path.lineTo(hx + hw + 9, hy);
  path.close();
  return path;
}


function buildDoorPath(doorX: number, doorY: number): any {
  "worklet";
  const path = Skia.Path.Make();
  path.moveTo(doorX, doorY + 20);
  path.lineTo(doorX, doorY);

  path.cubicTo(doorX, doorY - 5, doorX + 15, doorY - 5, doorX + 15, doorY);
  path.lineTo(doorX + 15, doorY + 20);
  path.close();
  return path;
}


function buildHousePath(
  startX: number,
  startY: number,
  ctrlX: number,
  ctrlY: number,
  endX: number,
  endY: number
): any {
  "worklet";
  const path = Skia.Path.Make();

  path.moveTo(startX - 5, startY);
  path.quadTo(ctrlX - 9, ctrlY, endX - 7, endY);
  path.lineTo(endX + 7, endY);
  path.quadTo(ctrlX + 9, ctrlY, startX + 5, startY);
  path.close();
  return path;
}

export default function DaylightScenery({
  seed = 42,
  safeMargins = { top: 0, bottom: 0, left: 0, right: 0 },
}: Props) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const W = screenW - safeMargins.left - safeMargins.right;
  const H = screenH - safeMargins.top - safeMargins.bottom;
  const groundY = H * 0.66;

  const time = useSharedValue(0);
  useFrameCallback((frameInfo) => {
    time.value += 0.016;
  });

  const parallax = useDerivedValue(() => {
    return Math.sin(time.value * 0.12) * 9;
  });
  const mtnParallax = useDerivedValue(() => parallax.value * -0.22);
  const hazeParallax = useDerivedValue(() => parallax.value * -0.12);
  const fgParallax = useDerivedValue(() => parallax.value * 0.08);
  const birdParallax = useDerivedValue(() => parallax.value * -0.35);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, 0.5, 4);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      savedScale.value = 1;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture
  );

  const canvasTransform = useDerivedValue(() => {
    return [
      { translateX: translateX.value + W / 2 },
      { translateY: translateY.value + H / 2 },
      { scale: scale.value },
      { translateX: -W / 2 },
      { translateY: -H / 2 },
    ];
  });

  const hazeMount1 = useDerivedValue(() =>
    buildMountainPath(
      W, H, W * 0.15, groundY - H * 0.2, groundY + 5, W * 0.38, seed, hazeParallax.value
    )
  );
  const hazeMount2 = useDerivedValue(() =>
    buildMountainPath(
      W, H, W * 0.88, groundY - H * 0.17, groundY + 5, W * 0.34, seed, hazeParallax.value
    )
  );
  const mainMount1 = useDerivedValue(() =>
    buildMountainPath(
      W, H, W * 0.28, groundY - H * 0.42, groundY, W * 0.26, seed, mtnParallax.value
    )
  );
  const mainMount2 = useDerivedValue(() =>
    buildMountainPath(
      W, H, W * 0.72, groundY - H * 0.4, groundY, W * 0.24, seed, mtnParallax.value
    )
  );
  const snow1 = useDerivedValue(() =>
    buildSnowPath(W, W * 0.28, groundY - H * 0.42, groundY, W * 0.26, seed, 0.22, mtnParallax.value)
  );
  const snow2 = useDerivedValue(() =>
    buildSnowPath(W, W * 0.72, groundY - H * 0.4, groundY, W * 0.24, seed, 0.2, mtnParallax.value)
  );

  const groundPath = useDerivedValue(() =>
    buildGroundPath(W, H, groundY, fgParallax.value)
  );

  const birdsPath = useDerivedValue(() => {
    const t = time.value;
    const flockT = (t * 0.035) % 1;
    const flockBaseX = -W * 0.18 + flockT * W * 1.36;
    const flockBaseY = H * 0.135 + Math.sin(flockT * TAU) * H * 0.035;
    const bP = birdParallax.value;

    const combined = Skia.Path.Make();
    const flockSize = 9;
    const mid = 4;
    for (let i = 0; i < flockSize; i++) {
      const side = i < mid ? -1 : i === mid ? 0 : 1;
      const idx = i < mid ? mid - i : i === mid ? 0 : i - mid;
      const sineOff = Math.sin(t * 1.4 + i * 0.55) * 4.5;
      const bx = flockBaseX + side * idx * 22 + sineOff + bP;
      const by = flockBaseY + idx * 9 + Math.sin(t * 0.75 + i * 0.35) * 3;
      const flap = Math.sin(t * 5.5 + i * 0.65) * 0.55;
      const birdP = buildBirdPath(bx, by, 7 + Math.sin(i * 1.3) * 1.5, flap);
      combined.addPath(birdP);
    }
  
    const s1x = ((t * 13 + 220) % (W + 120)) - 60 + bP;
    const s1y = H * 0.2 + Math.sin(t * 1.1) * 5;
    combined.addPath(buildBirdPath(s1x, s1y, 6.5, Math.sin(t * 5.5 + 2.8) * 0.55));

    const s2x = ((t * 9 + 400) % (W + 120)) - 60 + bP;
    const s2y = H * 0.08 + Math.sin(t * 0.85 + 2) * 4;
    combined.addPath(buildBirdPath(s2x, s2y, 5.5, Math.sin(t * 5.5 + 5.2) * 0.55));

    return combined;
  });


  const smokeData = useDerivedValue(() => {
    const t = time.value;
    const hx = W * 0.68 + fgParallax.value * 0.12;
    const hy = groundY - 4;
    const chimX = hx + 58 * 0.73;
    const result: { cx: number; cy: number; r: number; opacity: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const age = (t * 0.45 + i * 0.38) % 2.8;
      const sx = chimX + 5 + Math.sin(t * 0.55 + i * 1.15) * (3.5 + age * 6.5);
      const sy = hy - 28 - age * 24;
      const sr = 3 + age * 5.5;
      const alpha = Math.max(0, 0.2 - age * 0.07);
      result.push({ cx: sx, cy: sy, r: sr, opacity: alpha });
    }
    return result;
  });


  const cloudData = useDerivedValue(() => {
    const t = time.value;
    const cRng = mulberry32(seed + 200);
    const result: { cx: number; cy: number; sc: number; alpha: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const baseX = cRng() * W * 1.3 - W * 0.15;
      const cx = ((baseX + parallax.value * -0.25 + t * (2.5 + i * 1.2)) % (W + 280)) - 140;
      const cy = H * 0.05 + cRng() * H * 0.16;
      const sc = 0.55 + cRng() * 0.65;
      const alpha = 0.55 + cRng() * 0.3;
      result.push({ cx, cy, sc, alpha });
    }
    return result;
  });


  const grassStrokes = useMemo(() => {
    const rng = mulberry32(seed + 300);
    const strokes: { x: number; yBase: number; h: number; green: number; alpha: number }[] = [];
    for (let i = 0; i < 100; i++) {
      strokes.push({
        x: rng() * (W + 40) - 20,
        yBase: groundY + 4 + rng() * (H - groundY - 18),
        h: 5 + rng() * 12,
        green: 130 + rng() * 55,
        alpha: 0.3 + rng() * 0.15,
      });
    }
    return strokes;
  }, [seed, W, H, groundY]);

  const grassPath = useDerivedValue(() => {
    const t = time.value;
    const fp = fgParallax.value * 0.4;
    const path = Skia.Path.Make();
    for (let i = 0; i < grassStrokes.length; i++) {
      const s = grassStrokes[i];
      const gx = s.x + fp;
      const sway = Math.sin(t * 1.4 + gx * 0.015 + i * 0.3) * 2.2;
      path.moveTo(gx, s.yBase);
      path.quadTo(gx + sway, s.yBase - s.h * 0.6, gx + sway * 1.1, s.yBase - s.h);
    }
    return path;
  });


  const flowerSeedData = useMemo(() => {
    const rng = mulberry32(seed + 400);
    const colors = ["#ff6b8a", "#ffbe0b", "#e855a0", "#ff5566", "#f5a0c0", "#ffd166", "#ff88aa"];
    const flowers: { x: number; y: number; scale: number; color: string; leafDir: number; hasLeaf: boolean }[] = [];
    for (let i = 0; i < 22; i++) {
      flowers.push({
        x: W * 0.02 + rng() * W * 0.96,
        y: groundY + 7 + rng() * (H - groundY - 20),
        scale: 2.2 + rng() * 3.8,
        color: colors[Math.floor(rng() * colors.length)],
        hasLeaf: rng() > 0.5,
        leafDir: rng() > 0.5 ? 1 : -1,
      });
    }
    return flowers;
  }, [seed, W, H, groundY]);

  const treeData = useMemo(
    () => [
      { type: "round" as const, x: W * 0.08, y: groundY + 3, h: 98, cr: 31, tw: 6.5 },
      { type: "round" as const, x: W * 0.19, y: groundY + 7, h: 80, cr: 25, tw: 5 },
      { type: "pine" as const, x: W * 0.42, y: groundY + 2, h: 88 },
      { type: "pine" as const, x: W * 0.48, y: groundY + 5, h: 70 },
      { type: "round" as const, x: W * 0.87, y: groundY + 4, h: 92, cr: 28, tw: 5.5 },
      { type: "pine" as const, x: W * 0.95, y: groundY + 7, h: 74 },
    ],
    [W, groundY]
  );

  const hx = W * 0.68;
  const hy = groundY - 4;
  const hw = 58;
  const hh = 48;
  const chimX = hx + hw * 0.73;

  const roofPath = useMemo(() => buildRoofPath(hx, hy, hw), [hx, hy, hw]);
  const doorPath = useMemo(
    () => buildDoorPath(hx + hw * 0.5 - 7.5, hy + hh - 20),
    [hx, hy, hw, hh]
  );
  const pathToHouse = useMemo(
    () =>
      buildHousePath(
        hx + hw * 0.5, hy + hh,
        hx + hw * 0.15, groundY + 38,
        hx - 35, H * 0.97
      ),
    [hx, hy, hw, hh, groundY, H]
  );


  const sunX = W * 0.5;
  const sunY = H * 0.22;
  const sunR = H * 0.06;

  const sunRaysPath = useDerivedValue(() => {
    const t = time.value;
    const path = Skia.Path.Make();
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * TAU + t * 0.06;
      const inner = sunR * 1.15;
      const outer = sunR * (2.2 + Math.sin(t * 1.2 + i * 0.8) * 0.5);
      const spread = 0.055;
      path.moveTo(
        sunX + Math.cos(angle - spread) * inner,
        sunY + Math.sin(angle - spread) * inner
      );
      path.lineTo(
        sunX + Math.cos(angle) * outer,
        sunY + Math.sin(angle) * outer
      );
      path.lineTo(
        sunX + Math.cos(angle + spread) * inner,
        sunY + Math.sin(angle + spread) * inner
      );
      path.close();
    }
    return path;
  });


  const handleExportSVG = useCallback(() => {
    const svgStr = exportToSVG(W, H, seed);
    Share.share({ message: svgStr, title: `scenery-seed-${seed}.svg` });
  }, [W, H, seed]);


  const cloudBlobs = [
    [-26, 2, 30, 17],
    [0, -9, 36, 21],
    [24, -4, 28, 16],
    [11, 5, 26, 14],
    [-13, 6, 22, 12],
  ];


  const fenceStart = hx - 30;
  const fenceEnd = hx - 3;
  const fenceYb = hy + hh - 2;

  return (
    <GestureHandlerRootView style={styles.root}>
      <View
        style={[
          styles.container,
          {
            paddingTop: safeMargins.top,
            paddingBottom: safeMargins.bottom,
            paddingLeft: safeMargins.left,
            paddingRight: safeMargins.right,
          },
        ]}
        accessible
        accessibilityLabel={`Scenic daylight landscape with two mountains, a sun centered in the valley, flying birds in V formation, a small house with chimney smoke, trees, and flowers. Generated with seed ${seed}.`}
      >
        <GestureDetector gesture={composedGesture}>
          <Canvas style={{ width: W, height: H }}>
            <Group transform={canvasTransform}>
              <Rect x={0} y={0} width={W} height={H}>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(0, H * 0.72)}
                  colors={["#4a8ad4", "#78b8e8", "#a8d4f0", "#d4eaf8"]}
                  positions={[0, 0.35, 0.65, 1]}
                />
              </Rect>
              {cloudData.value?.map((c, ci) =>
                cloudBlobs.map(([ox, oy, rx, ry], bi) => (
                  <Oval
                    key={`cloud-${ci}-${bi}`}
                    x={c.cx + ox * c.sc - rx * c.sc}
                    y={c.cy + oy * c.sc - ry * c.sc}
                    width={rx * c.sc * 2}
                    height={ry * c.sc * 2}
                    color="white"
                    opacity={c.alpha}
                  />
                ))
              )}
              {[3, 2, 1, 0].map((layer) => (
                <Circle
                  key={`glow-${layer}`}
                  cx={sunX}
                  cy={sunY}
                  r={sunR * (3.5 + layer * 2.8)}
                >
                  <RadialGradient
                    c={vec(sunX, sunY)}
                    r={sunR * (3.5 + layer * 2.8)}
                    colors={[
                      `rgba(255,230,140,${0.1 - layer * 0.02})`,
                      "rgba(255,230,140,0)",
                    ]}
                  />
                </Circle>
              ))}
              <Circle cx={sunX} cy={sunY} r={sunR}>
                <RadialGradient
                  c={vec(sunX - sunR * 0.15, sunY - sunR * 0.15)}
                  r={sunR}
                  colors={["#fffef2", "#ffe680", "#ffcc33"]}
                  positions={[0, 0.35, 1]}
                />
              </Circle>

              
              <Path
                path={sunRaysPath}
                color="rgba(255,224,100,0.07)"
                style="fill"
              />

              
              <Path path={hazeMount1} color="rgba(140,160,200,0.3)" />
              <Path path={hazeMount2} color="rgba(145,160,195,0.25)" />

              
              <Path path={mainMount1}>
                <LinearGradient
                  start={vec(0, groundY - H * 0.42)}
                  end={vec(0, groundY + 8)}
                  colors={["#6882a8", "#4a6488"]}
                />
              </Path>
              <Path
                path={snow1}
                color="rgba(250,252,255,0.88)"
                style="stroke"
                strokeWidth={3.5}
                strokeCap="round"
              />

              <Path path={mainMount2}>
                <LinearGradient
                  start={vec(0, groundY - H * 0.4)}
                  end={vec(0, groundY + 8)}
                  colors={["#5a7a68", "#3a5a48"]}
                />
              </Path>
              <Path
                path={snow2}
                color="rgba(250,252,255,0.88)"
                style="stroke"
                strokeWidth={3.5}
                strokeCap="round"
              />

              
              <Path path={groundPath}>
                <LinearGradient
                  start={vec(0, groundY)}
                  end={vec(0, H)}
                  colors={["#55aa48", "#42903a", "#2a6a1e"]}
                  positions={[0, 0.25, 1]}
                />
              </Path>

              
              <Path
                path={grassPath}
                color="rgba(60,150,40,0.3)"
                style="stroke"
                strokeWidth={1}
                strokeCap="round"
              />

              
              {treeData.map((tree, i) => {
                if (tree.type === "pine") {
                  return (
                    <Group key={`tree-${i}`}>
                      <Rect
                        x={tree.x - 3.5}
                        y={tree.y - tree.h * 0.22}
                        width={7}
                        height={tree.h * 0.22}
                        color="#5a3a1c"
                      />
                      {[0, 1, 2, 3, 4].map((li) => {
                        const ly = tree.y - tree.h * 0.22 - li * tree.h * 0.16;
                        const lw = 23 - li * 3.5;
                        const triPath = Skia.Path.Make();
                        triPath.moveTo(tree.x, ly - tree.h * 0.18);
                        triPath.lineTo(tree.x - lw, ly);
                        triPath.lineTo(tree.x + lw, ly);
                        triPath.close();
                        return (
                          <Path
                            key={`pine-${i}-${li}`}
                            path={triPath}
                            color={li % 2 === 0 ? "#2a6a2e" : "#388a3a"}
                          />
                        );
                      })}
                    </Group>
                  );
                }
              
                const cr = tree.cr || 28;
                const tw = tree.tw || 5;
                const cy = tree.y - (tree.h * 0.6);
                return (
                  <Group key={`tree-${i}`}>
                    {/* Shadow */}
                    <Oval
                      x={tree.x - cr * 0.75}
                      y={tree.y}
                      width={cr * 1.5}
                      height={9}
                      color="rgba(0,0,0,0.07)"
                    />
                    {/* Trunk */}
                    <Rect
                      x={tree.x - tw}
                      y={tree.y - tree.h * 0.52}
                      width={tw * 2}
                      height={tree.h * 0.52}
                      color="#6a4a28"
                    />
                    {/* Canopy circles */}
                    {[
                      [0, -cr * 0.38],
                      [-cr * 0.56, cr * 0.04],
                      [cr * 0.56, cr * 0.04],
                      [-cr * 0.3, -cr * 0.48],
                      [cr * 0.3, -cr * 0.48],
                      [0, cr * 0.16],
                    ].map(([ox, oy], ci) => (
                      <Circle
                        key={`canopy-${i}-${ci}`}
                        cx={tree.x + ox}
                        cy={cy + oy}
                        r={cr * (0.52 + ci * 0.022)}
                        color={ci % 2 === 0 ? "#3a8a34" : "#50a84a"}
                      />
                    ))}
                  </Group>
                );
              })}

              
              <Group>
                {/* Shadow */}
                <Oval
                  x={hx + hw * 0.5 - hw * 0.65}
                  y={hy + hh - 3}
                  width={hw * 1.3}
                  height={10}
                  color="rgba(0,0,0,0.08)"
                />
                {/* Walls */}
                <Rect x={hx} y={hy} width={hw} height={hh}>
                  <LinearGradient
                    start={vec(hx, hy)}
                    end={vec(hx + hw, hy + hh)}
                    colors={["#f8edd5", "#eadcb8"]}
                  />
                </Rect>
                {/* Roof */}
                <Path path={roofPath}>
                  <LinearGradient
                    start={vec(hx, hy - 32)}
                    end={vec(hx, hy)}
                    colors={["#c84538", "#a8322a"]}
                  />
                </Path>
                {/* Chimney */}
                <Rect x={chimX} y={hy - 28} width={10} height={20} color="#8a5e3e" />
                <Rect x={chimX - 1.5} y={hy - 28} width={13} height={3} color="#7a5032" />
                {/* Door */}
                <Path path={doorPath} color="#5a381c" />
                {/* Knob */}
                <Circle cx={hx + hw * 0.5 + 4} cy={hy + hh - 11} r={1.3} color="#d4a040" />
                {/* Windows */}
                <Rect x={hx + 6} y={hy + 10} width={14} height={12} color="rgba(155,210,240,0.55)" />
                <Rect x={hx + hw - 20} y={hy + 10} width={14} height={12} color="rgba(155,210,240,0.55)" />
              </Group>

              
              {Array.from({ length: Math.floor((fenceEnd - fenceStart) / 9) + 1 }).map(
                (_, i) => {
                  const fx = fenceStart + i * 9;
                  return (
                    <Rect
                      key={`fence-${i}`}
                      x={fx}
                      y={fenceYb - 17}
                      width={2.5}
                      height={20}
                      color="#8a7046"
                    />
                  );
                }
              )}
              <Rect x={fenceStart} y={fenceYb - 13} width={fenceEnd - fenceStart + 2} height={1.5} color="#7a5e36" />
              <Rect x={fenceStart} y={fenceYb - 5} width={fenceEnd - fenceStart + 2} height={1.5} color="#7a5e36" />

              
              <Path path={pathToHouse} color="rgba(175,152,115,0.32)" />

              
              {flowerSeedData.map((f, i) => {
                const headX = f.x;
                const headY = f.y - f.scale * 5.5;
                return (
                  <Group key={`flower-${i}`}>
                    {/* Stem line */}
                    <Line
                      p1={vec(f.x, f.y)}
                      p2={vec(f.x, headY)}
                      color="#3a7a28"
                      strokeWidth={1.1}
                    />
                    {/* Petals */}
                    {[0, 1, 2, 3, 4].map((p) => {
                      const angle = (p / 5) * TAU + i * 0.9;
                      return (
                        <Circle
                          key={`petal-${i}-${p}`}
                          cx={headX + Math.cos(angle) * f.scale}
                          cy={headY + Math.sin(angle) * f.scale}
                          r={f.scale * 0.52}
                          color={f.color}
                        />
                      );
                    })}
                    {/* Center */}
                    <Circle cx={headX} cy={headY} r={f.scale * 0.28} color="#ffe044" />
                  </Group>
                );
              })}

              
              {smokeData.value?.map((s, i) => (
                <Circle
                  key={`smoke-${i}`}
                  cx={s.cx}
                  cy={s.cy}
                  r={s.r}
                  color={`rgba(200,200,210,${s.opacity})`}
                />
              ))}

              
              <Path
                path={birdsPath}
                color="rgba(45,38,30,0.65)"
                style="stroke"
                strokeWidth={1.8}
                strokeCap="round"
              />
            </Group>
          </Canvas>
        </GestureDetector>

        {/* ── Export button ── */}
        <TouchableOpacity
          onPress={handleExportSVG}
          style={styles.exportBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.exportText}>Export SVG</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0e0c08",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  exportBtn: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  exportText: {
    color: "#c0b8a0",
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    letterSpacing: 0.5,
  },
});