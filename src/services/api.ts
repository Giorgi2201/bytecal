import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, ProductLookupResult } from '../types/product';

const API_BASE_URL = 'http://localhost:5166';
const CACHE_PREFIX = 'bytecal:product:';

type ProductResponse = {
  barcode: string;
  name: string;
  calories: number;
  caloriesUnit: string;
  servingSize?: string | null;
  source: string;
};

const productCacheKey = (barcode: string) => `${CACHE_PREFIX}${barcode}`;

export async function lookupProduct(
  barcode: string,
): Promise<ProductLookupResult> {
  const cachedProduct = await getCachedProduct(barcode);

  if (cachedProduct) {
    return { product: cachedProduct };
  }

  const response = await fetch(`${API_BASE_URL}/api/products/${barcode}`);

  if (response.status === 404) {
    return {
      product: null,
      message: 'We could not find this barcode yet.',
    };
  }

  if (!response.ok) {
    throw new Error('Product lookup failed. Please try again.');
  }

  const data = (await response.json()) as ProductResponse;
  const product: Product = {
    barcode: data.barcode,
    name: data.name,
    calories: data.calories,
    caloriesUnit: data.caloriesUnit,
    servingSize: data.servingSize,
    source: data.source,
  };

  await AsyncStorage.setItem(productCacheKey(barcode), JSON.stringify(product));

  return { product };
}

async function getCachedProduct(barcode: string): Promise<Product | null> {
  const rawProduct = await AsyncStorage.getItem(productCacheKey(barcode));

  if (!rawProduct) {
    return null;
  }

  try {
    return JSON.parse(rawProduct) as Product;
  } catch {
    await AsyncStorage.removeItem(productCacheKey(barcode));
    return null;
  }
}
