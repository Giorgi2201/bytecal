import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clock3,
  Home,
  ScanLine,
  Settings,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/ThemeContext';

type TabConfig = {
  icon: React.ComponentType<{
    color: string;
    size?: number;
    strokeWidth?: number;
  }>;
  label: string;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  History: {
    icon: Clock3,
    label: 'History',
  },
  Home: {
    icon: Home,
    label: 'Home',
  },
  Scan: {
    icon: ScanLine,
    label: 'Scan',
  },
  Settings: {
    icon: Settings,
    label: 'Settings',
  },
};

type TabButtonProps = {
  config: TabConfig;
  focused: boolean;
  accentColor: string;
  inactiveColor: string;
  textPrimary: string;
  cardBorder: string;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
};

function TabButton({
  config,
  focused,
  accentColor,
  inactiveColor,
  textPrimary,
  cardBorder,
  onPress,
  onLongPress,
  accessibilityLabel,
}: TabButtonProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = focused
      ? withSpring(1, { damping: 15, stiffness: 240 })
      : withTiming(0, { duration: 180 });
  }, [focused, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.8, 1]),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 1.08]) },
      { translateY: interpolate(progress.value, [0, 1], [0, -3]) },
    ],
  }));

  const Icon = config.icon;
  const iconColor = focused ? accentColor : inactiveColor;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      onLongPress={onLongPress}
      onPress={onPress}
      style={styles.tabPressable}>
      <Animated.View
        style={[
          styles.tabInner,
          focused && styles.tabInnerActive,
          focused && { borderColor: cardBorder },
          animatedStyle,
        ]}>
        <Icon color={iconColor} size={22} strokeWidth={2} />
        <Text
          style={[
            styles.label,
            { color: focused ? textPrimary : inactiveColor },
          ]}>
          {config.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom + 8, 20);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={[styles.wrapper, { bottom }]}>
        <View style={[styles.island, { borderColor: theme.colors.tabBarBorder }]}>
          <BlurView
            blurAmount={28}
            blurType={theme.blurType}
            reducedTransparencyFallbackColor={theme.colors.tabBar}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: theme.colors.tabBar },
            ]}
          />

          <View style={styles.row}>
            {state.routes.map((route, index) => {
              const focused = state.index === index;
              const { options } = descriptors[route.key];
              const config = TAB_CONFIG[route.name] ?? {
                icon: Home,
                label: route.name,
              };

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
                navigation.emit({ target: route.key, type: 'tabLongPress' });
              };

              return (
                <TabButton
                  key={route.key}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  accentColor={theme.colors.accent}
                  cardBorder={theme.colors.cardBorder}
                  config={config}
                  focused={focused}
                  inactiveColor={theme.colors.textSecondary}
                  onLongPress={onLongPress}
                  onPress={onPress}
                  textPrimary={theme.colors.textPrimary}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  island: {
    borderRadius: 34,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#060912',
    shadowOffset: { height: 18, width: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.15,
    marginTop: 3,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tabInner: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 22,
    borderWidth: 1,
    minWidth: 68,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tabInnerActive: {
    backgroundColor: 'rgba(255,255,255,0.13)',
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
