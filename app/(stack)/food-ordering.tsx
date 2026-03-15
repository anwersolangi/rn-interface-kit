import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: "all", label: "For You", icon: "sparkles" },
  { id: "pizza", label: "Pizza", icon: "pizza" },
  { id: "sushi", label: "Sushi", icon: "fish" },
  { id: "burger", label: "Burgers", icon: "fast-food" },
  { id: "ramen", label: "Ramen", icon: "restaurant" },
  { id: "dessert", label: "Desserts", icon: "ice-cream" },
];

const PROMOS = [
  {
    id: "1",
    title: "Free Delivery",
    subtitle: "On orders above $20",
    tag: "TODAY ONLY",
    color: ["#FF6B35", "#FF9A5C"] as [string, string],
    emoji: "🍕",
  },
  {
    id: "2",
    title: "30% Off",
    subtitle: "Your first order this week",
    tag: "LIMITED",
    color: ["#2D2D3A", "#4A4A6A"] as [string, string],
    emoji: "🍜",
  },
  {
    id: "3",
    title: "New Arrivals",
    subtitle: "15 new restaurants nearby",
    tag: "EXPLORE",
    color: ["#1A7A4A", "#2DB870"] as [string, string],
    emoji: "🥢",
  },
];

const RESTAURANTS: {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  time: string;
  price: string;
  tag?: string;
  image: string;
}[] = [
  {
    id: "r1",
    name: "Sakura Omakase",
    cuisine: "Japanese · Sushi",
    rating: 4.9,
    time: "18–25 min",
    price: "$$",
    tag: "Top Rated",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80",
  },
  {
    id: "r2",
    name: "Napoli Verace",
    cuisine: "Italian · Pizza",
    rating: 4.8,
    time: "22–30 min",
    price: "$",
    tag: "Popular",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
  },
  {
    id: "r3",
    name: "The Grill House",
    cuisine: "American · Burgers",
    rating: 4.7,
    time: "15–20 min",
    price: "$",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  },
  {
    id: "r4",
    name: "Pho Saigon",
    cuisine: "Vietnamese · Noodles",
    rating: 4.6,
    time: "20–28 min",
    price: "$",
    tag: "New",
    image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80",
  },
];

const DISHES: {
  id: string;
  name: string;
  restaurant: string;
  price: number;
  rating: number;
  image: string;
  calories: string;
}[] = [
  {
    id: "d1",
    name: "Dragon Roll",
    restaurant: "Sakura Omakase",
    price: 18,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=300&q=80",
    calories: "320 cal",
  },
  {
    id: "d2",
    name: "Margherita STG",
    restaurant: "Napoli Verace",
    price: 14,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=300&q=80",
    calories: "560 cal",
  },
  {
    id: "d3",
    name: "Truffle Smash",
    restaurant: "The Grill House",
    price: 16,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=300&q=80",
    calories: "720 cal",
  },
  {
    id: "d4",
    name: "Tonkotsu Ramen",
    restaurant: "Pho Saigon",
    price: 13,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&q=80",
    calories: "480 cal",
  },
];

const TAB_ITEMS = [
  { icon: "home", label: "Home" },
  { icon: "search", label: "Search" },
  { icon: "receipt", label: "Orders" },
  { icon: "person", label: "Profile" },
];

