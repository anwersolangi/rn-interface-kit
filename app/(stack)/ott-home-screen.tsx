import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
  Extrapolation,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeInUp,
  SlideInDown,
} from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Svg, {
  Path as SvgPath,
  Circle as SvgCircle,
  Rect as SvgRect,
  Defs,
  LinearGradient as SvgLG,
  Stop,
} from "react-native-svg";

const { width: SW, height: SH } = Dimensions.get("window");
const HERO_H = SH * 0.52;
const CARD_W = SW * 0.32;
const CARD_H = CARD_W * 1.5;
const WIDE_W = SW * 0.42;
const WIDE_H = WIDE_W * 0.56;
const TOP10_W = SW * 0.3;
const TOP10_H = TOP10_W * 1.5;

const BG = "#0A0A0F";
const CARD_BG = "#15151E";
const ACCENT = "#E50914";
const ACCENT2 = "#FFB800";
const TXT = "#FFFFFF";
const TXT2 = "rgba(255,255,255,0.5)";
const TXT3 = "rgba(255,255,255,0.3)";
const GLASS = "rgba(255,255,255,0.06)";

const HERO_SLIDES = [
  {
    id: "1",
    title: "The Last Frontier",
    subtitle: "A New Original Series",
    genre: "Sci-Fi • Thriller • Drama",
    rating: "9.2",
    year: "2026",
    image: "https://images.unsplash.com/photo-1534996858221-380b92700493?w=800&h=1200&fit=crop",
    logo: "THE LAST\nFRONTIER",
  },
  {
    id: "2",
    title: "Ocean Deep",
    subtitle: "Premiering This Friday",
    genre: "Adventure • Mystery",
    rating: "8.7",
    year: "2026",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=1200&fit=crop",
    logo: "OCEAN\nDEEP",
  },
  {
    id: "3",
    title: "Neon Nights",
    subtitle: "Season 3 Now Streaming",
    genre: "Action • Cyberpunk",
    rating: "9.5",
    year: "2025",
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=1200&fit=crop",
    logo: "NEON\nNIGHTS",
  },
];

