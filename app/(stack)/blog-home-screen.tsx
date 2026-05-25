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
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';

const BG = '#FAFAF7';
const SURFACE = '#FFFFFF';
const BORDER = '#E8E4DC';
const TEXT_W = '#0A0A0A';
const TEXT_S = '#52525B';
const TEXT_M = '#A1A1AA';
const ACCENT = '#0A0A0A';

const HIGHLIGHT = '#F59E0B';
const RED = '#DC2626';
const GREEN = '#059669';
const BLUE = '#2563EB';
const PURPLE = '#7C3AED';

const UNSPLASH = 'https://images.unsplash.com/photo-';

type Article = {
  id: string;
  title: string;
  category: string;
  catColor: string;
  author: string;
  avatar: string;
  authorColor: string;
  readTime: string;
  views: string;
  img: string;
  trending?: boolean;
};

const FEATURED_IMG = `${UNSPLASH}1486312338219-ce68d2c6f44d?w=900&q=80`;

const TRENDING: Article[] = [
  {
    id: '1',
    title: 'The slow-living movement is rewriting urban life',
    category: 'CULTURE',
    catColor: PURPLE,
    author: 'Shahrukh Khan',
    avatar: 'S',
    authorColor: PURPLE,
    readTime: '8 min',
    views: '12.4K',
    img: `${UNSPLASH}1506905925346-21bda4d32df4?w=600&q=80`,
    trending: true,
  },
  {
    id: '2',
    title: 'Why your morning routine is the wrong target',
    category: 'WELLNESS',
    catColor: GREEN,
    author: 'Rehan Ahmed',
    avatar: 'R',
    authorColor: GREEN,
    readTime: '5 min',
    views: '8.7K',
    img: `${UNSPLASH}1545987796-200677ee1011?w=600&q=80`,
  },
  {
    id: '3',
    title: 'AI is making us better writers, not worse',
    category: 'TECH',
    catColor: BLUE,
    author: 'Anwer Solangi',
    avatar: 'A',
    authorColor: BLUE,
    readTime: '12 min',
    views: '24.1K',
    img: `${UNSPLASH}1531297484001-80022131f5a1?w=600&q=80`,
    trending: true,
  },
];

const CATEGORIES = [
  { name: 'For You', active: true },
  { name: 'Tech', icon: 'hardware-chip' },
  { name: 'Culture' },
  { name: 'Wellness' },
  { name: 'Business' },
  { name: 'Design' },
];

const AUTHORS = [
  { name: 'Shahrukh Khan', initials: 'S', color: PURPLE, followers: '12K' },
  { name: 'Rehan Ahmed', initials: 'R', color: GREEN, followers: '8.4K' },
  { name: 'Anwer Solangi', initials: 'A', color: BLUE, followers: '24K' },
  { name: 'Naveed Ahmed', initials: 'N', color: HIGHLIGHT, followers: '6.2K' },
  { name: 'Saeed Ahmed', initials: 'S', color: RED, followers: '18K' },
];

