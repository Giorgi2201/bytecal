import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  CameraPermissionStatus,
  Code,
  CodeType,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';

type ScannerViewProps = {
  isActive: boolean;
  permissionStatus: CameraPermissionStatus;
  onRequestPermission: () => void;
  onBarcodeScanned: (barcode: string) => void;
};

const supportedCodeTypes: CodeType[] = [
  'ean-13',
  'ean-8',
  'upc-a',
  'upc-e',
];

export function ScannerView({
  isActive,
  permissionStatus,
  onRequestPermission,
  onBarcodeScanned,
}: ScannerViewProps) {
  const device = useCameraDevice('back');
  const codeScanner = useCodeScanner({
    codeTypes: supportedCodeTypes,
    onCodeScanned: (codes: Code[]) => {
      const barcode = codes.find(code => Boolean(code.value))?.value;

      if (barcode) {
        onBarcodeScanned(barcode);
      }
    },
  });

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.permissionCard}>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>
          ByteCal uses your camera to scan food barcodes.
        </Text>
        <Pressable style={styles.permissionButton} onPress={onRequestPermission}>
          <Text style={styles.permissionButtonText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionCard}>
        <Text style={styles.permissionTitle}>No camera found</Text>
        <Text style={styles.permissionText}>
          Run ByteCal on a physical iPhone for barcode scanning.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.cameraShell}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        codeScanner={codeScanner}
      />
      <View style={styles.overlay}>
        <View style={styles.scanBox} />
        <Text style={styles.scanText}>Align barcode inside the frame</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraShell: {
    backgroundColor: '#101828',
    borderRadius: 32,
    height: 300,
    overflow: 'hidden',
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
  scanBox: {
    borderColor: '#12B76A',
    borderRadius: 22,
    borderWidth: 3,
    height: 112,
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
