import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { useAppTheme } from '../theme/ThemeContext';

const placeholderEntries = [
  { id: '1', title: 'Greek Yogurt', calories: 128, time: '08:42' },
  { id: '2', title: 'Chicken Wrap', calories: 432, time: '13:10' },
  { id: '3', title: 'Granola Bar', calories: 189, time: '16:24' },
];

export function HistoryScreen() {
  const { theme, unit } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>History</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Recent entries will sync with backend in a future update.
        </Text>

        {placeholderEntries.map(entry => (
          <GlassCard key={entry.id}>
            <View style={styles.cardRow}>
              <View>
                <Text style={[styles.entryTitle, { color: theme.colors.textPrimary }]}>
                  {entry.title}
                </Text>
                <Text style={[styles.entryTime, { color: theme.colors.textSecondary }]}>
                  {entry.time}
                </Text>
              </View>
              <Text style={[styles.entryCalories, { color: theme.colors.textPrimary }]}>
                {unit === 'kJ' ? Math.round(entry.calories * 4.184) : entry.calories} {unit}
              </Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    gap: 12,
    padding: 20,
    paddingBottom: 120,
  },
  entryCalories: {
    fontSize: 15,
    fontWeight: '700',
  },
  entryTime: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  safeArea: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
});
