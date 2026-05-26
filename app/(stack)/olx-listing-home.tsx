
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, Image, Dimensions } from 'react-native';
import {
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const TEAL = '#009f6b';
const BG = '#0a0a0a';

type Listing = { id: string; title: string; price: string; location: string; time: string; url: string; badge?: string };
type Category = { id: string; label: string; icon: string; color: string };

const FEATURED: Listing[] = [
  { id: '1', title: 'iPhone 15 Pro Max 256GB',     price: '$899',     location: 'Dubai, UAE', time: '2h ago', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80', badge: 'Featured' },
  { id: '2', title: 'Toyota Camry 2021',            price: '$18,500',  location: 'Karachi',    time: '5h ago', url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80', badge: 'Urgent' },
  { id: '3', title: '3BR Apartment Sea View',       price: '$1,200/mo',location: 'Lahore',     time: '1d ago', url: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&q=80', badge: 'Top Ad' },
];

const RECENT: Listing[] = [
  { id: '4', title: 'MacBook Pro M2 14"',      price: '$1,100', location: 'Islamabad', time: '30m', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80' },
  { id: '5', title: 'Nike Air Jordan 1 Retro', price: '$180',   location: 'Karachi',   time: '1h',  url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { id: '6', title: 'DSLR Canon 5D Mark IV',  price: '$1,400', location: 'Lahore',    time: '2h',  url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80' },
  { id: '7', title: 'Leather Sofa Set 3+2',   price: '$650',   location: 'Rawalpindi',time: '3h',  url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' },
  { id: '8', title: 'Road Bike Trek FX3',      price: '$420',   location: 'Islamabad', time: '4h',  url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80' },
];

const CATEGORIES: Category[] = [
  { id: '1', label: 'Mobiles',     icon: '📱', color: '#6366f1' },
  { id: '2', label: 'Cars',        icon: '🚗', color: '#f97316' },
  { id: '3', label: 'Property',    icon: '🏠', color: '#14b8a6' },
  { id: '4', label: 'Fashion',     icon: '👗', color: '#ec4899' },
  { id: '5', label: 'Electronics', icon: '💻', color: '#60a5fa' },
  { id: '6', label: 'Furniture',   icon: '🪑', color: '#fbbf24' },
  { id: '7', label: 'Books',       icon: '📚', color: '#34d399' },
  { id: '8', label: 'Sports',      icon: '⚽', color: '#f43f5e' },
];

const BADGE_COLORS: Record<string, string> = {
  Featured: '#fbbf24', Urgent: '#f87171', 'Top Ad': '#a78bfa',
};

export default function OLXListingHome() {

  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState<string[]>([]);
  const heartScale = useSharedValue(1);

  const toggleSave = (id: string) => {
    setSaved(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    heartScale.value = withSpring(1.35, { damping: 5, stiffness: 400 }, () => {
      heartScale.value = withSpring(1, { damping: 8, stiffness: 300 });
    });
  };
  
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.hdr}>
        <Text style={styles.hdrLogo}>OLX<Text style={{ color: TEAL }}>.</Text></Text>
        <Pressable style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={20} color="#888" />
        </Pressable>
      </View>
      <View style={styles.searchRow}>
        <Pressable style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#555" />
          <Text style={styles.searchTxt}>Search anything…</Text>
        </Pressable>
        <Pressable style={styles.locationBtn}>
          <Ionicons name="location-outline" size={16} color={TEAL} />
          <Text style={styles.locationTxt}>Karachi</Text>
          <Ionicons name="chevron-down" size={12} color="#555" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.catBox}>
          <Text style={styles.catLabel}>Browse Categories</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(cat => (
              <Pressable key={cat.id} style={styles.catItem}>
                <View style={[styles.catIcon, { backgroundColor: cat.color + '22' }]}>
                  <Text style={styles.catEmoji}>{cat.icon}</Text>
                </View>
                <Text style={styles.catName}>{cat.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.featuredBox}>
          <Text style={styles.featuredLabel}>Featured Ads</Text>
          <FlatList
            data={FEATURED} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false}
            snapToInterval={width * 0.78 + 12} decelerationRate="fast"
            contentContainerStyle={styles.featuredScroll}
            renderItem={({ item }) => (
              <Pressable style={styles.featuredCard}>
                <Image source={{ uri: item.url }} style={styles.featuredImg} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.92)']} style={StyleSheet.absoluteFill} />
                {item.badge && (
                  <View style={[styles.badgePill, { backgroundColor: BADGE_COLORS[item.badge] }]}>
                    <Text style={styles.badgeTxt}>{item.badge}</Text>
                  </View>
                )}
                <View style={styles.featuredInfo}>
                  <Text style={styles.featuredTitle}>{item.title}</Text>
                  <Text style={styles.featuredPrice}>{item.price}</Text>
                  <View style={styles.featuredMeta}>
                    <Ionicons name="location-outline" size={12} color="#aaa" />
                    <Text style={styles.featuredLoc}>{item.location}</Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        </View>

        <View style={styles.recentBox}>
          <Text style={styles.recentLabel}>Recent Ads</Text>
          {RECENT.map(item => (
            <Pressable key={item.id} style={styles.recentCard}>
              <Image source={{ uri: item.url }} style={styles.recentImg} />
              <View style={styles.recentInfo}>
                <Text style={styles.recentTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.recentPrice}>{item.price}</Text>
                <View style={styles.recentMeta}>
                  <Ionicons name="location-outline" size={12} color="#555" />
                  <Text style={styles.recentLoc}>{item.location}</Text>
                  <Text style={styles.recentDot}>·</Text>
                  <Text style={styles.recentTime}>{item.time} ago</Text>
                </View>
              </View>
              <Pressable onPress={() => toggleSave(item.id)} style={styles.saveBtn}>
                <Ionicons name={saved.includes(item.id) ? 'heart' : 'heart-outline'} size={18} color={saved.includes(item.id) ? '#f87171' : '#555'} />
              </Pressable>
            </Pressable>
          ))}
        </View>

      </ScrollView>
      <Pressable style={[styles.postFab, { bottom: insets.bottom + 16 }]}>
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.postFabTxt}>Post an Ad</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 100 },
  postFab: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: TEAL, borderRadius: 16, paddingVertical: 14 },
  postFabTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 },
  hdrLogo: { fontSize: 30, fontWeight: '900', color: '#fff' },
  notifBtn: { width: 38, height: 38, backgroundColor: '#111', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#1e1e1e' },
  searchRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 16 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#111', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 0.5, borderColor: '#1e1e1e' },
  searchTxt: { fontSize: 14, color: '#444' },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: TEAL + '22', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 0.5, borderColor: TEAL + '55' },
  locationTxt: { fontSize: 13, fontWeight: '600', color: TEAL },

  catBox: { paddingHorizontal: 20, marginBottom: 20 },
  catLabel: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 14 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catItem: { width: (width - 70) / 4, alignItems: 'center', gap: 6 },
  catIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  catEmoji: { fontSize: 26 },
  catName: { fontSize: 11, color: '#888', textAlign: 'center' },

  featuredBox: { marginBottom: 20 },
  featuredLabel: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 12, paddingHorizontal: 20 },
  featuredScroll: { paddingHorizontal: 20, gap: 12 },
  featuredCard: { width: width * 0.78, height: 220, borderRadius: 20, overflow: 'hidden', backgroundColor: '#111' },
  featuredImg: { width: '100%', height: '100%', position: 'absolute' },
  badgePill: { position: 'absolute', top: 14, left: 14, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { fontSize: 11, fontWeight: '800', color: '#000' },
  featuredInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, gap: 4 },
  featuredTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  featuredPrice: { fontSize: 18, fontWeight: '800', color: TEAL },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featuredLoc: { fontSize: 12, color: '#aaa' },

  recentBox: { paddingHorizontal: 20 },
  recentLabel: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 12 },
  recentCard: { flexDirection: 'row', gap: 12, backgroundColor: '#111', borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 0.5, borderColor: '#1e1e1e' },
  recentImg: { width: 90, height: 80, borderRadius: 12 },
  recentInfo: { flex: 1, gap: 4 },
  recentTitle: { fontSize: 14, fontWeight: '600', color: '#fff', lineHeight: 20 },
  recentPrice: { fontSize: 16, fontWeight: '800', color: TEAL },
  recentMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recentLoc: { fontSize: 11, color: '#555' },
  recentDot: { fontSize: 10, color: '#333' },
  recentTime: { fontSize: 11, color: '#555' },
  saveBtn: { padding: 4 },
});