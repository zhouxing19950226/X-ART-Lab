import part1 from "./apk-part-1.js";
import part2 from "./apk-part-2.js";
import part3 from "./apk-part-3.js";

export async function onRequestGet(){
  const binary=atob(part1+part2+part3);
  const bytes=Uint8Array.from(binary,value=>value.charCodeAt(0));
  return new Response(bytes,{headers:{
    "content-type":"application/vnd.android.package-archive",
    "content-disposition":"attachment; filename=X-ART-Lab-Android.apk",
    "content-length":String(bytes.length),
    "cache-control":"public,max-age=86400"
  }});
}
