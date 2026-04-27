import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalorieHeader } from '../components/CalorieHeader';
import { ProductCard } from '../components/ProductCard';
import { RootStackParamList } from '../navigation/types';
import { useCalories } from '../store/CalorieContext';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation, route }: HomeScreenProps) {
  const { currentProduct, dailyTotal, setCurrentProduct, addCurrentProductToDailyIntake } = useCalories();
  const [isLookupLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateProductCard = useCallback(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      duration: 240,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const scanResult = route.params?.scanResult;

    if (!scanResult) {
      return;
    }

    setCurrentProduct(scanResult.product);
    setErrorMessage(scanResult.errorMessage);
    setInfoMessage(scanResult.infoMessage);
    animateProductCard();

    navigation.setParams({ scanResult: undefined });
  }, [animateProductCard, navigation, route.params, setCurrentProduct]);

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

        <Pressable style={styles.scanButton} onPress={() => navigation.navigate('Scan')}>
          <Text style={styles.scanButtonText}>Scan Product</Text>
        </Pressable>

        <Animated.View style={{ opacity: fadeAnim }}>
          <ProductCard
            product={currentProduct}
            isLoading={isLookupLoading}
            errorMessage={errorMessage}
            onAdd={handleAddProduct}
          />
        </Animated.View>

        {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}
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
  safeArea: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  scanButton: {
    alignItems: 'center',
    backgroundColor: '#101828',
    borderRadius: 16,
    paddingVertical: 15,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
