import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { Product, ProductLookupResult } from '../types/product';

const CACHE_PREFIX = 'bytecal:product:';

type ProductResponse = {
  id: number;
  barcode: string;
  name: string;
  calories: number;
  source: 'OFF' | 'LOCAL';
  createdAt: string;
};

const productCacheKey = (barcode: string) => `${CACHE_PREFIX}${barcode}`;

export async function lookupProduct(
  barcode: string,
): Promise<ProductLookupResult> {
  const cachedProduct = await getCachedProduct(barcode);

  if (cachedProduct) {
    return { product: cachedProduct };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${barcode}`);

    if (response.status === 404) {
      return {
        product: null,
        message: 'Product not found',
      };
    }

    if (!response.ok) {
      throw new Error('Product lookup failed. Please try again.');
    }

    const product = await mapProductResponse(response);
    await AsyncStorage.setItem(productCacheKey(barcode), JSON.stringify(product));

    return { product };
  } catch (error) {
    if (cachedProduct) {
      return {
        product: cachedProduct,
        message: 'Backend unavailable. Loaded from local cache.',
      };
    }
    throw error;
  }
}

export async function createProductManually(input: {
  barcode: string;
  name: string;
  calories: number;
}): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    body: JSON.stringify(input),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (response.status === 409) {
    throw new Error('This barcode already exists.');
  }

  if (!response.ok) {
    throw new Error('Could not save product. Try again.');
  }

  const product = await mapProductResponse(response);
  await AsyncStorage.setItem(productCacheKey(product.barcode), JSON.stringify(product));
  return product;
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

async function mapProductResponse(response: Response): Promise<Product> {
  const data = (await response.json()) as ProductResponse;
  return {
    id: data.id,
    barcode: data.barcode,
    name: data.name,
    calories: data.calories,
    source: data.source,
    createdAt: data.createdAt,
  };
}
