import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const CREATE_OPTIONS = [
  { id: 'post', icon: 'image', label: 'Post', color: '#007AFF' },
  { id: 'story', icon: 'add-circle', label: 'Story', color: '#FF3B5C' },
  { id: 'reel', icon: 'videocam', label: 'Reel', color: '#FF9500' },
  { id: 'live', icon: 'radio', label: 'Live', color: '#AF52DE' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const RADIUS = 120;
const START_ANGLE = 0;
const END_ANGLE = 180;

function RadialMenuItem({ 
  option, 
  index, 
  total, 
  menuProgress, 
  onPress 
}: { 
  option: typeof CREATE_OPTIONS[0]; 
  index: number; 
  total: number; 
  menuProgress: Animated.SharedValue<number>;
  onPress: () => void;
}) {
  const angle = START_ANGLE + (END_ANGLE - START_ANGLE) * (index / (total - 1));
  const angleInRadians = (angle * Math.PI) / 180;
  
  const menuItemStyle = useAnimatedStyle(() => {
    const progress = menuProgress.value;
    const x = Math.cos(angleInRadians) * RADIUS * progress;
    const y = -Math.sin(angleInRadians) * RADIUS * progress;
    
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: progress },
      ],
      opacity: progress,
    };
  });

  return (
    <AnimatedPressable
      style={[styles.menuOption, menuItemStyle]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: option.color }]}>
        <Ionicons name={option.icon as any} size={28} color="#fff" />
      </View>
      <Text style={styles.menuLabel}>{option.label}</Text>
    </AnimatedPressable>
  );
}

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuProgress = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  const toggleMenu = () => {
    if (showMenu) {
      menuProgress.value = withSpring(0, { damping: 20, stiffness: 300 });
      overlayOpacity.value = withTiming(0, { duration: 200 });
      rotation.value = withSpring(0, { damping: 15 });
      setTimeout(() => setShowMenu(false), 300);
    } else {
      setShowMenu(true);
      menuProgress.value = withSpring(1, { damping: 18, stiffness: 200 });
      overlayOpacity.value = withTiming(1, { duration: 200 });
      rotation.value = withSpring(1, { damping: 15 });
    }
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 45}deg` }],
  }));

  return (
    <>
      {showMenu && (
        <AnimatedPressable
          style={[styles.overlay, overlayStyle]}
          onPress={toggleMenu}
        />
      )}

      {showMenu && (
        <View style={styles.menuContainer}>
          {CREATE_OPTIONS.map((option, index) => (
            <RadialMenuItem
              key={option.id}
              option={option}
              index={index}
              total={CREATE_OPTIONS.length}
              menuProgress={menuProgress}
              onPress={toggleMenu}
            />
          ))}
        </View>
      )}

      <View style={styles.tabBarContainer}>
        <BlurView intensity={40} tint="dark" style={styles.tabBar}>
          <View style={styles.tabBarInner}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              if (route.name === 'create') {
                return (
                  <AnimatedPressable
                    key={route.key}
                    onPress={toggleMenu}
                    style={[styles.centerButton, rotationStyle]}
                  >
                    <Ionicons name="add" size={32} color="#1C1C1E" />
                  </AnimatedPressable>
                );
              }

              const iconName = options.tabBarIcon as any;

              return (
                <Pressable
                  key={route.key}
                  style={styles.tab}
                  onPress={onPress}
                >
                  <Ionicons
                    name={isFocused ? iconName : `${iconName}-outline`}
                    size={24}
                    color={isFocused ? '#fff' : '#8E8E93'}
                  />
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 24,
    left: 20,
    right: 20,
  },
  tabBar: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  menuContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 60 : 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  menuOption: {
    position: 'absolute',
    alignItems: 'center',
    gap: 8,
  },
  menuIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});