function ArticleCard({ article, idx }: { article: Article; idx: number }) {
  return (
    <Animated.View
      entering={FadeInUp.delay(400 + idx * 100)}
      style={styles.articleCard}
    >
      <View style={styles.articleImgWrap}>
        <Image source={{ uri: article.img }} style={styles.articleImg} />
        {article.trending && (
          <View style={styles.trendingBadge}>
            <Ionicons name="flame" size={10} color="#FFF" />
            <Text style={styles.trendingText}>TRENDING</Text>
          </View>
        )}
      </View>
      <View style={styles.articleBody}>
        <View
          style={[
            styles.categoryPill,
            {
              backgroundColor: article.catColor + '15',
              borderColor: article.catColor + '40',
            },
          ]}
        >
          <Text style={[styles.categoryText, { color: article.catColor }]}>
            {article.category}
          </Text>
        </View>
        <Text style={styles.articleTitle} numberOfLines={3}>
          {article.title}
        </Text>
        <View style={styles.articleMeta}>
          <View
            style={[
              styles.authorAvatar,
              { backgroundColor: article.authorColor },
            ]}
          >
            <Text style={styles.authorAvatarText}>{article.avatar}</Text>
          </View>
          <Text style={styles.articleAuthor}>{article.author}</Text>
          <Text style={styles.articleDot}>·</Text>
          <Text style={styles.articleReadTime}>{article.readTime}</Text>
          <View style={styles.articleMetaRight}>
            <Ionicons name="eye-outline" size={10} color={TEXT_M} />
            <Text style={styles.articleViews}>{article.views}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function BlogHomeScreen() {
  const [category, setCategory] = useState('For You');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.topBar}>
          <Text style={styles.brand}>Folio</Text>
          <View style={styles.topRight}>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="search" size={18} color={TEXT_W} />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="bookmark-outline" size={18} color={TEXT_W} />
            </Pressable>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileText}>A</Text>
            </View>
          </View>
        </View>

        <View style={styles.greetingWrap}>
          <Text style={styles.greetingHi}>Good morning, Anwer.</Text>
          <Text style={styles.greetingTitle}>Today's stories</Text>
          <View style={styles.greetingMeta}>
            <View style={styles.greetingDot} />
            <Text style={styles.greetingMetaText}>
              14 NEW · UPDATED 12 MIN AGO
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catsRow}
        >
          {CATEGORIES.map((c, i) => (
            <Animated.View
              key={c.name}
              entering={FadeInRight.delay(100 + i * 50)}
            >
              <Pressable
                onPress={() => setCategory(c.name)}
                style={[
                  styles.catChip,
                  category === c.name && styles.catChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.catText,
                    category === c.name && { color: '#FFF', fontWeight: '900' },
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
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            start={{ x: 0.5, y: 0.3 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.featuredTopRow}>
            <View style={styles.featuredBadge}>
              <Ionicons name="trophy" size={10} color={HIGHLIGHT} />
              <Text style={styles.featuredBadgeText}>EDITOR'S PICK</Text>
            </View>
            <Pressable style={styles.featuredSaveBtn}>
              <Ionicons name="bookmark-outline" size={14} color="#FFF" />
            </Pressable>
          </View>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredCategory}>LONG READ · 18 MIN</Text>
            <Text style={styles.featuredTitle}>
              The death of the open internet and what comes next
            </Text>
            <View style={styles.featuredAuthorRow}>
              <View
                style={[styles.featuredAuthorAvatar, { backgroundColor: BLUE }]}
              >
                <Text style={styles.featuredAuthorText}>M</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featuredAuthorName}>Maria Lopez</Text>
                <Text style={styles.featuredAuthorBio}>
                  Senior Editor · Tech & Society
                </Text>
              </View>
              <View style={styles.featuredStats}>
                <View style={styles.featuredStat}>
                  <Ionicons name="heart" size={11} color="#FFF" />
                  <Text style={styles.featuredStatText}>3.2K</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeadRow}>
          <Text style={styles.sectionLabel}>TRENDING TODAY</Text>
          <Text style={styles.sectionAction}>See all →</Text>
        </View>

        <View style={{ paddingHorizontal: 22, gap: 12, marginBottom: 24 }}>
          {TRENDING.map((a, i) => (
            <ArticleCard key={a.id} article={a} idx={i} />
          ))}
        </View>

        <View style={styles.sectionHeadRow}>
          <Text style={styles.sectionLabel}>WRITERS TO FOLLOW</Text>
          <Text style={styles.sectionAction}>Browse all →</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.authorsRow}
        >
          {AUTHORS.map((a, i) => (
            <Animated.View
              key={a.name}
              entering={FadeInRight.delay(800 + i * 60)}
            >
              <Pressable style={styles.authorCard}>
                <View
                  style={[styles.authorBigAvatar, { backgroundColor: a.color }]}
                >
                  <Text style={styles.authorBigText}>{a.initials}</Text>
                </View>
                <Text style={styles.authorBigName}>{a.name}</Text>
                <Text style={styles.authorFollowers}>
                  {a.followers} followers
                </Text>
                <Pressable style={styles.followBtn}>
                  <Text style={styles.followText}>FOLLOW</Text>
                </Pressable>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>

        <View style={styles.newsletterCard}>
          <View style={styles.newsletterIcon}>
            <Ionicons name="mail" size={20} color={ACCENT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.newsletterTitle}>The Folio Weekly</Text>
            <Text style={styles.newsletterDesc}>
              The 5 best reads, every Sunday morning.
            </Text>
            <Text style={styles.newsletterCount}>JOIN 48,200 READERS</Text>
          </View>
          <Pressable style={styles.newsletterBtn}>
            <Text style={styles.newsletterBtnText}>SUBSCRIBE</Text>
          </Pressable>
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
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  brand: {
    color: TEXT_W,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    fontStyle: 'italic',
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  profileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
  },
  profileText: { color: '#FFF', fontSize: 14, fontWeight: '900' },

  greetingWrap: { paddingHorizontal: 22, marginBottom: 22 },
  greetingHi: { color: TEXT_S, fontSize: 13, fontWeight: '700' },
  greetingTitle: {
    color: TEXT_W,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginTop: 6,
    fontStyle: 'italic',
  },
  greetingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  greetingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: GREEN,
    shadowColor: GREEN,
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  greetingMetaText: {
    color: GREEN,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '900',
  },

  catsRow: { paddingHorizontal: 18, gap: 6, marginBottom: 22 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 11,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  catChipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  catText: { color: TEXT_W, fontSize: 12, fontWeight: '700' },

  featuredCard: {
    marginHorizontal: 22,
    marginBottom: 30,
    borderRadius: 22,
    overflow: 'hidden',
    height: 380,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
  featuredImg: { width: '100%', height: '100%' },
  featuredTopRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
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
    borderColor: HIGHLIGHT + '70',
  },
  featuredBadgeText: {
    color: HIGHLIGHT,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  featuredSaveBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  featuredContent: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  featuredCategory: {
    color: HIGHLIGHT,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },
  featuredTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    letterSpacing: -0.5,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  featuredAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featuredAuthorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredAuthorText: { color: '#FFF', fontSize: 13, fontWeight: '900' },
  featuredAuthorName: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  featuredAuthorBio: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
    fontStyle: 'italic',
  },
  featuredStats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featuredStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  featuredStatText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'Courier',
  },

  sectionHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 14,
  },
  sectionLabel: {
    color: TEXT_M,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '900',
  },
  sectionAction: { color: ACCENT, fontSize: 11, fontWeight: '800' },
  articleCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 18,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 12,
  },
  articleImgWrap: {
    width: 96,
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  articleImg: { width: '100%', height: '100%' },
  trendingBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: RED,
  },
  trendingText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  articleBody: { flex: 1, justifyContent: 'space-between' },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 0.5,
  },
  categoryText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  articleTitle: {
    color: TEXT_W,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
    letterSpacing: -0.3,
    marginTop: 6,
    marginBottom: 6,
  },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  articleAuthor: { color: TEXT_W, fontSize: 10, fontWeight: '800' },
  articleDot: { color: TEXT_M, fontSize: 11 },
  articleReadTime: { color: TEXT_S, fontSize: 10, fontWeight: '700' },
  articleMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto',
  },
  articleViews: {
    color: TEXT_M,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Courier',
  },

  authorsRow: { paddingHorizontal: 18, gap: 10, marginBottom: 24 },
  authorCard: {
    width: 130,
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  authorBigAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  authorBigText: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  authorBigName: { color: TEXT_W, fontSize: 13, fontWeight: '900' },
  authorFollowers: {
    color: TEXT_S,
    fontSize: 10,
    marginTop: 3,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  followBtn: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: ACCENT,
  },
  followText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  newsletterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 22,
    padding: 16,
    borderRadius: 18,
    backgroundColor: ACCENT,
  },
  newsletterIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  newsletterTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  newsletterDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  newsletterCount: {
    color: HIGHLIGHT,
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: '900',
    marginTop: 6,
  },
  newsletterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: HIGHLIGHT,
  },
  newsletterBtnText: {
    color: ACCENT,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
