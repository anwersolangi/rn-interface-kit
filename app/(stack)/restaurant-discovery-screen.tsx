import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeInRight,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const BG = '#FAF7F2';
const SURFACE = '#FFFFFF';
const CARD = '#F5F0E8';
const BORDER = '#E8DFD0';
const TEXT_W = '#1F1B14';
const TEXT_S = '#6B5E48';
const TEXT_M = '#9F907A';
const ACCENT = '#C9A86A';
const ACCENT_LT = '#E0BE82';
const ACCENT_DK = '#8B6843';
const ROSE = '#C97064';
const FOREST = '#3D5A40';
const NAVY = '#1F2937';
const RED = '#DC2626';
const GREEN = '#059669';
const AMBER = '#D97706';

const UNSPLASH = 'https://images.unsplash.com/photo-';

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviews: string;
  distance: string;
  time: string;
  price: string;
  img: string;
  badge?: { text: string; color: string };
};

const RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'Kolachi',
    cuisine: 'Pakistani · BBQ',
    rating: 4.8,
    reviews: '12.4K',
    distance: '2.4 km',
    time: '30 min',
    price: '$$$',
    img: `${UNSPLASH}1517248135467-4c7edcad34c4?w=600&q=80`,
    badge: { text: '★ EDITORS PICK', color: AMBER },
  },
  {
    id: '2',
    name: "Xander's",
    cuisine: 'Continental · Brunch',
    rating: 4.6,
    reviews: '3.2K',
    distance: '1.8 km',
    time: '20 min',
    price: '$$',
    img: `${UNSPLASH}1555396273-367ea4eb4db5?w=600&q=80`,
    badge: { text: '20% OFF TODAY', color: GREEN },
  },
  {
    id: '3',
    name: 'Café Aylanto',
    cuisine: 'Italian · Steakhouse',
    rating: 4.9,
    reviews: '8.7K',
    distance: '3.1 km',
    time: '40 min',
    price: '$$$$',
    img: `${UNSPLASH}1414235077428-338989a2e8c0?w=600&q=80`,
    badge: { text: 'RESERVE EARLY', color: ROSE },
  },
];

const CUISINES = [
  { name: 'All', icon: 'restaurant', color: ACCENT, active: true },
  { name: 'Pakistani', icon: 'flame', color: ROSE },
  { name: 'Italian', icon: 'pizza', color: AMBER },
  { name: 'Japanese', icon: 'fish', color: FOREST },
  { name: 'BBQ', icon: 'flame-outline', color: RED },
  { name: 'Desserts', icon: 'ice-cream', color: ACCENT_LT },
];

const FEATURED_IMG = `${UNSPLASH}1414235077428-338989a2e8c0?w=900&q=80`;

