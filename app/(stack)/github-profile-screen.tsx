import { Dimensions, StatusBar, Platform, StyleSheet } from "react-native";
import { useState, useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  FadeInDown,
  FadeIn,
  SlideInRight,
  runOnJS,
} from "react-native-reanimated";
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Rect,
  Defs,
  LinearGradient as SvgGrad,
  Stop,
} from "react-native-svg";

const { width: SW } = Dimensions.get("window");
const SBH = Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 24;

const BG = "#F2F4F7";
const WHITE = "#FFFFFF";
const TP = "#0F172A";
const TS = "#64748B";
const TM = "#94A3B8";
const GREEN = "#22C55E";
const GREEN_DIM = "#166534";
const GREEN_MID = "#16A34A";
const GREEN_LIGHT = "#BBF7D0";
const GREEN_BG = "#F0FDF4";
const ACCENT = "#6366F1";
const YELLOW = "#EAB308";
const SHADOW = "#0F172A";
const TAB_BG = "#0F172A";
const BORDER = "#E2E8F0";

const AVATAR =
  "https://images.unsplash.com/photo-1753545975907-dcb51efdd0d5?q=80&w=1598&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const COLS = 20;
const ROWS = 7;
const GRID_PADDING = 24;
const GRID_INNER_PAD = 16;
const GRID_GAP = 3;
const AVAILABLE_WIDTH = SW - GRID_PADDING * 2 - GRID_INNER_PAD * 2;
const CELL_SIZE = Math.floor((AVAILABLE_WIDTH - (COLS - 1) * GRID_GAP) / COLS);
const GRID_TOTAL_W = COLS * CELL_SIZE + (COLS - 1) * GRID_GAP;
const GRID_TOTAL_H = ROWS * CELL_SIZE + (ROWS - 1) * GRID_GAP;

const CONTRIBUTION_DATA = [
  [0, 1, 2, 3, 2, 1, 0, 1, 3, 4, 3, 2, 1, 0, 2, 3, 4, 4, 3, 2],
  [1, 2, 3, 4, 3, 2, 1, 2, 4, 3, 2, 3, 2, 1, 3, 4, 3, 2, 1, 3],
  [0, 1, 2, 2, 4, 3, 2, 3, 2, 1, 3, 4, 3, 2, 1, 2, 4, 3, 2, 1],
  [2, 3, 1, 0, 1, 2, 3, 4, 3, 2, 4, 3, 2, 3, 4, 3, 2, 1, 0, 2],
  [1, 0, 2, 3, 2, 1, 2, 3, 4, 4, 2, 1, 0, 1, 3, 4, 3, 2, 3, 4],
  [3, 2, 1, 2, 3, 4, 3, 2, 1, 2, 3, 2, 1, 0, 2, 3, 4, 4, 3, 2],
  [0, 1, 0, 1, 2, 3, 4, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 4, 3],
];

const TECH_STACK = [
  { name: "React Native", color: "#61DAFB" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Expo", color: "#000020" },
  { name: "Node.js", color: "#339933" },
  { name: "Next.js", color: "#0F172A" },
  { name: "Python", color: "#3776AB" },
];

const PROJECTS = [
  {
    name: "react-native-animations",
    desc: "Premium animation library for RN",
    lang: "TypeScript",
    langColor: "#3178C6",
    stars: "2.4K",
    forks: "186",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=300&fit=crop",
  },
  {
    name: "expo-starter-kit",
    desc: "Production-ready Expo template",
    lang: "TypeScript",
    langColor: "#3178C6",
    stars: "1.8K",
    forks: "342",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=300&fit=crop",
  },
  {
    name: "ghosttyper-vscode",
    desc: "Realistic code typing for demos",
    lang: "JavaScript",
    langColor: "#F7DF1E",
    stars: "956",
    forks: "78",
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&h=300&fit=crop",
  },
];

const SOCIALS = [
  { icon: "logo-github" as const, label: "GitHub", color: "#181717" },
  { icon: "logo-youtube" as const, label: "YouTube", color: "#FF0000" },
  { icon: "logo-instagram" as const, label: "Instagram", color: "#E4405F" },
  { icon: "logo-tiktok" as const, label: "TikTok", color: "#010101" },
];

const TABS = [
  { icon: "home-outline" as const, active: false },
  { icon: "search-outline" as const, active: false },
  { icon: "add-outline" as const, active: false },
  { icon: "code-slash-outline" as const, active: false },
  { icon: "person-outline" as const, active: true },
];

const GRID_COLORS = ["#EBEDF0", "#9BE9A8", "#40C463", "#30A14E", "#216E39"];

function ContributionGrid() {
  return (
    <Svg width={GRID_TOTAL_W} height={GRID_TOTAL_H} viewBox={`0 0 ${GRID_TOTAL_W} ${GRID_TOTAL_H}`}>
      {CONTRIBUTION_DATA.map((row, rI) =>
        row.map((level, cI) => (
          <Rect
            key={`${rI}-${cI}`}
            x={cI * (CELL_SIZE + GRID_GAP)}
            y={rI * (CELL_SIZE + GRID_GAP)}
            width={CELL_SIZE}
            height={CELL_SIZE}
            rx={2.5}
            fill={GRID_COLORS[level]}
          />
        ))
      )}
    </Svg>
  );
}

function AvatarRing() {
  const rotation = useSharedValue(0);
  useState(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 5000, easing: Easing.linear }),
      -1,
      false
    );
  });
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  return (
    <Animated.View style={[{ position: "absolute" }, ringStyle]}>
      <Svg width={152} height={152} viewBox="0 0 152 152">
        <Defs>
          <SvgGrad id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={GREEN} />
            <Stop offset="0.5" stopColor={ACCENT} />
            <Stop offset="1" stopColor={GREEN} />
          </SvgGrad>
        </Defs>
        <Circle cx="76" cy="76" r="73" stroke="url(#ring)" strokeWidth="2.5" fill="none" strokeDasharray="16 6" />
      </Svg>
    </Animated.View>
  );
}