function PromoBanner() {
  const [active, setActive] = useState(0);
  return (
    <View style={styles.promoSection}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width - 40}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          setActive(Math.round(e.nativeEvent.contentOffset.x / (width - 40)));
        }}
      >
        {PROMOS.map((p) => (
          <LinearGradient
            key={p.id}
            colors={p.color}
            style={styles.promoCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.promoLeft}>
              <View style={styles.promoTagPill}>
                <Text style={styles.promoTagText}>{p.tag}</Text>
              </View>
              <Text style={styles.promoTitle}>{p.title}</Text>
              <Text style={styles.promoSubtitle}>{p.subtitle}</Text>
              <Pressable style={styles.promoBtn}>
                <Text style={styles.promoBtnText}>Order Now</Text>
                <Feather name="arrow-right" size={13} color="#fff" />
              </Pressable>
            </View>
            <Text style={styles.promoEmoji}>{p.emoji}</Text>
          </LinearGradient>
        ))}
      </ScrollView>
      <View style={styles.promoDots}>
        {PROMOS.map((_, i) => (
          <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function CategoryChip({
  item,
  isActive,
  onPress,
}: {
  item: (typeof CATEGORIES)[0];
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={animated}>
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.92))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={onPress}
        style={[styles.chip, isActive && styles.chipActive]}
      >
        <Ionicons name={item.icon as never} size={13} color={isActive ? "#fff" : "#999"} />
        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{item.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function RestaurantCard({ item }: { item: (typeof RESTAURANTS)[0] }) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.restaurantCard, animated]}>
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.96))}
        onPressOut={() => (scale.value = withSpring(1))}
      >
        <View>
          <Image source={{ uri: item.image }} style={styles.restaurantImage} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.55)"]}
            style={styles.restaurantImageOverlay}
          />
          {item.tag && (
            <View style={styles.restaurantTag}>
              <Text style={styles.restaurantTagText}>{item.tag}</Text>
            </View>
          )}
          <View style={styles.restaurantTimeChip}>
            <Feather name="clock" size={10} color="#fff" />
            <Text style={styles.restaurantTimeText}>{item.time}</Text>
          </View>
        </View>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.restaurantMeta}>{item.cuisine}</Text>
          <View style={styles.restaurantFooter}>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={10} color="#FF6B35" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <View style={styles.pricePill}>
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function DishCard({ item }: { item: (typeof DISHES)[0] }) {
  const [added, setAdded] = useState(false);
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleAdd = () => {
    scale.value = withSpring(0.94, {}, () => {
      scale.value = withSpring(1);
    });
    setAdded((p) => !p);
  };

  return (
    <Animated.View style={[styles.dishCard, animated]}>
      <View style={styles.dishImageWrap}>
        <Image source={{ uri: item.image }} style={styles.dishImage} />
        <Pressable
          onPress={handleAdd}
          style={[styles.dishAddFloating, added && styles.dishAddFloatingActive]}
        >
          <Ionicons name={added ? "checkmark" : "add"} size={16} color="#fff" />
        </Pressable>
      </View>
      <View style={styles.dishInfo}>
        <Text style={styles.dishName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.dishRestaurant} numberOfLines={1}>{item.restaurant}</Text>
        <View style={styles.dishBottom}>
          <Text style={styles.dishPrice}>${item.price}</Text>
          <View style={styles.dishMeta}>
            <Ionicons name="star" size={10} color="#FF6B35" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.dishCalories}> · {item.calories}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function TabBar() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <View style={styles.tabBar}>
      <View style={styles.tabInner}>
        <Pressable style={styles.tabItem} onPress={() => setActiveTab(0)}>
          <Ionicons name="home" size={22} color={activeTab === 0 ? "#FF6B35" : "#C4C0BB"} />
          <Text style={[styles.tabLabel, activeTab === 0 && styles.tabLabelActive]}>Home</Text>
        </Pressable>

        <Pressable style={styles.tabItem} onPress={() => setActiveTab(1)}>
          <Ionicons name="search" size={22} color={activeTab === 1 ? "#FF6B35" : "#C4C0BB"} />
          <Text style={[styles.tabLabel, activeTab === 1 && styles.tabLabelActive]}>Search</Text>
        </Pressable>

        <View style={styles.cartFabSlot}>
          <Pressable onPress={() => setActiveTab(4)}>
            <LinearGradient
              colors={["#FF6B35", "#FF9A5C"]}
              style={styles.cartFabGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="shopping-bag" size={22} color="#fff" />
            </LinearGradient>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>3</Text>
            </View>
          </Pressable>
        </View>

        <Pressable style={styles.tabItem} onPress={() => setActiveTab(2)}>
          <Ionicons name="receipt" size={22} color={activeTab === 2 ? "#FF6B35" : "#C4C0BB"} />
          <Text style={[styles.tabLabel, activeTab === 2 && styles.tabLabelActive]}>Orders</Text>
        </Pressable>

        <Pressable style={styles.tabItem} onPress={() => setActiveTab(3)}>
          <Ionicons name="person" size={22} color={activeTab === 3 ? "#FF6B35" : "#C4C0BB"} />
          <Text style={[styles.tabLabel, activeTab === 3 && styles.tabLabelActive]}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function FoodHomeScreen() {
  const [activeCategory, setActiveCategory] = useState("all");
  const {top} = useSafeAreaInsets();

  return (
    <View style={[styles.safe, {marginTop: top} ]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />

      <View style={styles.header}>
        <View>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={13} color="#FF6B35" />
            <Text style={styles.locationLabel}>Delivering to</Text>
          </View>
          <Pressable style={styles.locationSelector}>
            <Text style={styles.locationCity}>Karachi, DHA Phase 5</Text>
            <Feather name="chevron-down" size={15} color="#1A1A2E" />
          </Pressable>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconBtn}>
            <Feather name="bell" size={19} color="#1A1A2E" />
            <View style={styles.notifDot} />
          </Pressable>
          <Pressable style={styles.avatarBtn}>
            <LinearGradient colors={["#1A1A2E", "#3D3D5C"]} style={styles.avatarGrad}>
              <Text style={styles.avatarText}>A</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.searchRow}>
          <Pressable style={styles.searchBar}>
            <View style={styles.searchIconWrap}>
              <Feather name="search" size={15} color="#FF6B35" />
            </View>
            <Text style={styles.searchPlaceholder}>Search dishes, restaurants…</Text>
            <View style={styles.searchDivider} />
            <Feather name="mic" size={15} color="#BBB" />
          </Pressable>
          <Pressable style={styles.filterBtn}>
            <LinearGradient colors={["#1A1A2E", "#2D2D50"]} style={styles.filterGrad}>
              <Feather name="sliders" size={17} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>

        <PromoBanner />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              item={cat}
              isActive={activeCategory === cat.id}
              onPress={() => setActiveCategory(cat.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Nearby Restaurants</Text>
            <Text style={styles.sectionSubtitle}>Open now · Karachi</Text>
          </View>
          <Pressable style={styles.seeAllBtn}>
            <Text style={styles.seeAll}>See all</Text>
            <Feather name="arrow-right" size={13} color="#FF6B35" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.restaurantList}
        >
          {RESTAURANTS.map((r) => (
            <RestaurantCard key={r.id} item={r} />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Popular Dishes</Text>
            <Text style={styles.sectionSubtitle}>Trending around you right now</Text>
          </View>
          <Pressable style={styles.seeAllBtn}>
            <Text style={styles.seeAll}>See all</Text>
            <Feather name="arrow-right" size={13} color="#FF6B35" />
          </Pressable>
        </View>

        <View style={styles.dishGrid}>
          {DISHES.map((d) => (
            <DishCard key={d.id} item={d} />
          ))}
        </View>

        <View style={styles.reorderBanner}>
          <LinearGradient
            colors={["#1A1A2E", "#2D2D50"]}
            style={styles.reorderGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.6 }}
          >
            <View style={styles.reorderLeft}>
              <View style={styles.reorderIconWrap}>
                <Ionicons name="refresh" size={16} color="#FF6B35" />
              </View>
              <View>
                <Text style={styles.reorderTitle}>Order again?</Text>
                <Text style={styles.reorderSub}>Dragon Roll · Sakura Omakase</Text>
              </View>
            </View>
            <Pressable style={styles.reorderBtn}>
              <Text style={styles.reorderBtnText}>Reorder</Text>
              <Feather name="arrow-right" size={13} color="#fff" />
            </Pressable>
          </LinearGradient>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAF8F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationLabel: {
    fontSize: 11,
    color: "#AAA",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  locationCity: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1A2E",
    letterSpacing: -0.4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0EDE8",
    justifyContent: "center",
    alignItems: "center",
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B35",
    position: "absolute",
    top: 7,
    right: 7,
    borderWidth: 1.5,
    borderColor: "#FAF8F5",
  },
  avatarBtn: {
    borderRadius: 22,
    overflow: "hidden",
  },
  avatarGrad: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  scrollContent: {
    paddingTop: 4,
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FFF0EB",
    justifyContent: "center",
    alignItems: "center",
  },
  searchPlaceholder: {
    flex: 1,
    color: "#CCCCCC",
    fontSize: 13.5,
    fontWeight: "400",
  },
  searchDivider: {
    width: 1,
    height: 18,
    backgroundColor: "#EEE",
  },
  filterBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  filterGrad: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  promoSection: {
    marginBottom: 8,
  },
  promoCard: {
    width: width - 40,
    marginLeft: 20,
    borderRadius: 22,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 138,
  },
  promoLeft: {
    flex: 1,
    gap: 6,
  },
  promoTagPill: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  promoTagText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  promoTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  promoSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "400",
  },
  promoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  promoBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  promoEmoji: {
    fontSize: 56,
    marginLeft: 8,
  },
  promoDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 12,
    marginBottom: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#DDD",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#FF6B35",
  },
  categoryList: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 14,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: "#F0EDE8",
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: "#1A1A2E",
    borderColor: "#1A1A2E",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  chipTextActive: {
    color: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A2E",
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#BBB",
    marginTop: 2,
    fontWeight: "400",
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FF6B35",
  },
  restaurantList: {
    paddingLeft: 20,
    paddingRight: 8,
    gap: 14,
    marginBottom: 26,
  },
  restaurantCard: {
    width: 188,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
  },
  restaurantImage: {
    width: "100%",
    height: 118,
    resizeMode: "cover",
  },
  restaurantImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  restaurantTag: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  restaurantTagText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  restaurantTimeChip: {
    position: "absolute",
    bottom: 8,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  restaurantTimeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  restaurantInfo: {
    padding: 13,
    gap: 4,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1A2E",
    letterSpacing: -0.3,
  },
  restaurantMeta: {
    fontSize: 12,
    color: "#BBB",
    fontWeight: "400",
  },
  restaurantFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFF0EB",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  pricePill: {
    backgroundColor: "#F0EDE8",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666",
  },
  dishGrid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 20,
  },
  dishCard: {
    width: (width - 54) / 2,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  dishImageWrap: {
    position: "relative",
  },
  dishImage: {
    width: "100%",
    height: 118,
    resizeMode: "cover",
  },
  dishAddFloating: {
    position: "absolute",
    bottom: -14,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#1A1A2E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2.5,
    borderColor: "#fff",
  },
  dishAddFloatingActive: {
    backgroundColor: "#2DB870",
  },
  dishInfo: {
    padding: 12,
    paddingTop: 20,
    gap: 2,
  },
  dishName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1A2E",
    letterSpacing: -0.3,
  },
  dishRestaurant: {
    fontSize: 11,
    color: "#BBB",
    fontWeight: "400",
  },
  dishBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1A1A2E",
    letterSpacing: -0.5,
  },
  dishMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  dishCalories: {
    fontSize: 10,
    color: "#CCC",
    fontWeight: "400",
  },
  reorderBanner: {
    marginHorizontal: 20,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 8,
  },
  reorderGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  reorderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reorderIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,107,53,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  reorderTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  reorderSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 2,
  },
  reorderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reorderBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0EDE8",
    paddingBottom: 28,
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  tabInner: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingTop: 12,
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: "#C4C0BB",
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#FF6B35",
    fontWeight: "700",
  },
  cartFabSlot: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 4,
    marginTop: -22,
  },
  cartFabGrad: {
    width: 58,
    height: 58,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#1A1A2E",
    borderRadius: 8,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
  },
});