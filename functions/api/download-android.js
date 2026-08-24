import part1 from "./apk-part-1.js";
import part2 from "./apk-part-2.js";
import part3 from "./apk-part-3.js";

export async function onRequestGet(){
  const parts=[part1,part2,part3];
  const stream=new ReadableStream({start(controller){for(const part of parts){const binary=atob(part),bytes=new Uint8Array(binary.length);for(let index=0;index<binary.length;index++)bytes[index]=binary.charCodeAt(index);controller.enqueue(bytes)}controller.close()}});
  return new Response(stream,{headers:{
    "content-type":"application/vnd.android.package-archive",
    "content-disposition":"attachment; filename=X-ART-Lab-Android.apk",
    "content-length":"978858",
    "cache-control":"public,max-age=86400"
  }});
}
