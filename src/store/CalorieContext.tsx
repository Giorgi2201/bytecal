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

type CalorieContextValue = {
  currentProduct: Product | null;
  dailyTotal: number;
  entries: FoodEntry[];
  setCurrentProduct: (product: Product | null) => void;
  addCurrentProductToDailyIntake: () => void;
};

const CalorieContext = createContext<CalorieContextValue | undefined>(
  undefined,
);

export function CalorieProvider({ children }: PropsWithChildren) {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [entries, setEntries] = useState<FoodEntry[]>([]);

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
      dailyTotal,
      entries,
      setCurrentProduct,
      addCurrentProductToDailyIntake,
    }),
    [addCurrentProductToDailyIntake, currentProduct, dailyTotal, entries],
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
