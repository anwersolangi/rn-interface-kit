import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DISC_SIZE = width * 0.72;

type Track = {
  title: string;
  artist: string;
  album: string;
  duration: number;
  accent: string;
  accent2: string;
};

const TRACKS: Track[] = [
  {
    title: 'Neon Nights',
    artist: 'The Architects',
    album: 'Future State',
    duration: 218,
    accent: '#a78bfa',
    accent2: '#6d28d9',
  },
  {
    title: 'Glass Horizon',
    artist: 'Solar Drift',
    album: 'Parallax',
    duration: 244,
    accent: '#60a5fa',
    accent2: '#1d4ed8',
  },
  {
    title: 'Golden Hour',
    artist: 'Prism Wave',
    album: 'Frequencies',
    duration: 196,
    accent: '#fbbf24',
    accent2: '#b45309',
  },
  {
    title: 'Deep Crimson',
    artist: 'Void Signal',
    album: 'Undertow',
    duration: 231,
    accent: '#f87171',
    accent2: '#b91c1c',
  },
];

const LYRICS = [
  'Lost in the static between the stars',
  'Every signal fades before it starts',
  'But the frequency finds you in the dark',
  'Burning neon through your broken heart',
];

function fmtTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function NowPlayingScreen() {
  const insets = useSafeAreaInsets();
  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [position, setPosition] = useState(42);
  const [shuffled, setShuffled] = useState(false);
  const [liked, setLiked] = useState(false);

  const track = TRACKS[trackIdx];
  const progress = position / track.duration;
  const lyricIdx = Math.floor(progress * LYRICS.length);
  const rotation = useSharedValue(0);
  const discScale = useSharedValue(1);

  useEffect(() => {
    if (playing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 4000, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      cancelAnimation(rotation);
    }
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () => setPosition(p => (p < track.duration ? p + 1 : 0)),
      1000,
    );
    return () => clearInterval(t);
  }, [playing, trackIdx]);

  const changeTrack = (delta: number) => {
    setTrackIdx(i => (i + delta + TRACKS.length) % TRACKS.length);
    setPosition(0);
    rotation.value = 0;
    discScale.value = withSpring(0.9, { damping: 5, stiffness: 300 }, () => {
      discScale.value = withSpring(1, { damping: 8, stiffness: 200 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const discStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: discScale.value }],
  }));

  return (
    <LinearGradient
      colors={[track.accent2 + 'ff', '#0a0a0a', '#080808']}
      style={[styles.root, { paddingTop: insets.top }]}
    >
      <View style={styles.hdr}>
        <Pressable style={styles.hdrBtn}>
          <Ionicons name="chevron-down" size={24} color="#fff" />
        </Pressable>
        <View style={styles.hdrCenter}>
          <Text style={styles.hdrSub}>PLAYING FROM ALBUM</Text>
          <Text style={styles.hdrTitle}>{track.album}</Text>
        </View>
        <Pressable style={styles.hdrBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.discArea}>
        <Animated.View style={[styles.disc, discStyle]}>
          <Svg
            width={DISC_SIZE}
            height={DISC_SIZE}
            viewBox={`0 0 ${DISC_SIZE} ${DISC_SIZE}`}
          >
            <Circle
              cx={DISC_SIZE / 2}
              cy={DISC_SIZE / 2}
              r={DISC_SIZE / 2 - 2}
              fill="#111"
              stroke={track.accent}
              strokeWidth={2}
            />
            {[0.78, 0.65, 0.52, 0.4].map((r, i) => (
              <Circle
                key={i}
                cx={DISC_SIZE / 2}
                cy={DISC_SIZE / 2}
                r={(DISC_SIZE * r) / 2}
                stroke={track.accent}
                strokeWidth={0.5}
                fill="none"
                opacity={0.3 + i * 0.1}
                strokeDasharray={i % 2 === 0 ? '3 6' : '1 4'}
              />
            ))}
            <Circle
              cx={DISC_SIZE / 2}
              cy={DISC_SIZE / 2}
              r={DISC_SIZE * 0.2}
              fill={track.accent2}
            />
            <Circle
              cx={DISC_SIZE / 2}
              cy={DISC_SIZE / 2}
              r={DISC_SIZE * 0.07}
              fill={track.accent}
            />
            <Circle
              cx={DISC_SIZE / 2}
              cy={DISC_SIZE / 2}
              r={DISC_SIZE * 0.025}
              fill="#1a1a1a"
            />
          </Svg>
        </Animated.View>
        <View style={styles.trackMeta}>
          <View style={styles.trackTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.trackTitle}>{track.title}</Text>
              <Text style={styles.trackArtist}>
                {track.artist} · {track.album}
              </Text>
            </View>
            <Pressable onPress={() => setLiked(l => !l)}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={24}
                color={liked ? track.accent : '#555'}
              />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.progressArea}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: track.accent },
            ]}
          />
          <View
            style={[
              styles.progressThumb,
              { left: `${progress * 100}%`, backgroundColor: track.accent },
            ]}
          />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{fmtTime(position)}</Text>
          <Text style={styles.timeText}>
            -{fmtTime(track.duration - position)}
          </Text>
        </View>
        <View style={styles.lyricsBox}>
          {LYRICS.map((line, i) => (
            <Text
              key={i}
              style={[
                styles.lyricLine,
                i === lyricIdx && { color: '#fff', fontSize: 14 },
              ]}
            >
              {line}
            </Text>
          ))}
        </View>
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable onPress={() => setShuffled(s => !s)}>
          <Ionicons
            name="shuffle"
            size={22}
            color={shuffled ? track.accent : '#555'}
          />
        </Pressable>
        <Pressable style={styles.skipBtn} onPress={() => changeTrack(-1)}>
          <Ionicons name="play-skip-back" size={28} color="#fff" />
        </Pressable>
        <Pressable
          style={[styles.playBtn, { backgroundColor: track.accent }]}
          onPress={() => {
            setPlaying(p => !p);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <Ionicons name={playing ? 'pause' : 'play'} size={32} color="#fff" />
        </Pressable>
        <Pressable style={styles.skipBtn} onPress={() => changeTrack(1)}>
          <Ionicons name="play-skip-forward" size={28} color="#fff" />
        </Pressable>
        <Pressable>
          <Ionicons name="repeat" size={22} color="#555" />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  hdrBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hdrCenter: { alignItems: 'center' },
  hdrSub: { fontSize: 10, color: '#ffffff66', letterSpacing: 1 },
  hdrTitle: { fontSize: 13, fontWeight: '700', color: '#fff', marginTop: 2 },

  discArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  disc: { borderRadius: DISC_SIZE / 2, overflow: 'hidden' },
  trackMeta: { width: '100%', paddingHorizontal: 28 },
  trackTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trackTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  trackArtist: { fontSize: 14, color: '#ffffff88', marginTop: 3 },

  progressArea: { paddingHorizontal: 28, gap: 6 },
  progressTrack: {
    height: 3,
    backgroundColor: '#ffffff22',
    borderRadius: 99,
    overflow: 'visible',
  },
  progressFill: { height: '100%', borderRadius: 99 },
  progressThumb: {
    position: 'absolute',
    top: -5,
    width: 13,
    height: 13,
    borderRadius: 99,
    marginLeft: -6,
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { fontSize: 12, color: '#ffffff66', fontVariant: ['tabular-nums'] },
  lyricsBox: { marginTop: 10, gap: 6, alignItems: 'center' },
  lyricLine: {
    fontSize: 12,
    color: '#ffffff33',
    textAlign: 'center',
    lineHeight: 20,
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  skipBtn: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 70,
    height: 70,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
