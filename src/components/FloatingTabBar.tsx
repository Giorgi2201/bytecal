import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/ThemeContext';

const TAB_META: Record<string, { icon: string; label: string }> = {
  History: { icon: '◷', label: 'History' },
  Home: { icon: '⌂', label: 'Home' },
  Scan: { icon: '◎', label: 'Scan' },
  Settings: { icon: '⚙', label: 'Settings' },
};

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const animations = useRef(state.routes.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    animations.forEach((value, index) => {
      Animated.spring(value, {
        damping: 16,
        mass: 0.9,
        stiffness: 210,
        toValue: state.index === index ? 1 : 0,
        useNativeDriver: true,
      }).start();
    });
  }, [animations, state.index]);

  const bottomOffset = useMemo(() => Math.max(insets.bottom + 10, 22), [insets.bottom]);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={[styles.wrapper, { bottom: bottomOffset }]}>
        <View style={[styles.island, { borderColor: theme.colors.tabBarBorder }]}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurAmount={26}
            blurType={theme.blurType}
            reducedTransparencyFallbackColor={theme.colors.tabBar}
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.tabBar }]} />

          <View style={styles.row}>
            {state.routes.map((route, index) => {
              const focused = state.index === index;
              const { options } = descriptors[route.key];
              const meta = TAB_META[route.name] ?? { icon: '•', label: route.name };
              const animatedValue = animations[index];

              const scale = animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.15],
              });
              const translateY = animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -5],
              });
              const iconOpacity = animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.68, 1],
              });

              const onPress = () => {
                const event = navigation.emit({
                  canPreventDefault: true,
                  target: route.key,
                  type: 'tabPress',
                });

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  target: route.key,
                  type: 'tabLongPress',
                });
              };

              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={focused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  onLongPress={onLongPress}
                  onPress={onPress}
                  style={styles.tabPressable}>
                  <Animated.View
                    style={[
                      styles.tabInner,
                      focused && [styles.tabInnerActive, { borderColor: theme.colors.cardBorder }],
                      { transform: [{ scale }, { translateY }] },
                    ]}>
                    <Animated.Text
                      style={[
                        styles.icon,
                        {
                          color: focused ? theme.colors.accent : theme.colors.textSecondary,
                          opacity: iconOpacity,
                        },
                      ]}>
                      {meta.icon}
                    </Animated.Text>
                    <Text
                      style={[
                        styles.label,
                        { color: focused ? theme.colors.textPrimary : theme.colors.textSecondary },
                      ]}>
                      {meta.label}
                    </Text>
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 24,
  },
  island: {
    borderRadius: 34,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#070B1A',
    shadowOffset: { height: 15, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tabInner: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 70,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabInnerActive: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  tabPressable: {
    borderRadius: 22,
    flex: 1,
  },
  wrapper: {
    left: 18,
    position: 'absolute',
    right: 18,
  },
});