function RestaurantCard({ rest, idx }: { rest: Restaurant; idx: number }) {
  return (
    <Animated.View entering={FadeInUp.delay(300 + idx * 100)}>
      <Pressable style={styles.restCard}>
        <View style={styles.restImageWrap}>
          <Image source={{ uri: rest.img }} style={styles.restImg} />
          {rest.badge && (
            <View
              style={[styles.restBadge, { backgroundColor: rest.badge.color }]}
            >
              <Text style={styles.restBadgeText}>{rest.badge.text}</Text>
            </View>
          )}
          <Pressable style={styles.restHeartBtn}>
            <Ionicons name="heart-outline" size={14} color="#FFF" />
          </Pressable>
        </View>
        <View style={styles.restBody}>
          <View style={styles.restHeadRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.restName}>{rest.name}</Text>
              <Text style={styles.restCuisine}>{rest.cuisine}</Text>
            </View>
            <View style={styles.restRating}>
              <Ionicons name="star" size={11} color={AMBER} />
              <Text style={styles.restRatingText}>{rest.rating}</Text>
            </View>
          </View>
          <View style={styles.restMeta}>
            <View style={styles.restMetaItem}>
              <Ionicons name="time-outline" size={11} color={TEXT_S} />
              <Text style={styles.restMetaText}>{rest.time}</Text>
            </View>
            <View style={styles.restMetaItem}>
              <Ionicons name="location-outline" size={11} color={TEXT_S} />
              <Text style={styles.restMetaText}>{rest.distance}</Text>
            </View>
            <Text style={styles.restPrice}>{rest.price}</Text>
            <Text style={styles.restReviews}>{rest.reviews}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function RestaurantDiscoveryScreen() {
  const [cuisine, setCuisine] = useState('All');
  const [partySize, setPartySize] = useState(4);

  const reservePulse = useSharedValue(1);

  React.useEffect(() => {
    reservePulse.value = withRepeat(
      withTiming(1.03, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);

  const reserveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reservePulse.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>Reserve</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={11} color={ACCENT_DK} />
              <Text style={styles.locationText}>Karachi · Clifton</Text>
              <Ionicons name="chevron-down" size={11} color={TEXT_M} />
            </View>
          </View>
          <View style={styles.topRight}>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={18} color={TEXT_W} />
              <View style={styles.notifDot} />
            </Pressable>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileText}>A</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={TEXT_M} />
          <Text style={styles.searchPlaceholder}>
            Cuisine, restaurant or vibe
          </Text>
          <View style={styles.searchFilter}>
            <Ionicons name="options" size={11} color={ACCENT_DK} />
            <Text style={styles.searchFilterText}>FILTERS</Text>
            <View style={styles.searchFilterCount}>
              <Text style={styles.searchFilterCountText}>2</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cuisineRow}
        >
          {CUISINES.map((c, i) => (
            <Animated.View
              key={c.name}
              entering={FadeInRight.delay(100 + i * 50)}
            >
              <Pressable
                onPress={() => setCuisine(c.name)}
                style={[
                  styles.cuisineChip,
                  cuisine === c.name && {
                    backgroundColor: c.color,
                    borderColor: c.color,
                  },
                ]}
              >
                <Ionicons
                  name={c.icon as any}
                  size={12}
                  color={cuisine === c.name ? '#FFF' : c.color}
                />
                <Text
                  style={[
                    styles.cuisineName,
                    cuisine === c.name && { color: '#FFF', fontWeight: '900' },
                  ]}
                >
                  {c.name}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>

        <View style={styles.featuredCard}>
          <Image source={{ uri: FEATURED_IMG }} style={styles.featuredImg} />
          <LinearGradient
            colors={['transparent', 'rgba(31,27,20,0.92)']}
            start={{ x: 0.5, y: 0.3 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.featuredTopRow}>
            <View style={styles.featuredBadge}>
              <Ionicons name="trophy" size={10} color={AMBER} />
              <Text style={styles.featuredBadgeText}>WEEKLY PICK</Text>
            </View>
            <View style={styles.featuredOffer}>
              <Text style={styles.featuredOfferText}>−25% FIRST VISIT</Text>
            </View>
          </View>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredKicker}>RESERVE BY 8 PM</Text>
            <Text style={styles.featuredName}>Café Aylanto</Text>
            <Text style={styles.featuredCuisine}>
              Italian · Wood-fired · Rooftop
            </Text>
            <View style={styles.featuredMetaRow}>
              <View style={styles.featuredMetaItem}>
                <Ionicons name="star" size={11} color={AMBER} />
                <Text style={styles.featuredMetaText}>4.9</Text>
                <Text style={styles.featuredMetaSub}>(8.7K reviews)</Text>
              </View>
              <View style={styles.featuredMetaDiv} />
              <Text style={styles.featuredMetaText}>$$$$</Text>
              <View style={styles.featuredMetaDiv} />
              <Text style={styles.featuredMetaText}>3.1 km</Text>
            </View>
          </View>
        </View>

        <View style={styles.partyCard}>
          <View style={styles.partyHead}>
            <Ionicons name="people" size={12} color={ACCENT_DK} />
            <Text style={styles.partyLbl}>PARTY OF</Text>
          </View>
          <View style={styles.partySizes}>
            {[2, 3, 4, 5, 6, 8].map(p => (
              <Pressable
                key={p}
                onPress={() => setPartySize(p)}
                style={[
                  styles.partyChip,
                  partySize === p && styles.partyChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.partyChipText,
                    partySize === p && { color: '#FFF', fontWeight: '900' },
                  ]}
                >
                  {p}
                </Text>
              </Pressable>
            ))}
            <View style={styles.partyTonight}>
              <View style={styles.partyTonightDot} />
              <Text style={styles.partyTonightText}>TONIGHT · 7:30 PM</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeadRow}>
          <Text style={styles.sectionLabel}>RECOMMENDED FOR YOU</Text>
          <Text style={styles.sectionAction}>See all →</Text>
        </View>
        <View style={{ paddingHorizontal: 18, gap: 14, marginBottom: 14 }}>
          {RESTAURANTS.map((r, i) => (
            <RestaurantCard key={r.id} rest={r} idx={i} />
          ))}
        </View>

        <View style={styles.bottomCta}>
          <View style={styles.ctaCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaLbl}>QUICK RESERVE</Text>
              <Text style={styles.ctaTitle}>Café Aylanto · 7:30 PM</Text>
            </View>
            <Animated.View style={reserveStyle}>
              <Pressable style={styles.reserveBtn}>
                <LinearGradient
                  colors={[ACCENT_LT, ACCENT, ACCENT_DK]}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                />
                <Text style={styles.reserveText}>RESERVE</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { paddingTop: 60, paddingBottom: 30 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  brand: {
    color: TEXT_W,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontStyle: 'italic',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  locationText: { color: TEXT_S, fontSize: 11, fontWeight: '700' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: RED,
    borderWidth: 1,
    borderColor: SURFACE,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_DK,
  },
  profileText: { color: '#FFF', fontSize: 15, fontWeight: '900' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 18,
  },
  searchPlaceholder: {
    flex: 1,
    color: TEXT_M,
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  searchFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: ACCENT + '15',
    borderWidth: 0.5,
    borderColor: ACCENT + '40',
  },
  searchFilterText: {
    color: ACCENT_DK,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  searchFilterCount: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ACCENT_DK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchFilterCountText: { color: '#FFF', fontSize: 9, fontWeight: '900' },

  cuisineRow: { paddingHorizontal: 14, gap: 6, marginBottom: 20 },
  cuisineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 11,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cuisineName: { color: TEXT_W, fontSize: 11, fontWeight: '700' },

  featuredCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    borderRadius: 22,
    overflow: 'hidden',
    height: 220,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  featuredImg: { width: '100%', height: '100%' },
  featuredTopRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 0.5,
    borderColor: AMBER + '70',
  },
  featuredBadgeText: {
    color: AMBER,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  featuredOffer: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: GREEN,
  },
  featuredOfferText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  featuredContent: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  featuredKicker: {
    color: ACCENT_LT,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  featuredName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontStyle: 'italic',
  },
  featuredCuisine: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '700',
  },
  featuredMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  featuredMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featuredMetaText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'Courier',
  },
  featuredMetaSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
  featuredMetaDiv: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  partyCard: {
    marginHorizontal: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
  },
  partyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  partyLbl: {
    color: ACCENT_DK,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '900',
  },
  partySizes: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  partyChip: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  partyChipActive: { backgroundColor: ACCENT_DK, borderColor: ACCENT_DK },
  partyChipText: {
    color: TEXT_W,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Courier',
  },
  partyTonight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: GREEN + '12',
    borderWidth: 0.5,
    borderColor: GREEN + '40',
    marginLeft: 'auto',
  },
  partyTonightDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: GREEN,
    shadowColor: GREEN,
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  partyTonightText: {
    color: GREEN,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  sectionLabel: {
    color: TEXT_M,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '900',
  },
  sectionHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  sectionAction: { color: ACCENT_DK, fontSize: 11, fontWeight: '800' },
  restCard: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 16,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 12,
  },
  restImageWrap: {
    width: 86,
    height: 86,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  restImg: { width: '100%', height: '100%' },
  restBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  restBadgeText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  restHeartBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restBody: { flex: 1, justifyContent: 'space-between' },
  restHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  restName: {
    color: TEXT_W,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  restCuisine: { color: TEXT_S, fontSize: 11, marginTop: 2, fontWeight: '600' },
  restRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: AMBER + '15',
    borderWidth: 0.5,
    borderColor: AMBER + '40',
  },
  restRatingText: {
    color: TEXT_W,
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'Courier',
  },
  restMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  restMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  restMetaText: { color: TEXT_S, fontSize: 10, fontWeight: '700' },
  restPrice: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 'auto',
    fontFamily: 'Courier',
  },
  restReviews: { color: TEXT_M, fontSize: 10, fontWeight: '600' },

  bottomCta: { paddingHorizontal: 18 },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: NAVY,
    borderWidth: 1,
    borderColor: NAVY,
  },
  ctaLbl: {
    color: ACCENT_LT,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '900',
  },
  ctaTitle: { color: '#FFF', fontSize: 14, fontWeight: '900', marginTop: 3 },
  reserveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: ACCENT,
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  reserveText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
