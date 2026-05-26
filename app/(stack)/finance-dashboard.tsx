import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Rect,
  Line,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const { width } = Dimensions.get('window');

const BG = '#f5f5f7';
const CARD = '#ffffff';
const T1 = '#1c1c1e';
const T2 = '#8e8e93';
const BORDER = '#f0f0f5';
const GREEN = '#22c55e';

const DONUT_R = 68;
const DONUT_C = 2 * Math.PI * DONUT_R;
const CATEGORIES = [
  { label: 'Housing', pct: 31, color: '#6366f1', amount: 1240 },
  { label: 'Food', pct: 22, color: '#22c55e', amount: 880 },
  { label: 'Transport', pct: 16, color: '#f97316', amount: 640 },
  { label: 'Shopping', pct: 14, color: '#ec4899', amount: 560 },
  { label: 'Health', pct: 10, color: '#3b82f6', amount: 400 },
  { label: 'Other', pct: 7, color: '#fbbf24', amount: 280 },
];

const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const INCOME_DATA = [6200, 6800, 5900, 7200, 6500, 7800];
const EXPENSE_DATA = [4100, 4800, 3900, 5200, 4600, 4000];
const BAR_MAX = Math.max(...INCOME_DATA);
const BAR_CHART_W = width - 80;
const BAR_H = 90;
const BAR_PAIR_W = (BAR_CHART_W - 20) / MONTHS.length;

const TRANSACTIONS = [
  {
    id: '1',
    label: 'Netflix Subscription',
    category: 'Entertainment',
    amount: -15.99,
    icon: '🎬',
    color: '#6366f1',
    date: 'Today',
  },
  {
    id: '2',
    label: 'Salary Transfer',
    category: 'Income',
    amount: 7800,
    icon: '💼',
    color: '#22c55e',
    date: 'Today',
  },
  {
    id: '3',
    label: 'Grocery Store',
    category: 'Food',
    amount: -87.4,
    icon: '🛒',
    color: '#f97316',
    date: 'Yesterday',
  },
  {
    id: '4',
    label: 'Freelance Payment',
    category: 'Income',
    amount: 850,
    icon: '💻',
    color: '#22c55e',
    date: 'Yesterday',
  },
  {
    id: '5',
    label: 'Electric Bill',
    category: 'Utilities',
    amount: -145,
    icon: '⚡',
    color: '#ec4899',
    date: 'Mon',
  },
];

