import { readFile } from "node:fs/promises";
import type { Product } from "../types.ts";

const PRODUCTS_FILE = new URL("./products.json", import.meta.url);

export async function loadBaselineProducts(): Promise<Product[]> {
  const contents = await readFile(PRODUCTS_FILE, "utf8");

  return JSON.parse(contents) as Product[];
}
