import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeInLeft,
  SlideInUp,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const TOKENS = [
  { coin: "ETH", amount: "12.45", usd: "$31,240", icon: "ethereum", bg: "#E8E8FF", border: "#7C3AED" },
  { coin: "SOL", amount: "89.2", usd: "$12,488", icon: "circle", bg: "#E8FFE8", border: "#16A34A" },
  { coin: "USDC", amount: "4,200", usd: "$4,200", icon: "dollar-sign", bg: "#FFF8E8", border: "#CA8A04" },
  { coin: "BTC", amount: "0.012", usd: "$363", icon: "bitcoin", bg: "#FFE8E8", border: "#DC2626" },
];

const TXS = [
  { icon: "arrow-up-right", label: "Sent to @vitalik", amount: "-0.42 ETH", time: "2m ago", type: "send" },
  { icon: "arrow-down-left", label: "Received USDC", amount: "+1,200.00", time: "1h ago", type: "receive" },
  { icon: "refresh-cw", label: "Swapped SOL→ETH", amount: "2.1 ETH", time: "3h ago", type: "swap" },
  { icon: "trending-up", label: "Staking Reward", amount: "+0.003 ETH", time: "6h ago", type: "receive" },
];

const ACTIONS = [
  { label: "Send", bg: "#FFD43B", icon: "arrow-up" },
  { label: "Receive", bg: "#A9E34B", icon: "arrow-down" },
  { label: "Swap", bg: "#74C0FC", icon: "repeat" },
];

const BrutButton = ({ label, bg, icon, index }: any) => {
  const pressed = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pressed.value * -2 },
      { translateY: pressed.value * -2 },
    ],
    shadowOffset: {
      width: 4 - pressed.value * 2,
      height: 4 - pressed.value * 2,
    },
  }));

  return (
    <Animated.View entering={FadeInDown.delay(400 + index * 80).springify().damping(12)}>
      <AnimatedTouchable
        style={[styles.actionBtn, { backgroundColor: bg }, animStyle]}
        activeOpacity={0.95}
        onPressIn={() => { pressed.value = withSpring(2, { damping: 15 }); }}
        onPressOut={() => { pressed.value = withSpring(0, { damping: 10 }); }}
      >
        <Ionicons name={icon as any} size={16} color="#000" />
        <Text style={styles.actionLabel}>{label}</Text>
      </AnimatedTouchable>
    </Animated.View>
  );
};

const TokenCard = ({ token, index }: any) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(550 + index * 100).springify().damping(14)}>
      <AnimatedTouchable
        style={[styles.tokenCard, { backgroundColor: token.bg }, animStyle]}
        activeOpacity={0.95}
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 10 }); }}
      >
        <View style={styles.tokenHeader}>
          <View style={styles.tokenIcon}>
            <FontAwesome5 name={token.icon} size={14} color="#fff" />
          </View>
          <Text style={styles.tokenName}>{token.coin}</Text>
        </View>
        <Text style={styles.tokenAmount}>{token.amount}</Text>
        <Text style={styles.tokenUsd}>{token.usd}</Text>
      </AnimatedTouchable>
    </Animated.View>
  );
};