const CONTINUE_WATCHING = [
  { id: "c1", title: "Dark Matter", ep: "S2 E4", progress: 0.65, time: "32m left", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=225&fit=crop" },
  { id: "c2", title: "The Signal", ep: "S1 E7", progress: 0.3, time: "48m left", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop" },
  { id: "c3", title: "Arctic Edge", ep: "S1 E2", progress: 0.85, time: "8m left", image: "https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=400&h=225&fit=crop" },
  { id: "c4", title: "Code Zero", ep: "Movie", progress: 0.45, time: "56m left", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop" },
];

const TRENDING = [
  { id: "t1", title: "Parallel", year: "2026", image: "https://images.unsplash.com/photo-1534996858221-380b92700493?w=300&h=450&fit=crop" },
  { id: "t2", title: "Wildfire", year: "2025", image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&h=450&fit=crop" },
  { id: "t3", title: "Gravity Falls", year: "2026", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&h=450&fit=crop" },
  { id: "t4", title: "Midnight Sun", year: "2025", image: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=300&h=450&fit=crop" },
  { id: "t5", title: "Echo Chamber", year: "2026", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=450&fit=crop" },
];

const TOP_10 = [
  { id: "r1", rank: 1, title: "Neon Nights S3", image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&h=450&fit=crop" },
  { id: "r2", rank: 2, title: "The Last Frontier", image: "https://images.unsplash.com/photo-1534996858221-380b92700493?w=300&h=450&fit=crop" },
  { id: "r3", rank: 3, title: "Ocean Deep", image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=450&fit=crop" },
  { id: "r4", rank: 4, title: "Dark Matter S2", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300&h=450&fit=crop" },
  { id: "r5", rank: 5, title: "Arctic Edge", image: "https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=300&h=450&fit=crop" },
];

const NEW_RELEASES = [
  { id: "n1", title: "Quantum Rift", tag: "NEW", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=450&fit=crop" },
  { id: "n2", title: "Skyborn", tag: "NEW", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&h=450&fit=crop" },
  { id: "n3", title: "Ghost Protocol", tag: "EXCLUSIVE", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=450&fit=crop" },
  { id: "n4", title: "Ember Storm", tag: "NEW", image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&h=450&fit=crop" },
  { id: "n5", title: "Void Walker", tag: "PREMIERE", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=450&fit=crop" },
];

const CATEGORIES = ["All", "Movies", "Series", "Originals", "Kids", "Anime"];

const PlayIcon = ({ size = 14 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <SvgPath d="M8 5v14l11-7z" />
  </Svg>
);

const PlusIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <SvgPath d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </Svg>
);

const BellIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="#fff">
    <SvgPath d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </Svg>
);

const SearchIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="#fff">
    <SvgPath d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </Svg>
);

const InfoIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="#fff">
    <SvgPath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </Svg>
);

function HeroBanner() {
  const [activeIdx, setActiveIdx] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const titleScale = useSharedValue(0.9);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    titleScale.value = withSpring(1, { damping: 14, stiffness: 100 });
    titleOpacity.value = withTiming(1, { duration: 400 });
  }, [activeIdx]);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (activeIdx + 1) % HERO_SLIDES.length;
      flatRef.current?.scrollToOffset({ offset: next * SW, animated: true });
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIdx]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    scrollX.value = x;
    const idx = Math.round(x / SW);
    if (idx !== activeIdx && idx >= 0 && idx < HERO_SLIDES.length) {
      setActiveIdx(idx);
    }
  }, [activeIdx]);

  const slide = HERO_SLIDES[activeIdx];

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleOpacity.value,
  }));

  return (
    <View style={styles.heroWrap}>
      <FlatList
        ref={flatRef}
        data={HERO_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ width: SW, height: HERO_H }}>
            <Image source={{ uri: item.image }} style={styles.heroImage} />
            <LinearGradient
              colors={["transparent", "rgba(10,10,15,0.4)", "rgba(10,10,15,0.85)", BG]}
              locations={[0, 0.4, 0.7, 1]}
              style={styles.heroGrad}
            />
          </View>
        )}
      />

      <View style={styles.heroContent}>
        <Animated.View style={titleStyle}>
          <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
          <Text style={styles.heroLogo}>{slide.logo}</Text>

          <View style={styles.heroMeta}>
            <View style={styles.ratingBadge}>
              <Svg width={10} height={10} viewBox="0 0 24 24" fill={ACCENT2}>
                <SvgPath d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </Svg>
              <Text style={styles.ratingText}>{slide.rating}</Text>
            </View>
            <Text style={styles.heroGenre}>{slide.genre}</Text>
            <Text style={styles.heroYear}>{slide.year}</Text>
          </View>

          <View style={styles.heroBtns}>
            <TouchableOpacity activeOpacity={0.85} style={styles.playBtn}>
              <PlayIcon size={18} />
              <Text style={styles.playBtnText}>Play</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} style={styles.listBtn}>
              <PlusIcon />
              <Text style={styles.listBtnText}>My List</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} style={styles.infoBtn}>
              <InfoIcon />
              <Text style={styles.infoBtnText}>Info</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.dots}>
          {HERO_SLIDES.map((_, i) => (
            <PaginationDot key={i} active={i === activeIdx} />
          ))}
        </View>
      </View>
    </View>
  );
}

function PaginationDot({ active }: { active: boolean }) {
  const w = useSharedValue(active ? 20 : 6);

  useEffect(() => {
    w.value = withSpring(active ? 20 : 6, { damping: 14, stiffness: 140 });
  }, [active]);

  const style = useAnimatedStyle(() => ({
    width: w.value,
    height: 4,
    borderRadius: 2,
    backgroundColor: active ? ACCENT : "rgba(255,255,255,0.25)",
    marginHorizontal: 3,
  }));

  return <Animated.View style={style} />;
}

