import process from "process";
import { chromium, type Page } from "playwright";
import type { Product } from "./types.ts";
import { CATALOG_URL, PRODUCT_LINK_SELECTOR } from "./variables.ts";

function extractProducts(elements: Element[]): Product[] {
  const productsByUrl = new Map<string, Product>();

  for (const element of elements) {
    const link = element as HTMLAnchorElement;
    const name =
      link.textContent?.trim() || link.querySelector("img")?.alt || "";

    if (!productsByUrl.has(link.href) || name) {
      productsByUrl.set(link.href, { name, url: link.href });
    }
  }

  return [...productsByUrl.values()];
}

async function logPageDetails(page: Page): Promise<void> {
  const links = page.locator(PRODUCT_LINK_SELECTOR);
  const products = await links.evaluateAll(extractProducts);

  const trimmedProducts = products.map(({ name, url }) => ({
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
}

async function openCatalog(): Promise<void> {
  const browser = await chromium.launch({ headless: false });

  try {
    const page = await browser.newPage();
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
    await logPageDetails(page);

    console.log("Catalog opened. Close the browser window to exit.");
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
