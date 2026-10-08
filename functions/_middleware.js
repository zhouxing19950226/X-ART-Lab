import { onRequestGet as getArticles } from "./api/articles.js";

// Keep the public article reader on the D1-backed handler even when Pages' static fallback would otherwise answer /api/articles with index.html.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (context.request.method === "GET" && url.pathname === "/api/articles") {
    return getArticles(context);
  }
  return context.next();
}
