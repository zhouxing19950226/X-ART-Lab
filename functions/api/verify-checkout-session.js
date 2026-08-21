const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
export async function onRequestGet({request,env}){
  if(!env.STRIPE_SECRET_KEY)return json({active:false,error:"Stripe 尚未配置"},503);
  const sessionId=new URL(request.url).searchParams.get("session_id");
  if(!sessionId||!sessionId.startsWith("cs_"))return json({active:false},400);
  const stripeResponse=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=subscription`,{headers:{Authorization:`Bearer ${env.STRIPE_SECRET_KEY}`}});
  const session=await stripeResponse.json();if(!stripeResponse.ok)return json({active:false},404);
  const subscription=session.subscription;
  const active=session.status==="complete"&&subscription&&["active","trialing"].includes(subscription.status);
  return json({active:Boolean(active),plan:subscription?.metadata?.xart_plan||null,cancelAtPeriodEnd:Boolean(subscription?.cancel_at_period_end),currentPeriodEnd:subscription?.current_period_end||null});
}
