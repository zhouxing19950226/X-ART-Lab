import React, { useEffect, useState } from "react";
import { Compass, BookMarked, CreditCard, User, Lock, ChevronLeft, Search, Check } from "lucide-react";
import Admin from "./Admin.jsx";

const ink="#141311", paper="#FAF9F4", red="#C81E1E", muted="#8C897D", hairline="#E3E0D5";

const ui={
 zh:{search:"搜索",issue:"本期专题 / ISSUE 01",issueTitle:"无人观看",issueMeta:"女性独处、私人空间与观看的政治 · 共 10 篇",read:"分钟阅读",unlock:"订阅解锁",article:"正文",back:"返回",intro:"在西方视觉文化的长期传统中，女性形象经常被组织为可观看、可描述和可欲望的对象。本文的出发点不是简单要求“更多女性形象”，而是追问图像内部的关系。",body:"当人物转身、闭眼、睡眠、阅读或发呆时，她仍然处于画面之中，也仍然被观众看见；然而，她不再主动确认观看者的存在。因此，“无人观看”并非字面意义上的没有观众，而是一种方法论上的悖论。",lockedTitle:"你尚未获得进入此文本其余部分的权利",lockedText:"订阅 X-ART Lab.，解锁本篇及全部研究专题的完整正文",subscribeCta:"订阅 / 获得进入与理解的权利",membershipTitle:"订阅，获得进入与理解的权利",membershipText:"解锁全部当代艺术研究专题，含正文、参考文献与创作概念矩阵",monthly:"月度",yearly:"年度",institution:"机构",perMonth:"/ 月",perYear:"/ 年",cancel:"随时取消",yearlyNote:"相当于 €3,18 / 月",custom:"定制",institutionNote:"院校 / 图书馆 / 工作室",recommended:"推荐",benefits:["全部研究专题完整正文","可下载 PDF / 离线阅读","创作概念矩阵与实践方法附录"],subscribed:"已订阅",confirm:"确认订阅",account:"我的书房",memberStatus:"会员状态",activeMember:"X-ART Lab. 年度会员 · 有效期至 2027-08",notSubscribed:"未订阅",active:"生效中",free:"免费版",saved:"已收藏",discover:"发现",mine:"我的",subscribe:"订阅"},
 fr:{search:"Rechercher",issue:"DOSSIER DU MOIS / NUMÉRO 01",issueTitle:"Sans regard",issueMeta:"Solitude féminine, espace privé et politique du regard · 10 articles",read:"min de lecture",unlock:"Réservé aux abonnés",article:"ARTICLE",back:"Retour",intro:"Dans la longue tradition de la culture visuelle occidentale, l’image des femmes a souvent été organisée comme un objet à regarder, décrire et désirer. Il ne s’agit pas seulement de demander davantage de représentations, mais d’interroger les relations internes à l’image.",body:"Lorsqu’une figure se détourne, ferme les yeux, dort, lit ou rêvasse, elle reste visible. Pourtant, elle ne confirme plus activement la présence du regardeur. « Sans regard » est donc un paradoxe méthodologique : l’œuvre demande à être vue, tandis que son sujet peut refuser de répondre au regard.",lockedTitle:"Vous n’avez pas encore accès à la suite de ce texte",lockedText:"Abonnez-vous à X-ART Lab. pour lire cet article et tous les dossiers de recherche",subscribeCta:"S’abonner et accéder aux contenus",membershipTitle:"S’abonner pour accéder et comprendre",membershipText:"Accédez à tous les dossiers, textes, références et matrices de concepts créatifs",monthly:"Mensuel",yearly:"Annuel",institution:"Institution",perMonth:"/ mois",perYear:"/ an",cancel:"Résiliable à tout moment",yearlyNote:"Soit €3,18 / mois",custom:"Sur devis",institutionNote:"Écoles / bibliothèques / ateliers",recommended:"Conseillé",benefits:["Tous les articles de recherche","PDF téléchargeables et lecture hors ligne","Matrices conceptuelles et méthodes pratiques"],subscribed:"Abonné",confirm:"Confirmer l’abonnement",account:"Ma bibliothèque",memberStatus:"Statut de membre",activeMember:"Membre annuel X-ART Lab. · jusqu’en 08/2027",notSubscribed:"Sans abonnement",active:"Actif",free:"Gratuit",saved:"Favoris",discover:"Découvrir",mine:"Mon espace",subscribe:"S’abonner"},
 en:{search:"Search",issue:"CURRENT ISSUE / ISSUE 01",issueTitle:"Unwatched",issueMeta:"Female solitude, private space and the politics of looking · 10 articles",read:"min read",unlock:"Subscriber access",article:"ARTICLE",back:"Back",intro:"Across the long tradition of Western visual culture, women have often been organized as objects to be viewed, described and desired. The point is not simply to demand more images of women, but to question the relationships structured within the image.",body:"When a figure turns away, closes her eyes, sleeps, reads or daydreams, she remains visible. Yet she no longer confirms the viewer’s presence. “Unwatched” is therefore a methodological paradox: an artwork asks to be seen, while its subject can refuse to answer the gaze.",lockedTitle:"You do not yet have access to the rest of this text",lockedText:"Subscribe to X-ART Lab. to unlock this article and every research issue",subscribeCta:"Subscribe and access the full archive",membershipTitle:"Subscribe for access and understanding",membershipText:"Unlock every contemporary art research issue, including essays, references and creative concept matrices",monthly:"Monthly",yearly:"Yearly",institution:"Institution",perMonth:"/ month",perYear:"/ year",cancel:"Cancel anytime",yearlyNote:"Equivalent to €3.18 / month",custom:"Custom",institutionNote:"Schools / libraries / studios",recommended:"Recommended",benefits:["Complete research articles","Downloadable PDFs and offline reading","Creative concept matrices and practical methods"],subscribed:"Subscribed",confirm:"Confirm subscription",account:"My library",memberStatus:"Membership status",activeMember:"X-ART Lab. annual member · valid through 08/2027",notSubscribed:"Not subscribed",active:"Active",free:"Free",saved:"Saved",discover:"Discover",mine:"My space",subscribe:"Subscribe"}
};

