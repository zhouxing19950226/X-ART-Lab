const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const languageNames={zh:"Simplified Chinese",fr:"French",en:"English"};
const deadline=(promise,ms,label)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(Error(`${label} timed out`)),ms))]);
const answerText=result=>String(result?.response||result?.result?.response||result?.choices?.[0]?.message?.content||result?.choices?.[0]?.text||"").trim();
const evidenceWindow=(text,limit=60000)=>{
  const source=String(text||"").replace(/\u0000/g,"").trim();
  if(source.length<=limit)return source;
  const part=Math.floor(limit/3),middle=Math.max(0,Math.floor(source.length/2-part/2));
  return `${source.slice(0,part)}\n\n[... middle of document ...]\n\n${source.slice(middle,middle+part)}\n\n[... end of document ...]\n\n${source.slice(-part)}`;
};

export async function onRequestPost({request,env}){
  if(!env.AI)return json({error:"AI service is not configured"},503);
  let form;try{form=await request.formData()}catch{return json({error:"Invalid upload"},400)}
  const file=form.get("file"),question=String(form.get("question")||"").trim().slice(0,1200),context=String(form.get("context")||"").trim().slice(0,5000),language=languageNames[form.get("language")]||languageNames.en;
  if(!(file instanceof File)||!file.size)return json({error:"Missing file"},400);
  if(file.size>10*1024*1024)return json({error:"File is too large"},413);
  const allowed=new Set(["application/pdf","image/jpeg","image/png","image/webp"]);
  if(!allowed.has(file.type))return json({error:"Unsupported file type"},415);
  try{
    const rules=`Respond only in ${language}. Answer the user's actual question before adding interpretation. Base every factual claim on the uploaded material. Never invent artists, works, quotations, citations, dates, visual details, or page numbers. Clearly separate observation, inference, and uncertainty. Use exactly these four sections, translated into the response language: Core conclusion; Evidence from the material; Deep analysis; Continue exploring. In Evidence from the material, provide 2-5 concrete details or short excerpts from the source. If the source does not support a claim, say that explicitly. Be rigorous and specific rather than generic.`;
    if(file.type.startsWith("image/")){
      const bytes=new Uint8Array(await file.arrayBuffer());
      let binary="";for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
      const image=`data:${file.type};base64,${btoa(binary)}`;
      const prompt=`You are X-ART Lab's rigorous visual-art research assistant. Inspect the original image yourself at pixel level before reasoning. ${rules}\n\nPREVIOUS CONVERSATION:\n${context||"None"}\n\nUSER QUESTION: ${question}`;
      const result=await deadline(env.AI.run("@cf/meta/llama-4-scout-17b-16e-instruct",{messages:[{role:"system",content:"Accuracy is more important than eloquence. Do not identify an artist or work unless visible evidence supports it."},{role:"user",content:prompt}],image,max_tokens:1200,temperature:.05}),30000,"Visual analysis");
      const answer=answerText(result);if(!answer)throw Error("Empty image analysis");
      return json({answer,fileName:file.name,mode:"vision"});
    }
    const converted=await deadline(env.AI.toMarkdown({name:file.name,blob:new Blob([await file.arrayBuffer()],{type:file.type})}),14000,"PDF extraction");
    const result=Array.isArray(converted)?converted[0]:converted;
    if(!result||result.format==="error"||!result.data)throw Error(result?.error||"Document conversion failed");
    const source=evidenceWindow(result.data);
    const prompt=`You are X-ART Lab's rigorous document research assistant. Read the supplied excerpts closely before answering. ${rules}\n\nPREVIOUS CONVERSATION:\n${context||"None"}\n\nUSER QUESTION: ${question}\n\nFILE: ${file.name}\nEXTRACTED MATERIAL (beginning, middle, and end when the document is long):\n---\n${source}\n---`;
    const output=await deadline(env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast",{messages:[{role:"system",content:"Accuracy, close reading, textual evidence, and explicit uncertainty are more important than confidence. Do not use outside knowledge unless the user explicitly asks for it, and label it when used."},{role:"user",content:prompt}],max_tokens:1400,temperature:.08}),35000,"PDF analysis");
    const answer=answerText(output);
    if(!answer)throw Error("Empty analysis");
    return json({answer,fileName:file.name,mode:"document"});
  }catch(error){return json({error:"Document analysis failed",detail:error.message},error.message?.includes("timed out")?504:502)}
}
