export async function POST(req) {
  const secret = req.headers.get("x-paylink-secret");

  // 1) Verify webhook secret
  if (!secret || secret !== process.env.PAYLINK_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2) Read payload
  const event = await req.json();
  console.log("Paylink Webhook:", event);

  // 3) Only handle paid
  if (event.orderStatus !== "Paid") {
    return new Response(JSON.stringify({ ok: true, ignored: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 4) The CV orderId MUST be here
  const orderId = event.merchantOrderNumber; // لازم يكون CV_xxx
  const transactionNo = event.transactionNo;

  if (!orderId) {
    return new Response(JSON.stringify({ ok: false, error: "Missing merchantOrderNumber" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 5) Update Base44 entity
  const base44Res = await fetch(`https://app.base44.com/api/entities/CV/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "api_key": process.env.BASE44_API_KEY,
    },
    body: JSON.stringify({
      paymentStatus: "paid",
      transactionNo: transactionNo || null,
    }),
  });

  const base44Data = await base44Res.json();

  return new Response(JSON.stringify({ ok: true, updated: base44Data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