const fallbackItems=[
 {n:"07",tag:"UNKNOWABILITY",locked:true,minutes:12,zh:["从可见到缺席：不可知性及其悖论","不可知性不是“神秘女人”的浪漫化，而是对信息边界的坚持。"],fr:["De la visibilité à l’absence : le paradoxe de l’inconnaissable","L’inconnaissable affirme une limite de l’information, sans romantiser la « femme mystérieuse »."],en:["From Visibility to Absence: The Paradox of Unknowability","Unknowability holds a boundary around information without romanticizing the “mysterious woman.”"]},
 {n:"04",tag:"TIME",locked:true,minutes:9,zh:["独处与时间所有权：非生产性存在的政治","她没有变得更好，她只是拥有了一段不需要产生价值的时间。"],fr:["Solitude et propriété du temps","Elle possède simplement un temps qui n’a pas à produire de valeur."],en:["Solitude and the Ownership of Time","She simply owns a stretch of time that need not produce value."]},
 {n:"02",tag:"SPACE",locked:false,minutes:14,zh:["房间不是背景：Woolf、Pollock 与性别化空间","房间既可能保护主体，也可能把主体限制在私人领域。"],fr:["La chambre n’est pas un décor : Woolf, Pollock et l’espace genré","La chambre peut protéger le sujet autant qu’elle peut le confiner au domaine privé."],en:["The Room Is Not a Backdrop: Woolf, Pollock and Gendered Space","A room may protect its subject while also confining her to the private sphere."]},
 {n:"01",tag:"THE GAZE",locked:false,minutes:11,zh:["观看的结构：Berger、Mulvey 与观看权力","观看并没有消失；被撤回的是观看者理所当然获得回应的权利。"],fr:["La structure du regard : Berger, Mulvey et le pouvoir de voir","Le droit du spectateur à recevoir une réponse est retiré."],en:["The Structure of Looking: Berger, Mulvey and the Power of the Gaze","What is withdrawn is the viewer’s assumed right to a response."]}
];

