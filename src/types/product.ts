export type Product = {
  barcode: string;
  name: string;
  calories: number;
  caloriesUnit: string;
  servingSize?: string | null;
  source: string;
};

export type ProductLookupResult = {
  product: Product | null;
  message?: string;
};
