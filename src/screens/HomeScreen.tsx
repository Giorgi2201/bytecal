import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useCameraPermission } from 'react-native-vision-camera';
import { CalorieHeader } from '../components/CalorieHeader';
import { ProductCard } from '../components/ProductCard';
import { ScannerView } from '../components/ScannerView';
import { lookupProduct } from '../services/api';
import { useCalories } from '../store/CalorieContext';

const scanCooldownMs = 2200;

export function HomeScreen() {
  const { currentProduct, dailyTotal, setCurrentProduct, addCurrentProductToDailyIntake } =
    useCalories();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastScanRef = useRef<{ barcode: string; timestamp: number } | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();

    if (!granted) {
      Alert.alert(
        'Camera permission denied',
        'Enable camera access in Settings to scan product barcodes.',
      );
    }
  }, [requestPermission]);

  const animateProductCard = useCallback(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      duration: 240,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleBarcodeScanned = useCallback(
    async (barcode: string) => {
      const now = Date.now();
      const lastScan = lastScanRef.current;

      if (
        isLookupLoading ||
        (lastScan?.barcode === barcode &&
          now - lastScan.timestamp < scanCooldownMs)
      ) {
        return;
      }

      lastScanRef.current = { barcode, timestamp: now };
      setIsLookupLoading(true);
      setErrorMessage(null);

      try {
        const result = await lookupProduct(barcode);

        if (!result.product) {
          setCurrentProduct(null);
          setErrorMessage(result.message ?? 'Unknown barcode.');
          return;
        }

        setCurrentProduct(result.product);
        animateProductCard();
      } catch (error) {
        setCurrentProduct(null);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please scan again.',
        );
      } finally {
        setIsLookupLoading(false);
      }
    },
    [
      animateProductCard,
      isLookupLoading,
      setCurrentProduct,
    ],
  );

  const handleAddProduct = useCallback(() => {
    addCurrentProductToDailyIntake();
    Alert.alert('Added', 'Product calories were added to today.');
  }, [addCurrentProductToDailyIntake]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.appName}>ByteCal</Text>
          <Text style={styles.headline}>Scan food. Track calories.</Text>
        </View>

        <CalorieHeader dailyTotal={dailyTotal} />

        <ScannerView
          isActive={!isLookupLoading}
          permissionStatus={hasPermission ? 'granted' : 'not-determined'}
          onRequestPermission={handleRequestPermission}
          onBarcodeScanned={handleBarcodeScanned}
        />

        <Animated.View style={{ opacity: fadeAnim }}>
          <ProductCard
            product={currentProduct}
            isLoading={isLookupLoading}
            errorMessage={errorMessage}
            onAdd={handleAddProduct}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appName: {
    color: '#12B76A',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 36,
  },
  headline: {
    color: '#101828',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.2,
    lineHeight: 39,
  },
  hero: {
    paddingTop: 8,
  },
  safeArea: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
});
