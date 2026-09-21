export interface Product {
  id: string;
  name: string;
  url: string;
}

export interface ComparisonResult {
  total: number;
  added: Product[];
  removed: Product[];
  changed: Product[];
}
