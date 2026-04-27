export type Product = {
  id: number;
  barcode: string;
  name: string;
  calories: number;
  source: 'OFF' | 'LOCAL';
  createdAt: string;
};

export type ProductLookupResult = {
  product: Product | null;
  message?: string;
};
