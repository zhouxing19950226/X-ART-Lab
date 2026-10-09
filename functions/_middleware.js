// Let Cloudflare Pages dispatch /api/* to the existing file-based handlers.
// Keep the middleware lightweight and await the next handler explicitly.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.pathname === "/api/ping" && context.request.method === "GET") {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  }
  return await context.next();
}
