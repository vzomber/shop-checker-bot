import type { ComparisonResult, Product } from "./types.ts";

export function formatProductMessage(products: Product[], changes: ComparisonResult): string {
  const shouldIncludeChangeDetails = changes.added.length || changes.removed.length || changes.changed.length;

  if (!shouldIncludeChangeDetails) {
    const names = products.map((product, index) =>
      `${index + 1}. ${Array.from(product.name).slice(0, 30).join("")}`,
    );
    return [`No changes. Same ${changes.total} products.`, "", ...names].join("\n");
  }

  const sections = [
    `Change!\nTotal products: ${changes.total}\nAdded: ${changes.added.length}\nRemoved: ${changes.removed.length}\nChanged: ${changes.changed.length}`,
  ];

  for (const [label, items] of [
    ["Added", changes.added],
    ["Changed (current values)", changes.changed],
    ["Removed (baseline values)", changes.removed],
  ] as const) {
    if (items.length === 0) continue;

    const list = items.map((product, index) =>
      `${index + 1}. ${product.name}\nID: ${product.id}\n${product.url}`,
    );
    sections.push(`${label}:\n${list.join("\n\n")}`);
  }

  return sections.join("\n\n");
}
