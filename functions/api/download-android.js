export async function onRequestGet(){
  // Keep the large APK payload out of the Pages Functions startup path.
  // It is loaded only when a user explicitly requests the Android download.
  const [{ default: part1 }, { default: part2 }, { default: part3 }] = await Promise.all([
    import("./apk-part-1.js"),
    import("./apk-part-2.js"),
    import("./apk-part-3.js"),
  ]);
  const parts=[part1,part2,part3];
  const stream=new ReadableStream({start(controller){for(const part of parts){const binary=atob(part),bytes=new Uint8Array(binary.length);for(let index=0;index<binary.length;index++)bytes[index]=binary.charCodeAt(index);controller.enqueue(bytes)}controller.close()}});
  return new Response(stream,{headers:{
    "content-type":"application/vnd.android.package-archive",
    "content-disposition":"attachment; filename=X-ART-Lab-Android.apk",
    "content-length":"978858",
    "cache-control":"public,max-age=86400"
  }});
}
