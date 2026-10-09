// Let Cloudflare Pages dispatch /api/* to the existing file-based handlers.
// Keep the middleware lightweight and await the next handler explicitly.
export async function onRequest(context) {
  return await context.next();
}
