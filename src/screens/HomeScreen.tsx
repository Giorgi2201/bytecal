import React, { useMemo } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { useCalories } from '../store/CalorieContext';
import { useAppTheme } from '../theme/ThemeContext';

export function HomeScreen() {
  const { currentProduct, dailyTotal, scanFeedback, addCurrentProductToDailyIntake } = useCalories();
  const { theme, unit } = useAppTheme();

  const formattedTotal = useMemo(() => {
    if (unit === 'kJ') {
      return Math.round(dailyTotal * 4.184);
    }

    return Math.round(dailyTotal);
  }, [dailyTotal, unit]);

  const handleAddProduct = () => {
    if (!currentProduct) {
      return;
    }

    addCurrentProductToDailyIntake();
    Alert.alert('Added', 'Product calories were added to today.');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.screenTitle, { color: theme.colors.textPrimary }]}>Today</Text>

        <GlassCard style={styles.totalCard}>
          <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>Daily intake</Text>
          <View style={styles.totalRow}>
            <Text style={[styles.totalValue, { color: theme.colors.textPrimary }]}>{formattedTotal}</Text>
            <Text style={[styles.totalUnit, { color: theme.colors.textSecondary }]}>{unit}</Text>
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Last scanned</Text>
          {currentProduct ? (
            <>
              <Text style={[styles.productName, { color: theme.colors.textPrimary }]}>
                {currentProduct.name}
              </Text>
              <Text style={[styles.productMeta, { color: theme.colors.textSecondary }]}>
                Barcode {currentProduct.barcode}
              </Text>
              <Text style={[styles.productMeta, { color: theme.colors.textSecondary }]}>
                {Math.round(currentProduct.calories)} kcal
              </Text>
              <Text style={[styles.addText, { color: theme.colors.accent }]} onPress={handleAddProduct}>
                Add to Daily Intake
              </Text>
            </>
          ) : (
            <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
              No product scanned yet. Open the Scan tab to start.
            </Text>
          )}
          {scanFeedback?.errorMessage ? (
            <Text style={[styles.feedbackText, { color: theme.colors.danger }]}>
              {scanFeedback.errorMessage}
            </Text>
          ) : null}
          {scanFeedback?.infoMessage ? (
            <Text style={[styles.feedbackText, { color: theme.colors.success }]}>
              {scanFeedback.infoMessage}
            </Text>
          ) : null}
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addText: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 14,
  },
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 120,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  placeholderText: {
    fontSize: 15,
    lineHeight: 21,
  },
  productMeta: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 3,
  },
  productName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
    marginTop: 4,
  },
  safeArea: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  totalCard: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  totalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  totalUnit: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  totalValue: {
    fontSize: 62,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
});