function AnimatedStat({ value, label, delay }: { value: string; label: string; delay: number }) {
  const scale = useSharedValue(0);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: scale.value }));
  useState(() => { scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 100 })); });
  return (
    <Animated.View style={[{ alignItems: "center", flex: 1 }, animStyle]}>
      <Animated.Text style={s.statValue}>{value}</Animated.Text>
      <Animated.Text style={s.statLabel}>{label}</Animated.Text>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const scrollY = useSharedValue(0);
  const [activeAction, setActiveAction] = useState(-1);
  const [isFollowing, setIsFollowing] = useState(false);
  const followScale = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({ onScroll: (e) => { scrollY.value = e.contentOffset.y; } });
  const headerBg = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [0, 100], [0, 1], Extrapolation.CLAMP) }));
  const avatarParallax = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [-50, 0, 150], [1.1, 1, 0.85], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 150], [0, -15], Extrapolation.CLAMP);
    return { transform: [{ scale }, { translateY }] };
  });

  const toggleFollow = useCallback(() => {
    setIsFollowing((p) => !p);
    followScale.value = withSequence(withTiming(0.9, { duration: 80 }), withSpring(1, { damping: 8, stiffness: 200 }));
  }, [followScale]);
  const followStyle = useAnimatedStyle(() => ({ transform: [{ scale: followScale.value }] }));
  const followGesture = Gesture.Tap().onEnd(() => { runOnJS(toggleFollow)(); });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <Animated.View style={[s.stickyHeader, headerBg]}>
        <Animated.Text style={s.stickyTitle}>Anwer Solangi</Animated.Text>
      </Animated.View>

      <Animated.View style={s.topBar}>
        <Animated.View style={s.topBtn}>
          <Ionicons name="menu-outline" size={26} color={TP} />
        </Animated.View>
        <Animated.View style={s.topBtn}>
          <Ionicons name="ellipsis-horizontal" size={24} color={TP} />
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: SBH + 50, paddingBottom: 120 }}
      >
        <Animated.View entering={FadeIn.delay(100).duration(600)} style={s.avatarWrap}>
          <Animated.View style={avatarParallax}>
            <Animated.View style={s.avatarContainer}>
              <AvatarRing />
              <Animated.View style={s.avatarBorder}>
                <Image source={{ uri: AVATAR }} style={s.avatar} contentFit="cover" transition={500} />
              </Animated.View>
              <Animated.View style={s.statusBadge}>
                <Ionicons name="code-slash" size={11} color={WHITE} />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={s.info}>
          <Animated.View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Animated.Text style={s.name}>Anwer Solangi</Animated.Text>
            <Animated.View style={s.proBadge}>
              <Animated.Text style={s.proText}>PRO</Animated.Text>
            </Animated.View>
          </Animated.View>
          <Animated.Text style={s.role}>React Native Developer</Animated.Text>
          <Animated.Text style={s.location}>Karachi, Pakistan</Animated.Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(500)} style={s.statsRow}>
          <AnimatedStat value="4,827" label="Commits" delay={400} />
          <Animated.View style={s.statDiv} />
          <AnimatedStat value="845K" label="Followers" delay={550} />
          <Animated.View style={s.statDiv} />
          <AnimatedStat value="12.4K" label="Stars" delay={700} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(420).duration(500)} style={s.actionsRow}>
          {[
            { icon: "bookmark-outline" as const, activeIcon: "bookmark" as const },
            { icon: "heart-outline" as const, activeIcon: "heart" as const },
            { icon: "share-social-outline" as const, activeIcon: "share-social" as const },
          ].map((btn, i) => {
            const isActive = activeAction === i;
            return (
              <Animated.View
                key={i}
                onTouchEnd={() => setActiveAction((p) => (p === i ? -1 : i))}
                style={[s.actionBtn, isActive && s.actionBtnActive]}
              >
                <Ionicons name={isActive ? btn.activeIcon : btn.icon} size={22} color={isActive ? WHITE : TS} />
              </Animated.View>
            );
          })}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(520).duration(500)} style={s.section}>
          <Animated.View style={s.sectionHeader}>
            <Animated.Text style={s.sectionTitle}>Contributions</Animated.Text>
            <Animated.View style={s.contribBadge}>
              <Animated.Text style={s.contribBadgeText}>1,247 this year</Animated.Text>
            </Animated.View>
          </Animated.View>
          <Animated.View style={s.contribCard}>
            <ContributionGrid />
            <Animated.View style={s.legend}>
              <Animated.Text style={s.legendText}>Less</Animated.Text>
              {GRID_COLORS.map((c, i) => (
                <Animated.View key={i} style={[s.legendBox, { backgroundColor: c }]} />
              ))}
              <Animated.Text style={s.legendText}>More</Animated.Text>
            </Animated.View>
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(620).duration(500)} style={s.section}>
          <Animated.Text style={s.sectionTitle}>Tech Stack</Animated.Text>
          <Animated.View style={s.techGrid}>
            {TECH_STACK.map((tech, i) => (
              <Animated.View key={tech.name} entering={FadeIn.delay(670 + i * 50).duration(300)} style={s.techChip}>
                <Animated.View style={[s.techDot, { backgroundColor: tech.color }]} />
                <Animated.Text style={s.techLabel}>{tech.name}</Animated.Text>
              </Animated.View>
            ))}
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(720).duration(500)} style={s.section}>
          <Animated.View style={s.sectionHeader}>
            <Animated.Text style={s.sectionTitle}>Pinned Repos</Animated.Text>
            <Animated.Text style={s.seeAll}>See All</Animated.Text>
          </Animated.View>

          <Animated.View style={s.featuredCard}>
            <Image source={{ uri: PROJECTS[0].image }} style={s.featuredImg} contentFit="cover" transition={800} />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.6)"]} style={s.featuredOverlay}>
              <Animated.View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Ionicons name="folder-open-outline" size={14} color={GREEN} />
                <Animated.Text style={s.featuredName}>{PROJECTS[0].name}</Animated.Text>
              </Animated.View>
              <Animated.View style={s.featuredMeta}>
                <Animated.View style={s.featuredBadge}>
                  <Animated.View style={[s.miniDot, { backgroundColor: PROJECTS[0].langColor }]} />
                  <Animated.Text style={s.featuredMetaText}>{PROJECTS[0].lang}</Animated.Text>
                </Animated.View>
                <Animated.View style={s.featuredBadge}>
                  <Ionicons name="star" size={11} color={YELLOW} />
                  <Animated.Text style={s.featuredMetaText}>{PROJECTS[0].stars}</Animated.Text>
                </Animated.View>
                <Animated.View style={s.featuredBadge}>
                  <Ionicons name="git-branch-outline" size={11} color="#ccc" />
                  <Animated.Text style={s.featuredMetaText}>{PROJECTS[0].forks}</Animated.Text>
                </Animated.View>
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={s.repoGrid}>
            {PROJECTS.slice(1).map((proj, i) => (
              <Animated.View key={proj.name} entering={FadeIn.delay(820 + i * 100).duration(400)} style={s.repoCard}>
                <Image source={{ uri: proj.image }} style={s.repoImg} contentFit="cover" transition={600} />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.65)"]} style={s.repoOverlay}>
                  <Animated.Text style={s.repoName} numberOfLines={1}>{proj.name}</Animated.Text>
                  <Animated.View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="star" size={10} color={YELLOW} />
                    <Animated.Text style={s.repoStat}>{proj.stars}</Animated.Text>
                  </Animated.View>
                </LinearGradient>
              </Animated.View>
            ))}
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(900).duration(500)} style={s.section}>
          <Animated.Text style={s.sectionTitle}>Connect</Animated.Text>
          <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {SOCIALS.map((social, i) => (
              <Animated.View key={social.label} entering={SlideInRight.delay(950 + i * 80).duration(400)} style={s.socialCard}>
                <Animated.View style={[s.socialIcon, { backgroundColor: social.color + "10" }]}>
                  <Ionicons name={social.icon} size={22} color={social.color} />
                </Animated.View>
                <Animated.Text style={s.socialLabel}>{social.label}</Animated.Text>
              </Animated.View>
            ))}
          </Animated.ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450).duration(500)} style={s.buttonsRow}>
          <GestureDetector gesture={followGesture}>
            <Animated.View style={[followStyle, { flex: 1 }]}>
              <LinearGradient
                colors={isFollowing ? [WHITE, WHITE] : [GREEN_MID, GREEN]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.followBtn, isFollowing && { borderWidth: 1.5, borderColor: BORDER }]}
              >
                <Ionicons name={isFollowing ? "checkmark" : "person-add-outline"} size={18} color={isFollowing ? TP : WHITE} />
                <Animated.Text style={[s.followText, isFollowing && { color: TP }]}>
                  {isFollowing ? "Following" : "Follow"}
                </Animated.Text>
              </LinearGradient>
            </Animated.View>
          </GestureDetector>
          <Animated.View style={s.iconBtn}>
            <Ionicons name="chatbubble-outline" size={20} color={TP} />
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(1050).duration(400)} style={s.footerCard}>
          <Animated.View style={s.footerDot} />
          <Animated.Text style={s.footerText}>Open for collaborations & freelance</Animated.Text>
          <Ionicons name="arrow-forward-outline" size={16} color={GREEN_MID} />
        </Animated.View>
      </Animated.ScrollView>

      <Animated.View entering={FadeInDown.delay(1100).duration(500)} style={s.tabWrap}>
        <Animated.View style={s.tabBar}>
          {TABS.map((tab, i) => (
            <Animated.View key={i} style={s.tabItem}>
              {tab.active && <Animated.View style={s.tabActiveDot} />}
              <Ionicons
                name={tab.icon}
                size={tab.icon === "add-outline" ? 30 : 23}
                color={tab.active ? WHITE : "rgba(255,255,255,0.35)"}
              />
            </Animated.View>
          ))}
        </Animated.View>
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  stickyHeader: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 9,
    height: SBH + 44, backgroundColor: "rgba(242,244,247,0.96)",
    alignItems: "center", justifyContent: "flex-end", paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.04)",
  },
  stickyTitle: { fontSize: 17, fontWeight: "700", color: TP },
  topBar: {
    position: "absolute", top: SBH, left: 0, right: 0, zIndex: 10,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, height: 44,
  },
  topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarWrap: { alignItems: "center", marginTop: 8 },
  avatarContainer: { width: 152, height: 152, alignItems: "center", justifyContent: "center" },
  avatarBorder: {
    width: 134, height: 134, borderRadius: 67, backgroundColor: WHITE,
    padding: 4, shadowColor: SHADOW, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 12,
  },
  avatar: { width: "100%", height: "100%", borderRadius: 63 },
  statusBadge: {
    position: "absolute", bottom: 8, right: 8,
    width: 28, height: 28, borderRadius: 10, backgroundColor: GREEN,
    alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: BG,
  },
  info: { alignItems: "center", marginTop: 16, paddingHorizontal: 30 },
  name: { fontSize: 26, fontWeight: "800", color: TP, letterSpacing: -0.5 },
  proBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: GREEN_BG, borderWidth: 1, borderColor: GREEN_LIGHT,
  },
  proText: {
    fontSize: 10, fontWeight: "800", color: GREEN_DIM, letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  role: { fontSize: 15, color: TS, fontWeight: "500", marginTop: 6 },
  location: { fontSize: 14, color: TM, fontWeight: "400", marginTop: 2 },
  statsRow: {
    flexDirection: "row", alignItems: "center", marginHorizontal: 40, marginTop: 24, paddingVertical: 4,
  },
  statDiv: { width: 2, height: 28, backgroundColor: BORDER, borderRadius: 1, alignSelf: "center" },
  statValue: { fontSize: 22, fontWeight: "800", color: TP, letterSpacing: -0.5 },
  statLabel: { fontSize: 12, color: TS, fontWeight: "500", marginTop: 2 },
  actionsRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 22 },
  actionBtn: {
    width: 56, height: 56, borderRadius: 18, backgroundColor: WHITE,
    alignItems: "center", justifyContent: "center",
    shadowColor: SHADOW, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  actionBtnActive: {
    backgroundColor: ACCENT, shadowColor: ACCENT, shadowOpacity: 0.25,
  },
  section: { marginTop: 28, paddingHorizontal: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: TP, marginBottom: 14 },
  seeAll: { fontSize: 13, fontWeight: "600", color: ACCENT },
  contribBadge: {
    backgroundColor: GREEN_BG, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: GREEN_LIGHT,
  },
  contribBadgeText: {
    fontSize: 11, fontWeight: "700", color: GREEN_DIM,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  contribCard: {
    backgroundColor: WHITE, borderRadius: 18, padding: GRID_INNER_PAD,
    shadowColor: SHADOW, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4,
    alignItems: "center",
  },
  legend: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 12, alignSelf: "flex-end" },
  legendText: { fontSize: 10, color: TM, fontWeight: "500" },
  legendBox: { width: 11, height: 11, borderRadius: 2.5 },
  techGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  techChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: WHITE,
    shadowColor: SHADOW, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  techDot: { width: 10, height: 10, borderRadius: 5 },
  techLabel: { fontSize: 13, fontWeight: "600", color: TP },
  featuredCard: {
    width: "100%", height: 200, borderRadius: 20, overflow: "hidden", backgroundColor: WHITE,
    shadowColor: SHADOW, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 18, elevation: 8,
  },
  featuredImg: { width: "100%", height: "100%" },
  featuredOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: 80, justifyContent: "flex-end", paddingHorizontal: 16, paddingBottom: 14,
  },
  featuredName: {
    fontSize: 15, fontWeight: "700", color: WHITE,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  featuredMeta: { flexDirection: "row", gap: 10 },
  featuredBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  featuredMetaText: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.9)" },
  miniDot: { width: 8, height: 8, borderRadius: 4 },
  repoGrid: { flexDirection: "row", gap: 12, marginTop: 12 },
  repoCard: {
    flex: 1, height: (SW - 60) / 2 - 6, borderRadius: 16, overflow: "hidden", backgroundColor: WHITE,
    shadowColor: SHADOW, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  repoImg: { width: "100%", height: "100%" },
  repoOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: 60, justifyContent: "flex-end", paddingHorizontal: 10, paddingBottom: 10,
  },
  repoName: {
    fontSize: 11, fontWeight: "700", color: WHITE, marginBottom: 3,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  repoStat: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  socialCard: {
    width: 88, paddingVertical: 14, borderRadius: 16, backgroundColor: WHITE,
    alignItems: "center", gap: 8,
    shadowColor: SHADOW, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  socialIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  socialLabel: { fontSize: 11, fontWeight: "600", color: TS },
  buttonsRow: { flexDirection: "row", marginHorizontal: 24, marginTop: 24, gap: 10 },
  followBtn: {
    paddingVertical: 15, borderRadius: 16, alignItems: "center",
    justifyContent: "center", flexDirection: "row", gap: 8,
    shadowColor: GREEN_MID, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 14, elevation: 8,
  },
  followText: { fontSize: 15, fontWeight: "700", color: WHITE, letterSpacing: 0.2 },
  iconBtn: {
    width: 54, height: 54, borderRadius: 16, backgroundColor: WHITE,
    alignItems: "center", justifyContent: "center",
    shadowColor: SHADOW, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4, borderWidth: 1.5, borderColor: BORDER,
  },
  footerCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 24, marginTop: 24, backgroundColor: GREEN_BG,
    paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1, borderColor: GREEN_LIGHT,
  },
  footerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN },
  footerText: { fontSize: 13, fontWeight: "600", color: GREEN_DIM, flex: 1 },
  tabWrap: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: Platform.OS === "ios" ? 28 : 14,
  },
  tabBar: {
    flexDirection: "row", backgroundColor: TAB_BG, borderRadius: 26,
    paddingVertical: 16, paddingHorizontal: 8, alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000", shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3, shadowRadius: 28, elevation: 16,
  },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabActiveDot: { position: "absolute", top: -8, width: 5, height: 5, borderRadius: 2.5, backgroundColor: GREEN },
});