const Lang=({lang,setLang})=><div className="flex gap-1" aria-label="Language">{[["zh","中文"],["fr","FR"],["en","EN"]].map(([id,label])=><button key={id} onClick={()=>setLang(id)} aria-pressed={lang===id} style={{fontSize:10,fontWeight:700,color:lang===id?paper:ink,background:lang===id?ink:"transparent",border:`1px solid ${lang===id?ink:hairline}`,borderRadius:999,padding:"5px 8px"}}>{label}</button>)}</div>;
const Eye=({children})=><div style={{color:red,fontSize:11,fontWeight:700,letterSpacing:".12em"}}>{children}</div>;
function RichText({text="",blurred=false}){const parts=text.split(/(!\[[^\]]*\]\([^)]+\))/g).filter(Boolean);return <div style={{filter:blurred?"blur(4px)":"none",userSelect:blurred?"none":"auto"}}>{parts.map((part,index)=>{const image=part.match(/^!\[([^\]]*)\]\((.+)\)$/s);return image?<img key={index} src={image[2]} alt={image[1]} style={{display:"block",width:"100%",maxHeight:560,objectFit:"cover",borderRadius:8,margin:"18px 0"}}/>:<React.Fragment key={index}>{part.split(/\n\s*\n/).filter(paragraph=>paragraph.trim()).map((paragraph,paragraphIndex)=><p key={paragraphIndex} style={{fontSize:15,lineHeight:1.9}}>{paragraph.trim()}</p>)}</React.Fragment>})}</div>}

function Discover({lang,setLang,open,items}){
  const t=ui[lang],[query,setQuery]=useState("");
  const needle=query.trim().toLocaleLowerCase(),localized=items.filter(p=>!p.language||p.language==="all"||p.language===lang);
  const results=needle?localized.filter(p=>[p.tag,...(p[lang]||[])].join(" ").toLocaleLowerCase().includes(needle)):localized;
  const emptyText=lang==="zh"?"没有找到相关文章":lang==="fr"?"Aucun article trouvé":"No articles found";
  return <div className="flex flex-col h-full" style={{background:paper}}>
    <header className="px-5 pt-5 pb-4" style={{borderBottom:`1px solid ${hairline}`}}>
      <div className="flex items-start justify-between gap-3"><div><div style={{fontSize:26,fontWeight:800,color:ink}}>X-ART Lab.</div><div style={{fontSize:10,fontWeight:700,color:muted,letterSpacing:".18em"}}>CONTEMPORARY ART RESEARCH</div></div><Lang lang={lang} setLang={setLang}/></div>
      <label className="flex items-center gap-2 mt-4" style={{height:40,border:`1px solid ${hairline}`,borderRadius:999,padding:"0 14px",background:"#fff"}}>
        <Search size={15} color={muted}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search} aria-label={t.search} style={{flex:1,minWidth:0,border:0,outline:0,background:"transparent",fontSize:13,color:ink}}/>
        {query&&<button onClick={()=>setQuery("")} aria-label={lang==="zh"?"清除搜索":lang==="fr"?"Effacer la recherche":"Clear search"} style={{fontSize:18,color:muted,lineHeight:1}}>×</button>}
      </label>
    </header>
    <main className="flex-1 overflow-y-auto px-5 pb-6">{results.map(p=><button key={p.id||p.n} onClick={()=>open(p)} className="w-full text-left" style={{padding:"16px 0",borderBottom:`1px solid ${hairline}`}}>{p.cover_image&&<img src={p.cover_image} alt="" style={{width:"100%",height:180,objectFit:"cover",borderRadius:8,marginBottom:14}}/>}<div className="flex gap-3"><b style={{fontSize:12,color:red,minWidth:20}}>{p.n}</b><div><div style={{fontSize:10,fontWeight:700,color:muted,letterSpacing:".1em"}}>{p.tag}</div><div style={{fontSize:15,fontWeight:700,marginTop:4,lineHeight:1.4}}>{p[lang][0]}</div><div style={{fontSize:12,color:muted,marginTop:6,lineHeight:1.5}}>{p[lang][1]}</div><div className="flex gap-2" style={{marginTop:8,fontSize:11,color:muted}}><span>{p.minutes} {t.read}</span>{p.locked&&<span className="flex items-center gap-1" style={{color:red}}><Lock size={10}/>{t.unlock}</span>}</div></div></div></button>)}{results.length===0&&<div style={{padding:"40px 0",textAlign:"center",fontSize:13,color:muted}}>{emptyText}</div>}</main>
  </div>
}

