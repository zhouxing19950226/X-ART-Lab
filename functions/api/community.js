const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const clean=value=>String(value||"").replace(/[<>]/g,"").trim();

async function initialize(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS community_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'zh',
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

export async function onRequestGet({env}){
  if(!env.DB)return json({error:"Community database is not configured"},503);
  await initialize(env.DB);
  const {results}=await env.DB.prepare("SELECT * FROM community_posts ORDER BY created_at DESC, id DESC LIMIT 200").all();
  const replies=new Map(),posts=[];
  for(const post of results){if(post.parent_id){if(!replies.has(post.parent_id))replies.set(post.parent_id,[]);replies.get(post.parent_id).push(post)}else posts.push(post)}
  return json({posts:posts.slice(0,60).map(post=>({...post,replies:(replies.get(post.id)||[]).reverse()}))});
}

export async function onRequestPost({request,env}){
  if(!env.DB)return json({error:"Community database is not configured"},503);
  await initialize(env.DB);
  let body;try{body=await request.json()}catch{return json({error:"Invalid request"},400)}
  if(body.action==="like"){
    const id=Number(body.id);if(!id)return json({error:"Missing post"},400);
    await env.DB.prepare("UPDATE community_posts SET likes=likes+1 WHERE id=?").bind(id).run();
    return json({ok:true});
  }
  const author=clean(body.author).slice(0,40),content=clean(body.content).slice(0,1200),language=["zh","fr","en"].includes(body.language)?body.language:"zh",parentId=body.parentId?Number(body.parentId):null;
  if(author.length<1||content.length<2)return json({error:"Name and message are required"},400);
  if(parentId){const parent=await env.DB.prepare("SELECT id FROM community_posts WHERE id=? AND parent_id IS NULL").bind(parentId).first();if(!parent)return json({error:"Discussion not found"},404)}
  const result=await env.DB.prepare("INSERT INTO community_posts (parent_id,author,content,language) VALUES (?,?,?,?)").bind(parentId,author,content,language).run();
  return json({ok:true,id:result.meta.last_row_id},201);
}
