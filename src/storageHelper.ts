import { randomUUID } from "node:crypto";
import { readFile, rename, writeFile, rm } from "node:fs/promises";
import type { Product } from "./types.ts";

const PRODUCTS_FILE = new URL("../data/products.json", import.meta.url);

export async function loadBaselineProducts(): Promise<Product[]> {
  const contents = await readFile(PRODUCTS_FILE, "utf8");

  return JSON.parse(contents) as Product[];
}

export async function saveProducts(products: Product[]): Promise<void> {
  if (products.length === 0) {
    throw new Error("Refusing to replace the snapshot with an empty product list.");
  }

  const temporaryFile = new URL(`../data/products-${randomUUID()}.tmp`, import.meta.url);

  try {
    await writeFile(temporaryFile, JSON.stringify(products, null, 2) + "\n", {
      encoding: "utf8",
      flag: "wx",
    });
    await rename(temporaryFile, PRODUCTS_FILE);
  } finally {
    await rm(temporaryFile, { force: true });
  }
}
