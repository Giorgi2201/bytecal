import React, { useCallback, useRef, useState } from 'react';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Camera,
  Code,
  CodeType,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { RootStackParamList, ScanResult } from '../navigation/types';
import { lookupProduct } from '../services/api';

type ScanScreenProps = NativeStackScreenProps<RootStackParamList, 'Scan'>;

const supportedCodeTypes: CodeType[] = ['ean-13', 'ean-8', 'upc-a', 'upc-e'];

export function ScanScreen({ navigation }: ScanScreenProps) {
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isProcessing, setIsProcessing] = useState(false);
  const hasScannedRef = useRef(false);

  const finishScan = useCallback(
    (scanResult: ScanResult) => {
      navigation.navigate('Home', { scanResult });
    },
    [navigation],
  );

  const onCodeDetected = useCallback(
    async (barcode: string) => {
      if (hasScannedRef.current || isProcessing) {
        return;
      }

      hasScannedRef.current = true;
      setIsProcessing(true);

      try {
        const result = await lookupProduct(barcode);
        finishScan({
          barcode,
          errorMessage: result.product ? null : result.message ?? 'Unknown barcode.',
          infoMessage: result.product ? result.message ?? null : null,
          product: result.product,
        });
      } catch (error) {
        finishScan({
          barcode,
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Something went wrong. Please try scanning again.',
          infoMessage: null,
          product: null,
        });
      }
    },
    [finishScan, isProcessing],
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Scan Product</Text>
      </View>

      {!hasPermission ? (
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionText}>
            ByteCal uses your camera to scan food barcodes.
          </Text>
          <Pressable style={styles.permissionButton} onPress={handleRequestPermission}>
            <Text style={styles.permissionButtonText}>Allow Camera</Text>
          </Pressable>
        </View>
      ) : null}

      {hasPermission && !device ? (
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>No camera found</Text>
          <Text style={styles.permissionText}>
            Run ByteCal on a physical device for barcode scanning.
          </Text>
        </View>
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
            <Text style={styles.scanText}>{isProcessing ? 'Processing...' : 'Scanning...'}</Text>
          </View>
          {isProcessing ? <ActivityIndicator style={styles.loader} color="#12B76A" /> : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  backButtonText: {
    color: '#101828',
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
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerTitle: {
    color: '#101828',
    fontSize: 22,
    fontWeight: '800',
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
    backgroundColor: '#101828',
    borderRadius: 16,
    paddingVertical: 14,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  permissionCard: {
    backgroundColor: '#F2F4F7',
    borderColor: '#EAECF0',
    borderRadius: 32,
    borderWidth: 1,
    gap: 12,
    margin: 20,
    minHeight: 260,
    padding: 24,
    justifyContent: 'center',
  },
  permissionText: {
    color: '#667085',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  permissionTitle: {
    color: '#101828',
    fontSize: 22,
    fontWeight: '900',
  },
  safeArea: {
    backgroundColor: '#F9FAFB',
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
