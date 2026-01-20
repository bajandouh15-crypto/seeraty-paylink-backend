export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, amount, customerName, customerEmail, customerMobile } = body;

    if (!orderId || !amount) {
      return new Response(JSON.stringify({ error: "Missing orderId or amount" }), { status: 400 });
    }

    const res = await fetch("https://api.paylink.sa/your-create-endpoint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-id": process.env.PAYLINK_API_ID,
        "x-api-secret": process.env.PAYLINK_API_SECRET
      },
      body: JSON.stringify({
        orderNumber: orderId,
        amount,
        customerName,
        customerEmail,
        customerMobile,
        successUrl: `https://seeraty.online/payment-success?orderId=${orderId}`,
        cancelUrl: `https://seeraty.online/payment-failed?orderId=${orderId}`
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Paylink error", details: data }), { status: 400 });
    }

    return new Response(JSON.stringify({ paymentUrl: data.paymentUrl }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
