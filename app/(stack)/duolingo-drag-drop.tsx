import React, { useCallback, useReducer, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  ZoomIn,
  ZoomOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle } from "react-native-svg";
import { Canvas, Path as SkPath, Skia } from "@shopify/react-native-skia";

const SPRING_SOFT = { damping: 22, stiffness: 180, mass: 0.9 };
const SPRING_SNAPPY = { damping: 18, stiffness: 340, mass: 0.6 };
const SPRING_BOUNCY = { damping: 12, stiffness: 220, mass: 0.8 };
const SPRING_FLY = { damping: 16, stiffness: 160, mass: 0.7 };

const WORD_HEIGHT = 50;

const SENTENCE_WORDS = ["The", "cat", "sat", "on", "the", "mat"];
const WORD_POOL = ["mat", "The", "on", "sat", "cat", "dog", "the", "ran"];

const C = {
  primary: "#58CC02",
  primaryDark: "#46A302",
  primaryLight: "#89E219",
  secondary: "#1CB0F6",
  secondaryDark: "#1899D6",
  bg: "#131F24",
  bgCard: "#1B2B33",
  bgCardLight: "#223642",
  surface: "#1B2B33",
  border: "#2A3F4D",
  borderLight: "#354E5E",
  text: "#FFFFFF",
  textMid: "#8BA4B5",
  textLight: "#5A7585",
  slotBorder: "#1CB0F6",
  slotBg: "rgba(28,176,246,0.08)",
  wordBg: "#223642",
  wordBorder: "#354E5E",
  wordShadow: "#0D1A20",
  correct: "#1B3A1B",
  correctBorder: "#58CC02",
  correctText: "#89E219",
  wrong: "#3A1B1B",
  wrongBorder: "#FF4B4B",
  wrongText: "#FF8080",
  xpGold: "#FFC800",
  accent: "#CE82FF",
};

type Layout = { x: number; y: number; width: number; height: number };
type CorrectState = "correct" | "wrong" | "neutral";

type WordState = {
  id: number;
  word: string;
  inSlot: boolean;
  slotIndex: number | null;
  poolIndex: number;
};
type SlotState = { wordId: number | null };
type AppState = {
  words: WordState[];
  slots: SlotState[];
  checked: boolean;
  isCorrect: boolean | null;
};
type Action =
  | { type: "PLACE_WORD"; wordId: number; slotIndex: number }
  | { type: "REMOVE_FROM_SLOT"; slotIndex: number }
  | { type: "CHECK" }
  | { type: "RESET" };

function buildInitialState(): AppState {
  return {
    words: WORD_POOL.map((word, i) => ({
      id: i,
      word,
      inSlot: false,
      slotIndex: null,
      poolIndex: i,
    })),
    slots: SENTENCE_WORDS.map(() => ({ wordId: null })),
    checked: false,
    isCorrect: null,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "PLACE_WORD": {
      const { wordId, slotIndex } = action;
      const evicted = state.slots[slotIndex].wordId;
      const words = state.words.map((w) => {
        if (w.id === wordId) return { ...w, inSlot: true, slotIndex };
        if (evicted !== null && w.id === evicted)
          return { ...w, inSlot: false, slotIndex: null };
        return w;
      });
      const slots = state.slots.map((s, i) =>
        i === slotIndex ? { wordId } : s
      );
      return { ...state, words, slots, checked: false, isCorrect: null };
    }
    case "REMOVE_FROM_SLOT": {
      const wordId = state.slots[action.slotIndex].wordId;
      if (wordId === null) return state;
      const words = state.words.map((w) =>
        w.id === wordId ? { ...w, inSlot: false, slotIndex: null } : w
      );
      const slots = state.slots.map((s, i) =>
        i === action.slotIndex ? { wordId: null } : s
      );
      return { ...state, words, slots, checked: false, isCorrect: null };
    }
    case "CHECK": {
      const placed = state.slots.map((s) =>
        s.wordId !== null
          ? state.words.find((w) => w.id === s.wordId)?.word ?? ""
          : ""
      );
      const isCorrect =
        placed.every((w, i) => w === SENTENCE_WORDS[i]) &&
        state.slots.every((s) => s.wordId !== null);
      return { ...state, checked: true, isCorrect };
    }
    case "RESET":
      return buildInitialState();
    default:
      return state;
  }
}

