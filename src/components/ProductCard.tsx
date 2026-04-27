import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Product } from '../types/product';

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
  if (isLoading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color="#12B76A" />
        <Text style={styles.mutedText}>Looking up product...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Scan result</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Ready to scan</Text>
        <Text style={styles.emptyTitle}>Tap Scan Product to start.</Text>
        <Text style={styles.mutedText}>
          ByteCal scans EAN and UPC barcodes from packaged foods.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Scanned product</Text>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.meta}>Barcode {product.barcode}</Text>
      <Text style={styles.meta}>Source: {product.source}</Text>
      <View style={styles.calorieRow}>
        <Text style={styles.calories}>{Math.round(product.calories)}</Text>
        <Text style={styles.calorieUnit}>kcal</Text>
      </View>
      <Pressable style={styles.button} onPress={onAdd}>
        <Text style={styles.buttonText}>Add to Daily Intake</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#12B76A',
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
    color: '#101828',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  calorieUnit: {
    color: '#667085',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EAECF0',
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
  },
  emptyTitle: {
    color: '#101828',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 8,
  },
  errorText: {
    color: '#B42318',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  label: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  meta: {
    color: '#667085',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 6,
  },
  mutedText: {
    color: '#667085',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    marginTop: 8,
  },
  name: {
    color: '#101828',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
    lineHeight: 30,
  },
});
