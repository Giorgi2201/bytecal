import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Product } from '../types/product';

type FoodEntry = {
  id: string;
  product: Product;
  timestamp: string;
};

export type ScanFeedback = {
  barcode: string;
  errorMessage: string | null;
  infoMessage: string | null;
};

type CalorieContextValue = {
  currentProduct: Product | null;
  scanHistory: Product[];
  dailyTotal: number;
  entries: FoodEntry[];
  scanFeedback: ScanFeedback | null;
  setCurrentProduct: (product: Product | null) => void;
  setScanFeedback: (feedback: ScanFeedback | null) => void;
  addCurrentProductToDailyIntake: () => void;
  addProductToIntake: (product: Product) => void;
  removeLastEntryForProduct: (barcode: string) => void;
};

const CalorieContext = createContext<CalorieContextValue | undefined>(
  undefined,
);

export function CalorieProvider({ children }: PropsWithChildren) {
  const [currentProduct, setCurrentProductState] = useState<Product | null>(null);
  const [scanHistory, setScanHistory] = useState<Product[]>([]);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [scanFeedback, setScanFeedback] = useState<ScanFeedback | null>(null);

  const setCurrentProduct = useCallback((product: Product | null) => {
    setCurrentProductState(product);
    if (product) {
      setScanHistory(prev => {
        const filtered = prev.filter(p => p.barcode !== product.barcode);
        return [product, ...filtered].slice(0, 10);
      });
    }
  }, []);

  const addCurrentProductToDailyIntake = useCallback(() => {
    if (!currentProduct) {
      return;
    }
    setEntries(previousEntries => [
      {
        id: `${currentProduct.barcode}-${Date.now()}`,
        product: currentProduct,
        timestamp: new Date().toISOString(),
      },
      ...previousEntries,
    ]);
  }, [currentProduct]);

  const addProductToIntake = useCallback((product: Product) => {
    setEntries(prev => [
      {
        id: `${product.barcode}-${Date.now()}`,
        product,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const removeLastEntryForProduct = useCallback((barcode: string) => {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.product.barcode === barcode);
      if (idx === -1) {
        return prev;
      }
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const dailyTotal = useMemo(
    () =>
      entries.reduce(
        (totalCalories, entry) => totalCalories + entry.product.calories,
        0,
      ),
    [entries],
  );

  const value = useMemo(
    () => ({
      currentProduct,
      scanHistory,
      dailyTotal,
      entries,
      scanFeedback,
      setCurrentProduct,
      setScanFeedback,
      addCurrentProductToDailyIntake,
      addProductToIntake,
      removeLastEntryForProduct,
    }),
    [
      addCurrentProductToDailyIntake,
      addProductToIntake,
      currentProduct,
      scanHistory,
      dailyTotal,
      entries,
      removeLastEntryForProduct,
      scanFeedback,
      setCurrentProduct,
    ],
  );

  return (
    <CalorieContext.Provider value={value}>{children}</CalorieContext.Provider>
  );
}

export function useCalories() {
  const context = useContext(CalorieContext);

  if (!context) {
    throw new Error('useCalories must be used within CalorieProvider');
  }

  return context;
}
