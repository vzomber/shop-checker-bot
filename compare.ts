import type { Product } from "./types.ts";

export function compareProducts(baseline: Product[], current: Product[]) {
  const baselineById = new Map(baseline.map((product) => [product.id, product]));
  const currentById = new Map(current.map((product) => [product.id, product]));

  return {
    added: current.filter((product) => !baselineById.has(product.id)),
    removed: baseline.filter((product) => !currentById.has(product.id)),
    changed: current.filter((product) => {
      const original = baselineById.get(product.id);
      return original && (original.name !== product.name || original.url !== product.url);
    }),
  };
}
