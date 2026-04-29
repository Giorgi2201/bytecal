import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  Camera,
  Code,
  CodeType,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { RootTabParamList } from '../navigation/types';
import { lookupProduct } from '../services/api';
import { useCalories } from '../store/CalorieContext';
import { GlassCard } from '../components/GlassCard';
import { useAppTheme } from '../theme/ThemeContext';

type ScanScreenProps = BottomTabScreenProps<RootTabParamList, 'Scan'>;

const supportedCodeTypes: CodeType[] = ['ean-13', 'ean-8', 'upc-a', 'upc-e'];

export function ScanScreen({ navigation }: ScanScreenProps) {
  const isFocused = useIsFocused();
  const { theme } = useAppTheme();
  const { setCurrentProduct, setScanFeedback } = useCalories();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isProcessing, setIsProcessing] = useState(false);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    if (isFocused) {
      hasScannedRef.current = false;
      setIsProcessing(false);
    }
  }, [isFocused]);

  const onCodeDetected = useCallback(
    async (barcode: string) => {
      if (hasScannedRef.current || isProcessing) {
        return;
      }

      hasScannedRef.current = true;
      setIsProcessing(true);

      try {
        const result = await lookupProduct(barcode);
        setCurrentProduct(result.product);
        setScanFeedback({
          barcode,
          errorMessage: result.product ? null : result.message ?? 'Unknown barcode.',
          infoMessage: result.product ? result.message ?? null : null,
        });
        navigation.navigate('Home');
      } catch (error) {
        setCurrentProduct(null);
        setScanFeedback({
          barcode,
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Something went wrong. Please try scanning again.',
          infoMessage: null,
        });
        navigation.navigate('Home');
      }
    },
    [isProcessing, navigation, setCurrentProduct, setScanFeedback],
  );

  const codeScanner = useCodeScanner({
    codeTypes: supportedCodeTypes,
    onCodeScanned: (codes: Code[]) => {
      const barcode = codes.find(code => Boolean(code.value))?.value;

      if (barcode) {
        onCodeDetected(barcode).catch(() => {
          // Error is handled inside onCodeDetected.
        });
      }
    },
  });

  const isCameraActive = isFocused && hasPermission && !isProcessing;

  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();

    if (!granted) {
      Alert.alert(
        'Camera permission denied',
        'Enable camera access in Settings to scan product barcodes.',
      );
    }
  }, [requestPermission]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Scan a product</Text>
        <Pressable
          style={[styles.backButton, { borderColor: theme.colors.cardBorder }]}
          onPress={() => navigation.navigate('Home')}>
          <Text style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>Close</Text>
        </Pressable>
      </View>

      {!hasPermission ? (
        <GlassCard style={styles.permissionCard}>
          <Text style={[styles.permissionTitle, { color: theme.colors.textPrimary }]}>Camera access needed</Text>
          <Text style={[styles.permissionText, { color: theme.colors.textSecondary }]}>
            ByteCal uses your camera to scan food barcodes.
          </Text>
          <Pressable style={[styles.permissionButton, { backgroundColor: theme.colors.accent }]} onPress={handleRequestPermission}>
            <Text style={styles.permissionButtonText}>Allow Camera</Text>
          </Pressable>
        </GlassCard>
      ) : null}

      {hasPermission && !device ? (
        <GlassCard style={styles.permissionCard}>
          <Text style={[styles.permissionTitle, { color: theme.colors.textPrimary }]}>No camera found</Text>
          <Text style={[styles.permissionText, { color: theme.colors.textSecondary }]}>
            Run ByteCal on a physical device for barcode scanning.
          </Text>
        </GlassCard>
      ) : null}

      {hasPermission && device ? (
        <View style={styles.cameraShell}>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isCameraActive}
            codeScanner={codeScanner}
          />
          <View style={styles.overlay}>
            <View style={styles.scanBox} />
            <Text style={styles.scanText}>{isProcessing ? 'Processing...' : 'Scan a product'}</Text>
          </View>
          {isProcessing ? <ActivityIndicator style={styles.loader} color="#12B76A" /> : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cameraShell: {
    backgroundColor: '#101828',
    borderRadius: 32,
    flex: 1,
    margin: 20,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  loader: {
    bottom: 26,
    position: 'absolute',
    right: 26,
  },
  overlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 24,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  permissionButton: {
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 6,
    paddingVertical: 14,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  permissionCard: {
    gap: 14,
    margin: 20,
    minHeight: 220,
    justifyContent: 'center',
  },
  permissionText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  safeArea: {
    flex: 1,
  },
  scanBox: {
    borderColor: '#12B76A',
    borderRadius: 22,
    borderWidth: 3,
    height: 120,
    width: '86%',
  },
  scanText: {
    backgroundColor: 'rgba(16, 24, 40, 0.78)',
    borderRadius: 999,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 18,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
});
