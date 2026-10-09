// Let Cloudflare Pages dispatch /api/* to the existing file-based handlers.
// The middleware must stay lightweight so a failing import cannot make Pages
// fail open to the SPA HTML response.
export async function onRequest(context) {
  return context.next();
}
