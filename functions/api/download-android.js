const loadPart = async (request, path) => {
  const response = await fetch(new URL(path, request.url));
  if (!response.ok) throw new Error("Android payload is unavailable");
  return response.text();
};

export async function onRequestGet({ request }) {
  const parts = await Promise.all([
    loadPart(request, "/part-1.txt"),
    loadPart(request, "/part-2.txt"),
    loadPart(request, "/part-3.txt"),
  ]);
  const stream = new ReadableStream({
    start(controller) {
      for (const part of parts) {
        const binary = atob(part);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
        controller.enqueue(bytes);
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: {
    "content-type": "application/vnd.android.package-archive",
    "content-disposition": "attachment; filename=X-ART-Lab-Android.apk",
    "content-length": "978858",
    "cache-control": "public,max-age=86400",
  }});
}
