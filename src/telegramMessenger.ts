import process from "node:process";

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
  const chatId = process.env.CHAT_ID;

  if (!token || !chatId) {
    throw new Error("Set BOT_TOKEN and CHAT_ID in .env.");
  }

  const response = await createGelegramPostMessage(token, chatId, text);

  if (!response.ok) {
    throw new Error(`Telegram request failed: HTTP ${response.status}`);
  }

  const result = (await response.json()) as { ok: boolean };
  if (!result.ok) {
    throw new Error("Telegram could not send the message.");
  }

  console.log("Telegram message sent.");
}
