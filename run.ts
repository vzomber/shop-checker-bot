import process from "process";
import { chromium, type Page } from "playwright";
import type { Product } from "./types.ts";
import { CATALOG_URL, PRODUCT_LINK_SELECTOR } from "./variables.ts";
import { loadBaselineProducts } from "./storage.ts";
import { compareProducts } from "./compare.ts";

function collectProductsData(elements: Element[]): Product[] {
  const productsByUrl = new Map<string, Product>();

  for (const element of elements) {
    const link = element as HTMLAnchorElement;
    const id = new URL(link.href).pathname.match(/\/p-(\d+)\.html$/)?.[1];

    if (!id) continue;

    const name =
      link.textContent?.trim() || link.querySelector("img")?.alt || "";

    if (!productsByUrl.has(link.href) || name) {
      productsByUrl.set(link.href, { id, name, url: link.href });
    }
  }

  return [...productsByUrl.values()];
}

async function readProducts(page: Page): Promise<Product[]> {
  const links = page.locator(PRODUCT_LINK_SELECTOR);
  const products = await links.evaluateAll(collectProductsData);

  const trimmedProducts = products.map(({ id, name, url }) => ({
    id,
    name: name.substring(0, 50),
    url:
      url.length > 70
        ? "..." + url.substring(url.length - 70, url.length)
        : url,
  }));

  if (products.length > 0) {
    console.table(trimmedProducts);
  } else {
    console.log(
      "No product links found. Check the page preview for a loading or access restriction message.",
    );
  }

  return products;
}

async function openCatalog(): Promise<void> {
  const browser = await chromium.launch({ headless: false });

  try {
    const page = await browser.newPage();
    page.on("console", (message) => {
      console.log(`[browser:${message.type()}] ${message.text()}`);
    });

    const response = await page.goto(CATALOG_URL, {
      waitUntil: "domcontentloaded",
    });

    if (!response) {
      throw new Error("Failed to get a response from the catalog page.");
    }

    if (!response.ok()) {
      throw new Error(`Catalog request failed: HTTP ${response.status()}`);
    }

    console.log("HTTP status:", response.status());
    const products = await readProducts(page);

    if (products.length === 0) {
      throw new Error(
        "No products found. Skipping comparison: the page may not have loaded correctly.",
      );
    }

    const baseline = await loadBaselineProducts();
    const changes = compareProducts(baseline, products);

    console.log("Changes compared with the fixed products.json baseline:");
    console.log("Added:", changes.added);
    console.log("Removed:", changes.removed);
    console.log("Changed name or URL:", changes.changed);

    console.log("Catalog opened. Close the browser window to exit.");

    const tgMessage = `New products: ${products.length}\nAdded: ${changes.added.length}\nRemoved: ${changes.removed.length}\nChanged: ${changes.changed.length}`;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function main(): Promise<void> {
  console.log("Shop Checker is running.");

  await openCatalog();
}

main().catch((error: unknown) => {
  console.error("Project error:", error);
  process.exitCode = 1;
});
