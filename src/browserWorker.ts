import { type Browser, type Page } from "playwright";
import { CATALOG_URL, PRODUCT_LINK_SELECTOR } from "./variables.ts";
import type { Product } from "./types.ts";

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

export async function readPageData(browser: Browser) {
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

  return products;
}
