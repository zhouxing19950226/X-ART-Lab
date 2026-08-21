export async function onRequestGet(){
  const response=await fetch("https://zhou-xing.com/logo.png",{cf:{cacheTtl:86400,cacheEverything:true}});
  if(!response.ok)return new Response("Logo unavailable",{status:502});
  const headers=new Headers(response.headers);
  headers.set("Cache-Control","public, max-age=86400");
  return new Response(response.body,{status:200,headers});
}
