import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { useCalories } from '../store/CalorieContext';
import { useAppTheme } from '../theme/ThemeContext';

function formatEntryTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return timeStr;
  }

  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${dateStr} · ${timeStr}`;
}

export function HistoryScreen() {
  const { theme, unit } = useAppTheme();
  const { entries, dailyTotal } = useCalories();

  const formattedTotal = useMemo(() => {
    const value = unit === 'kJ' ? Math.round(dailyTotal * 4.184) : Math.round(dailyTotal);
    return `${value} ${unit}`;
  }, [dailyTotal, unit]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>History</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {entries.length > 0
            ? `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} · ${formattedTotal} today`
            : 'Add products from the Home tab to track your intake.'}
        </Text>

        {entries.length === 0 ? (
          <GlassCard>
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No entries yet</Text>
            <Text style={[styles.emptyBody, { color: theme.colors.textSecondary }]}>
              Scan a barcode, then tap "Add to Daily Intake" on the Home tab. Your entries will appear here.
            </Text>
          </GlassCard>
        ) : (
          entries.map(entry => {
            const calories = unit === 'kJ'
              ? Math.round(entry.product.calories * 4.184)
              : Math.round(entry.product.calories);

            return (
              <GlassCard key={entry.id}>
                <View style={styles.cardRow}>
                  <View style={styles.entryInfo}>
                    <Text style={[styles.entryTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                      {entry.product.name}
                    </Text>
                    <Text style={[styles.entryTime, { color: theme.colors.textSecondary }]}>
                      {formatEntryTime(entry.timestamp)}
                    </Text>
                  </View>
                  <Text style={[styles.entryCalories, { color: theme.colors.textPrimary }]}>
                    {calories} {unit}
                  </Text>
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
  cardRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 120,
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
  entryCalories: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 0,
  },
  entryInfo: {
    flex: 1,
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
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
});
