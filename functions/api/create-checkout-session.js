const PLANS = {
  monthly: { amount: 2800, interval: "month", name: "X-ART Lab. 月度会员" },
  yearly: { amount: 29800, interval: "year", name: "X-ART Lab. 年度会员" },
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: "Stripe 测试密钥尚未配置" }, 503);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "请求格式无效" }, 400);
  }

  const plan = PLANS[payload.plan];
  if (!plan) return json({ error: "请选择有效的订阅方案" }, 400);

  const origin = new URL(request.url).origin;
  const form = new URLSearchParams({
    mode: "subscription",
    locale: "auto",
    billing_address_collection: "required",
    "tax_id_collection[enabled]": "true",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "cny",
    "line_items[0][price_data][unit_amount]": String(plan.amount),
    "line_items[0][price_data][product_data][name]": plan.name,
    "line_items[0][price_data][recurring][interval]": plan.interval,
    "subscription_data[metadata][xart_plan]": payload.plan,
    success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?checkout=cancelled`,
  });

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  const session = await stripeResponse.json();

  if (!stripeResponse.ok) {
    return json({ error: session.error?.message || "Stripe 创建支付会话失败" }, 502);
  }
  return json({ url: session.url });
}
