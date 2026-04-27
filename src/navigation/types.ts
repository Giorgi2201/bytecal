import { Product } from '../types/product';

export type ScanResult = {
  product: Product | null;
  errorMessage: string | null;
  infoMessage: string | null;
  barcode: string;
};

export type RootStackParamList = {
  Home: { scanResult?: ScanResult } | undefined;
  Scan: undefined;
};
