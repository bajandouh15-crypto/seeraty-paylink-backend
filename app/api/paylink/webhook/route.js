export async function POST(req) {
  try {
    const secret = req.headers.get("x-paylink-secret");
    if (!secret || secret !== process.env.PAYLINK_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const event = await req.json();
    console.log("Paylink Webhook:", event);

    const { merchantOrderNumber, orderStatus, transactionNo } = event;

    if (orderStatus !== "Paid") {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const API_KEY = process.env.BASE44_API_KEY;
    const CV_ENDPOINT = process.env.BASE44_CV_ENDPOINT;

    // 🔍 ابحث عن CV بواسطة orderId
    const searchUrl = `${CV_ENDPOINT}?orderId=${encodeURIComponent(merchantOrderNumber)}`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        api_key: API_KEY,
        "Content-Type": "application/json",
      },
    });

    const list = await searchRes.json();
    const cv = Array.isArray(list) ? list[0] : list?.data?.[0];

    if (!cv?.id) {
      return new Response(JSON.stringify({ ok: false, error: "CV not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ تحديث حالة الدفع
    const updateUrl = `${CV_ENDPOINT}/${cv.id}`;

    await fetch(updateUrl, {
      method: "PUT",
      headers: {
        api_key: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentStatus: "paid",
        transactionNo: transactionNo || "",
      }),
    });

    return new Response(JSON.stringify({ ok: true, updated: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Webhook Error:", e);
    return new Response(JSON.stringify({ ok: false, error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
