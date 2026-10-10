export async function onRequest(context) {
  try {
    return await context.next();
  } catch (error) {
    const detail = String(error?.stack || error?.message || error || "Unknown Pages Function error");
    return new Response(JSON.stringify({ error: "Pages Function failed", detail }), {
      status: 500,
      headers: {
        "content-type": "application/json; charset=UTF-8",
        "cache-control": "no-store",
      },
    });
  }
}
