const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const languageNames={zh:"zh",fr:"fr",en:"en"};

async function audioBytes(result){
  if(result instanceof ReadableStream)return new Uint8Array(await new Response(result).arrayBuffer());
  if(result instanceof ArrayBuffer)return new Uint8Array(result);
  if(ArrayBuffer.isView(result))return new Uint8Array(result.buffer,result.byteOffset,result.byteLength);
  const encoded=result?.audio||result?.result?.audio;
  if(typeof encoded==="string"){const binary=atob(encoded),bytes=new Uint8Array(binary.length);for(let index=0;index<binary.length;index++)bytes[index]=binary.charCodeAt(index);return bytes}
  throw Error("Unsupported audio response");
}

export async function onRequestPost({request,env}){
  if(!env.AI)return json({error:"Audio service is not configured"},503);
  let body;try{body=await request.json()}catch{return json({error:"Invalid request"},400)}
  const text=String(body.text||"").trim().slice(0,9000),language=languageNames[body.language]||"en";
  if(!text)return json({error:"Missing text"},400);
  const chunks=text.match(/[^。！？.!?]{1,900}[。！？.!?]?/g)||[text],parts=[];
  try{
    for(const chunk of chunks)parts.push(await audioBytes(await env.AI.run("@cf/myshell-ai/melotts",{prompt:chunk,lang:language})));
    const audio=await new Blob(parts,{type:"audio/mpeg"}).arrayBuffer();
    return new Response(audio,{headers:{"content-type":"audio/mpeg","content-disposition":"attachment; filename=article.mp3","cache-control":"no-store"}});
  }catch(error){return json({error:"Audio generation failed",detail:error.message},502)}
}
