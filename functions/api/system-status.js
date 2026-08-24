const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const authorized=(request,env)=>Boolean(env.ADMIN_TOKEN)&&request.headers.get("Authorization")===`Bearer ${env.ADMIN_TOKEN}`;

export async function onRequestGet({request,env}){
  if(!authorized(request,env))return json({error:"Unauthorized"},401);
  const services={database:false,ai:Boolean(env.AI),translation:Boolean(env.AI),pdf:true,audio:Boolean(env.AI)};
  const errors=[];
  if(env.DB)try{await env.DB.prepare("SELECT 1 ok").first();services.database=true}catch(error){errors.push({service:"database",message:error.message,time:new Date().toISOString()})}
  else errors.push({service:"database",message:"Database binding is missing",time:new Date().toISOString()});
  if(!env.AI)errors.push({service:"AI",message:"AI binding is missing",time:new Date().toISOString()});
  let recentErrors=errors;
  if(env.DB&&services.database)try{await env.DB.prepare("CREATE TABLE IF NOT EXISTS service_errors(id INTEGER PRIMARY KEY AUTOINCREMENT,service TEXT NOT NULL,message TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();for(const error of errors)await env.DB.prepare("INSERT INTO service_errors(service,message) VALUES(?,?)").bind(error.service,error.message).run();const result=await env.DB.prepare("SELECT service,message,created_at time FROM service_errors ORDER BY id DESC LIMIT 10").all();recentErrors=result.results}catch{}
  return json({services,errors:recentErrors,checkedAt:new Date().toISOString()});
}
