const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});

const instructions={
  simple:"Explain the passage in plain language without flattening its key concepts. Give one concrete art-world example.",
  summary:"Summarize the central claim, supporting logic, and creative implication in concise bullet points.",
  theory:"Connect the passage to two or three relevant theorists. Explain agreements, tensions, and why each connection matters. Do not invent quotations.",
  statement:"Transform the passage into a concise first-person artist statement. Keep it specific, credible, and free of inflated art jargon.",
  method:"Turn the passage into a practical creative method: intention, materials or medium, process steps, constraints, and reflection questions."
};
const languageNames={zh:"Simplified Chinese",fr:"French",en:"English"};

export async function onRequestPost({request,env}){
  if(!env.AI)return json({error:"AI service is not configured"},503);
  let body;try{body=await request.json()}catch{return json({error:"Invalid request"},400)}
  const action=instructions[body.action],text=String(body.text||"").trim().slice(0,12000),title=String(body.title||"").slice(0,300),language=languageNames[body.language]||languageNames.en;
  if(!action||!text)return json({error:"Missing action or text"},400);
  const prompt=`You are X-ART Lab's rigorous art research and creative practice assistant. ${action}\nRespond in ${language}. Base the answer on the supplied text and clearly mark any interpretive extension. Never fabricate sources or quotations. Use readable headings and short paragraphs.\n\nARTICLE: ${title}\n\nTEXT:\n${text}`;
  try{
    const result=await env.AI.run("@cf/meta/llama-3.1-8b-instruct",{messages:[{role:"system",content:"You help artists convert critical reading into clear understanding and responsible creative practice."},{role:"user",content:prompt}],max_tokens:900,temperature:.45});
    const answer=String(result.response||result.result?.response||"").trim();
    if(!answer)throw Error("Empty AI response");
    return json({answer});
  }catch(error){return json({error:"AI request failed",detail:error.message},502)}
}
