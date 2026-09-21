import process from "process";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium, type Browser, type Page } from "playwright";
import { CHECK_INTERVAL_MS, NO_CHANGE_MESSAGE_INTERVAL_MS } from "./src/variables.ts";
import {
  checkIntervalSetup,
  compareProduct,
  readPageData,
  sendTelegramMessage,
  formatProductMessage,
} from "./src/index.ts";

let lastNoChangeNotificationSentAt: number | null = null;

async function readDataAndCompare(page: Page) {
  let products;
  let comparisonResult;

  products = await readPageData(page);
  comparisonResult = await compareProduct(products);

  const shouldNotifyAboutChanges = comparisonResult.added.length > 0 || comparisonResult.removed.length > 0 || comparisonResult.changed.length > 0;
  const isNoChangeReminderDue = lastNoChangeNotificationSentAt === null ||
    Date.now() - lastNoChangeNotificationSentAt >= NO_CHANGE_MESSAGE_INTERVAL_MS;

  if (!shouldNotifyAboutChanges && !isNoChangeReminderDue) {
    console.log("No changes. Skipping Telegram message until the reminder interval expires.");
    return;
  }

  const telegramMessage = formatProductMessage(products, comparisonResult);

  await sendTelegramMessage(telegramMessage);

  if (!shouldNotifyAboutChanges) {
    lastNoChangeNotificationSentAt = Date.now();
  }
}

async function main(): Promise<void> {
  checkIntervalSetup();
  console.log("Shop Checker is started");

  const browser = await chromium.launch({ headless: false });
  console.log("Browser opened");

  try {
    while (true) {
      const page = await browser.newPage();

      await readDataAndCompare(page);

      console.log(`Next check in ${CHECK_INTERVAL_MS / 1000} seconds.`);

      await sleep(CHECK_INTERVAL_MS);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error("main error:", error);
  process.exitCode = 1;
});
