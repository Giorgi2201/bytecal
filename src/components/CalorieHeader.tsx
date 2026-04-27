import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type CalorieHeaderProps = {
  dailyTotal: number;
};

export function CalorieHeader({ dailyTotal }: CalorieHeaderProps) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.eyebrow}>Today</Text>
        <Text style={styles.title}>Daily calories</Text>
      </View>
      <View style={styles.totalPill}>
        <Text style={styles.total}>{Math.round(dailyTotal)}</Text>
        <Text style={styles.unit}>kcal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#101828',
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  eyebrow: {
    color: '#98A2B3',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  totalPill: {
    alignItems: 'baseline',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  total: {
    color: '#101828',
    fontSize: 24,
    fontWeight: '800',
  },
  unit: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '700',
  },
});
