const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const authorized=(request,env)=>Boolean(env.ADMIN_TOKEN)&&request.headers.get("Authorization")===`Bearer ${env.ADMIN_TOKEN}`;
const names={zh:"chinese",fr:"french",en:"english"};
const detect=text=>/[\u3400-\u9fff]/.test(text)?"zh":/[àâçéèêëîïôûùüÿœæ]/i.test(text)?"fr":"en";
const cleanMarkdown=value=>String(value||"").replace(/\r\n?/g,"\n").replace(/\n[ \t]+\n/g,"\n\n").replace(/\n{3,}/g,"\n\n").replace(/^\s*Page \d+\s*$/gim,"").trim();
const textOf=result=>String(result?.response||result?.result?.response||result?.choices?.[0]?.message?.content||"").trim();

async function translate(ai,text,source,target){
  if(!text.trim()||source===target)return text;
  const paragraphs=text.split(/\n\n+/).filter(Boolean),chunks=[];
  let chunk="";
  for(const paragraph of paragraphs){
    const next=chunk?`${chunk}\nXARTPARA\n${paragraph}`:paragraph;
    if(next.length>4800&&chunk){chunks.push(chunk);chunk=paragraph}else chunk=next;
  }
  if(chunk)chunks.push(chunk);
  const translated=new Array(chunks.length);
  let cursor=0;
  const worker=async()=>{while(cursor<chunks.length){const index=cursor++,value=chunks[index];let answer="";for(let attempt=0;attempt<2&&!answer;attempt++){try{const result=await ai.run("@cf/meta/m2m100-1.2b",{text:value,source_lang:names[source],target_lang:names[target]});answer=String(result.translated_text||result.translation||"").trim()}catch(error){if(attempt)throw error}}if(!answer)throw Error(`Empty ${target} translation at part ${index+1}`);translated[index]=answer.replace(/XART\s*PARA/gi,"\n\n")}};
  await Promise.all(Array.from({length:Math.min(2,chunks.length)},worker));
  return cleanMarkdown(translated.join("\n\n"));
}

export async function onRequestPost({request,env}){
  if(!authorized(request,env))return json({error:"管理员登录已失效"},401);
  if(!env.AI)return json({error:"AI 服务尚未绑定"},503);
  let form;try{form=await request.formData()}catch{return json({error:"上传格式无效"},400)}
  const file=form.get("file");
  if(!(file instanceof File)||file.type!=="application/pdf")return json({error:"请选择 PDF 文件"},400);
  if(file.size>10*1024*1024)return json({error:"PDF 不能超过 10MB"},413);
  try{
    const converted=await env.AI.toMarkdown({name:file.name,blob:new Blob([await file.arrayBuffer()],{type:"application/pdf"})});
    const result=Array.isArray(converted)?converted[0]:converted;
    if(!result?.data||result.format==="error")throw Error(result?.error||"PDF extraction failed");
    const content=cleanMarkdown(result.data).slice(0,70000),source=detect(content),firstHeading=content.match(/^#{1,2}\s+(.+)$/m)?.[1]?.trim(),fallback=file.name.replace(/\.pdf$/i,"").replace(/[-_]+/g," ");
    const metaPrompt=`Read this ${names[source]} academic text. Return strict JSON only with keys title and summary. Preserve the real title when visible. Summary must be accurate, neutral, and 2-3 sentences.\n\n${content.slice(0,9000)}`;
    const metaResult=await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast",{messages:[{role:"user",content:metaPrompt}],max_tokens:420,temperature:.05});
    let meta={};try{meta=JSON.parse(textOf(metaResult).replace(/^```json\s*|\s*```$/g,""))}catch{}
    const title=String(meta.title||firstHeading||fallback).replace(/^#+\s*/,"").slice(0,260),summary=String(meta.summary||content.replace(/[#>*_\[\]()]/g,"").slice(0,420)).trim();
    const targets=["zh","fr","en"],output={source,fileName:file.name,fileSize:file.size,translationErrors:{}};
    for(const target of targets)if(target===source){output[target+"_title"]=title;output[target+"_summary"]=summary;output[target+"_content"]=content}
    await Promise.all(targets.filter(target=>target!==source).map(async target=>{for(let attempt=0;attempt<2;attempt++)try{const[translatedTitle,translatedSummary,translatedContent]=await Promise.all([translate(env.AI,title,source,target),translate(env.AI,summary,source,target),translate(env.AI,content,source,target)]);if(!translatedTitle||translatedContent.length<Math.min(80,content.length/4))throw Error("Incomplete translation");output[target+"_title"]=translatedTitle;output[target+"_summary"]=translatedSummary;output[target+"_content"]=translatedContent;delete output.translationErrors[target];break}catch(error){output[target+"_title"]="";output[target+"_summary"]="";output[target+"_content"]="";output.translationErrors[target]=error.message;if(attempt===0)await new Promise(resolve=>setTimeout(resolve,350))}}));
    if(Object.keys(output.translationErrors).length)return json({error:"有语言翻译未完成，系统已自动重试，请再次上传",detail:output.translationErrors},502);
    return json(output);
  }catch(error){return json({error:"PDF 提取或翻译失败",detail:error.message},502)}
}