function CategoryPills() {
  const [active, setActive] = useState(0);

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(300)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catScroll}
      >
        {CATEGORIES.map((cat, i) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActive(i)}
            activeOpacity={0.8}
            style={[styles.catPill, active === i && styles.catPillActive]}
          >
            <Text style={[styles.catText, active === i && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

function ContinueCard({
  item,
  index,
}: {
  item: (typeof CONTINUE_WATCHING)[0];
  index: number;
}) {
  const scale = useSharedValue(1);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withTiming(0.95, { duration: 100 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInRight.delay(300 + index * 60).duration(300)}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.wideCard, animStyle]}>
          <Image source={{ uri: item.image }} style={styles.wideImage} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            style={styles.wideGrad}
          />
          <View style={styles.widePlayOverlay}>
            <View style={styles.widePlayCircle}>
              <PlayIcon size={16} />
            </View>
          </View>
          <View style={styles.wideBottom}>
            <Text style={styles.wideTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.wideRow}>
              <Text style={styles.wideEp}>{item.ep}</Text>
              <Text style={styles.wideTime}>{item.time}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]}>
                <LinearGradient
                  colors={[ACCENT, "#FF3D3D"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

function Top10Card({
  item,
  index,
}: {
  item: (typeof TOP_10)[0];
  index: number;
}) {
  const scale = useSharedValue(1);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withTiming(0.94, { duration: 100 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInRight.delay(400 + index * 70).duration(300)}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.top10Wrap, cardStyle]}>
          <Text style={styles.top10Num}>{item.rank}</Text>
          <View style={styles.top10Card}>
            <Image source={{ uri: item.image }} style={styles.top10Image} />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.top10Grad}
            />
            <Text style={styles.top10Title} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

function PosterCard({
  item,
  index,
  delay,
}: {
  item: { id: string; title: string; image: string; tag?: string; year?: string };
  index: number;
  delay: number;
}) {
  const scale = useSharedValue(1);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withTiming(0.94, { duration: 100 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInRight.delay(delay + index * 60).duration(300)}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.posterCard, cardStyle]}>
          <Image source={{ uri: item.image }} style={styles.posterImage} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.75)"]}
            style={styles.posterGrad}
          />
          {item.tag && (
            <View style={[styles.tagBadge, item.tag === "EXCLUSIVE" ? styles.tagExclusive : item.tag === "PREMIERE" ? styles.tagPremiere : undefined]}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
          )}
          <Text style={styles.posterTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

function SectionHeader({
  title,
  delay,
}: {
  title: string;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(250)}
      style={styles.sectionHeader}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity activeOpacity={0.6}>
        <Text style={styles.seeAll}>See All</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function LiveBadge() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.liveBadge}>
      <Animated.View style={[styles.liveDot, style]} />
      <Text style={styles.liveText}>LIVE</Text>
    </View>
  );
}

