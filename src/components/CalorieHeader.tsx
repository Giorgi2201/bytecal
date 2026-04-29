import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';

type CalorieHeaderProps = {
  dailyTotal: number;
};

export function CalorieHeader({ dailyTotal }: CalorieHeaderProps) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.textPrimary, shadowColor: theme.colors.shadow }]}>
      <View>
        <Text style={[styles.eyebrow, { color: theme.isDark ? '#6B7A99' : '#98A2B3' }]}>Today</Text>
        <Text style={[styles.title, { color: theme.colors.background }]}>Daily calories</Text>
      </View>
      <View style={[styles.totalPill, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.total, { color: theme.colors.textPrimary }]}>{Math.round(dailyTotal)}</Text>
        <Text style={[styles.unit, { color: theme.colors.textSecondary }]}>kcal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  totalPill: {
    alignItems: 'baseline',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  total: {
    fontSize: 24,
    fontWeight: '800',
  },
  unit: {
    fontSize: 13,
    fontWeight: '700',
  },
});
