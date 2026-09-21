export interface Product {
  id: string;
  name: string;
  url: string;
}

export interface ComparisonResult {
  total: number;
  added: Product[];
  addedLength: number;
  removed: Product[];
  removedLength: number;
  changed: Product[];
  changedLength: number;
}
