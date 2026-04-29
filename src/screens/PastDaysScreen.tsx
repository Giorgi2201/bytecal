import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { useCalories } from '../store/CalorieContext';
import { useAppTheme } from '../theme/ThemeContext';

type DayGroup = {
  dateKey: string;
  date: Date;
  total: number;
  count: number;
};

function formatDayLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const entryDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (entryDay.getTime() === today.getTime()) {
    return 'Today';
  }
  if (entryDay.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function PastDaysScreen() {
  const { theme, unit } = useAppTheme();
  const { entries } = useCalories();

  const dayGroups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, DayGroup>();

    for (const entry of entries) {
      const date = new Date(entry.timestamp);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (!map.has(dateKey)) {
        map.set(dateKey, { dateKey, date, total: 0, count: 0 });
      }
      const group = map.get(dateKey)!;
      group.total += entry.product.calories;
      group.count += 1;
    }

    return Array.from(map.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
  }, [entries]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Past Days</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {dayGroups.length > 0
            ? `${dayGroups.length} ${dayGroups.length === 1 ? 'day' : 'days'} tracked`
            : 'No entries recorded yet.'}
        </Text>

        {dayGroups.length === 0 ? (
          <GlassCard>
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
              Nothing here yet
            </Text>
            <Text style={[styles.emptyBody, { color: theme.colors.textSecondary }]}>
              Scan products and add them to your intake to start tracking your daily calories.
            </Text>
          </GlassCard>
        ) : (
          dayGroups.map(group => {
            const displayCalories =
              unit === 'kJ'
                ? Math.round(group.total * 4.184)
                : Math.round(group.total);

            return (
              <GlassCard key={group.dateKey}>
                <View style={styles.dayRow}>
                  <View>
                    <Text style={[styles.dayLabel, { color: theme.colors.textPrimary }]}>
                      {formatDayLabel(group.date)}
                    </Text>
                    <Text style={[styles.dayCount, { color: theme.colors.textSecondary }]}>
                      {group.count} {group.count === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                  <View style={styles.calorieRight}>
                    <Text
                      style={[styles.calorieValue, { color: theme.colors.textPrimary }]}>
                      {displayCalories}
                    </Text>
                    <Text
                      style={[styles.calorieUnit, { color: theme.colors.textSecondary }]}>
                      {unit}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  calorieRight: {
    alignItems: 'flex-end',
  },
  calorieUnit: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 120,
  },
  dayCount: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  dayLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  dayRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyBody: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  safeArea: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
});