function FeaturedRow() {
  return (
    <Animated.View entering={FadeInDown.delay(600).duration(300)} style={styles.featuredRow}>
      <TouchableOpacity activeOpacity={0.85} style={styles.featuredCard}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&h=340&fit=crop" }}
          style={styles.featuredImage}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          style={styles.featuredGrad}
        />
        <LiveBadge />
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle}>World Sports Championship</Text>
          <Text style={styles.featuredSub}>Live Now • 24K watching</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function OTTHomeScreen() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <HeroBanner />

        <View style={styles.navOverlay}>
          <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.navbar}>
            <View style={styles.logoWrap}>
              <Svg width={28} height={28} viewBox="0 0 24 24">
                <Defs>
                  <SvgLG id="logoGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={ACCENT} />
                    <Stop offset="1" stopColor="#FF3D3D" />
                  </SvgLG>
                </Defs>
                <SvgPath d="M4 4h4v16H4V4zm6 0h4l4 8-4 8h-4l4-8-4-8zm6 0h4v16h-4V4z" fill="url(#logoGrad)" />
              </Svg>
              <Text style={styles.logoText}>StreamX</Text>
            </View>
            <View style={styles.navRight}>
              <TouchableOpacity style={styles.navBtn} activeOpacity={0.7}>
                <SearchIcon />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} activeOpacity={0.7}>
                <BellIcon />
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7}>
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop" }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        <CategoryPills />

        <SectionHeader title="Continue Watching" delay={280} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowScroll}
        >
          {CONTINUE_WATCHING.map((item, i) => (
            <ContinueCard key={item.id} item={item} index={i} />
          ))}
        </ScrollView>

        <SectionHeader title="Top 10 This Week" delay={380} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowScroll}
        >
          {TOP_10.map((item, i) => (
            <Top10Card key={item.id} item={item} index={i} />
          ))}
        </ScrollView>

        <FeaturedRow />

        <SectionHeader title="Trending Now" delay={500} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowScroll}
        >
          {TRENDING.map((item, i) => (
            <PosterCard key={item.id} item={item} index={i} delay={520} />
          ))}
        </ScrollView>

        <SectionHeader title="New Releases" delay={600} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowScroll}
        >
          {NEW_RELEASES.map((item, i) => (
            <PosterCard key={item.id} item={item} index={i} delay={620} />
          ))}
        </ScrollView>

        <View style={{ height: 90 }} />
      </ScrollView>

      <Animated.View entering={SlideInDown.delay(300).duration(400).springify()} style={styles.tabBar}>
        <BlurView intensity={40} tint="dark" style={styles.tabBlur}>
          <View style={styles.tabContent}>
            {[
              { icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z", label: "Home", active: true },
              { icon: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z", label: "Explore", active: false },
              { icon: "M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z", label: "Library", active: false },
              { icon: "M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z", label: "Saved", active: false },
              { icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z", label: "Profile", active: false },
            ].map((tab) => (
              <TouchableOpacity key={tab.label} activeOpacity={0.7} style={styles.tabItem}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill={tab.active ? "#fff" : TXT3}>
                  <SvgPath d={tab.icon} />
                </Svg>
                <Text style={[styles.tabLabel, tab.active && { color: "#fff" }]}>
                  {tab.label}
                </Text>
                {tab.active && <View style={styles.tabDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 0 },
  navOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
  },
  navbar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 10,
  },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoText: { fontSize: 20, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  navRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  navBtn: { position: "relative" },
  notifDot: {
    position: "absolute", top: -1, right: -1, width: 8, height: 8,
    borderRadius: 4, backgroundColor: ACCENT, borderWidth: 1.5, borderColor: BG,
  },
  avatar: {
    width: 30, height: 30, borderRadius: 6, borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
  },
  heroWrap: { height: HERO_H, position: "relative" },
  heroImage: { width: SW, height: HERO_H, resizeMode: "cover" },
  heroGrad: { ...StyleSheet.absoluteFillObject },
  heroContent: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 10,
  },
  heroSubtitle: {
    fontSize: 11, color: ACCENT, fontWeight: "700", letterSpacing: 1.5,
    textTransform: "uppercase", marginBottom: 6,
  },
  heroLogo: {
    fontSize: 36, fontWeight: "900", color: "#fff", letterSpacing: -1,
    lineHeight: 40, marginBottom: 10,
  },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  ratingBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,184,0,0.12)", paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: { fontSize: 12, color: ACCENT2, fontWeight: "700" },
  heroGenre: { fontSize: 12, color: TXT2 },
  heroYear: { fontSize: 12, color: TXT3 },
  heroBtns: { flexDirection: "row", alignItems: "center", gap: 10 },
  playBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: ACCENT, paddingHorizontal: 22, paddingVertical: 10,
    borderRadius: 8,
  },
  playBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  listBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: GLASS, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  listBtnText: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  infoBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 10,
  },
  infoBtnText: { fontSize: 12, fontWeight: "600", color: TXT2 },
  dots: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: 12,
  },
  catScroll: { paddingHorizontal: 16, gap: 8, paddingVertical: 12 },
  catPill: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: GLASS, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  catPillActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  catText: { fontSize: 13, fontWeight: "600", color: TXT2 },
  catTextActive: { color: "#fff" },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, marginTop: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  seeAll: { fontSize: 12, fontWeight: "600", color: ACCENT },
  rowScroll: { paddingHorizontal: 16, gap: 10 },
  wideCard: {
    width: WIDE_W, height: WIDE_H + 50, borderRadius: 12, overflow: "hidden",
    backgroundColor: CARD_BG,
  },
  wideImage: {
    width: WIDE_W, height: WIDE_H, borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  wideGrad: {
    position: "absolute", left: 0, right: 0, top: WIDE_H * 0.4,
    height: WIDE_H * 0.6,
  },
  widePlayOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, height: WIDE_H,
    alignItems: "center", justifyContent: "center",
  },
  widePlayCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)", borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  wideBottom: { padding: 10, paddingTop: 6 },
  wideTitle: { fontSize: 13, fontWeight: "700", color: "#fff", marginBottom: 2 },
  wideRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  wideEp: { fontSize: 11, color: TXT2, fontWeight: "500" },
  wideTime: { fontSize: 11, color: TXT3, fontWeight: "500" },
  progressTrack: {
    height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressFill: { height: 3, borderRadius: 1.5 },
  top10Wrap: {
    flexDirection: "row", alignItems: "flex-end", marginRight: 4,
  },
  top10Num: {
    fontSize: 72, fontWeight: "900", color: BG,
    lineHeight: 80, marginRight: -14, zIndex: 0,
    textShadowColor: "rgba(255,255,255,0.12)",
    textShadowOffset: { width: -1, height: 0 },
    textShadowRadius: 0,
    includeFontPadding: false,
  },
  top10Card: {
    width: TOP10_W, height: TOP10_H, borderRadius: 10, overflow: "hidden",
    backgroundColor: CARD_BG, zIndex: 1,
  },
  top10Image: { width: TOP10_W, height: TOP10_H },
  top10Grad: {
    position: "absolute", left: 0, right: 0, bottom: 0, height: TOP10_H * 0.4,
  },
  top10Title: {
    position: "absolute", bottom: 8, left: 8, right: 8,
    fontSize: 11, fontWeight: "700", color: "#fff",
  },
  posterCard: {
    width: CARD_W, height: CARD_H, borderRadius: 10, overflow: "hidden",
    backgroundColor: CARD_BG,
  },
  posterImage: { width: CARD_W, height: CARD_H },
  posterGrad: {
    position: "absolute", left: 0, right: 0, bottom: 0, height: CARD_H * 0.4,
  },
  posterTitle: {
    position: "absolute", bottom: 8, left: 8, right: 8,
    fontSize: 12, fontWeight: "700", color: "#fff",
  },
  tagBadge: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: ACCENT, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4,
  },
  tagExclusive: { backgroundColor: "#9C27B0" },
  tagPremiere: { backgroundColor: ACCENT2 },
  tagText: { fontSize: 8, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  featuredRow: { paddingHorizontal: 16, marginTop: 20 },
  featuredCard: {
    width: "100%", height: 180, borderRadius: 14, overflow: "hidden",
    backgroundColor: CARD_BG,
  },
  featuredImage: { width: "100%", height: 180 },
  featuredGrad: { ...StyleSheet.absoluteFillObject },
  featuredContent: { position: "absolute", bottom: 14, left: 14 },
  featuredTitle: { fontSize: 18, fontWeight: "800", color: "#fff", marginBottom: 4 },
  featuredSub: { fontSize: 12, color: TXT2, fontWeight: "500" },
  liveBadge: {
    position: "absolute", top: 12, left: 12,
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(229,9,20,0.85)", paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { fontSize: 10, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  tabBar: { position: "absolute", bottom: 0, left: 0, right: 0 },
  tabBlur: { overflow: "hidden", borderTopWidth: 0.5, borderTopColor: "rgba(255,255,255,0.06)" },
  tabContent: {
    flexDirection: "row", justifyContent: "space-around",
    paddingTop: 8, paddingBottom: 28, backgroundColor: "rgba(10,10,15,0.65)",
  },
  tabItem: { alignItems: "center", gap: 3, minWidth: 50 },
  tabLabel: { fontSize: 10, fontWeight: "500", color: TXT3 },
  tabDot: {
    width: 4, height: 4, borderRadius: 2, backgroundColor: ACCENT, marginTop: 1,
  },
});