const DuoOwl = ({ size = 80 }: { size?: number }) => {
  const scale = size / 171;
  const w = 143 * scale;
  const h = 171 * scale;
  return (
    <Svg width={w} height={h} viewBox="0 0 143 171" fill="none">
      <Path fillRule="evenodd" clipRule="evenodd" d="M51.4273 9.06885C79.8514 9.06885 102.855 32.0346 102.855 60.4127V170.853H10.1096C4.54201 170.853 0 166.319 0 160.76V60.559C0 32.1809 23.0031 9.06885 51.4273 9.06885Z" fill="#ACC1D9" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M32.9662 25.1597C38.2408 25.1597 42.4898 29.4018 42.4898 34.6678V38.9099C42.4898 44.1759 38.2408 48.418 32.9662 48.418C27.6916 48.418 23.4426 44.1759 23.4426 38.9099V34.6678C23.4426 29.548 27.6916 25.1597 32.9662 25.1597Z" fill="white" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M48.6436 25.1597C43.369 25.1597 39.12 29.4018 39.12 34.6678V38.9099C39.12 44.1759 43.369 48.418 48.6436 48.418C53.9181 48.418 58.1671 44.1759 58.1671 38.9099V34.6678C58.1671 29.548 53.9181 25.1597 48.6436 25.1597Z" fill="white" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M48.2037 31.4502C45.5664 31.4502 43.3687 33.6444 43.3687 36.2774V39.203C43.3687 41.836 45.5664 44.0302 48.2037 44.0302C50.841 44.0302 53.0387 41.836 53.0387 39.203V36.2774C53.0387 33.6444 50.841 31.4502 48.2037 31.4502Z" fill="#636363" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M33.992 31.4502C31.3547 31.4502 29.157 33.6444 29.157 36.2774V39.203C29.157 41.836 31.3547 44.0302 33.992 44.0302C36.6293 44.0302 38.8271 41.836 38.8271 39.203V36.2774C38.8271 33.6444 36.6293 31.4502 33.992 31.4502Z" fill="#636363" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M27.8382 51.4897H45.4201C53.4785 51.4897 60.0718 58.0723 60.0718 66.1176C60.0718 74.163 53.4785 80.7455 45.4201 80.7455H27.8382C19.7798 80.7455 13.1865 74.163 13.1865 66.1176C13.1865 58.0723 19.7798 51.4897 27.8382 51.4897Z" fill="white" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M34.4313 105.613C47.7643 105.613 58.6065 116.437 58.6065 129.749V137.063C58.6065 150.374 47.7643 161.199 34.4313 161.199C21.0983 161.199 10.2561 150.374 10.2561 137.063V129.749C10.2561 116.437 21.0983 105.613 34.4313 105.613Z" fill="white" />
      <Path d="M103.001 170.854C97.1403 170.854 92.3053 166.173 92.3053 160.175C92.3053 154.178 96.9938 149.497 103.001 149.497C106.517 149.497 111.645 147.449 114.429 143.646C117.067 139.989 117.213 135.015 115.162 129.018C105.638 101.517 118.678 89.6688 127.323 84.9879C132.451 82.2086 138.898 84.1102 141.681 89.2299C144.465 94.3497 142.56 100.786 137.432 103.565C135.088 104.882 130.253 107.515 135.235 121.996C139.63 134.576 138.311 146.571 131.718 155.933C125.418 165.149 114.136 170.854 103.001 170.854Z" fill="#ACC1D9" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M98.6054 88.0596H103.001V114.39H98.6054C91.2796 114.39 85.4189 108.539 85.4189 101.225C85.4189 93.9107 91.2796 88.0596 98.6054 88.0596Z" fill="#95ADC8" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M98.6054 123.167H103.001V149.497H98.6054C91.2796 149.497 85.4189 143.646 85.4189 136.332C85.4189 129.018 91.2796 123.167 98.6054 123.167Z" fill="#95ADC8" />
      <Path d="M74.7234 23.6968H23.4426V38.3247H74.7234V23.6968Z" fill="#ACC1D9" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M36.1894 59.5351L38.6802 56.9021C39.8523 55.5856 39.8523 53.5376 38.5337 52.3674C37.9476 51.7823 37.215 51.4897 36.3359 51.4897H31.2079C29.4497 51.4897 27.9845 52.9525 27.9845 54.7079C27.9845 55.4393 28.2775 56.3169 28.8636 56.9021L31.3544 59.5351C32.673 60.8516 34.7243 60.9979 36.0429 59.6814C36.0429 59.6814 36.0429 59.6814 36.1894 59.5351Z" fill="#F6A4A5" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M48.6435 3.07171L57.7275 16.3831H27.8381L36.9222 3.07171C39.1199 -0.146427 43.5154 -1.0241 46.7387 1.17008C47.4713 1.7552 48.0574 2.34031 48.6435 3.07171Z" fill="#ACC1D9" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M65.6392 3.07171L74.7232 16.3831H44.8339L53.9179 3.07171C56.1156 -0.146427 60.5111 -1.0241 63.7345 1.17008C64.4671 1.7552 65.1996 2.34031 65.6392 3.07171Z" fill="#ACC1D9" />
    </Svg>
  );
};

