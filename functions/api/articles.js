const columns=["n","tag","minutes","locked","published","language","cover_image","zh_title","zh_summary","zh_content","fr_title","fr_summary","fr_content","en_title","en_summary","en_content"];

const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const authorized=(request,env)=>Boolean(env.ADMIN_TOKEN)&&request.headers.get("Authorization")===`Bearer ${env.ADMIN_TOKEN}`;
const languageNames={zh:"chinese",fr:"french",en:"english"};

async function translatePlain(ai,text,source,target){
  if(!text.trim())return "";
  const chunks=[];
  for(let start=0;start<text.length;start+=1400)chunks.push(text.slice(start,start+1400));
  const translated=[];
  for(const chunk of chunks){
    const result=await ai.run("@cf/meta/m2m100-1.2b",{text:chunk,source_lang:languageNames[source],target_lang:languageNames[target]});
    translated.push(result.translated_text||result.translation||"");
  }
  return translated.join("");
}

async function translateRich(ai,text,source,target){
  const parts=text.split(/(!\[[^\]]*\]\([^)]+\))/g);
  const output=[];
  for(const part of parts)output.push(/^!\[[^\]]*\]\([^)]+\)$/.test(part)?part:await translatePlain(ai,part,source,target));
  return output.join("");
}

async function translateArticle(ai,body){
  const source=body.language;
  for(const target of ["zh","fr","en"].filter(code=>code!==source)){
    body[target+"_title"]=await translatePlain(ai,body[source+"_title"],source,target);
    body[target+"_summary"]=await translatePlain(ai,body[source+"_summary"],source,target);
    body[target+"_content"]=await translateRich(ai,body[source+"_content"],source,target);
  }
  body.language="all";
}

async function initialize(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    n TEXT NOT NULL, tag TEXT NOT NULL, minutes INTEGER NOT NULL DEFAULT 10,
    locked INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1,
    language TEXT NOT NULL DEFAULT 'all', cover_image TEXT NOT NULL DEFAULT '',
    zh_title TEXT NOT NULL, zh_summary TEXT NOT NULL, zh_content TEXT NOT NULL,
    fr_title TEXT NOT NULL, fr_summary TEXT NOT NULL, fr_content TEXT NOT NULL,
    en_title TEXT NOT NULL, en_summary TEXT NOT NULL, en_content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  for(const statement of [
    "ALTER TABLE articles ADD COLUMN language TEXT NOT NULL DEFAULT 'all'",
    "ALTER TABLE articles ADD COLUMN cover_image TEXT NOT NULL DEFAULT ''"
  ])try{await db.prepare(statement).run()}catch{}
}

export async function onRequestGet({request,env}){
  if(!env.DB)return json({error:"数据库尚未绑定"},503);
  await initialize(env.DB);
  const all=new URL(request.url).searchParams.get("all")==="1";
  if(all&&!authorized(request,env))return json({error:"管理员登录已失效"},401);
  const query=all?"SELECT * FROM articles ORDER BY CAST(n AS INTEGER) DESC, id DESC":"SELECT * FROM articles WHERE published=1 ORDER BY CAST(n AS INTEGER) DESC, id DESC";
  const {results}=await env.DB.prepare(query).all();
  return json({articles:results.map(x=>({...x,locked:Boolean(x.locked),published:Boolean(x.published)}))});
}

export async function onRequestPost({request,env}){
  if(!authorized(request,env))return json({error:"管理员密码不正确"},401);
  if(!env.DB)return json({error:"数据库尚未绑定"},503);
  await initialize(env.DB);
  const body=await request.json();
  body.language=body.language||"zh";
  body.cover_image=body.cover_image||"";
  for(const code of ["zh","fr","en"])for(const field of ["title","summary","content"])body[code+"_"+field]=body[code+"_"+field]||"";
  if(!["zh","fr","en","all"].includes(body.language))return json({error:"不支持的文章语言"},400);
  for(const field of ["title","summary","content"])if(!body[body.language+"_"+field]&&body.language!=="all")return json({error:"缺少字段："+field},400);
  if(body.language!=="all"){
    if(!env.AI)return json({error:"自动翻译服务尚未绑定"},503);
    try{await translateArticle(env.AI,body)}catch(error){return json({error:"自动翻译失败，请稍后重试",detail:error.message},502)}
  }
  for(const key of columns)if(body[key]===undefined||body[key]===null)return json({error:`缺少字段：${key}`},400);
  const values=columns.map(key=>["locked","published"].includes(key)?(body[key]?1:0):body[key]);
  if(body.id){
    const set=columns.map(key=>`${key}=?`).join(",");
    await env.DB.prepare(`UPDATE articles SET ${set},updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(...values,body.id).run();
    return json({ok:true,id:body.id});
  }
  const marks=columns.map(()=>"?").join(",");
  const result=await env.DB.prepare(`INSERT INTO articles (${columns.join(",")}) VALUES (${marks})`).bind(...values).run();
  return json({ok:true,id:result.meta.last_row_id},201);
}

export async function onRequestDelete({request,env}){
  if(!authorized(request,env))return json({error:"管理员密码不正确"},401);
  if(!env.DB)return json({error:"数据库尚未绑定"},503);
  await initialize(env.DB);
  const id=Number(new URL(request.url).searchParams.get("id"));
  if(!id)return json({error:"缺少文章 ID"},400);
  await env.DB.prepare("DELETE FROM articles WHERE id=?").bind(id).run();
  return json({ok:true});
}
