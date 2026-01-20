export async function POST(req) {
  const secret = req.headers.get("x-paylink-secret");

  if (!secret || secret !== process.env.PAYLINK_WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const event = await req.json();

  // هنا مستقبلاً:
  // - تقرأ orderNumber
  // - تتحقق من status = paid / success
  // - تحدث الطلب في قاعدة البيانات

  console.log("Paylink Webhook:", event);

  return new Response("OK", { status: 200 });
}
