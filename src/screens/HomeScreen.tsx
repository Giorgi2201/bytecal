import React, { useMemo } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Minus, Plus, ScanLine } from 'lucide-react-native';
import { GlassCard } from '../components/GlassCard';
import { useCalories } from '../store/CalorieContext';
import { useAppTheme } from '../theme/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { Product } from '../types/product';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

type ScannedProductCardProps = {
  product: Product;
  addedCount: number;
  onAdd: () => void;
  onRemove: () => void;
};

function ScannedProductCard({
  product,
  addedCount,
  onAdd,
  onRemove,
}: ScannedProductCardProps) {
  const { theme, unit } = useAppTheme();

  const calories =
    unit === 'kJ'
      ? Math.round(product.calories * 4.184)
      : Math.round(product.calories);

  return (
    <GlassCard contentStyle={styles.compactContent}>
      <View style={styles.productRow}>
        <Pressable
          style={[styles.addBtn, { borderColor: theme.colors.accent }]}
          onPress={onAdd}>
          <Plus color={theme.colors.accent} size={16} strokeWidth={2.5} />
        </Pressable>

        <View style={styles.productMid}>
          <Text
            style={[styles.productName, { color: theme.colors.textPrimary }]}
            numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={[styles.productCals, { color: theme.colors.textSecondary }]}>
            {calories} {unit}
          </Text>
        </View>

        {addedCount > 0 ? (
          <View style={styles.rightActions}>
            <View
              style={[styles.countBadge, { backgroundColor: theme.colors.accent + '22' }]}>
              <Text style={[styles.countText, { color: theme.colors.accent }]}>
                {addedCount}×
              </Text>
            </View>
            <Pressable
              style={[styles.removeBtn, { borderColor: theme.colors.cardBorder }]}
              onPress={onRemove}>
              <Minus color={theme.colors.textSecondary} size={14} strokeWidth={2.5} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </GlassCard>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const {
    scanHistory,
    entries,
    dailyTotal,
    scanFeedback,
    addProductToIntake,
    removeLastEntryForProduct,
  } = useCalories();
  const { theme, unit } = useAppTheme();

  const formattedTotal = useMemo(() => {
    if (unit === 'kJ') {
      return Math.round(dailyTotal * 4.184);
    }
    return Math.round(dailyTotal);
  }, [dailyTotal, unit]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.screenTitle, { color: theme.colors.textPrimary }]}>Today</Text>

        <GlassCard>
          <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
            Daily intake
          </Text>
          <View style={styles.totalRow}>
            <Text style={[styles.totalValue, { color: theme.colors.textPrimary }]}>
              {formattedTotal}
            </Text>
            <Text style={[styles.totalUnit, { color: theme.colors.textSecondary }]}>
              {unit}
            </Text>
          </View>
          <Pressable
            style={[styles.scanButton, { backgroundColor: theme.colors.accent }]}
            onPress={() => navigation.navigate('Scan')}>
            <ScanLine color="#FFFFFF" size={18} strokeWidth={2} />
            <Text style={styles.scanButtonText}>Scan a Product</Text>
          </Pressable>
        </GlassCard>

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

        {scanHistory.length > 0 ? (
          <>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Last Scanned
            </Text>
            {scanHistory.map(product => (
              <ScannedProductCard
                key={product.barcode}
                product={product}
                addedCount={entries.filter(
                  e => e.product.barcode === product.barcode,
                ).length}
                onAdd={() => addProductToIntake(product)}
                onRemove={() => removeLastEntryForProduct(product.barcode)}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    flexShrink: 0,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  compactContent: {
    padding: 12,
  },
  content: {
    gap: 12,
    padding: 20,
    paddingBottom: 120,
  },
  countBadge: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
  },
  productCals: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  productMid: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
  },
  productRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  removeBtn: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  rightActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 6,
  },
  safeArea: {
    flex: 1,
  },
  scanButton: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 13,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
    marginTop: 8,
    textTransform: 'uppercase',
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
    marginTop: 6,
  },
  totalValue: {
    fontSize: 62,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
});
