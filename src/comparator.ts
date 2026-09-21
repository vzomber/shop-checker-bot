import type { ComparisonResult, Product } from "./types.ts";
import { loadBaselineProducts } from "./storageHelper.ts";
import { sendTelegramMessage } from "./telegramMessenger.ts";

export function compareProducts(baseline: Product[], current: Product[]) {
  const baselineById = new Map(
    baseline.map((product) => [product.id, product]),
  );
  const currentById = new Map(current.map((product) => [product.id, product]));

  return {
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

export async function comparator(
  products: Product[],
): Promise<ComparisonResult> {
  const baseline = await loadBaselineProducts();
  const changes = compareProducts(baseline, products);

  return {
    added: changes.added,
    addedLength: changes.added.length,
    removed: changes.removed,
    removedLength: changes.removed.length,
    changed: changes.changed,
    changedLength: changes.changed.length,
    total: products.length,
  };

  //   console.log("Changes compared with the fixed products.json baseline:");
  //   console.log("Added:", changes.added);
  //   console.log("Removed:", changes.removed);
  //   console.log("Changed name or URL:", changes.changed);

  //   const tgMessage = `Total products: ${products.length}\nAdded: ${changes.added.length}\nRemoved: ${changes.removed.length}\nChanged: ${changes.changed.length}`;
  //   if (
  //     changes.added.length ||
  //     changes.removed.length ||
  //     changes.changed.length
  //   ) {
  //     await sendTelegramMessage(tgMessage);
  //   } else {
  //     console.log("No changes from baseline. Telegram notification skipped.");
  //   }
}
