import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useCameraPermission } from 'react-native-vision-camera';
import { CalorieHeader } from '../components/CalorieHeader';
import { ProductCard } from '../components/ProductCard';
import { ScannerView } from '../components/ScannerView';
import { createProductManually, lookupProduct } from '../services/api';
import { useCalories } from '../store/CalorieContext';

const scanCooldownMs = 2200;

export function HomeScreen() {
  const { currentProduct, dailyTotal, setCurrentProduct, addCurrentProductToDailyIntake } =
    useCalories();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingBarcode, setPendingBarcode] = useState<string | null>(null);
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [isCreatingManualProduct, setIsCreatingManualProduct] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
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
      setInfoMessage(null);
      setPendingBarcode(null);

      try {
        const result = await lookupProduct(barcode);

        if (!result.product) {
          setCurrentProduct(null);
          setErrorMessage(result.message ?? 'Unknown barcode.');
          setPendingBarcode(barcode);
          return;
        }

        setCurrentProduct(result.product);
        if (result.message) {
          setInfoMessage(result.message);
        }
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

  const handleCreateManualProduct = useCallback(async () => {
    if (!pendingBarcode) {
      return;
    }

    const name = manualName.trim();
    const calories = Number(manualCalories);

    if (!name || !Number.isFinite(calories) || calories <= 0) {
      Alert.alert('Invalid data', 'Please enter a name and valid calories.');
      return;
    }

    setIsCreatingManualProduct(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const product = await createProductManually({
        barcode: pendingBarcode,
        calories,
        name,
      });
      setCurrentProduct(product);
      setPendingBarcode(null);
      setManualName('');
      setManualCalories('');
      setInfoMessage('Product added to local catalog.');
      animateProductCard();
      Alert.alert('Success', 'Product saved. You can now add it to daily intake.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not save product.',
      );
    } finally {
      setIsCreatingManualProduct(false);
    }
  }, [
    animateProductCard,
    manualCalories,
    manualName,
    pendingBarcode,
    setCurrentProduct,
  ]);

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
            isLoading={isLookupLoading || isCreatingManualProduct}
            errorMessage={errorMessage}
            onAdd={handleAddProduct}
          />
        </Animated.View>

        {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}

        {pendingBarcode ? (
          <View style={styles.manualCard}>
            <Text style={styles.manualTitle}>Product not found</Text>
            <Text style={styles.manualSubtitle}>
              Add this product to build your local Georgian-friendly database.
            </Text>
            <Text style={styles.manualBarcode}>Barcode: {pendingBarcode}</Text>
            <TextInput
              style={styles.input}
              value={manualName}
              onChangeText={setManualName}
              placeholder="Product name"
              placeholderTextColor="#98A2B3"
              editable={!isCreatingManualProduct}
            />
            <TextInput
              style={styles.input}
              value={manualCalories}
              onChangeText={setManualCalories}
              placeholder="Calories (kcal)"
              keyboardType="numeric"
              placeholderTextColor="#98A2B3"
              editable={!isCreatingManualProduct}
            />
            <Pressable
              style={styles.submitButton}
              onPress={handleCreateManualProduct}
              disabled={isCreatingManualProduct}>
              <Text style={styles.submitButtonText}>Save Product</Text>
            </Pressable>
          </View>
        ) : null}
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
  infoText: {
    color: '#0B6B44',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D0D5DD',
    borderRadius: 14,
    borderWidth: 1,
    color: '#101828',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  manualBarcode: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
  },
  manualCard: {
    backgroundColor: '#ECFDF3',
    borderColor: '#ABEFC6',
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  manualSubtitle: {
    color: '#344054',
    fontSize: 14,
    lineHeight: 20,
  },
  manualTitle: {
    color: '#067647',
    fontSize: 20,
    fontWeight: '800',
  },
  safeArea: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#12B76A',
    borderRadius: 14,
    marginTop: 4,
    paddingVertical: 13,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