const Heart = () => (
  <Svg width={20} height={20} viewBox="0 0 24 22" fill="none">
    <Path d="M20.84 3.61a5.5 5.5 0 00-7.78 0L12 4.67l-1.06-1.06a5.501 5.501 0 00-7.78 7.78l1.06 1.06L12 20.23l7.78-7.78 1.06-1.06a5.501 5.501 0 000-7.78v0z" fill="#FF4B4B" stroke="#E63939" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={8} cy={7} r={2.5} fill="#FF8080" opacity={0.6} />
  </Svg>
);

const XpStar = ({ size = 16 }: { size?: number }) => {
  const p = Skia.Path.Make();
  const cx = size / 2;
  const r1 = size / 2 - 0.5;
  const r2 = r1 / 2.4;
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? r1 : r2;
    const x = cx + r * Math.cos(angle);
    const y = cx + r * Math.sin(angle);
    if (i === 0) p.moveTo(x, y);
    else p.lineTo(x, y);
  }
  p.close();
  return (
    <Canvas style={{ width: size, height: size }}>
      <SkPath path={p} color={C.xpGold} />
    </Canvas>
  );
};

const WordTile = ({
  word,
  onPress,
  disabled,
  correctState = "neutral",
  isSlot = false,
  isGhost = false,
}: {
  word: string;
  onPress?: () => void;
  disabled?: boolean;
  correctState?: CorrectState;
  isSlot?: boolean;
  isGhost?: boolean;
}) => {
  const borderColor =
    correctState === "correct" ? C.correctBorder
    : correctState === "wrong" ? C.wrongBorder
    : isSlot ? C.secondary
    : C.wordBorder;

  const shadowColor =
    correctState === "correct" ? C.primaryDark
    : correctState === "wrong" ? "#CC3333"
    : isSlot ? C.secondaryDark
    : C.wordShadow;

  const bgColor =
    correctState === "correct" ? C.correct
    : correctState === "wrong" ? C.wrong
    : C.wordBg;

  const textColor =
    correctState === "correct" ? C.correctText
    : correctState === "wrong" ? C.wrongText
    : C.text;

  if (isGhost) {
    return (
      <View style={[styles.wordRoot, { opacity: 0.15 }]}>
        <View style={[styles.wordContainer, { backgroundColor: "transparent", borderColor: C.borderLight, borderStyle: "dashed" }]}>
          <Text style={[styles.wordText, { color: "transparent" }]}>{word}</Text>
        </View>
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.wordRoot, pressed && { transform: [{ translateY: 2 }] }]}>
      {({ pressed }) => (
        <View>
          <View style={[styles.wordContainer, { backgroundColor: bgColor, borderColor }]}>
            <Text style={[styles.wordText, { color: textColor }]}>{word}</Text>
          </View>
          <View style={[styles.wordShadow, { borderColor: shadowColor, opacity: pressed ? 0 : 1 }]} />
        </View>
      )}
    </Pressable>
  );
};

type DraggableWordProps = {
  wordState: WordState;
  onDragEnd: (
    wordId: number,
    poolIndex: number,
    translationX: number,
    translationY: number,
    velocityX: number,
    velocityY: number,
    translateXSV: Animated.SharedValue<number>,
    translateYSV: Animated.SharedValue<number>,
    scaleSV: Animated.SharedValue<number>,
    rotateSV: Animated.SharedValue<number>,
    isAnimatingSV: Animated.SharedValue<boolean>
  ) => void;
  dispatch: React.Dispatch<Action>;
  state: AppState;
};

