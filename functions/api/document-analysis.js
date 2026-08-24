const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const languageNames={zh:"Simplified Chinese",fr:"French",en:"English"};
const deadline=(promise,ms,label)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(Error(`${label} timed out`)),ms))]);
const answerText=result=>String(result?.response||result?.result?.response||result?.choices?.[0]?.message?.content||result?.choices?.[0]?.text||"").trim();
const base64=buffer=>{const bytes=new Uint8Array(buffer),parts=[];for(let start=0;start<bytes.length;start+=32768)parts.push(String.fromCharCode(...bytes.subarray(start,start+32768)));return btoa(parts.join(""))};

export async function onRequestPost({request,env}){
  if(!env.AI)return json({error:"AI service is not configured"},503);
  let form;try{form=await request.formData()}catch{return json({error:"Invalid upload"},400)}
  const file=form.get("file"),question=String(form.get("question")||"").trim().slice(0,1200),language=languageNames[form.get("language")]||languageNames.en;
  if(!(file instanceof File)||!file.size)return json({error:"Missing file"},400);
  if(file.size>10*1024*1024)return json({error:"File is too large"},413);
  const allowed=new Set(["application/pdf","image/jpeg","image/png","image/webp"]);
  if(!allowed.has(file.type))return json({error:"Unsupported file type"},415);
  try{
    const rules=`Respond only in ${language}. Base the analysis on the uploaded material. Separate direct observation, interpretation, and outside context. Never invent artists, works, quotations, citations, dates, or page numbers. If something is unclear, say so. Begin with a direct answer, use short headings, and end with Evidence from the material.`;
    if(file.type.startsWith("image/")){
      const image=`data:${file.type};base64,${base64(await file.arrayBuffer())}`;
      const prompt=`You are X-ART Lab's rigorous visual-art research assistant. ${rules}\n\nUSER QUESTION: ${question||"Analyze the image's composition, visual language, atmosphere, likely artistic context, and useful creative directions."}`;
      const result=await deadline(env.AI.run("@cf/meta/llama-4-scout-17b-16e-instruct",{messages:[{role:"system",content:"Accuracy and careful visual observation are more important than confidence."},{role:"user",content:prompt}],image,max_tokens:700,temperature:.15}),18000,"Image analysis");
      const answer=answerText(result);if(!answer)throw Error("Empty image analysis");
      return json({answer,fileName:file.name,mode:"vision"});
    }
    const converted=await deadline(env.AI.toMarkdown({name:file.name,blob:new Blob([await file.arrayBuffer()],{type:file.type})}),14000,"PDF extraction");
    const result=Array.isArray(converted)?converted[0]:converted;
    if(!result||result.format==="error"||!result.data)throw Error(result?.error||"Document conversion failed");
    const source=String(result.data).slice(0,16000);
    const prompt=`You are X-ART Lab's rigorous document research assistant. ${rules}\n\nUSER QUESTION: ${question||"Summarize the central argument, identify key concepts, explain its relevance to contemporary art, and suggest two research directions."}\n\nFILE: ${file.name}\nEXTRACTED MATERIAL:\n---\n${source}\n---`;
    const output=await deadline(env.AI.run("@cf/zai-org/glm-4.7-flash",{messages:[{role:"system",content:"Accuracy, textual evidence, and explicit uncertainty are more important than confidence."},{role:"user",content:prompt}],max_tokens:720,temperature:.12}),15000,"PDF analysis");
    const answer=answerText(output);
    if(!answer)throw Error("Empty analysis");
    return json({answer,fileName:file.name,mode:"document"});
  }catch(error){return json({error:"Document analysis failed",detail:error.message},error.message?.includes("timed out")?504:502)}
}
