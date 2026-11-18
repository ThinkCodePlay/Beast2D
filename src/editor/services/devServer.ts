const DEV_PING = "/__beast2d/dev";
const SAVE_URL = "/__beast2d/save-cart";

export async function pingDevServer(): Promise<boolean> {
  const ping = await fetch(DEV_PING, { method: "GET" }).catch(() => null);
  return ping?.ok === true;
}

export async function saveCartToDevServer(body: {
  source: string;
  sfx: unknown;
}): Promise<boolean> {
  const response = await fetch(SAVE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.ok;
}
