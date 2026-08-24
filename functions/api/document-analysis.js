const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const languageNames={zh:"Simplified Chinese",fr:"French",en:"English"};

export async function onRequestPost({request,env}){
  if(!env.AI)return json({error:"AI service is not configured"},503);
  let form;try{form=await request.formData()}catch{return json({error:"Invalid upload"},400)}
  const file=form.get("file"),question=String(form.get("question")||"").trim().slice(0,1200),language=languageNames[form.get("language")]||languageNames.en;
  if(!(file instanceof File)||!file.size)return json({error:"Missing file"},400);
  if(file.size>10*1024*1024)return json({error:"File is too large"},413);
  const allowed=new Set(["application/pdf","image/jpeg","image/png","image/webp"]);
  if(!allowed.has(file.type))return json({error:"Unsupported file type"},415);
  try{
    const converted=await env.AI.toMarkdown({name:file.name,blob:new Blob([await file.arrayBuffer()],{type:file.type})});
    const result=Array.isArray(converted)?converted[0]:converted;
    if(!result||result.format==="error"||!result.data)throw Error(result?.error||"Document conversion failed");
    const source=String(result.data).slice(0,30000);
    const prompt=`Analyze the uploaded research material with academic care. Respond only in ${language}.\n\nUSER QUESTION: ${question||"Provide a concise overview of the material, identify its central ideas or visual features, explain its relevance to contemporary art, and suggest two useful research directions."}\n\nRULES:\n- Base claims about the document only on the extracted material below.\n- Distinguish observation, interpretation, and outside context.\n- Quote only short phrases that appear exactly in the extracted material.\n- Never invent artists, theorists, artworks, citations, dates, or page numbers.\n- If extraction is incomplete or an image detail is unclear, say so explicitly.\n- Begin with a direct answer, then use short descriptive headings, and end with Evidence from the material.\n\nFILE: ${file.name}\nEXTRACTED MATERIAL:\n---\n${source}\n---`;
    const inference=env.AI.run("@cf/zai-org/glm-4.7-flash",{messages:[{role:"system",content:"You are X-ART Lab's rigorous multimodal research assistant. Accuracy and explicit evidence are more important than confidence."},{role:"user",content:prompt}],max_tokens:1000,temperature:.15});
    const output=await Promise.race([inference,new Promise((_,reject)=>setTimeout(()=>reject(Error("Analysis timed out")),30000))]);
    const answer=String(output.response||output.result?.response||output.choices?.[0]?.message?.content||output.choices?.[0]?.text||"").trim();
    if(!answer)throw Error("Empty analysis");
    return json({answer,fileName:file.name});
  }catch(error){return json({error:"Document analysis failed",detail:error.message},502)}
}
