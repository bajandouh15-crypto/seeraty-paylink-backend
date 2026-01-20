export async function POST(req) {
  const secret = req.headers.get("x-paylink-secret");

  if (!secret || secret !== process.env.PAYLINK_WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const event = await req.json();

  // لاحقًا: هنا نحدّث الطلب أنه مدفوع

  return new Response("OK", { status: 200 });
}
