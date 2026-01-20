export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, amount, customerName, customerEmail, customerMobile } = body;

    if (!orderId || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing orderId or amount" }),
        { status: 400 }
      );
    }

    // ⚠️ مهم: هذا لازم يتغير لعنوان Paylink الصحيح لإنشاء الدفع
    const paylinkResponse = await fetch("https://api.paylink.sa/YOUR_CREATE_ENDPOINT", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-id": process.env.PAYLINK_API_ID,
        "x-api-secret": process.env.PAYLINK_API_SECRET
      },
      body: JSON.stringify({
        orderNumber: orderId,
        amount: amount,
        customerName: customerName || "Customer",
        customerEmail: customerEmail || "test@test.com",
        customerMobile: customerMobile || "966500000000",
        successUrl: `https://seeraty.online/payment-success?orderId=${orderId}`,
        cancelUrl: `https://seeraty.online/payment-failed?orderId=${orderId}`
      })
    });

    const data = await paylinkResponse.json();

    if (!paylinkResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Paylink error", details: data }),
        { status: 400 }
      );
    }

    // بعض حسابات Paylink ترجع: paymentUrl أو url
    const paymentUrl = data.paymentUrl || data.url;

    return new Response(JSON.stringify({ paymentUrl }), { status: 200 });

  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Server error", message: e.message }),
      { status: 500 }
    );
  }
}

