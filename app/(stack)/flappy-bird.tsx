import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import {
  Canvas,
  Circle,
  Rect,
  RoundedRect,
  Group,
  Path,
  LinearGradient,
  vec,
  Skia,
} from "@shopify/react-native-skia";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const { width: SW, height: SH } = Dimensions.get("window");

const BIRD_X = SW * 0.28;
const BIRD_R = 14;
const GRAVITY = 0.38;
const FLAP = -7;
const MAX_VEL = 11;
const PIPE_W = 58;
const PIPE_CAP_H = 24;
const PIPE_CAP_EX = 5;
const GAP = 160;
const PIPE_SPEED = 2.6;
const GROUND_H = 90;
const PLAY_H = SH - GROUND_H;
const MIN_GAP_Y = GAP / 2 + 70;
const MAX_GAP_Y = PLAY_H - GAP / 2 - 70;
const PIPE_SPACING = 210;

const SKY_TOP = "#C8E6FF";
const SKY_BOT = "#87CEEB";
const CLOUD = "rgba(255,255,255,0.85)";
const PIPE_BODY = "#5CB85C";
const PIPE_CAP = "#4A9E4A";
const PIPE_LIGHT = "rgba(255,255,255,0.12)";
const PIPE_DARK = "rgba(0,0,0,0.08)";
const GROUND_MAIN = "#DEB887";
const GROUND_DARK = "#C8A87A";
const GRASS_TOP = "#5DBE5D";
const GRASS_DARK = "#4CAF50";
const BIRD_BODY = "#FFD93D";
const BIRD_BELLY = "#FFF3B0";
const BIRD_WING = "#F0C820";
const BIRD_WING_D = "#D4AE12";
const BIRD_BEAK = "#FF6B35";
const BIRD_BEAK_D = "#E05520";

interface PipeData {
  x: number;
  gapY: number;
  scored: boolean;
}

interface CloudData {
  x: number;
  y: number;
  r1: number;
  r2: number;
  r3: number;
  speed: number;
}

interface GameState {
  birdY: number;
  birdVel: number;
  pipes: PipeData[];
  clouds: CloudData[];
  groundX: number;
  frame: number;
  deathFrame: number;
  status: "ready" | "playing" | "dead";
}

const makeClouds = (): CloudData[] => [
  { x: 60, y: 80, r1: 18, r2: 24, r3: 16, speed: 0.3 },
  { x: 200, y: 130, r1: 14, r2: 20, r3: 12, speed: 0.45 },
  { x: 340, y: 60, r1: 20, r2: 26, r3: 18, speed: 0.35 },
  { x: 120, y: 190, r1: 12, r2: 16, r3: 10, speed: 0.5 },
  { x: 450, y: 110, r1: 16, r2: 22, r3: 14, speed: 0.4 },
];

const randomGapY = () =>
  MIN_GAP_Y + Math.random() * (MAX_GAP_Y - MIN_GAP_Y);

const initState = (): GameState => ({
  birdY: SH * 0.4,
  birdVel: 0,
  pipes: [],
  clouds: makeClouds(),
  groundX: 0,
  frame: 0,
  deathFrame: 0,
  status: "ready",
});

