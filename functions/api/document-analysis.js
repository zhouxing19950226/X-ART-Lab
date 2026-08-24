const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const languageNames={zh:"Simplified Chinese",fr:"French",en:"English"};
const deadline=(promise,ms,label)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(Error(`${label} timed out`)),ms))]);
const answerText=result=>String(result?.response||result?.result?.response||result?.choices?.[0]?.message?.content||result?.choices?.[0]?.text||"").trim();

export async function onRequestPost({request,env}){
  if(!env.AI)return json({error:"AI service is not configured"},503);
  let form;try{form=await request.formData()}catch{return json({error:"Invalid upload"},400)}
  const file=form.get("file"),question=String(form.get("question")||"").trim().slice(0,1200),context=String(form.get("context")||"").trim().slice(0,5000),language=languageNames[form.get("language")]||languageNames.en;
  if(!(file instanceof File)||!file.size)return json({error:"Missing file"},400);
  if(file.size>10*1024*1024)return json({error:"File is too large"},413);
  const allowed=new Set(["application/pdf","image/jpeg","image/png","image/webp"]);
  if(!allowed.has(file.type))return json({error:"Unsupported file type"},415);
  try{
    const rules=`Respond only in ${language}. Base the analysis on the uploaded material. Never invent artists, works, quotations, citations, dates, or page numbers. If something is unclear, say so. Use exactly these four short sections, translated into the response language: Core conclusion; Evidence from the material; Deep analysis; Continue exploring. Keep each section concise.`;
    if(file.type.startsWith("image/")){
      const image=Array.from(new Uint8Array(await file.arrayBuffer()));
      const observationResult=await deadline(env.AI.run("@cf/llava-hf/llava-1.5-7b-hf",{image,prompt:"Describe only what is visibly present in this image with forensic accuracy. State the exact dominant colors, background color, shapes, line directions, symmetry, composition, spacing, visible text, and approximate positions. Do not identify a brand, infer meaning, or add anything not visible.",max_tokens:420}),13000,"Visual inspection");
      const observation=String(observationResult?.description||observationResult?.response||observationResult?.result?.description||observationResult?.result?.response||"").trim();
      if(!observation)throw Error("Empty visual inspection");
      const prompt=`You are X-ART Lab's rigorous visual-art research assistant. ${rules}\n\nA dedicated vision model inspected the uploaded image. Treat its report as the only visual evidence.\n\nVISUAL EVIDENCE:\n${observation}\n\nPREVIOUS CONVERSATION:\n${context||"None"}\n\nUSER QUESTION: ${question}`;
      const result=await deadline(env.AI.run("@cf/zai-org/glm-4.7-flash",{messages:[{role:"system",content:"Never contradict the supplied visual evidence. Accuracy is more important than eloquence."},{role:"user",content:prompt}],max_tokens:720,temperature:.08}),13000,"Visual reasoning");
      const answer=answerText(result);if(!answer)throw Error("Empty image analysis");
      return json({answer,fileName:file.name,mode:"vision"});
    }
    const converted=await deadline(env.AI.toMarkdown({name:file.name,blob:new Blob([await file.arrayBuffer()],{type:file.type})}),14000,"PDF extraction");
    const result=Array.isArray(converted)?converted[0]:converted;
    if(!result||result.format==="error"||!result.data)throw Error(result?.error||"Document conversion failed");
    const source=String(result.data).slice(0,16000);
    const prompt=`You are X-ART Lab's rigorous document research assistant. ${rules}\n\nPREVIOUS CONVERSATION:\n${context||"None"}\n\nUSER QUESTION: ${question}\n\nFILE: ${file.name}\nEXTRACTED MATERIAL:\n---\n${source}\n---`;
    const output=await deadline(env.AI.run("@cf/zai-org/glm-4.7-flash",{messages:[{role:"system",content:"Accuracy, textual evidence, and explicit uncertainty are more important than confidence."},{role:"user",content:prompt}],max_tokens:720,temperature:.12}),15000,"PDF analysis");
    const answer=answerText(output);
    if(!answer)throw Error("Empty analysis");
    return json({answer,fileName:file.name,mode:"document"});
  }catch(error){return json({error:"Document analysis failed",detail:error.message},error.message?.includes("timed out")?504:502)}
}
