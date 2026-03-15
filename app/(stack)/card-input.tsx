import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  StatusBar,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;
const CARD_HEIGHT = 200;

const springConfig = {
  damping: 18,
  stiffness: 140,
};

type Card = {
  id: string;
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
  gradient: string[];
};

const SAVED_CARDS: Card[] = [
  {
    id: '1',
    number: '4532 1234 5678 9010',
    holder: 'JOHN ANDERSON',
    expiry: '12/28',
    cvv: '123',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: '2',
    number: '5425 2334 3010 9903',
    holder: 'SARAH WILLIAMS',
    expiry: '09/27',
    cvv: '456',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: '3',
    number: '3782 822463 10005',
    holder: 'MIKE JOHNSON',
    expiry: '06/26',
    cvv: '789',
    gradient: ['#4facfe', '#00f2fe'],
  },
];

export default function CardInputScreen() {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiveCardFlipped, setIsLiveCardFlipped] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < SAVED_CARDS.length - 1)
      setCurrentIndex(currentIndex + 1);
  };

  const isNewCard = cardNumber || cardHolder || expiry || cvv;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>Payment Method</Text>
              <Text style={styles.subtitle}>
                {isNewCard
                  ? 'Adding new card'
                  : `Card ${currentIndex + 1} of ${SAVED_CARDS.length}`}
              </Text>
            </View>

            <View style={styles.cardsContainer}>
              {isNewCard ? (
                <LiveCard
                  number={cardNumber || '•••• •••• •••• ••••'}
                  holder={cardHolder || 'CARD HOLDER NAME'}
                  expiry={expiry || 'MM/YY'}
                  cvv={cvv || '•••'}
                  isFlipped={isLiveCardFlipped}
                />
              ) : (
                <CardStack
                  cards={SAVED_CARDS}
                  currentIndex={currentIndex}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                />
              )}
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={styles.inputLabel}>
                  <Ionicons
                    name="card-outline"
                    size={20}
                    color="rgba(255,255,255,0.6)"
                  />
                  <Text style={styles.label}>Card Number</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={cardNumber}
                  onChangeText={text => setCardNumber(formatCardNumber(text))}
                  keyboardType="number-pad"
                  maxLength={19}
                  onFocus={() => setIsLiveCardFlipped(false)}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputLabel}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="rgba(255,255,255,0.6)"
                  />
                  <Text style={styles.label}>Cardholder Name</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="John Anderson"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  autoCapitalize="characters"
                  onFocus={() => setIsLiveCardFlipped(false)}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.inputHalf]}>
                  <View style={styles.inputLabel}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="rgba(255,255,255,0.6)"
                    />
                    <Text style={styles.label}>Expiry</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={expiry}
                    onChangeText={text => setExpiry(formatExpiry(text))}
                    keyboardType="number-pad"
                    maxLength={5}
                    onFocus={() => setIsLiveCardFlipped(false)}
                  />
                </View>

                <View style={[styles.inputContainer, styles.inputHalf]}>
                  <View style={styles.inputLabel}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="rgba(255,255,255,0.6)"
                    />
                    <Text style={styles.label}>CVV</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={cvv}
                    onChangeText={text => setCvv(text.slice(0, 4))}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                    onFocus={() => setIsLiveCardFlipped(true)}
                    onBlur={() => setIsLiveCardFlipped(false)}
                  />
                </View>
              </View>

              <Pressable style={styles.saveButton}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={[styles.saveButtonGradient, { borderRadius: 16 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Card</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

function LiveCard({
  number,
  holder,
  expiry,
  cvv,
  isFlipped,
}: {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
  isFlipped: boolean;
}) {
  const flipRotation = useSharedValue(0);

  React.useEffect(() => {
    flipRotation.value = withSpring(isFlipped ? 180 : 0, {
      damping: 18,
      stiffness: 140,
    });
  }, [isFlipped]);

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipRotation.value}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipRotation.value - 180}deg` }],
    backfaceVisibility: 'hidden',
  }));

  return (
    <View style={styles.cardWrapper}>
      <Animated.View style={[styles.cardFace, frontAnimatedStyle]}>
        <LinearGradient
          colors={['#11998e', '#38ef7d']}
          style={[styles.liveCard, { borderRadius: 24 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <BlurView intensity={20} tint="light" style={styles.cardBlur}>
            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={48}
                  color="rgba(255,255,255,0.9)"
                />
                <Ionicons name="wifi" size={32} color="rgba(255,255,255,0.7)" />
              </View>

              <Text style={styles.cardNumberLive}>{number}</Text>

              <View style={styles.cardBottom}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabelSmall}>CARDHOLDER</Text>
                  <Text style={styles.cardValue} numberOfLines={1}>
                    {holder}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabelSmall}>EXPIRES</Text>
                  <Text style={styles.cardValue}>{expiry}</Text>
                </View>
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>

      <Animated.View
        style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}
      >
        <LinearGradient
          colors={['#11998e', '#38ef7d']}
          style={[styles.liveCard, { borderRadius: 24 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardBackContent}>
            <View style={styles.magneticStrip} />

            <View style={styles.cvvContainer}>
              <Text style={styles.cvvLabel}>Security Code</Text>
              <View style={styles.cvvBox}>
                <Text style={styles.cvvText}>{cvv}</Text>
              </View>
            </View>

            <View style={styles.cardBackInfo}>
              <View style={styles.backInfoRow}>
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.backInfoText}>Valid until {expiry}</Text>
              </View>
              <View style={styles.backInfoRow}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.backInfoText}>Keep CVV secure</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function CardStack({
  cards,
  currentIndex,
  onPrevious,
  onNext,
}: {
  cards: Card[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const translateX = useSharedValue(0);
  const animatedIndex = useSharedValue(currentIndex);
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>(
    {},
  );

  React.useEffect(() => {
    animatedIndex.value = withSpring(currentIndex, {
      damping: 20,
      stiffness: 150,
      mass: 0.8,
    });
  }, [currentIndex]);

  const handleFlip = (cardId: string) => {
    setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      translateX.value = event.translationX;
    })
    .onEnd(event => {
      if (event.translationX > 100 && currentIndex > 0) {
        onPrevious();
      } else if (event.translationX < -100 && currentIndex < cards.length - 1) {
        onNext();
      }
      translateX.value = withSpring(0, springConfig);
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    handleFlip(cards[currentIndex].id);
  });

  const composedGesture = Gesture.Race(tapGesture, panGesture);

  return (
    <View style={styles.stackContainer}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={styles.gestureArea}>
          {cards.map((card, index) => (
            <StackedCard
              key={card.id}
              card={card}
              index={index}
              animatedIndex={animatedIndex}
              totalCards={cards.length}
              translateX={translateX}
              isActive={index === currentIndex}
              isFlipped={flippedCards[card.id] || false}
            />
          ))}
        </Animated.View>
      </GestureDetector>

      {currentIndex > 0 && (
        <Pressable
          style={[styles.navButton, styles.navLeft]}
          onPress={onPrevious}
        >
          <BlurView intensity={40} tint="dark" style={styles.navBlur}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </BlurView>
        </Pressable>
      )}

      {currentIndex < cards.length - 1 && (
        <Pressable style={[styles.navButton, styles.navRight]} onPress={onNext}>
          <BlurView intensity={40} tint="dark" style={styles.navBlur}>
            <Ionicons name="chevron-forward" size={28} color="#fff" />
          </BlurView>
        </Pressable>
      )}
    </View>
  );
}

function StackedCard({
  card,
  index,
  animatedIndex,
  totalCards,
  translateX,
  isActive,
  isFlipped,
}: any) {
  const flipRotation = useSharedValue(0);

  React.useEffect(() => {
    flipRotation.value = withSpring(isFlipped ? 180 : 0, {
      damping: 18,
      stiffness: 140,
    });
  }, [isFlipped]);

  const animatedStyle = useAnimatedStyle(() => {
    const diff = index - animatedIndex.value;

    const scale = interpolate(
      diff,
      [-1, 0, 1, 2, 3],
      [0.88, 1, 0.94, 0.91, 0.88],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      Math.abs(diff),
      [0, 1, 2, 3],
      [1, 0.8, 0.6, 0],
      Extrapolation.CLAMP,
    );

    const translateXValue = isActive ? translateX.value : 0;

    const translateYValue = interpolate(
      diff,
      [-2, -1, 0, 1, 2, 3],
      [-CARD_HEIGHT * 1.2, -CARD_HEIGHT * 0.7, 0, 8, 16, 24],
      Extrapolation.CLAMP,
    );

    const rotateZ = interpolate(
      translateXValue,
      [-width / 2, 0, width / 2],
      [-8, 0, 8],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: translateXValue },
        { translateY: translateYValue },
        { scale },
        { perspective: 1000 },
        { rotateZ: `${rotateZ}deg` },
      ],
      opacity,
      zIndex:
        index === Math.round(animatedIndex.value) ? 1000 : totalCards - index,
    };
  });

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipRotation.value}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipRotation.value - 180}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const CardContent = (
    <>
      <Animated.View
        style={[styles.cardFace, frontAnimatedStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={card.gradient}
          style={[styles.card, { borderRadius: 24 }]}
        >
          <BlurView intensity={10} tint="light" style={styles.cardBlur}>
            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={48}
                  color="rgba(255,255,255,0.9)"
                />
                <Ionicons name="wifi" size={32} color="rgba(255,255,255,0.7)" />
              </View>

              <Text style={styles.cardNumberStack}>{card.number}</Text>

              <View style={styles.cardBottom}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabelSmall}>CARDHOLDER</Text>
                  <Text style={styles.cardValue}>{card.holder}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabelSmall}>EXPIRES</Text>
                  <Text style={styles.cardValue}>{card.expiry}</Text>
                </View>
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>

      <Animated.View
        style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={card.gradient}
          style={[styles.card, { borderRadius: 24 }]}
        >
          <View style={styles.cardBackContent}>
            <View style={styles.magneticStrip} />

            <View style={styles.cvvContainer}>
              <Text style={styles.cvvLabel}>Security Code</Text>
              <View style={styles.cvvBox}>
                <Text style={styles.cvvText}>{card.cvv}</Text>
              </View>
            </View>

            <View style={styles.cardBackInfo}>
              <View style={styles.backInfoRow}>
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.backInfoText}>
                  Valid until {card.expiry}
                </Text>
              </View>
              <View style={styles.backInfoRow}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.backInfoText}>Keep CVV secure</Text>
              </View>
            </View>

            <Text style={styles.tapToFlip}>Tap to flip back</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </>
  );

  return (
    <Animated.View style={[styles.stackCard, animatedStyle]}>
      <View style={styles.cardPressable}>{CardContent}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  cardsContainer: { height: CARD_HEIGHT + 100, marginBottom: 20 },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
      },
      android: { elevation: 16 },
    }),
  },
  stackContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT + 80,
    marginHorizontal: 24,
    position: 'relative',
  },
  gestureArea: { flex: 1 },
  stackCard: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: { elevation: 12 },
    }),
  },
  liveCard: { flex: 1, overflow: 'hidden' },
  card: { flex: 1, overflow: 'hidden' },
  cardPressable: { flex: 1 },
  cardFace: { position: 'absolute', width: '100%', height: '100%' },
  cardBack: { backfaceVisibility: 'hidden' },
  cardBlur: { flex: 1, padding: 24, backgroundColor: 'rgba(255,255,255,0.05)' },
  cardBackContent: { flex: 1, padding: 24, justifyContent: 'space-between' },
  magneticStrip: {
    width: '120%',
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.6)',
    marginLeft: -24,
    marginTop: 10,
  },
  cvvContainer: { marginTop: 30 },
  cvvLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cvvBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cvvText: { fontSize: 24, fontWeight: '700', color: '#fff', letterSpacing: 4 },
  cardBackInfo: { gap: 12, marginTop: 20 },
  backInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backInfoText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  tapToFlip: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  cardContent: { flex: 1, justifyContent: 'space-between' },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumberLive: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 3,
    fontVariant: ['tabular-nums'],
  },
  cardNumberStack: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardInfo: { flex: 1 },
  cardLabelSmall: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardValue: { fontSize: 15, fontWeight: '700', color: '#fff' },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    transform: [{ translateY: -24 }],
    zIndex: 1000,
  },
  navLeft: { left: -12 },
  navRight: { right: -12 },
  navBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  form: { paddingHorizontal: 24, gap: 20 },
  inputContainer: { gap: 12 },
  inputLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  row: { flexDirection: 'row', gap: 16 },
  inputHalf: { flex: 1 },
  saveButton: {
    marginTop: 12,
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  saveButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
