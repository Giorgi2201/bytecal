import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useAppTheme } from '../theme/ThemeContext';

type GlassCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function GlassCard({ children, style }: GlassCardProps) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, { borderColor: theme.colors.cardBorder, shadowColor: theme.colors.shadow }, style]}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurAmount={24}
        blurType={theme.blurType}
        reducedTransparencyFallbackColor={theme.colors.card}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.card }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  content: {
    padding: 20,
  },
});