function Reader({item,lang,setLang,back,toSubscribe,subscribed}){
  const t=ui[lang],locked=item.locked&&!subscribed,articleBody=item.content?.[lang]||t.body;
  return <article className="swiss-reader">
    <header className="swiss-reader-header">
      <button onClick={back} aria-label={t.back}><ChevronLeft size={20}/><span>{t.back}</span></button>
      <div className="swiss-reader-brand"><b>X-ART LAB</b><small>CONTEMPORARY ART RESEARCH</small></div>
      <Lang lang={lang} setLang={setLang}/>
    </header>
    <main className="swiss-reader-scroll">
      <section className="swiss-reader-hero">
        <div className="swiss-red-rule"/>
        <div className="swiss-meta"><b>{item.n}</b><span>{item.tag}</span><span>{item.minutes} {t.read}</span></div>
        <h1>{item[lang][0]}</h1>
        <div className="swiss-byline"><b>XING ZHOU</b><span>ZHOU-XING.COM</span></div>
      </section>
      {item.cover_image&&<img className="swiss-cover" src={item.cover_image} alt=""/>}
      <section className="swiss-reader-body">
        <p className="swiss-summary">{item[lang][1]}</p>
        <div className="swiss-body-rule"/>
        {locked?<div className="relative"><RichText text={articleBody} blurred/><div className="swiss-lock"><Lock size={20} color={red}/><b>{t.lockedTitle}</b><span>{t.lockedText}</span><button onClick={toSubscribe}>{t.subscribeCta}</button></div></div>:<RichText text={articleBody}/>}
        <footer className="swiss-article-footer"><b>X</b><span>XING ZHOU</span><span>ZHOU-XING.COM</span></footer>
      </section>
    </main>
  </article>
}

function Subscribe({lang,setLang,subscribed}){
  const t=ui[lang],[selected,setSelected]=useState("yearly"),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const plans=[{id:"monthly",name:t.monthly,en:"MONTHLY",price:"€3,59",period:t.perMonth,note:t.cancel},{id:"yearly",name:t.yearly,en:"YEARLY",price:"€38,18",period:t.perYear,note:t.yearlyNote,rec:true},{id:"institution",name:t.institution,en:"INSTITUTION",price:t.custom,period:"",note:t.institutionNote}];
  const checkout=async()=>{if(subscribed)return;if(selected==="institution"){setError(lang==="zh"?"机构订阅请联系 X-ART Lab。":lang==="fr"?"Contactez X-ART Lab pour un abonnement institutionnel.":"Contact X-ART Lab for an institutional plan.");return}setBusy(true);setError("");try{const response=await fetch("/api/create-checkout-session",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({plan:selected})});const data=await response.json();if(!response.ok||!data.url)throw new Error(data.error||"Stripe error");location.href=data.url}catch(e){setError(e.message)}finally{setBusy(false)}};
  const payLabel=busy?(lang==="zh"?"正在连接 Stripe…":lang==="fr"?"Connexion à Stripe…":"Connecting to Stripe…"):(lang==="zh"?"前往 Stripe 安全支付":lang==="fr"?"Payer avec Stripe":"Continue to secure Stripe payment");
  return <div className="flex flex-col h-full" style={{background:paper}}><header className="px-5 pt-5 pb-4" style={{borderBottom:`1px solid ${hairline}`}}><div className="flex items-start justify-between gap-2"><div><Eye>MEMBERSHIP</Eye><h1 style={{fontSize:21,fontWeight:800,marginTop:8,lineHeight:1.3}}>{t.membershipTitle}</h1></div><Lang lang={lang} setLang={setLang}/></div><p style={{fontSize:12,color:muted,lineHeight:1.6}}>{t.membershipText}</p></header><main className="flex-1 overflow-y-auto px-5 pt-5">{plans.map(p=><button key={p.id} onClick={()=>{setSelected(p.id);setError("")}} className="w-full text-left" style={{padding:16,marginBottom:12,borderRadius:12,border:`1px solid ${selected===p.id?red:hairline}`,background:selected===p.id?"#FDF1F1":"transparent"}}><div className="flex justify-between items-center gap-2"><div><div className="flex items-center gap-2"><b>{p.name}</b><small style={{color:muted}}>{p.en}</small>{p.rec&&<small style={{color:paper,background:red,padding:"2px 6px",borderRadius:4}}>{t.recommended}</small>}</div><small style={{color:muted}}>{p.note}</small></div><div><b style={{fontSize:18}}>{p.price}</b><small style={{color:muted}}>{p.period}</small>{selected===p.id&&<Check size={14} color={red}/>}</div></div></button>)}{t.benefits.map(f=><div key={f} className="flex items-center gap-2" style={{marginTop:10}}><Check size={14} color={red}/><span style={{fontSize:13}}>{f}</span></div>)}</main><footer className="px-5 pb-6 pt-3" style={{borderTop:`1px solid ${hairline}`}}>{error&&<p style={{fontSize:12,color:red,textAlign:"center",margin:"0 0 8px"}}>{error}</p>}<button disabled={busy||subscribed} onClick={checkout} style={{width:"100%",border:0,background:subscribed?muted:ink,color:paper,fontWeight:700,padding:14,borderRadius:999}}>{subscribed?t.subscribed:payLabel}</button></footer></div>
}

