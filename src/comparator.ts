import type { ComparisonResult, Product } from "./types.ts";
import { loadBaselineProducts } from "./storageHelper.ts";

export async function compareProduct(
  current: Product[],
): Promise<ComparisonResult> {
  const baseline = await loadBaselineProducts();
  const baselineById = new Map(
    baseline.map((product) => [product.id, product]),
  );
  const currentById = new Map(current.map((product) => [product.id, product]));

  return {
    total: current.length,
    added: current.filter((product) => !baselineById.has(product.id)),
    removed: baseline.filter((product) => !currentById.has(product.id)),
    changed: current.filter((product) => {
      const original = baselineById.get(product.id);

      return (
        original &&
        (original.name !== product.name || original.url !== product.url)
      );
    }),
  };
}
