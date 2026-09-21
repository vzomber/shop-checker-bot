import process from "node:process";
import { TELEGRAM_MAX_MESSAGE_LENGTH } from "./variables.ts";

function trimMessage(text: string): string {
  if (text.length <= TELEGRAM_MAX_MESSAGE_LENGTH) return text;

  const notice = "\n\n[Message truncated]";
  const end = TELEGRAM_MAX_MESSAGE_LENGTH - notice.length;
  // Avoid cutting an emoji between its UTF-16 halves.
  const shortened = text.slice(0, end).replace(/[\uD800-\uDBFF]$/, "");

  return shortened.trimEnd() + notice;
}

function getTelegramApi(token: string) {
  return `https://api.telegram.org/bot${token}/sendMessage`;
}

function createGelegramPostMessage(
  token: string,
  chatId: string,
  text: string,
) {
  return fetch(getTelegramApi(token), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
    signal: AbortSignal.timeout(15_000),
  });
}

export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID?.trim();
  const secondChatId = process.env.CHAT_ID_2?.trim();

  if (!token || !chatId) {
    throw new Error("Set BOT_TOKEN and CHAT_ID in .env.");
  }

  const message = trimMessage(text);
  const chatIds = [...new Set([chatId, secondChatId].filter((id): id is string => Boolean(id)))];
  const errors: Error[] = [];

  for (const destinationId of chatIds) {
    try {
      const response = await createGelegramPostMessage(token, destinationId, message);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = (await response.json()) as { ok: boolean };
      if (!result.ok) {
        throw new Error("Telegram could not send the message.");
      }

      console.log(`Telegram message sent to chat ${destinationId}.`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      errors.push(new Error(`Telegram delivery failed for chat ${destinationId}: ${reason}`));
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, "Some Telegram messages could not be delivered.");
  }
}
