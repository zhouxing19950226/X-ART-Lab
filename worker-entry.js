import { onRequestGet as getArchives, onRequestPost as postArchives, onRequestDelete as deleteArchives } from "./functions/api/archives.js";
import { onRequestGet as getArticles, onRequestPost as postArticles, onRequestDelete as deleteArticles } from "./functions/api/articles.js";
import { onRequestGet as getCategories, onRequestPost as postCategories, onRequestDelete as deleteCategories } from "./functions/api/categories.js";
import { onRequestGet as getCommunity, onRequestPost as postCommunity } from "./functions/api/community.js";
import { onRequestGet as getCommunityAdmin, onRequestPost as postCommunityAdmin } from "./functions/api/community-admin.js";
import { onRequestPost as postCheckout } from "./functions/api/create-checkout-session.js";
import { onRequestPost as postDocumentAnalysis } from "./functions/api/document-analysis.js";
import { onRequestGet as getAndroid } from "./functions/api/download-android.js";
import { onRequestPost as postAudio } from "./functions/api/generate-audio.js";
import { onRequestPost as postImportPdf } from "./functions/api/import-pdf.js";
import { onRequestGet as getMembers, onRequestPost as postMembers, onRequestDelete as deleteMembers } from "./functions/api/members.js";
import { onRequestPost as postReadingAssistant } from "./functions/api/reading-assistant.js";
import { onRequestGet as getSiteLogo } from "./functions/api/site-logo.js";
import { onRequestGet as getSystemStatus } from "./functions/api/system-status.js";
import { onRequestGet as getUsers } from "./functions/api/users.js";
import { onRequestGet as getCheckout } from "./functions/api/verify-checkout-session.js";

const routes = new Map([
  ["GET /api/archives", getArchives],
  ["POST /api/archives", postArchives],
  ["DELETE /api/archives", deleteArchives],
  ["GET /api/articles", getArticles],
  ["POST /api/articles", postArticles],
  ["DELETE /api/articles", deleteArticles],
  ["GET /api/categories", getCategories],
  ["POST /api/categories", postCategories],
  ["DELETE /api/categories", deleteCategories],
  ["GET /api/community", getCommunity],
  ["POST /api/community", postCommunity],
  ["GET /api/community-admin", getCommunityAdmin],
  ["POST /api/community-admin", postCommunityAdmin],
  ["POST /api/create-checkout-session", postCheckout],
  ["POST /api/document-analysis", postDocumentAnalysis],
  ["GET /api/download-android", getAndroid],
  ["POST /api/generate-audio", postAudio],
  ["POST /api/import-pdf", postImportPdf],
  ["GET /api/members", getMembers],
  ["POST /api/members", postMembers],
  ["DELETE /api/members", deleteMembers],
  ["POST /api/reading-assistant", postReadingAssistant],
  ["GET /api/site-logo", getSiteLogo],
  ["GET /api/system-status", getSystemStatus],
  ["GET /api/users", getUsers],
  ["GET /api/verify-checkout-session", getCheckout],
]);

const contextFor = (request, env, workerContext) => ({
  request,
  env,
  params: {},
  data: {},
  next: () => env.ASSETS.fetch(request),
  waitUntil: promise => workerContext.waitUntil(promise),
  passThroughOnException() {},
});

export default {
  async fetch(request, env, workerContext) {
    const url = new URL(request.url);
    const handler = routes.get(request.method + " " + url.pathname);
    if (handler) return handler(contextFor(request, env, workerContext));
    return env.ASSETS.fetch(request);
  },
};
// Keep the direct worker entry as the Pages deployment source of truth.