const loadPdfImage=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src});
function wrapCanvasText(context,text,maxWidth){const lines=[];for(const paragraph of String(text||"").split(/\n/)){if(!paragraph){lines.push("");continue}let line="";for(const character of paragraph){const next=line+character;if(context.measureText(next).width>maxWidth&&line){lines.push(line);line=character}else line=next}if(line)lines.push(line)}return lines}

async function downloadArticle(item,lang){
  const {jsPDF}=await import("jspdf");
  const articleTitle=item[lang][0],summary=item[lang][1],body=item.content?.[lang]||"",author="Xing Zhou",website="https://zhou-xing.com";
  const width=1240,height=1754,left=112,right=102,contentWidth=width-left-right,footerTop=1515,pages=[];
  let canvas,context,y;
  const newPage=()=>{canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;context=canvas.getContext("2d");context.fillStyle="#FFFFFF";context.fillRect(0,0,width,height);context.fillStyle="#111111";y=112;pages.push({canvas,context})};
  const ensure=space=>{if(y+space>footerTop){newPage()}};
  const drawText=(text,{font="30px Arial",color="#111111",lineHeight=47,spaceAfter=22,maxWidth=contentWidth,x=left}={})=>{context.font=font;const lines=wrapCanvasText(context,text,maxWidth);for(const line of lines){ensure(lineHeight);context.font=font;context.fillStyle=color;context.fillText(line,x,y);y+=lineHeight}y+=spaceAfter};
  const drawImage=async src=>{if(!src)return;try{const image=await loadPdfImage(src),scale=Math.min(contentWidth/image.width,600/image.height),w=image.width*scale,h=image.height*scale;ensure(h+48);context.fillStyle="#FFFFFF";context.fillRect(left-2,y-2,w+4,h+4);context.drawImage(image,left,y,w,h);context.fillStyle="#C81E1E";context.fillRect(left,y+h+14,84,5);y+=h+48}catch{}};
  newPage();
  context.fillStyle="#C81E1E";context.fillRect(left,82,84,8);
  context.font="700 20px Arial";context.fillStyle="#111111";context.fillText("X-ART LAB",left,132);context.font="18px Arial";context.fillStyle="#666666";context.fillText("CONTEMPORARY ART RESEARCH",left,163);
  context.textAlign="right";context.font="700 66px Arial";context.fillStyle="#C81E1E";context.fillText(item.n||"01",width-right,150);context.textAlign="left";y=252;
  drawText(articleTitle,{font:"700 58px Arial",lineHeight:70,spaceAfter:28,maxWidth:contentWidth*.83});
  context.strokeStyle="#111111";context.lineWidth=3;context.beginPath();context.moveTo(left,y);context.lineTo(width-right,y);context.stroke();y+=34;
  context.font="700 20px Arial";context.fillStyle="#111111";context.fillText(author.toUpperCase(),left,y);context.font="19px Arial";context.fillStyle="#666666";context.fillText(`${item.tag}  /  ${item.minutes} MIN`,left+310,y);y+=58;
  await drawImage(item.cover_image);
  drawText(summary,{font:"italic 29px Arial",color:"#444444",lineHeight:45,spaceAfter:38,maxWidth:contentWidth*.83});
  const parts=body.split(/(!\[[^\]]*\]\([^)]+\))/g).filter(Boolean);
  for(const part of parts){const image=part.match(/^!\[([^\]]*)\]\((.+)\)$/s);if(image)await drawImage(image[2]);else drawText(part.trim(),{font:"29px Arial",lineHeight:47,spaceAfter:24,maxWidth:contentWidth*.83})}
  let logo=null;try{logo=await loadPdfImage("/icons/logo-black.svg")}catch{}
  pages.forEach(({context:ctx},index)=>{ctx.fillStyle="#FFFFFF";ctx.fillRect(0,footerTop-8,width,height-footerTop+8);ctx.strokeStyle="#111111";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(left,footerTop+12);ctx.lineTo(width-right,footerTop+12);ctx.stroke();if(logo)ctx.drawImage(logo,left,footerTop+34,44,44);ctx.fillStyle="#111111";ctx.font="700 17px Arial";ctx.fillText(author.toUpperCase(),left+62,footerTop+53);ctx.textAlign="right";ctx.font="700 15px Arial";ctx.fillText("ZHOU-XING.COM",width-right,footerTop+53);ctx.fillStyle="#C81E1E";ctx.fillText(String(index+1).padStart(2,"0")+" / "+String(pages.length).padStart(2,"0"),width-right,footerTop+80);ctx.textAlign="left";ctx.font="16px Arial";ctx.fillStyle="#444444";const footerTitleLines=wrapCanvasText(ctx,articleTitle,contentWidth-62);footerTitleLines.forEach((line,lineIndex)=>ctx.fillText(line,left+62,footerTop+84+lineIndex*24))});
  const pdf=new jsPDF({orientation:"portrait",unit:"pt",format:"a4",compress:true});
  pages.forEach(({canvas:page},index)=>{if(index)pdf.addPage();pdf.addImage(page.toDataURL("image/jpeg",.9),"JPEG",0,0,595.28,841.89,undefined,"FAST")});
  pdf.save(`${articleTitle.replace(/[\\/:*?"<>|]/g,"-")}.pdf`);
}

