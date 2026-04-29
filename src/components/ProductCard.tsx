import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Product } from '../types/product';
import { useAppTheme } from '../theme/ThemeContext';

type ProductCardProps = {
  product: Product | null;
  isLoading: boolean;
  errorMessage: string | null;
  onAdd: () => void;
};

export function ProductCard({
  product,
  isLoading,
  errorMessage,
  onAdd,
}: ProductCardProps) {
  const { theme } = useAppTheme();

  const cardStyle = [styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder, shadowColor: theme.colors.shadow }];

  if (isLoading) {
    return (
      <View style={cardStyle}>
        <ActivityIndicator color={theme.colors.accent} />
        <Text style={[styles.mutedText, { color: theme.colors.textSecondary }]}>Looking up product...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={cardStyle}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Scan result</Text>
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>{errorMessage}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={cardStyle}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Ready to scan</Text>
        <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>Tap Scan Product to start.</Text>
        <Text style={[styles.mutedText, { color: theme.colors.textSecondary }]}>
          ByteCal scans EAN and UPC barcodes from packaged foods.
        </Text>
      </View>
    );
  }

  return (
    <View style={cardStyle}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Scanned product</Text>
      <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{product.name}</Text>
      <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>Barcode {product.barcode}</Text>
      <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>Source: {product.source}</Text>
      <View style={styles.calorieRow}>
        <Text style={[styles.calories, { color: theme.colors.textPrimary }]}>{Math.round(product.calories)}</Text>
        <Text style={[styles.calorieUnit, { color: theme.colors.textSecondary }]}>kcal</Text>
      </View>
      <Pressable style={[styles.button, { backgroundColor: theme.colors.accent }]} onPress={onAdd}>
        <Text style={styles.buttonText}>Add to Daily Intake</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 18,
    marginTop: 20,
    paddingVertical: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  calorieRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  calories: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  calorieUnit: {
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  meta: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 6,
  },
  mutedText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    marginTop: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
    lineHeight: 30,
  },
});
