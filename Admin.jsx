import React, { useEffect, useState } from "react";

const blankArticle={id:null,n:"",tag:"",minutes:10,locked:false,published:true,zh_title:"",zh_summary:"",zh_content:"",fr_title:"",fr_summary:"",fr_content:"",en_title:"",en_summary:"",en_content:""};
const fieldStyle={width:"100%",border:"1px solid #d8d5ca",borderRadius:8,padding:"10px 12px",fontSize:14,background:"#fff"};
const buttonStyle={border:0,borderRadius:999,padding:"10px 18px",fontWeight:700,cursor:"pointer"};

export default function Admin(){
  const[token,setToken]=useState(()=>sessionStorage.getItem("xart-admin-token")||"");
  const[inputToken,setInputToken]=useState("");
  const[articles,setArticles]=useState([]);
  const[editing,setEditing]=useState(null);
  const[message,setMessage]=useState("");
  const[busy,setBusy]=useState(false);

  const api=async(path="",options={})=>{
    const response=await fetch(`/api/articles${path}`,{...options,headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`,...options.headers}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||"请求失败");
    return data;
  };
  const load=async()=>{setBusy(true);try{const data=await api("?all=1");setArticles(data.articles);setMessage("")}catch(e){setMessage(e.message);if(e.message.includes("登录"))setToken("")}finally{setBusy(false)}};
  useEffect(()=>{if(token){sessionStorage.setItem("xart-admin-token",token);load()}},[token]);
  const login=async e=>{e.preventDefault();setToken(inputToken.trim())};
  const save=async e=>{e.preventDefault();setBusy(true);try{await api("",{method:"POST",body:JSON.stringify(editing)});setEditing(null);setMessage("文章已发布");await load()}catch(err){setMessage(err.message)}finally{setBusy(false)}};
  const remove=async article=>{if(!confirm(`确定删除“${article.zh_title||article.en_title}”吗？`))return;setBusy(true);try{await api(`?id=${article.id}`,{method:"DELETE"});setMessage("文章已删除");await load()}catch(err){setMessage(err.message)}finally{setBusy(false)}};

  if(!token)return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f4f2eb",fontFamily:"Arial,sans-serif",padding:24}}><form onSubmit={login} style={{width:"min(420px,100%)",background:"#fff",padding:32,borderRadius:16,boxShadow:"0 16px 50px #00000018"}}><h1 style={{margin:"0 0 8px"}}>X-ART Lab 后台</h1><p style={{color:"#777",margin:"0 0 24px"}}>输入管理员密码后添加和更新文章。</p><input type="password" value={inputToken} onChange={e=>setInputToken(e.target.value)} placeholder="管理员密码" required style={fieldStyle}/><button style={{...buttonStyle,width:"100%",marginTop:16,background:"#141311",color:"#fff"}}>登录</button></form></main>;

  return <main style={{minHeight:"100vh",background:"#f4f2eb",color:"#141311",fontFamily:"Arial,sans-serif"}}>
    <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px clamp(20px,5vw,64px)",background:"#141311",color:"#fff"}}><div><b style={{fontSize:20}}>X-ART Lab 后台</b><div style={{fontSize:12,opacity:.7}}>文章管理</div></div><div style={{display:"flex",gap:10}}><a href="/" style={{color:"#fff",padding:10}}>查看应用</a><button onClick={()=>{sessionStorage.removeItem("xart-admin-token");setToken("")}} style={{...buttonStyle,background:"#fff",color:"#141311"}}>退出</button></div></header>
    <div style={{maxWidth:1100,margin:"0 auto",padding:"32px clamp(20px,5vw,64px)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,marginBottom:24}}><div><h1 style={{margin:0}}>文章</h1><p style={{color:"#777"}}>发布后，中文、法文和英文应用会自动同步。</p></div><button onClick={()=>setEditing({...blankArticle})} style={{...buttonStyle,background:"#c81e1e",color:"#fff"}}>＋ 添加文章</button></div>
      {message&&<p style={{padding:12,background:"#fff",borderRadius:8}}>{message}</p>}
      <div style={{display:"grid",gap:12}}>{articles.map(article=><article key={article.id} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:16,background:"#fff",padding:18,borderRadius:12}}><div><div style={{fontSize:11,color:"#c81e1e",fontWeight:700}}>{article.n} · {article.tag}</div><h2 style={{fontSize:17,margin:"6px 0"}}>{article.zh_title||article.en_title}</h2><span style={{fontSize:12,color:"#777"}}>{article.published?"已发布":"草稿"} · {article.locked?"订阅文章":"免费文章"} · {article.minutes} 分钟</span></div><div style={{display:"flex",gap:8,alignItems:"center"}}><button onClick={()=>setEditing({...article})} style={{...buttonStyle,background:"#eee"}}>编辑</button><button onClick={()=>remove(article)} style={{...buttonStyle,background:"#fff0f0",color:"#b00020"}}>删除</button></div></article>)}</div>
      {busy&&<p>正在处理…</p>}
    </div>
    {editing&&<div style={{position:"fixed",inset:0,background:"#0008",display:"grid",placeItems:"center",padding:16,zIndex:20}}><form onSubmit={save} style={{width:"min(900px,100%)",maxHeight:"92vh",overflow:"auto",background:"#faf9f4",borderRadius:16,padding:24}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2>{editing.id?"编辑文章":"添加文章"}</h2><button type="button" onClick={()=>setEditing(null)} style={{...buttonStyle,background:"#eee"}}>关闭</button></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}><label>编号<input value={editing.n} onChange={e=>setEditing({...editing,n:e.target.value})} required style={fieldStyle}/></label><label>分类<input value={editing.tag} onChange={e=>setEditing({...editing,tag:e.target.value})} required style={fieldStyle}/></label><label>阅读分钟<input type="number" min="1" value={editing.minutes} onChange={e=>setEditing({...editing,minutes:Number(e.target.value)})} style={fieldStyle}/></label></div><div style={{display:"flex",gap:24,margin:"18px 0"}}><label><input type="checkbox" checked={editing.locked} onChange={e=>setEditing({...editing,locked:e.target.checked})}/> 需要订阅</label><label><input type="checkbox" checked={editing.published} onChange={e=>setEditing({...editing,published:e.target.checked})}/> 立即发布</label></div>{[["zh","中文"],["fr","Français"],["en","English"]].map(([code,label])=><fieldset key={code} style={{border:"1px solid #ddd",borderRadius:12,padding:16,marginBottom:16}}><legend style={{fontWeight:700}}>{label}</legend><label>标题<input value={editing[`${code}_title`]||""} onChange={e=>setEditing({...editing,[`${code}_title`]:e.target.value})} required style={fieldStyle}/></label><label>摘要<textarea value={editing[`${code}_summary`]||""} onChange={e=>setEditing({...editing,[`${code}_summary`]:e.target.value})} rows="3" required style={{...fieldStyle,marginTop:6}}/></label><label>正文<textarea value={editing[`${code}_content`]||""} onChange={e=>setEditing({...editing,[`${code}_content`]:e.target.value})} rows="7" required style={{...fieldStyle,marginTop:6}}/></label></fieldset>)}<button disabled={busy} style={{...buttonStyle,width:"100%",background:"#141311",color:"#fff",padding:14}}>{busy?"正在发布…":"保存并发布"}</button></form></div>}
  </main>;
}