function Profile({lang,setLang,subscribed,items,onRead}){const t=ui[lang],readLabel=lang==="zh"?"阅读":lang==="fr"?"Lire":"Read",downloadLabel=lang==="zh"?"下载":lang==="fr"?"Télécharger":"Download",localized=items.filter(p=>!p.language||p.language==="all"||p.language===lang);return <div className="h-full" style={{background:paper}}><header className="px-5 pt-5 pb-4 flex justify-between" style={{borderBottom:`1px solid ${hairline}`}}><div><Eye>ACCOUNT</Eye><h1 style={{fontSize:20,fontWeight:800,marginTop:8}}>{t.account}</h1></div><Lang lang={lang} setLang={setLang}/></header><main className="px-5 pt-5 overflow-y-auto" style={{height:"calc(100% - 92px)"}}><section style={{border:`1px solid ${hairline}`,borderRadius:12,padding:16}}><div className="flex justify-between"><div><b>{t.memberStatus}</b><div style={{fontSize:12,color:muted}}>{subscribed?t.activeMember:t.notSubscribed}</div></div><span>{subscribed?t.active:t.free}</span></div></section><h2 style={{fontSize:11,fontWeight:700,color:muted,marginTop:20}}>{t.saved}</h2>{localized.slice(0,2).map(p=><article key={p.id||p.n} style={{padding:"14px 0",borderBottom:`1px solid ${hairline}`}}><div className="flex justify-between gap-3"><div><b style={{fontSize:13}}>{p[lang][0]}</b><div style={{fontSize:11,color:muted,marginTop:3}}>{p.tag}</div></div><BookMarked size={16} color={muted}/></div><div className="flex gap-2" style={{marginTop:10}}><button onClick={()=>onRead(p)} style={{border:0,borderRadius:999,background:ink,color:paper,padding:"8px 16px",fontSize:12,fontWeight:700}}>{readLabel}</button><button onClick={()=>downloadArticle(p,lang)} style={{border:`1px solid ${hairline}`,borderRadius:999,background:"transparent",color:ink,padding:"8px 16px",fontSize:12,fontWeight:700}}>{downloadLabel}</button></div></article>)}</main></div>}

