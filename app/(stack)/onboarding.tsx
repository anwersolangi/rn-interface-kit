import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {runOnJS} from 'react-native-worklets';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  blurhash: string;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Discover Your Path',
    subtitle: 'Embark on a journey of endless possibilities',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    blurhash: 'LNEfkw~q4n%MD$j[WBj[~qRjM{of',
  },
  {
    id: '2',
    title: 'Connect Seamlessly',
    subtitle: 'Experience the future of digital interaction',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80',
    blurhash: 'L68N0Z~q00IU00WB-;of00xu9Fxu',
  },
  {
    id: '3',
    title: 'Begin Your Story',
    subtitle: 'Join a community built for creators like you',
    image: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1200&q=80',
    blurhash: 'L46*$lt700og~qt700Rj00Rj%Mof',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);

  const updateIndex = (index: number) => {
    setCurrentIndex(index);
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX + contextX.value;
    })
    .onEnd((event) => {
      const shouldMoveToNext = event.translationX < -width / 3 && currentIndex < slides.length - 1;
      const shouldMoveToPrev = event.translationX > width / 3 && currentIndex > 0;

      if (shouldMoveToNext) {
        translateX.value = withSpring(-(currentIndex + 1) * width, {
          damping: 15,
          stiffness: 80,
        });
        runOnJS(updateIndex)(currentIndex + 1);
      } else if (shouldMoveToPrev) {
        translateX.value = withSpring(-(currentIndex - 1) * width, {
          damping: 15,
          stiffness: 80,
        });
        runOnJS(updateIndex)(currentIndex - 1);
      } else {
        translateX.value = withSpring(-currentIndex * width, {
          damping: 15,
          stiffness: 80,
        });
      }
    });

  const handleGetStarted = () => {
    console.log('Get Started pressed');
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <GestureDetector gesture={pan}>
        <Animated.View style={styles.scrollContainer}>
          {slides.map((slide, index) => (
            <SlideItem
              key={slide.id}
              slide={slide}
              index={index}
              translateX={translateX}
            />
          ))}
        </Animated.View>
      </GestureDetector>

      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <Dot key={index} index={index} translateX={translateX} />
        ))}
      </View>

      {currentIndex === slides.length - 1 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleGetStarted}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

interface SlideItemProps {
  slide: Slide;
  index: number;
  translateX: ReturnType<typeof useSharedValue<number>>;
}

const SlideItem = ({ slide, index, translateX }: SlideItemProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const translateXValue = translateX.value + index * width;

    const scale = interpolate(
      translateXValue,
      [-width, 0, width],
      [0.7, 1, 0.7],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      translateXValue,
      [-width, 0, width],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    const rotateZ = interpolate(
      translateXValue,
      [-width, 0, width],
      [15, 0, -15],
      Extrapolation.CLAMP
    );

    const borderRadius = interpolate(
      translateXValue,
      [-width, 0, width],
      [60, 0, 60],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { scale },
        { rotateZ: `${rotateZ}deg` },
      ],
      opacity,
      borderRadius,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const translateXValue = translateX.value + index * width;

    const translateY = interpolate(
      translateXValue,
      [-width, 0, width],
      [100, 0, -100],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      translateXValue,
      [-width, 0, width],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.slide, { left: index * width }, animatedStyle]}>
      <Image
        source={{ uri: slide.image }}
        placeholder={slide.blurhash}
        contentFit="cover"
        transition={1000}
        style={styles.image}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
        style={styles.gradient}
      />
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>
    </Animated.View>
  );
};

interface DotProps {
  index: number;
  translateX: ReturnType<typeof useSharedValue<number>>;
}

const Dot = ({ index, translateX }: DotProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const translateXValue = translateX.value + index * width;

    const dotWidth = interpolate(
      translateXValue,
      [-width, 0, width],
      [8, 32, 8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      translateXValue,
      [-width, 0, width],
      [0.4, 1, 0.4],
      Extrapolation.CLAMP
    );

    return {
      width: dotWidth,
      opacity,
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  slide: {
    width,
    height,
    position: 'absolute',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.65,
  },
  textContainer: {
    position: 'absolute',
    bottom: 180,
    width: '100%',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 26,
    fontWeight: '400',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 140,
    width: '100%',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginHorizontal: 3,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    paddingHorizontal: 32,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});