import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IonIcons from '@react-native-vector-icons/ionicons';
import { useAppTheme } from '../theme/ThemeContext';

type AnimType = 'bounce' | 'pulse' | 'slideUp' | 'rotate';

type TabConfig = {
  iconActive: string;
  iconInactive: string;
  animation: AnimType;
  label: string;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  History: {
    animation: 'slideUp',
    iconActive: 'time',
    iconInactive: 'time-outline',
    label: 'History',
  },
  Home: {
    animation: 'bounce',
    iconActive: 'home',
    iconInactive: 'home-outline',
    label: 'Home',
  },
  Scan: {
    animation: 'pulse',
    iconActive: 'scan',
    iconInactive: 'scan-outline',
    label: 'Scan',
  },
  Settings: {
    animation: 'rotate',
    iconActive: 'settings',
    iconInactive: 'settings-outline',
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
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotateDeg = useSharedValue(0);

  useEffect(() => {
    if (!focused) {
      return;
    }

    switch (config.animation) {
      case 'bounce':
        scale.value = withSequence(
          withSpring(1.28, { damping: 4, stiffness: 320 }),
          withSpring(1, { damping: 12, stiffness: 220 }),
        );
        break;

      case 'pulse':
        scale.value = withSequence(
          withTiming(1.22, { duration: 90, easing: Easing.out(Easing.quad) }),
          withTiming(0.92, { duration: 80, easing: Easing.in(Easing.quad) }),
          withSpring(1, { damping: 14, stiffness: 240 }),
        );
        break;

      case 'slideUp':
        translateY.value = withSequence(
          withTiming(7, { duration: 0 }),
          withSpring(0, { damping: 11, stiffness: 200 }),
        );
        break;

      case 'rotate':
        rotateDeg.value = withSequence(
          withTiming(-18, { duration: 80, easing: Easing.out(Easing.quad) }),
          withSpring(0, { damping: 8, stiffness: 180 }),
        );
        break;
    }
  }, [config.animation, focused, rotateDeg, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotateDeg.value}deg` },
    ],
  }));

  const iconName = focused ? config.iconActive : config.iconInactive;
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
        <IonIcons name={iconName} size={22} color={iconColor} />
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
                animation: 'bounce' as AnimType,
                iconActive: 'ellipse',
                iconInactive: 'ellipse-outline',
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
