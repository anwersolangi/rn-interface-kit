import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Route = {
  label: string;
  path: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

const ROUTES: Route[] = [
  { label: "3D Soda", path: "/3d-soda", icon: "cube-outline" },
  { label: "AI Assistant Home", path: "/ai-assistant-home", icon: "sparkles-outline" },
  { label: "Broadcast Radio", path: "/broadcast-radio", icon: "radio-outline" },
  { label: "Card Input", path: "/card-input", icon: "card-outline" },
  { label: "Cyberpunk Slot Machine", path: "/cyberpunk-slot-machine", icon: "game-controller-outline" },
  { label: "Delivery Screen", path: "/delivery-screen", icon: "bicycle-outline" },
  { label: "Duolingo Drag Drop", path: "/duolingo-drag-drop", icon: "grid-outline" },
  { label: "Dynamic Music Player", path: "/dynamic-music-player", icon: "musical-notes-outline" },
  { label: "Flappy Bird", path: "/flappy-bird", icon: "airplane-outline" },
  { label: "Food Ordering", path: "/food-ordering", icon: "restaurant-outline" },
  { label: "GitHub Profile Screen", path: "/github-profile-screen", icon: "logo-github" },
  { label: "Habit Tracker AI", path: "/habbit-tracker-ai", icon: "sparkles-outline" },
  { label: "Habit Tracker Homescreen", path: "/habit-tracker-homescreen", icon: "checkmark-done-outline" },
  { label: "Kids Scenery", path: "/kids-scenery", icon: "image-outline" },
  { label: "Neo Brutalism Wallet", path: "/neo-brutalism-wallet", icon: "grid-outline" },
  { label: "Neumorphism Weather", path: "/neumorphism-weather", icon: "cloud-outline" },
  { label: "Onboarding", path: "/onboarding", icon: "navigate-outline" },
  { label: "OTP", path: "/otp", icon: "keypad-outline" },
  { label: "OTT Home Screen", path: "/ott-home-screen", icon: "tv-outline" },
  { label: "Pizza Ordering", path: "/pizza-ordering", icon: "pizza-outline" },
  { label: "Profile", path: "/profile", icon: "person-outline" },
  { label: "Reels", path: "/reels", icon: "play-circle-outline" },
  { label: "Scientific Calculator", path: "/scientific-calculator", icon: "calculator-outline" },
  { label: "Search", path: "/search", icon: "search-outline" },
  { label: "Settings Toggle", path: "/settings-toggle", icon: "settings-outline" },
  { label: "Spotify Wrap", path: "/spotify-wrap", icon: "musical-notes-outline" },
  { label: "Stock Digit Flip", path: "/stock-digit-flip", icon: "trending-up-outline" },
  { label: "Travel Booking", path: "/travel-booking", icon: "airplane-outline" },
  { label: "YT Tinder", path: "/yt-tinder", icon: "heart-outline" },
  { label: "OLX Listing Home", path: "/olx-listing-home", icon: "pricetags-outline" },
  { label: "Gym Membership Card", path: "/gym-membership-card", icon: "card-outline" },
  { label: "OTT Streaming Home", path: "/ott-streaming-home", icon: "tv-outline" },
  { label: "Restaurant Booking Screen", path: "/restaurant-booking-screen", icon: "restaurant-outline" },
  { label: "Restaurant Discovery Screen", path: "/restaurant-discovery-screen", icon: "compass-outline" },
  { label: "Blog Home Screen", path: "/blog-home-screen", icon: "newspaper-outline" },
  { label: "Boarding Pass", path: "/boarding-pass", icon: "ticket-outline" },
  { label: "Coffee Order Carousel", path: "/coffee-order-carousel", icon: "cafe-outline" },
];

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.eyebrow}>@anwersolangidev</Text>
        <Text style={styles.title}>UI Components</Text>
        <Text style={styles.subtitle}>{ROUTES.length} screens</Text>
      </View>

      <FlatList
        data={ROUTES}
        keyExtractor={(item) => item.path}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Pressable
            style={({ pressed }) => [
              styles.row,
              pressed && styles.rowPressed,
            ]}
            onPress={() => router.push(item.path as never)}
          >
            <View style={styles.rowLeft}>
              <View style={styles.indexBadge}>
                <Text style={styles.indexText}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
              </View>
              {item.icon && (
                <Ionicons
                  name={item.icon}
                  size={20}
                  color="#a0a0b0"
                  style={styles.rowIcon}
                />
              )}
              <Text style={styles.rowLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#3a3a4a" />
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090f",
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a2e",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    color: "#5b5bf6",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f0f0f8",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#4a4a5a",
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#0f0f1a",
  },
  rowPressed: {
    backgroundColor: "#16162a",
    transform: [{ scale: 0.985 }],
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#5b5bf6",
    letterSpacing: 0.5,
  },
  rowIcon: {
    width: 20,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#c8c8d8",
    letterSpacing: -0.1,
  },
  separator: {
    height: 4,
  },
});