function Tabs({tab,setTab,lang}){const t=ui[lang],tabs=[["discover",t.discover,Compass],["library",t.mine,User],["subscribe",t.subscribe,CreditCard]];return <nav className="flex items-center justify-around" style={{height:64,borderTop:`1px solid ${hairline}`,background:paper}}>{tabs.map(([id,label,Icon])=><button key={id} onClick={()=>setTab(id)} className="flex flex-col items-center gap-1"><Icon size={20} color={tab===id?red:muted}/><span style={{fontSize:10,color:tab===id?red:muted,fontWeight:tab===id?700:400}}>{label}</span></button>)}</nav>}

const responsiveStyles=`
.xart-stage{min-height:100dvh;padding:0;background:#FAF9F4;align-items:stretch}
.xart-device{width:100%;height:100dvh;border:0;border-radius:0;box-shadow:none}
.swiss-reader{height:100%;display:flex;flex-direction:column;background:#fff;color:#111}
.swiss-reader-header{min-height:72px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 clamp(18px,4vw,52px);border-bottom:1px solid #111;background:#fff}
.swiss-reader-header>button{display:flex;align-items:center;gap:5px;justify-self:start;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.swiss-reader-header>.flex{justify-self:end}.swiss-reader-brand{text-align:center;line-height:1.05}.swiss-reader-brand b{display:block;font-size:15px;letter-spacing:.04em}.swiss-reader-brand small{font-size:7px;letter-spacing:.18em;color:#777}
.swiss-reader-scroll{flex:1;overflow-y:auto;background:#fff}
.swiss-reader-hero{position:relative;padding:clamp(36px,7vw,88px) clamp(20px,7vw,92px) clamp(42px,8vw,96px);background:#fff}
.swiss-red-rule{width:72px;height:6px;background:#c81e1e;margin-bottom:34px}.swiss-meta{display:grid;grid-template-columns:90px 1fr auto;align-items:baseline;border-top:2px solid #111;padding-top:12px;font-size:11px;letter-spacing:.12em}.swiss-meta b{font-size:34px;line-height:1;color:#c81e1e}.swiss-meta span:last-child{text-align:right}
.swiss-reader-hero h1{max-width:980px;margin:clamp(34px,7vw,78px) 0 46px;font-size:clamp(38px,7vw,92px);font-weight:800;letter-spacing:-.055em;line-height:.98}
.swiss-byline{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #111;padding-top:13px;font-size:10px;letter-spacing:.12em}.swiss-byline span{text-align:right}
.swiss-cover{display:block;width:100%;max-height:72vh;object-fit:cover;border-radius:0}
.swiss-reader-body{width:min(760px,calc(100% - 40px));margin:0 auto;padding:clamp(42px,8vw,92px) 0 70px}.swiss-summary{margin:0 0 42px;font-size:clamp(20px,2.4vw,30px);font-weight:500;line-height:1.45;letter-spacing:-.02em}.swiss-body-rule{width:72px;height:5px;background:#c81e1e;margin-bottom:42px}.swiss-reader-body>div>p{font-size:17px!important;line-height:1.9!important;margin:0 0 26px}.swiss-reader-body img{border-radius:0!important}
.swiss-lock{position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:flex-start;padding:100px 0 8px;background:linear-gradient(180deg,transparent,#fff 48%)}.swiss-lock b{margin-top:12px;font-size:18px}.swiss-lock span{margin-top:7px;color:#777;font-size:13px}.swiss-lock button{margin-top:18px;border:0;border-radius:0;background:#111;color:#fff;padding:13px 18px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.swiss-article-footer{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:12px;margin-top:70px;padding-top:16px;border-top:2px solid #111;font-size:10px;letter-spacing:.12em}.swiss-article-footer b{font-size:30px;line-height:1}.swiss-article-footer span:last-child{text-align:right}
@media (min-width:700px){
  .xart-stage{min-height:100dvh;padding:0;background:#FAF9F4;align-items:stretch}
  .xart-device{width:100%;height:100dvh;border:0;border-radius:0;box-shadow:none}
  .xart-device header,.xart-device main,.xart-device footer{padding-left:max(32px,env(safe-area-inset-left));padding-right:max(32px,env(safe-area-inset-right))}
  .xart-device main{scrollbar-gutter:stable}
}
@media (max-width:699px){.swiss-reader-header{grid-template-columns:1fr auto}.swiss-reader-brand{display:none}.swiss-reader-header>button span{display:none}.swiss-meta{grid-template-columns:58px 1fr}.swiss-meta span:last-child{grid-column:2;text-align:left;margin-top:8px}.swiss-reader-hero h1{margin:38px 0 36px}.swiss-byline{grid-template-columns:1fr}.swiss-byline span{display:none}.swiss-reader-body{width:calc(100% - 40px)}}
`;

