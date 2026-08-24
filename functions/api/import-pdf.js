const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const authorized=(request,env)=>Boolean(env.ADMIN_TOKEN)&&request.headers.get("Authorization")===`Bearer ${env.ADMIN_TOKEN}`;
const names={zh:"chinese",fr:"french",en:"english"};
const detect=text=>/[\u3400-\u9fff]/.test(text)?"zh":/[àâçéèêëîïôûùüÿœæ]/i.test(text)?"fr":"en";
const cleanMarkdown=value=>String(value||"").replace(/\r\n?/g,"\n").replace(/\n[ \t]+\n/g,"\n\n").replace(/\n{3,}/g,"\n\n").replace(/^\s*Page \d+\s*$/gim,"").trim();
const textOf=result=>String(result?.response||result?.result?.response||result?.choices?.[0]?.message?.content||"").trim();

async function translate(ai,text,source,target){
  if(!text.trim()||source===target)return text;
  const blocks=text.split(/(\n\n+)/),translated=[];
  for(let start=0;start<blocks.length;start+=12){
    const slice=blocks.slice(start,start+12),tokens=[];
    const protectedText=slice.map(part=>/^\n+$/.test(part)?`XARTBREAK${tokens.push(part)-1}END`:part).join("");
    const result=await ai.run("@cf/meta/m2m100-1.2b",{text:protectedText,source_lang:names[source],target_lang:names[target]});
    translated.push(String(result.translated_text||result.translation||"").replace(/XARTBREAK\s*(\d+)\s*END/gi,(_,i)=>tokens[Number(i)]||"\n\n"));
  }
  return cleanMarkdown(translated.join(""));
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
    const targets=["zh","fr","en"],output={source,fileName:file.name,fileSize:file.size};
    await Promise.all(targets.map(async target=>{
      output[target+"_title"]=await translate(env.AI,title,source,target);
      output[target+"_summary"]=await translate(env.AI,summary,source,target);
      output[target+"_content"]=await translate(env.AI,content,source,target);
    }));
    return json(output);
  }catch(error){return json({error:"PDF 提取或翻译失败",detail:error.message},502)}
}