export default function FinanceDashboard() {
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState(0);

  const donutProgress = useSharedValue(0);

  const ib0 = useSharedValue(0);
  const ib1 = useSharedValue(0);
  const ib2 = useSharedValue(0);
  const ib3 = useSharedValue(0);
  const ib4 = useSharedValue(0);
  const ib5 = useSharedValue(0);
  const eb0 = useSharedValue(0);
  const eb1 = useSharedValue(0);
  const eb2 = useSharedValue(0);
  const eb3 = useSharedValue(0);
  const eb4 = useSharedValue(0);
  const eb5 = useSharedValue(0);

  const inBars = [ib0, ib1, ib2, ib3, ib4, ib5];
  const exBars = [eb0, eb1, eb2, eb3, eb4, eb5];

  const ibp0 = useAnimatedProps(() => ({
    height: ib0.value,
    y: BAR_H - ib0.value,
  }));
  const ibp1 = useAnimatedProps(() => ({
    height: ib1.value,
    y: BAR_H - ib1.value,
  }));
  const ibp2 = useAnimatedProps(() => ({
    height: ib2.value,
    y: BAR_H - ib2.value,
  }));
  const ibp3 = useAnimatedProps(() => ({
    height: ib3.value,
    y: BAR_H - ib3.value,
  }));
  const ibp4 = useAnimatedProps(() => ({
    height: ib4.value,
    y: BAR_H - ib4.value,
  }));
  const ibp5 = useAnimatedProps(() => ({
    height: ib5.value,
    y: BAR_H - ib5.value,
  }));

  const ebp0 = useAnimatedProps(() => ({
    height: eb0.value,
    y: BAR_H - eb0.value,
  }));
  const ebp1 = useAnimatedProps(() => ({
    height: eb1.value,
    y: BAR_H - eb1.value,
  }));
  const ebp2 = useAnimatedProps(() => ({
    height: eb2.value,
    y: BAR_H - eb2.value,
  }));
  const ebp3 = useAnimatedProps(() => ({
    height: eb3.value,
    y: BAR_H - eb3.value,
  }));
  const ebp4 = useAnimatedProps(() => ({
    height: eb4.value,
    y: BAR_H - eb4.value,
  }));
  const ebp5 = useAnimatedProps(() => ({
    height: eb5.value,
    y: BAR_H - eb5.value,
  }));

  const inBarProps = [ibp0, ibp1, ibp2, ibp3, ibp4, ibp5];
  const exBarProps = [ebp0, ebp1, ebp2, ebp3, ebp4, ebp5];

  useEffect(() => {
    donutProgress.value = withTiming(1, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
    let cur = 0;
    const target = 24680;
    const t = setInterval(() => {
      cur += target / 60;
      if (cur >= target) {
        setBalance(target);
        clearInterval(t);
      } else setBalance(Math.round(cur));
    }, 20);
    MONTHS.forEach((_, i) => {
      const delay = i * 100;
      inBars[i].value = withDelay(
        delay,
        withTiming((INCOME_DATA[i] / BAR_MAX) * BAR_H * 0.9, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        }),
      );
      exBars[i].value = withDelay(
        delay,
        withTiming((EXPENSE_DATA[i] / BAR_MAX) * BAR_H * 0.9, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        }),
      );
    });
    return () => clearInterval(t);
  }, []);

  let offset = 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.hdr}>
        <View>
          <Text style={styles.hdrSub}>My Portfolio</Text>
          <Text style={styles.hdrTitle}>Finance</Text>
        </View>
        <Pressable style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={20} color={T1} />
          <View style={styles.notifDot} />
        </Pressable>
      </View>
      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.balanceLabel}>Net Worth</Text>
          <Text style={styles.balanceNum}>
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.balanceChange}>
            <Ionicons name="trending-up" size={14} color={GREEN} />
            <Text style={[styles.balanceChangeTxt, { color: GREEN }]}>
              +$2,340 (+10.5% this month)
            </Text>
          </View>
        </View>
        <View style={styles.balanceActions}>
          {['Send', 'Receive', 'Pay'].map(a => (
            <Pressable key={a} style={styles.balanceAction}>
              <Text style={styles.balanceActionTxt}>{a}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.spendingCard}>
          <Text style={styles.cardTitle}>Spending Breakdown</Text>
          <View style={styles.donutRow}>
            <View style={styles.donutWrap}>
              <Svg width={160} height={160} viewBox="0 0 160 160">
                <Circle
                  cx={80}
                  cy={80}
                  r={DONUT_R}
                  stroke={BG}
                  strokeWidth={16}
                  fill="none"
                />
                {CATEGORIES.map((cat, i) => {
                  const seg = (cat.pct / 100) * DONUT_C;
                  const thisOffset =
                    -(0.25 * DONUT_C) - (offset * DONUT_C) / 100;
                  offset += cat.pct;
                  return (
                    <Circle
                      key={i}
                      cx={80}
                      cy={80}
                      r={DONUT_R}
                      fill="none"
                      stroke={cat.color}
                      strokeWidth={16}
                      strokeDasharray={[seg, DONUT_C - seg]}
                      strokeDashoffset={thisOffset}
                    />
                  );
                })}
                <Circle cx={80} cy={80} r={52} fill={CARD} />
              </Svg>
              <View style={styles.donutCenter}>
                <Text style={styles.donutTotal}>$4,000</Text>
                <Text style={styles.donutLabel}>this month</Text>
              </View>
            </View>
            <View style={styles.catLegend}>
              {CATEGORIES.map(cat => (
                <View key={cat.label} style={styles.catItem}>
                  <View
                    style={[styles.catDot, { backgroundColor: cat.color }]}
                  />
                  <Text style={styles.catName}>{cat.label}</Text>
                  <Text style={[styles.catAmt, { color: cat.color }]}>
                    ${cat.amount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.barChartCard}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.cardTitle}>Income vs Expenses</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#6366f1' }]}
                />
                <Text style={styles.legendTxt}>Income</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#f87171' }]}
                />
                <Text style={styles.legendTxt}>Expense</Text>
              </View>
            </View>
          </View>
          <Svg
            width={BAR_CHART_W}
            height={BAR_H + 20}
            viewBox={`0 0 ${BAR_CHART_W} ${BAR_H + 20}`}
          >
            <Line
              x1={0}
              y1={BAR_H}
              x2={BAR_CHART_W}
              y2={BAR_H}
              stroke={BORDER}
              strokeWidth={1}
            />
            {MONTHS.map((_, i) => {
              const bw = BAR_PAIR_W * 0.35;
              const groupX = 10 + i * BAR_PAIR_W;
              return (
                <React.Fragment key={i}>
                  <AnimatedRect
                    x={groupX}
                    width={bw}
                    rx={3}
                    fill="#6366f1"
                    opacity={0.85}
                    animatedProps={inBarProps[i]}
                  />
                  <AnimatedRect
                    x={groupX + bw + 3}
                    width={bw}
                    rx={3}
                    fill="#f87171"
                    opacity={0.85}
                    animatedProps={exBarProps[i]}
                  />
                </React.Fragment>
              );
            })}
          </Svg>
          <View style={styles.monthLabels}>
            {MONTHS.map(m => (
              <Text key={m} style={styles.monthLabel}>
                {m}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.txCard}>
          <Text style={styles.cardTitle}>Recent Transactions</Text>
          {TRANSACTIONS.map(tx => (
            <View key={tx.id} style={styles.txRow}>
              <View
                style={[styles.txIcon, { backgroundColor: tx.color + '18' }]}
              >
                <Text style={styles.txEmoji}>{tx.icon}</Text>
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txLabel}>{tx.label}</Text>
                <Text style={styles.txMeta}>
                  {tx.category} · {tx.date}
                </Text>
              </View>
              <Text
                style={[styles.txAmount, { color: tx.amount > 0 ? GREEN : T1 }]}
              >
                {tx.amount > 0 ? '+' : ''}
                {tx.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 40 },
  hdr: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  hdrSub: { fontSize: 13, color: T2, marginBottom: 2 },
  hdrTitle: { fontSize: 26, fontWeight: '800', color: T1 },
  notifBtn: {
    width: 42,
    height: 42,
    backgroundColor: CARD,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: '#f87171',
    borderWidth: 1.5,
    borderColor: CARD,
  },
  balanceCard: {
    marginHorizontal: 20,
    backgroundColor: '#6366f1',
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
    gap: 16,
  },
  balanceLabel: { fontSize: 13, color: '#ffffffaa', marginBottom: 4 },
  balanceNum: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  balanceChangeTxt: { fontSize: 13, fontWeight: '600' },
  balanceActions: { flexDirection: 'row', gap: 10 },
  balanceAction: {
    flex: 1,
    backgroundColor: '#ffffff22',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  balanceActionTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },

  spendingCard: {
    backgroundColor: CARD,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: T1 },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  donutWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutTotal: { fontSize: 16, fontWeight: '800', color: T1 },
  donutLabel: { fontSize: 10, color: T2, marginTop: 2 },
  catLegend: { flex: 1, gap: 8 },
  catItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  catDot: { width: 8, height: 8, borderRadius: 99 },
  catName: { flex: 1, fontSize: 12, color: T1 },
  catAmt: { fontSize: 12, fontWeight: '700' },

  barChartCard: {
    backgroundColor: CARD,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 12,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  legendRow: { flexDirection: 'row', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 99 },
  legendTxt: { fontSize: 11, color: T2 },
  monthLabels: { flexDirection: 'row', justifyContent: 'space-around' },
  monthLabel: { fontSize: 10, color: T2 },

  txCard: {
    backgroundColor: CARD,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 4,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txEmoji: { fontSize: 18 },
  txInfo: { flex: 1 },
  txLabel: { fontSize: 14, fontWeight: '600', color: T1 },
  txMeta: { fontSize: 11, color: T2, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