export default function App(){
  if(location.pathname.startsWith("/admin"))return <Admin/>;
  const[tab,setTab]=useState("discover"),[open,setOpen]=useState(null),[subscribed,setSubscribed]=useState(false),[items,setItems]=useState(fallbackItems),[lang,setLang]=useState(()=>localStorage.getItem("xart-language")||"zh");
  useEffect(()=>{localStorage.setItem("xart-language",lang);document.documentElement.lang=lang==="zh"?"zh-CN":lang},[lang]);
  useEffect(()=>{fetch(`/api/articles?t=${Date.now()}`,{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(data=>{if(data.articles?.length)setItems(data.articles.map(p=>({id:p.id,n:p.n,tag:p.tag,minutes:p.minutes,locked:p.locked,language:p.language||"all",cover_image:p.cover_image||"",zh:[p.zh_title,p.zh_summary],fr:[p.fr_title,p.fr_summary],en:[p.en_title,p.en_summary],content:{zh:p.zh_content,fr:p.fr_content,en:p.en_content}})))}).catch(()=>{})},[]);
  useEffect(()=>{const params=new URLSearchParams(location.search),sessionId=params.get("session_id")||localStorage.getItem("xart-stripe-session");if(params.get("checkout")==="cancelled")history.replaceState({},"",location.pathname);if(!sessionId)return;fetch(`/api/verify-checkout-session?session_id=${encodeURIComponent(sessionId)}&t=${Date.now()}`,{cache:"no-store"}).then(r=>r.json()).then(data=>{if(data.active){setSubscribed(true);localStorage.setItem("xart-stripe-session",sessionId)}else localStorage.removeItem("xart-stripe-session");if(params.get("session_id"))history.replaceState({},"",location.pathname)}).catch(()=>{})},[]);
  let screen=open?<Reader item={open} lang={lang} setLang={setLang} back={()=>setOpen(null)} toSubscribe={()=>{setOpen(null);setTab("subscribe")}} subscribed={subscribed}/>:tab==="discover"?<Discover lang={lang} setLang={setLang} open={setOpen} items={items}/>:tab==="subscribe"?<Subscribe lang={lang} setLang={setLang} subscribed={subscribed} onSubscribed={()=>setSubscribed(true)}/>:<Profile lang={lang} setLang={setLang} subscribed={subscribed} items={items} onRead={setOpen}/>;
  return <><style>{responsiveStyles}</style><div className="xart-stage w-full flex items-center justify-center"><div className="xart-device" style={{overflow:"hidden",display:"flex",flexDirection:"column"}}><div style={{flex:1,overflow:"hidden"}}>{screen}</div>{!open&&<Tabs tab={tab} setTab={setTab} lang={lang}/>}</div></div></>
}
