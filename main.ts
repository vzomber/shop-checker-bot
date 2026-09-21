import process from "process";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium, type Browser } from "playwright";
import { CHECK_INTERVAL_MS } from "./src/variables.ts";
import {
  checkIntervalSetup,
  comparator,
  readPageData,
  sendTelegramMessage,
  type ComparisonResult,
} from "./src/index.ts";

async function readDataAndCompare(browser: Browser) {
  let products;
  let messages;

  products = await readPageData(browser);
  messages = await comparator(products);

  return messages;
}

export function checkAndNotify(messages: ComparisonResult): void {
  if (
    messages.added.length ||
    messages.removed.length ||
    messages.changed.length
  ) {
    const tgMessage = `Change!\nTotal products: ${messages.total}\nAdded: ${messages.added.length}\nRemoved: ${messages.removed.length}\nChanged: ${messages.changed.length}`;

    sendTelegramMessage(tgMessage);
  } else {
    console.log("No changes from baseline. Telegram notification skipped.");
  }
}

async function main(): Promise<void> {
  checkIntervalSetup();
  console.log("Shop Checker is started");

  const browser = await chromium.launch({ headless: false });
  console.log("Browser opened");

  try {
    while (true) {
      const messages = await readDataAndCompare(browser);

      checkAndNotify(messages);

      console.log(`Next check in ${CHECK_INTERVAL_MS / 1000} seconds.`);
      await sleep(CHECK_INTERVAL_MS);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error("main error:", error);
  process.exitCode = 1;
});