const TxRow = ({ tx, index }: any) => {
  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.max(-60, Math.min(0, e.translationX));
    })
    .onEnd(() => {
      translateX.value = withSpring(0, { damping: 15 });
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const amountColor =
    tx.type === "receive" ? "#2B8A3E" : tx.type === "send" ? "#C92A2A" : "#000";

  return (
    <Animated.View entering={SlideInUp.delay(800 + index * 100).springify().damping(14)}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.txRow, animStyle]}>
          <View style={styles.txIcon}>
            <Ionicons name={tx.icon as any} size={16} color="#fff" />
          </View>
          <View style={styles.txInfo}>
            <Text style={styles.txLabel}>{tx.label}</Text>
            <Text style={styles.txTime}>{tx.time}</Text>
          </View>
          <Text style={[styles.txAmount, { color: amountColor }]}>{tx.amount}</Text>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

export default function WalletScreen() {
  const balanceScale = useSharedValue(0.8);

  useEffect(() => {
    balanceScale.value = withSpring(1, { damping: 12, stiffness: 80 });
  }, []);

  const balanceAnim = useAnimatedStyle(() => ({
    transform: [{ scale: balanceScale.value }],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <View style={styles.headerSection}>
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.topBar}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>BRUTVAULT</Text>
            </View>
            <View style={styles.profileBadge}>
              <Text style={styles.profileText}>AS</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
          </Animated.View>
          <Animated.View style={balanceAnim}>
            <Animated.Text entering={FadeInDown.delay(250).duration(600)} style={styles.balanceValue}>
              $48,291
            </Animated.Text>
          </Animated.View>
          <Animated.View entering={FadeInLeft.delay(350).duration(400)} style={styles.changeBadge}>
            <Ionicons name="trending-up" size={14} color="#51CF66" />
            <Text style={styles.changeText}>12.4% this week</Text>
          </Animated.View>
        </View>

        <View style={styles.bodySection}>
          <View style={styles.actionsRow}>
            {ACTIONS.map((action, i) => (
              <BrutButton key={action.label} {...action} index={i} />
            ))}
          </View>

          <View style={styles.tokenGrid}>
            {TOKENS.map((token, i) => (
              <TokenCard key={token.coin} token={token} index={i} />
            ))}
          </View>

          <Animated.View entering={FadeInDown.delay(800).duration(400)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          </Animated.View>

          <View style={styles.txList}>
            {TXS.map((tx, i) => (
              <TxRow key={i} tx={tx} index={i} />
            ))}
          </View>

          <Animated.View entering={FadeInDown.delay(1200).springify()}>
            <TouchableOpacity style={styles.viewAllBtn} activeOpacity={0.9}>
              <Text style={styles.viewAllText}>VIEW ALL TRANSACTIONS</Text>
              <Ionicons name="arrow-forward" size={16} color="#000" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF0",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerSection: {
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 4,
    borderBottomColor: "#000",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    backgroundColor: "#FFD43B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  logoText: {
    fontFamily: "monospace",
    fontSize: 16,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.5,
  },
  profileBadge: {
    width: 40,
    height: 40,
    backgroundColor: "#FF6B6B",
    borderWidth: 3,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#fff",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
  },
  profileText: {
    fontFamily: "monospace",
    fontWeight: "900",
    fontSize: 14,
    color: "#000",
  },
  balanceLabel: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 2,
    marginBottom: 4,
  },
  balanceValue: {
    fontFamily: "monospace",
    fontSize: 52,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -3,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  changeText: {
    fontFamily: "monospace",
    fontSize: 14,
    color: "#51CF66",
    fontWeight: "700",
  },
  bodySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#000",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  actionLabel: {
    fontFamily: "monospace",
    fontWeight: "900",
    fontSize: 13,
    color: "#000",
  },
  tokenGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  tokenCard: {
    width: (width - 50) / 2,
    borderWidth: 3,
    borderColor: "#000",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  tokenHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  tokenIcon: {
    width: 30,
    height: 30,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  tokenName: {
    fontFamily: "monospace",
    fontWeight: "900",
    fontSize: 15,
    color: "#000",
  },
  tokenAmount: {
    fontFamily: "monospace",
    fontWeight: "900",
    fontSize: 22,
    color: "#000",
    marginBottom: 2,
  },
  tokenUsd: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#666",
  },
  sectionHeader: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "monospace",
    fontWeight: "900",
    fontSize: 12,
    color: "#fff",
    letterSpacing: 1,
  },
  txList: {
    gap: 10,
    marginBottom: 20,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 3,
    borderColor: "#000",
    padding: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  txIcon: {
    width: 34,
    height: 34,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  txInfo: {
    flex: 1,
  },
  txLabel: {
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 13,
    color: "#000",
  },
  txTime: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#888",
    marginTop: 2,
  },
  txAmount: {
    fontFamily: "monospace",
    fontWeight: "900",
    fontSize: 13,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 3,
    borderColor: "#000",
    paddingVertical: 14,
    backgroundColor: "#FFD43B",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  viewAllText: {
    fontFamily: "monospace",
    fontWeight: "900",
    fontSize: 13,
    color: "#000",
    letterSpacing: 1,
  },
});