const circleRect = (
  cx: number,
  cy: number,
  r: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean => {
  const nearX = Math.max(rx, Math.min(cx, rx + rw));
  const nearY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nearX;
  const dy = cy - nearY;
  return dx * dx + dy * dy < r * r;
};

export default function FlappyGame() {
  const game = useRef(initState()).current;
  const [, setTick] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [status, setStatus] = useState<"ready" | "playing" | "dead">("ready");
  const rafRef = useRef(0);

  const scoreScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const deathTint = useSharedValue(0);

  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const deathStyle = useAnimatedStyle(() => ({
    opacity: deathTint.value,
  }));

  const resetGame = useCallback(() => {
    game.birdY = SH * 0.4;
    game.birdVel = 0;
    game.pipes = [];
    game.frame = 0;
    game.deathFrame = 0;
    game.status = "ready";
    setScore(0);
    setStatus("ready");
    deathTint.value = withTiming(0, { duration: 200 });
  }, []);

  const handleTap = useCallback(() => {
    if (game.status === "ready") {
      game.status = "playing";
      game.birdVel = FLAP;
      game.pipes = [{ x: SW + 100, gapY: randomGapY(), scored: false }];
      setStatus("playing");
    } else if (game.status === "playing") {
      game.birdVel = FLAP;
    } else if (game.status === "dead" && game.frame - game.deathFrame > 40) {
      resetGame();
    }
  }, []);

  const handleDeath = useCallback(() => {
    game.status = "dead";
    game.deathFrame = game.frame;
    setStatus("dead");
    const finalScore = game.pipes.filter((p) => p.scored).length;
    setScore(finalScore);
    setHighScore((h) => Math.max(h, finalScore));
    flashOpacity.value = withSequence(
      withTiming(0.7, { duration: 50 }),
      withTiming(0, { duration: 300 })
    );
    deathTint.value = withTiming(0.25, { duration: 200 });
  }, []);

  const incrementScore = useCallback(() => {
    setScore((s) => s + 1);
    scoreScale.value = withSequence(
      withTiming(1.4, { duration: 80 }),
      withSpring(1, { damping: 8, stiffness: 300 })
    );
  }, []);

  const tap = Gesture.Tap().onStart(() => {
    scheduleOnRN(handleTap);
  });

  useEffect(() => {
    const loop = () => {
      const g = game;
      g.frame++;

      g.clouds.forEach((c) => {
        c.x -= c.speed;
        if (c.x < -80) c.x = SW + 60 + Math.random() * 100;
      });

      if (g.status === "ready") {
        g.birdY = SH * 0.4 + Math.sin(g.frame * 0.04) * 14;
        g.groundX -= 1;
      }

      if (g.status === "playing") {
        g.birdVel = Math.min(g.birdVel + GRAVITY, MAX_VEL);
        g.birdY += g.birdVel;
        g.groundX -= PIPE_SPEED;

        g.pipes.forEach((p) => (p.x -= PIPE_SPEED));

        if (g.pipes.length === 0 || g.pipes[g.pipes.length - 1].x < SW - PIPE_SPACING) {
          g.pipes.push({ x: SW + 50, gapY: randomGapY(), scored: false });
        }

        g.pipes = g.pipes.filter((p) => p.x > -PIPE_W - 20);

        g.pipes.forEach((p) => {
          if (!p.scored && p.x + PIPE_W < BIRD_X) {
            p.scored = true;
            runOnJS(incrementScore)();
          }
        });

        let hit = false;

        if (g.birdY + BIRD_R > PLAY_H || g.birdY - BIRD_R < 0) {
          hit = true;
        }

        if (!hit) {
          for (const p of g.pipes) {
            const topH = p.gapY - GAP / 2;
            const botY = p.gapY + GAP / 2;
            if (
              circleRect(BIRD_X, g.birdY, BIRD_R - 1, p.x, 0, PIPE_W, topH) ||
              circleRect(BIRD_X, g.birdY, BIRD_R - 1, p.x, botY, PIPE_W, SH - botY) ||
              circleRect(BIRD_X, g.birdY, BIRD_R - 1, p.x - PIPE_CAP_EX, topH - PIPE_CAP_H, PIPE_W + PIPE_CAP_EX * 2, PIPE_CAP_H) ||
              circleRect(BIRD_X, g.birdY, BIRD_R - 1, p.x - PIPE_CAP_EX, botY, PIPE_W + PIPE_CAP_EX * 2, PIPE_CAP_H)
            ) {
              hit = true;
              break;
            }
          }
        }

        if (hit) {
          runOnJS(handleDeath)();
        }
      }

      if (g.status === "dead") {
        if (g.birdY < PLAY_H - BIRD_R) {
          g.birdVel = Math.min(g.birdVel + GRAVITY * 1.8, MAX_VEL * 1.3);
          g.birdY = Math.min(g.birdY + g.birdVel, PLAY_H - BIRD_R);
        }
      }

      setTick((t) => t + 1);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const g = game;
  const rotation =
    g.status === "ready"
      ? Math.sin(g.frame * 0.04) * 0.15
      : Math.min(Math.max(g.birdVel * 4.5, -30), 85) * (Math.PI / 180);

  const wingY = Math.floor(g.frame / 6) % 2 === 0 ? -3 : 4;

  const beak = Skia.Path.Make();
  beak.moveTo(BIRD_X + BIRD_R - 2, g.birdY - 3);
  beak.lineTo(BIRD_X + BIRD_R + 11, g.birdY + 2);
  beak.lineTo(BIRD_X + BIRD_R - 2, g.birdY + 7);
  beak.close();

  const beakBot = Skia.Path.Make();
  beakBot.moveTo(BIRD_X + BIRD_R - 2, g.birdY + 2);
  beakBot.lineTo(BIRD_X + BIRD_R + 9, g.birdY + 3);
  beakBot.lineTo(BIRD_X + BIRD_R - 2, g.birdY + 7);
  beakBot.close();

  const stripeW = 36;
  const gxOff = ((g.groundX % stripeW) + stripeW) % stripeW;

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="dark-content" hidden />
      <GestureDetector gesture={tap}>
        <View style={styles.container}>
          <Canvas style={styles.canvas}>
            

            <Rect x={0} y={0} width={SW} height={SH}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, PLAY_H)}
                colors={[SKY_TOP, SKY_BOT]}
              />
            </Rect>





            

            {g.clouds.map((c, i) => (
              <Group key={i}>
                <Circle cx={c.x} cy={c.y} r={c.r1} color={CLOUD} />
                <Circle cx={c.x + c.r2 * 0.9} cy={c.y - 4} r={c.r2} color={CLOUD} />
                <Circle cx={c.x + c.r2 * 1.8} cy={c.y} r={c.r3} color={CLOUD} />
              </Group>
            ))}





            

            {g.pipes.map((p, i) => {
              const topH = p.gapY - GAP / 2;
              const botY = p.gapY + GAP / 2;
              return (
                <Group key={`pipe-${i}`}>
                  <Rect x={p.x} y={0} width={PIPE_W} height={topH} color={PIPE_BODY} />
                  <Rect x={p.x} y={0} width={6} height={topH} color={PIPE_LIGHT} />
                  <Rect x={p.x + PIPE_W - 6} y={0} width={6} height={topH} color={PIPE_DARK} />
                  <RoundedRect
                    x={p.x - PIPE_CAP_EX}
                    y={topH - PIPE_CAP_H}
                    width={PIPE_W + PIPE_CAP_EX * 2}
                    height={PIPE_CAP_H}
                    r={4}
                    color={PIPE_CAP}
                  />
                  <RoundedRect
                    x={p.x - PIPE_CAP_EX}
                    y={topH - PIPE_CAP_H}
                    width={6}
                    height={PIPE_CAP_H}
                    r={2}
                    color={PIPE_LIGHT}
                  />

                  <Rect x={p.x} y={botY} width={PIPE_W} height={PLAY_H - botY} color={PIPE_BODY} />
                  <Rect x={p.x} y={botY} width={6} height={PLAY_H - botY} color={PIPE_LIGHT} />
                  <Rect x={p.x + PIPE_W - 6} y={botY} width={6} height={PLAY_H - botY} color={PIPE_DARK} />
                  <RoundedRect
                    x={p.x - PIPE_CAP_EX}
                    y={botY}
                    width={PIPE_W + PIPE_CAP_EX * 2}
                    height={PIPE_CAP_H}
                    r={4}
                    color={PIPE_CAP}
                  />
                  <RoundedRect
                    x={p.x - PIPE_CAP_EX}
                    y={botY}
                    width={6}
                    height={PIPE_CAP_H}
                    r={2}
                    color={PIPE_LIGHT}
                  />
                </Group>
              );
            })}





            

            <Rect x={0} y={PLAY_H} width={SW} height={GROUND_H} color={GROUND_MAIN} />
            <Rect x={0} y={PLAY_H} width={SW} height={6} color={GRASS_TOP} />
            <Rect x={0} y={PLAY_H + 6} width={SW} height={3} color={GRASS_DARK} />

            {Array.from({ length: Math.ceil(SW / stripeW) + 2 }).map((_, i) => (
              <Rect
                key={`gs-${i}`}
                x={i * stripeW - gxOff}
                y={PLAY_H + 14}
                width={stripeW / 2}
                height={3}
                color={GROUND_DARK}
              />
            ))}
            {Array.from({ length: Math.ceil(SW / stripeW) + 2 }).map((_, i) => (
              <Rect
                key={`gs2-${i}`}
                x={i * stripeW - gxOff + stripeW * 0.3}
                y={PLAY_H + 26}
                width={stripeW / 3}
                height={2}
                color={GROUND_DARK}
              />
            ))}





            

            <Group
              transform={[{ rotate: rotation }]}
              origin={vec(BIRD_X, g.birdY)}
            >
              <Circle cx={BIRD_X + 1} cy={g.birdY + 2} r={BIRD_R + 1} color="rgba(0,0,0,0.08)" />

              <Circle cx={BIRD_X} cy={g.birdY} r={BIRD_R} color={BIRD_BODY} />

              <Circle
                cx={BIRD_X - 2}
                cy={g.birdY + 3}
                r={BIRD_R * 0.55}
                color={BIRD_BELLY}
              />

              <Circle
                cx={BIRD_X - 6}
                cy={g.birdY + wingY}
                r={7}
                color={BIRD_WING}
              />
              <Circle
                cx={BIRD_X - 6}
                cy={g.birdY + wingY + 2}
                r={5}
                color={BIRD_WING_D}
              />

              <Path path={beak} color={BIRD_BEAK} />
              <Path path={beakBot} color={BIRD_BEAK_D} />

              <Circle cx={BIRD_X + 6} cy={g.birdY - 4} r={6} color="white" />
              <Circle cx={BIRD_X + 8} cy={g.birdY - 4} r={3} color="#1A1A2E" />
              <Circle cx={BIRD_X + 9} cy={g.birdY - 5.5} r={1.2} color="white" />
            </Group>




          </Canvas>

          

          <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />
          <Animated.View style={[styles.deathTint, deathStyle]} pointerEvents="none" />

          {status === "playing" && (
            <Animated.View style={[styles.scoreWrap, scoreStyle]}>
              <Text style={styles.score}>{score}</Text>
            </Animated.View>
          )}



          

          {status === "ready" && (
            <View style={styles.startOverlay}>
              <View style={styles.startCard}>
                <Text style={styles.startTitle}>Flappy Bird</Text>
                <Text style={styles.startSub}>Tap to fly!</Text>
                <View style={styles.startDivider} />
                <View style={styles.startRow}>
                  <View style={styles.startChip}>
                    <Text style={styles.startChipIcon}></Text>
                    <Text style={styles.startChipVal}>{highScore}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {status === "dead" && (
            <View style={styles.deathOverlay}>
              <View style={styles.deathCard}>
                <Text style={styles.deathTitle}>Game Over</Text>
                <View style={styles.deathDivider} />
                <View style={styles.deathScores}>
                  <View style={styles.deathScoreItem}>
                    <Text style={styles.deathLabel}>Score</Text>
                    <Text style={styles.deathVal}>{score}</Text>
                  </View>
                  <View style={styles.deathScoreDivider} />
                  <View style={styles.deathScoreItem}>
                    <Text style={styles.deathLabel}>Best</Text>
                    <Text style={[styles.deathVal, { color: "#FFD93D" }]}>
                      {highScore}
                    </Text>
                  </View>
                </View>
                {score >= highScore && score > 0 && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW BEST!</Text>
                  </View>
                )}
                <View style={styles.medalRow}>
                  {score >= 10 && (
                    <Text style={styles.medal}>
                      {score >= 40 ? "" : score >= 20 ? "🥈" : ""}
                    </Text>
                  )}
                </View>
                <Text style={styles.restartHint}>Tap to restart</Text>
              </View>
            </View>
          )}

🥉🥇🏆
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFF",
  },
  deathTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FF0000",
  },
  scoreWrap: {
    position: "absolute",
    top: 70,
    alignSelf: "center",
  },
  score: {
    fontSize: 56,
    fontWeight: "900",
    color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    fontVariant: ["tabular-nums"],
  },
  



  startOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 120,
  },
  startCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 48,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    gap: 8,
  },
  startTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1F2937",
    letterSpacing: -1,
  },
  startSub: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  startDivider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#FFD93D",
    marginVertical: 6,
  },
  startRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  startChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  startChipIcon: {
    fontSize: 16,
  },
  startChipVal: {
    fontSize: 16,
    fontWeight: "800",
    color: "#F59E0B",
  },
  deathOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  deathCard: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 44,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    minWidth: 240,
    gap: 10,
  },
  deathTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#EF4444",
    letterSpacing: -0.5,
  },
  deathDivider: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#EF4444",
    opacity: 0.3,
  },
  deathScores: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  deathScoreItem: {
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 2,
  },
  deathScoreDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#E5E7EB",
  },
  deathLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  deathVal: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
    fontVariant: ["tabular-nums"],
  },
  newBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#F59E0B",
    letterSpacing: 1.5,
  },
  medalRow: {
    minHeight: 36,
    justifyContent: "center",
  },
  medal: {
    fontSize: 36,
  },
  restartHint: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 2,
  }


});



