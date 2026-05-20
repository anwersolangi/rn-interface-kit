import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PURPLE = '#7f5af0';
const BG = '#09090f';

const HERO_URL =
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=900&q=80';

type Show = { id: string; title: string; label: string; url: string };
const CONTINUE: Show[] = [
  {
    id: '1',
    title: 'Dark Signal',
    label: 'S1 E4',
    url: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&q=80',
  },
  {
    id: '2',
    title: 'Parallax',
    label: 'S2 E7',
    url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80',
  },
  {
    id: '3',
    title: 'Requiem',
    label: 'S1 E2',
    url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80',
  },
  {
    id: '4',
    title: 'Cold Front',
    label: 'S3 E9',
    url: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=400&q=80',
  },
];
const TRENDING: Show[] = [
  {
    id: '5',
    title: 'Neon Protocol',
    label: 'Action',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
  },
  {
    id: '6',
    title: 'Hollow Earth',
    label: 'Sci-Fi',
    url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&q=80',
  },
  {
    id: '7',
    title: 'Static',
    label: 'Thriller',
    url: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=400&q=80',
  },
  {
    id: '8',
    title: 'Meridian',
    label: 'Drama',
    url: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&q=80',
  },
  {
    id: '9',
    title: 'Void',
    label: 'Horror',
    url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80',
  },
];
const TABS = ['Home', 'Series', 'Movies', 'Downloads'];
const WATCH_PCT: Record<string, number> = {
  '1': 42,
  '2': 68,
  '3': 15,
  '4': 87,
};

export default function OTTStreamingHome() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Home');
  const [myList, setMyList] = useState<string[]>([]);

  const plusScale = useSharedValue(1);
  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plusScale.value }],
  }));

  const toggleList = (id: string) => {
    setMyList(l => (l.includes(id) ? l.filter(x => x !== id) : [...l, id]));
    plusScale.value = withSpring(1.3, { damping: 5, stiffness: 400 }, () => {
      plusScale.value = withSpring(1, { damping: 8, stiffness: 300 });
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.hdr}>
        <Text style={styles.logo}>
          STREAM<Text style={{ color: PURPLE }}>·</Text>
        </Text>
        <View style={styles.hdrRight}>
          <Pressable>
            <Ionicons name="search-outline" size={22} color="#fff" />
          </Pressable>
          <Pressable style={styles.avatar}>
            <Text style={styles.avatarTxt}>A</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        style={styles.tabScroll}
      >
        {TABS.map(tab => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={styles.tabItem}
          >
            <Text
              style={[styles.tabTxt, activeTab === tab && styles.tabTxtActive]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Pressable style={styles.hero}>
          <Image
            source={{ uri: HERO_URL }}
            style={styles.heroImg}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', BG]}
            style={styles.heroGrad}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroBadges}>
              <View style={[styles.genreBadge, { backgroundColor: PURPLE }]}>
                <Text style={styles.genreTxt}>SCI-FI</Text>
              </View>
              <View style={styles.genreBadge}>
                <Text style={styles.genreTxt}>THRILLER</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>THE LAST HORIZON</Text>
            <Text style={styles.heroSub}>2025 · Season 2 · 8 Episodes</Text>
            <View style={styles.heroActions}>
              <Pressable style={styles.playBtn}>
                <Ionicons name="play" size={18} color="#000" />
                <Text style={styles.playTxt}>Play</Text>
              </Pressable>
              <Animated.View style={plusStyle}>
                <Pressable
                  style={styles.listBtn}
                  onPress={() => toggleList('hero')}
                >
                  <Ionicons
                    name={myList.includes('hero') ? 'checkmark' : 'add'}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.listTxt}>
                    {myList.includes('hero') ? 'Saved' : 'My List'}
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </Pressable>

        <View style={styles.continueBox}>
          <View style={styles.rowHdr}>
            <Text style={styles.rowTitle}>Continue Watching</Text>
          </View>
          <FlatList
            data={CONTINUE}
            keyExtractor={i => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.continueScroll}
            renderItem={({ item }) => (
              <Pressable style={styles.continueCard}>
                <Image source={{ uri: item.url }} style={styles.continueImg} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.playCircle}>
                  <Ionicons name="play-circle" size={34} color="#ffffffcc" />
                </View>
                <View style={styles.continueInfo}>
                  <Text style={styles.continueTitle}>{item.title}</Text>
                  <Text style={styles.continueEp}>{item.label}</Text>
                  <View style={styles.watchBar}>
                    <View
                      style={[
                        styles.watchFill,
                        { width: `${WATCH_PCT[item.id]}%` },
                      ]}
                    />
                  </View>
                </View>
              </Pressable>
            )}
          />
        </View>

        <View style={styles.trendBox}>
          <View style={styles.rowHdr}>
            <Text style={styles.rowTitle}>Trending Now 🔥</Text>
            <Text style={styles.seeAll}>See all</Text>
          </View>
          <FlatList
            data={TRENDING}
            keyExtractor={i => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendScroll}
            renderItem={({ item, index }) => (
              <Pressable style={styles.trendCard}>
                <Image source={{ uri: item.url }} style={styles.trendImg} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.rankBadge}>
                  <Text style={styles.rankTxt}>#{index + 1}</Text>
                </View>
                <View style={styles.trendInfo}>
                  <Text style={styles.trendTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.trendGenre}>{item.label}</Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 40 },
  trendBox: {},
  rowHdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  rowTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  seeAll: { fontSize: 13, color: PURPLE },
  trendScroll: { paddingHorizontal: 20, gap: 10 },
  trendCard: {
    width: 130,
    height: 190,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  trendImg: { width: '100%', height: '100%' },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: PURPLE,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  rankTxt: { fontSize: 11, fontWeight: '800', color: '#fff' },
  trendInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  trendTitle: { fontSize: 12, fontWeight: '700', color: '#fff' },
  trendGenre: { fontSize: 10, color: '#aaa', marginTop: 2 },

  continueBox: { marginBottom: 22 },
  continueScroll: { paddingHorizontal: 20, gap: 10 },
  continueCard: {
    width: 200,
    height: 116,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  continueImg: { width: '100%', height: '100%' },
  playCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    gap: 3,
  },
  continueTitle: { fontSize: 12, fontWeight: '700', color: '#fff' },
  continueEp: { fontSize: 10, color: '#aaa' },
  watchBar: {
    height: 2,
    backgroundColor: '#ffffff33',
    borderRadius: 99,
    overflow: 'hidden',
    marginTop: 4,
  },
  watchFill: { height: '100%', backgroundColor: PURPLE, borderRadius: 99 },

  hero: { height: 440, position: 'relative', marginBottom: 22 },
  heroImg: { width: '100%', height: '100%' },
  heroGrad: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 240 },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 8,
  },
  heroBadges: { flexDirection: 'row', gap: 6 },
  genreBadge: {
    backgroundColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  genreTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  heroSub: { fontSize: 13, color: '#aaa' },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  playTxt: { fontSize: 15, fontWeight: '800', color: '#000' },
  listBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff22',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: '#ffffff44',
  },
  listTxt: { fontSize: 14, fontWeight: '600', color: '#fff' },

  hdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logo: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  hdrRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },
  tabScroll: { maxHeight: 40 },
  tabs: { paddingHorizontal: 20, gap: 26, alignItems: 'center' },
  tabItem: { alignItems: 'center', gap: 4 },
  tabTxt: { fontSize: 14, fontWeight: '600', color: '#555' },
  tabTxtActive: { color: '#fff' },
  tabUnderline: {
    width: '60%',
    height: 2,
    backgroundColor: PURPLE,
    borderRadius: 99,
  },
});