function DraggableWord({ wordState, onDragEnd, dispatch, state }: DraggableWordProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);
  const isGestureActive = useSharedValue(false);
  const isAnimating = useSharedValue(false);
  const rotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleDragEnd = useCallback(
    (tX: number, tY: number, vX: number, vY: number) => {
      onDragEnd(wordState.id, wordState.poolIndex, tX, tY, vX, vY, translateX, translateY, scale, rotate, isAnimating);
    },
    [wordState.id, wordState.poolIndex, onDragEnd]
  );

  const panGesture = Gesture.Pan()
    .minDistance(4)
    .onStart(() => {
      runOnJS(triggerHaptic)();
      isGestureActive.value = true;
      zIndex.value = 999;
      scale.value = withSpring(1.12, SPRING_SNAPPY);
      glowOpacity.value = withTiming(1, { duration: 200 });
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      rotate.value = withSpring(
        Math.min(Math.max(e.velocityX / 150, -8), 8),
        { damping: 10, stiffness: 100 }
      );
    })
    .onEnd((e) => {
      isGestureActive.value = false;
      glowOpacity.value = withTiming(0, { duration: 300 });
      runOnJS(handleDragEnd)(e.translationX, e.translationY, e.velocityX, e.velocityY);
      zIndex.value = withDelay(400, withTiming(1, { duration: 0 }));
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateZ: `${rotate.value}deg` },
    ],
    zIndex: isGestureActive.value || isAnimating.value ? 999 : zIndex.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.secondary,
    opacity: glowOpacity.value * 0.6,
  }));

  const handleTilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const emptySlot = state.slots.findIndex((s) => s.wordId === null);
    if (emptySlot !== -1) {
      dispatch({ type: "PLACE_WORD", wordId: wordState.id, slotIndex: emptySlot });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  if (state.checked || wordState.inSlot) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animStyle}>
        <Animated.View style={glowStyle} />
        <WordTile word={wordState.word} onPress={handleTilePress} />
      </Animated.View>
    </GestureDetector>
  );
}

const ResultBanner = ({ checked, isCorrect }: { checked: boolean; isCorrect: boolean | null }) => {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);
  const bannerScale = useSharedValue(0.95);

  React.useEffect(() => {
    if (checked) {
      translateY.value = withSpring(0, SPRING_BOUNCY);
      opacity.value = withTiming(1, { duration: 250 });
      bannerScale.value = withSequence(withSpring(1.02, SPRING_SNAPPY), withSpring(1, SPRING_BOUNCY));
    } else {
      translateY.value = 50;
      opacity.value = 0;
      bannerScale.value = 0.95;
    }
  }, [checked]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: bannerScale.value }],
    opacity: opacity.value,
  }));

  if (!checked) return null;

  return (
    <Animated.View style={style}>
      <LinearGradient
        colors={isCorrect ? ["rgba(88,204,2,0.12)", "rgba(88,204,2,0.06)"] : ["rgba(255,75,75,0.12)", "rgba(255,75,75,0.06)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.resultBanner, { borderColor: isCorrect ? C.correctBorder : C.wrongBorder }]}
      >
        <View style={[styles.resultIconWrap, { backgroundColor: isCorrect ? C.correctBorder : "#FF4B4B" }]}>
          <Ionicons name={isCorrect ? "checkmark" : "close"} size={20} color="white" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.resultTitle, { color: isCorrect ? C.correctText : C.wrongText }]}>
            {isCorrect ? "Great job!" : "Not quite!"}
          </Text>
          <Text style={styles.resultSub}>
            {isCorrect ? "You earned +10 XP" : `Correct: "${SENTENCE_WORDS.join(" ")}"`}
          </Text>
        </View>
        {isCorrect && <XpStar size={28} />}
      </LinearGradient>
    </Animated.View>
  );
};

