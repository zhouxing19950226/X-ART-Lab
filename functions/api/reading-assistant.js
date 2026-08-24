const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});

const instructions={
  custom:"Answer the user's specific question about the supplied passage. Explain your reasoning clearly and stay grounded in the text.",
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
  const action=instructions[body.action],text=String(body.text||"").trim().slice(0,6000),title=String(body.title||"").slice(0,300),question=String(body.question||"").trim().slice(0,800),language=languageNames[body.language]||languageNames.en;
  if(!action||!text)return json({error:"Missing action or text"},400);
  const prompt=`You are X-ART Lab's rigorous art research and creative practice assistant. ${action}\nRespond in ${language}. Base the answer on the supplied text and clearly mark any interpretive extension. Never fabricate sources or quotations. Use readable headings and short paragraphs.\n\nARTICLE: ${title}\n${question?`\nUSER QUESTION: ${question}\n`:""}\nTEXT:\n${text}`;
  try{
    const inference=env.AI.run("@cf/meta/llama-3.2-3b-instruct",{messages:[{role:"system",content:"You help artists convert critical reading into clear understanding and responsible creative practice."},{role:"user",content:prompt}],max_tokens:520,temperature:.35});
    const result=await Promise.race([inference,new Promise((_,reject)=>setTimeout(()=>reject(Error("AI response timed out")),22000))]);
    const answer=String(result.response||result.result?.response||result.choices?.[0]?.message?.content||result.choices?.[0]?.text||"").trim();
    if(!answer)throw Error("Empty AI response");
    return json({answer});
  }catch(error){return json({error:"AI request failed",detail:error.message},502)}
}
