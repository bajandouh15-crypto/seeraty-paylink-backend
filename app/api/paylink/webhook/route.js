export async function POST(req) {
  const secret = req.headers.get("x-paylink-secret");

  if (!secret || secret !== process.env.PAYLINK_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const event = await req.json();

  console.log("Paylink Webhook:", event);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