export default function DuolingoDragDrop() {
  const [state, dispatch] = useReducer(reducer, buildInitialState());
  const slotLayoutsRef = useRef<Record<number, Layout>>({});
  const poolLayoutsRef = useRef<Record<number, Layout>>({});
  const [lives] = useState(3);
  const [xp] = useState(42);

  const allSlotsFilled = state.slots.every((s) => s.wordId !== null);

  const measureSlot = useCallback((index: number, target: any) => {
    target.measure((_x: number, _y: number, w: number, h: number, pageX: number, pageY: number) => {
      slotLayoutsRef.current[index] = { x: pageX, y: pageY, width: w, height: h };
    });
  }, []);

  const measurePool = useCallback((index: number, target: any) => {
    target.measure((_x: number, _y: number, w: number, h: number, pageX: number, pageY: number) => {
      poolLayoutsRef.current[index] = { x: pageX, y: pageY, width: w, height: h };
    });
  }, []);

  const handleDragEnd = useCallback(
    (
      wordId: number,
      poolIndex: number,
      translationX: number,
      translationY: number,
      velocityX: number,
      velocityY: number,
      translateXSV: Animated.SharedValue<number>,
      translateYSV: Animated.SharedValue<number>,
      scaleSV: Animated.SharedValue<number>,
      rotateSV: Animated.SharedValue<number>,
      isAnimatingSV: Animated.SharedValue<boolean>
    ) => {
      const pl = poolLayoutsRef.current[poolIndex];
      if (!pl) {
        translateXSV.value = withSpring(0, SPRING_SOFT);
        translateYSV.value = withSpring(0, SPRING_SOFT);
        scaleSV.value = withSpring(1, SPRING_BOUNCY);
        rotateSV.value = withSpring(0, SPRING_SOFT);
        return;
      }

      const tileCenterX = pl.x + pl.width / 2;
      const tileCenterY = pl.y + pl.height / 2;
      const absX = tileCenterX + translationX;
      const absY = tileCenterY + translationY;

      let targetSlot: number | null = null;
      const slots = slotLayoutsRef.current;
      for (const key in slots) {
        const idx = Number(key);
        const layout = slots[idx];
        if (
          absX >= layout.x - 20 &&
          absX <= layout.x + layout.width + 20 &&
          absY >= layout.y - 20 &&
          absY <= layout.y + layout.height + 20
        ) {
          targetSlot = idx;
          break;
        }
      }

      if (targetSlot !== null) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        dispatch({ type: "PLACE_WORD", wordId, slotIndex: targetSlot });

        const sl = slots[targetSlot];
        if (sl) {
          const flyToX = sl.x + sl.width / 2 - tileCenterX;
          const flyToY = sl.y + sl.height / 2 - tileCenterY;
          isAnimatingSV.value = true;
          translateXSV.value = withSpring(flyToX, SPRING_FLY, () => {
            translateXSV.value = 0;
            translateYSV.value = 0;
            isAnimatingSV.value = false;
          });
          translateYSV.value = withSpring(flyToY, SPRING_FLY);
          scaleSV.value = withSequence(withSpring(0.85, SPRING_SNAPPY), withSpring(1, SPRING_BOUNCY));
          rotateSV.value = withSpring(0, SPRING_SOFT);
        } else {
          translateXSV.value = withSpring(0, SPRING_FLY);
          translateYSV.value = withSpring(0, SPRING_FLY);
          scaleSV.value = withSpring(1, SPRING_BOUNCY);
          rotateSV.value = withSpring(0, SPRING_SOFT);
        }
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        isAnimatingSV.value = true;
        scaleSV.value = withSequence(withSpring(0.92, SPRING_SNAPPY), withSpring(1, SPRING_BOUNCY));
        translateXSV.value = withSpring(0, { ...SPRING_SOFT, velocity: velocityX * 0.3 }, () => {
          isAnimatingSV.value = false;
        });
        translateYSV.value = withSpring(0, { ...SPRING_SOFT, velocity: velocityY * 0.3 });
        rotateSV.value = withSpring(0, SPRING_SOFT);
      }
    },
    []
  );

  const handleCheck = () => {
    dispatch({ type: "CHECK" });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: "RESET" });
  };

  const getSlotWord = (i: number) => {
    const slot = state.slots[i];
    if (slot.wordId === null) return null;
    return state.words.find((w) => w.id === slot.wordId) ?? null;
  };

  const getSlotCorrectState = (i: number): CorrectState => {
    if (!state.checked) return "neutral";
    const word = getSlotWord(i);
    if (!word) return "neutral";
    return word.word === SENTENCE_WORDS[i] ? "correct" : "wrong";
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <Pressable onPress={handleReset} style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.5, transform: [{ scale: 0.9 }] }]}>
            <Ionicons name="close" size={18} color={C.textMid} />
          </Pressable>
          <View style={styles.progressTrack}>
            <LinearGradient colors={[C.primaryLight, C.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.progressFill} />
          </View>
          <View style={styles.topStats}>
            <View style={styles.livesRow}>
              {Array.from({ length: 3 }, (_, i) => (
                <View key={i} style={{ opacity: i < lives ? 1 : 0.25 }}>
                  <Heart />
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.xpRow}>
          <XpStar size={13} />
          <Text style={styles.xpText}>{xp} XP</Text>
          <View style={styles.xpDot} />
          <Text style={styles.lessonTag}>Lesson 4 · Section 2</Text>
        </View>

        <View style={styles.owlRow}>
          <DuoOwl size={78} />
          <View style={styles.speechBubble}>
            <Text style={styles.speechTitle}>Translate this sentence</Text>
            <Text style={styles.speechHint}>Tap or drag the words below</Text>
            <View style={styles.speechNubBorder} />
            <View style={styles.speechNub} />
          </View>
        </View>

        <View style={styles.promptCard}>
          <View style={styles.promptTopRow}>
            <View style={styles.langPill}>
              <Text style={styles.langPillEmoji}>🇫🇷</Text>
              <Text style={styles.langPillText}>FRENCH</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.audioBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] }]}>
              <Ionicons name="volume-high" size={16} color="white" />
            </Pressable>
          </View>
          <Text style={styles.promptSentence}>Le chat était assis sur le tapis</Text>
        </View>

        <View style={styles.answerBox}>
          <View style={styles.answerRow}>
            {SENTENCE_WORDS.map((_, i) => {
              const slotWord = getSlotWord(i);
              const cs = getSlotCorrectState(i);
              return (
                <View key={i} onLayout={(e) => measureSlot(i, e.target)}>
                  {slotWord ? (
                    <Animated.View entering={ZoomIn.springify().damping(14).stiffness(200).duration(350)} exiting={ZoomOut.duration(200)}>
                      <WordTile
                        word={slotWord.word}
                        isSlot
                        correctState={cs}
                        onPress={() => {
                          if (!state.checked) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            dispatch({ type: "REMOVE_FROM_SLOT", slotIndex: i });
                          }
                        }}
                        disabled={state.checked}
                      />
                    </Animated.View>
                  ) : (
                    <Animated.View entering={FadeIn.duration(200)} style={styles.emptySlot} />
                  )}
                </View>
              );
            })}
          </View>
          <View style={styles.answerDivider} />
        </View>

        <ResultBanner checked={state.checked} isCorrect={state.isCorrect} />

        <View style={styles.poolDivider} />
        <View style={styles.wordPool}>
          {state.words.map((wordState) => {
            if (wordState.inSlot) {
              return (
                <View key={wordState.id} onLayout={(e) => measurePool(wordState.poolIndex, e.target)}>
                  <WordTile word={wordState.word} isGhost />
                </View>
              );
            }
            return (
              <View key={wordState.id} onLayout={(e) => measurePool(wordState.poolIndex, e.target)}>
                <Animated.View entering={FadeInUp.springify().damping(16).delay(wordState.poolIndex * 40)}>
                  <DraggableWord wordState={wordState} onDragEnd={handleDragEnd} dispatch={dispatch} state={state} />
                </Animated.View>
              </View>
            );
          })}
        </View>

        <View style={styles.ctaRow}>
          {state.checked ? (
            <Pressable onPress={handleReset} style={({ pressed }) => [styles.checkBtn, pressed && { transform: [{ scale: 0.97 }] }]}>
              <LinearGradient colors={[C.primaryLight, C.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.checkBtnGradient}>
                <Text style={styles.checkBtnText}>CONTINUE</Text>
                <Ionicons name="arrow-forward" size={18} color="white" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable onPress={handleCheck} disabled={!allSlotsFilled} style={({ pressed }) => [styles.checkBtn, !allSlotsFilled && styles.checkBtnDisabled, pressed && allSlotsFilled && { transform: [{ scale: 0.97 }] }]}>
              {allSlotsFilled ? (
                <LinearGradient colors={[C.primaryLight, C.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.checkBtnGradient}>
                  <Text style={styles.checkBtnText}>CHECK</Text>
                </LinearGradient>
              ) : (
                <View style={styles.checkBtnGradient}>
                  <Text style={[styles.checkBtnText, styles.checkBtnTextDisabled]}>CHECK</Text>
                </View>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, paddingTop: Platform.OS === "ios" ? 56 : 30, paddingHorizontal: 18, paddingBottom: 34 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.bgCard, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: C.border },
  progressTrack: { flex: 1, height: 14, borderRadius: 7, backgroundColor: C.bgCard, borderWidth: 1.5, borderColor: C.border, overflow: "hidden" },
  progressFill: { width: "40%", height: "100%", borderRadius: 6 },
  topStats: { flexDirection: "row", alignItems: "center" },
  livesRow: { flexDirection: "row", gap: 3, alignItems: "center" },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 14, paddingLeft: 2 },
  xpText: { fontSize: 12, fontWeight: "800", color: C.xpGold },
  xpDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: C.textLight, marginHorizontal: 2 },
  lessonTag: { fontSize: 11, color: C.textLight, fontWeight: "600" },
  owlRow: { flexDirection: "row", alignItems: "center", gap: 0, marginBottom: 14, marginLeft: -4 },
  speechBubble: { flex: 1, backgroundColor: C.bgCard, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, paddingVertical: 12, paddingHorizontal: 16, marginLeft: 8 },
  speechTitle: { fontSize: 16, fontWeight: "800", color: C.text, marginBottom: 3, fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium" },
  speechHint: { fontSize: 12, color: C.textLight, fontWeight: "500" },
  speechNubBorder: { position: "absolute", left: -9, top: "38%", width: 0, height: 0, borderTopWidth: 8, borderBottomWidth: 8, borderRightWidth: 9, borderTopColor: "transparent", borderBottomColor: "transparent", borderRightColor: C.border },
  speechNub: { position: "absolute", left: -7, top: "38%", marginTop: 1, width: 0, height: 0, borderTopWidth: 7, borderBottomWidth: 7, borderRightWidth: 8, borderTopColor: "transparent", borderBottomColor: "transparent", borderRightColor: C.bgCard },
  promptCard: { borderRadius: 16, borderWidth: 1.5, borderColor: "rgba(255,200,0,0.25)", backgroundColor: "rgba(255,200,0,0.06)", padding: 14, marginBottom: 14, gap: 10 },
  promptTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  langPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,200,0,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  langPillEmoji: { fontSize: 12 },
  langPillText: { fontSize: 10, fontWeight: "900", color: C.xpGold, letterSpacing: 0.8 },
  audioBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.secondary, alignItems: "center", justifyContent: "center" },
  promptSentence: { fontSize: 21, fontWeight: "800", color: C.text, lineHeight: 30, letterSpacing: 0.2 },
  answerBox: { marginBottom: 8 },
  answerRow: { flexDirection: "row", flexWrap: "wrap", gap: 2, minHeight: WORD_HEIGHT + 12, paddingVertical: 8, paddingHorizontal: 2 },
  answerDivider: { height: 2, backgroundColor: C.border, borderRadius: 1, marginTop: 4 },
  emptySlot: { height: WORD_HEIGHT - 10, width: 58, margin: 4, borderRadius: 10, borderWidth: 1.5, borderColor: C.slotBorder, borderStyle: "dashed", backgroundColor: C.slotBg },
  resultBanner: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1.5, padding: 14, marginBottom: 6, overflow: "hidden" },
  resultIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  resultTitle: { fontSize: 16, fontWeight: "900", marginBottom: 2 },
  resultSub: { fontSize: 12, color: C.textMid, fontWeight: "500" },
  poolDivider: { height: 1.5, backgroundColor: C.border, borderRadius: 1, marginBottom: 14 },
  wordPool: { flexDirection: "row", flexWrap: "wrap", flex: 1, alignContent: "flex-start" },
  ctaRow: { marginTop: 8 },
  checkBtn: { borderRadius: 16, overflow: "hidden", shadowColor: C.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 0, elevation: 5 },
  checkBtnGradient: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 16, borderRadius: 16 },
  checkBtnDisabled: { backgroundColor: C.bgCard, borderWidth: 1.5, borderColor: C.border, shadowOpacity: 0, elevation: 0 },
  checkBtnText: { fontSize: 16, fontWeight: "900", color: "white", letterSpacing: 1.2 },
  checkBtnTextDisabled: { color: C.textLight },
  wordRoot: { padding: 4 },
  wordContainer: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: C.wordBorder, backgroundColor: C.wordBg, height: WORD_HEIGHT - 10, justifyContent: "center", alignItems: "center" },
  wordText: { fontSize: 17, fontWeight: "700", color: C.text, letterSpacing: 0.2 },
  wordShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 10, borderWidth: 1.5, borderColor: C.wordShadow, borderTopColor: "transparent", borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomWidth: 3.5, top: 4 },
});