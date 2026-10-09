import * as archives from "./api/archives.js";
import * as articles from "./api/articles.js";
import * as categories from "./api/categories.js";
import * as community from "./api/community.js";
import * as communityAdmin from "./api/community-admin.js";
import * as createCheckoutSession from "./api/create-checkout-session.js";
import * as documentAnalysis from "./api/document-analysis.js";
import * as downloadAndroid from "./api/download-android.js";
import * as generateAudio from "./api/generate-audio.js";
import * as importPdf from "./api/import-pdf.js";
import * as members from "./api/members.js";
import * as ping from "./api/ping.js";
import * as readingAssistant from "./api/reading-assistant.js";
import * as siteLogo from "./api/site-logo.js";
import * as systemStatus from "./api/system-status.js";
import * as users from "./api/users.js";
import * as verifyCheckoutSession from "./api/verify-checkout-session.js";

// Pages' static SPA fallback can answer /api/* with index.html before the
// generated route is reached. Dispatch existing API handlers from the root
// middleware so login, articles, and member management keep their data path.
const API_MODULES = {
  "/api/archives": archives,
  "/api/articles": articles,
  "/api/categories": categories,
  "/api/community": community,
  "/api/community-admin": communityAdmin,
  "/api/create-checkout-session": createCheckoutSession,
  "/api/document-analysis": documentAnalysis,
  "/api/download-android": downloadAndroid,
  "/api/generate-audio": generateAudio,
  "/api/import-pdf": importPdf,
  "/api/members": members,
  "/api/ping": ping,
  "/api/reading-assistant": readingAssistant,
  "/api/site-logo": siteLogo,
  "/api/system-status": systemStatus,
  "/api/users": users,
  "/api/verify-checkout-session": verifyCheckoutSession,
};

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const module = API_MODULES[url.pathname];
  if (module) {
    const method = context.request.method.toLowerCase();
    const handler = module[`onRequest${method[0].toUpperCase()}${method.slice(1)}`];
    if (handler) return handler(context);
  }
  return context.next();
}
