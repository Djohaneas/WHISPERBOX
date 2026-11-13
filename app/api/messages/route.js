import {NextResponse} from "next/server";import {load,tx,newId,limited,clean,savePhoto,guard,blockedRes,track} from "../../lib/db";import {cats,themes,tracks} from "../../lib/data";
export const dynamic="force-dynamic";
export async function GET(req){if(await guard(req))return blockedRes();const q=clean(new URL(req.url).searchParams.get("q"),60).toLowerCase();if(q.length>=2)await track(req,"search",q);const messages=(await load()).messages.filter(m=>!m.hidden);
const items=messages.filter(m=>!q||m.to.toLowerCase().includes(q)).sort((a,b)=>b.createdAt-a.createdAt);
return NextResponse.json({total:items.length,items:items.slice(0,100).map(({id,category,from,to,text,theme,createdAt,replies,photo})=>({id,category,from,to,text:text.slice(0,160),theme,createdAt,replies:replies.filter(r=>!r.deleted).length,photo:!!photo}))})}
export async function POST(req){if(await guard(req))return blockedRes();if(limited(req))return NextResponse.json({error:"Terlalu banyak permintaan. Coba lagi sebentar."},{status:429});
let b;try{b=await req.json()}catch{return NextResponse.json({error:"Data tidak valid."},{status:400})}
const to=clean(b.to,40),text=String(b.text||"").trim().slice(0,600),anonymous=!!b.anonymous,from=anonymous?"Anonim":clean(b.from,40);
if(!to)return NextResponse.json({error:"Nama penerima wajib diisi."},{status:400});
if(!anonymous&&!from)return NextResponse.json({error:"Isi nama pengirim atau pilih Anonim."},{status:400});
if(text.length<3)return NextResponse.json({error:"Pesan terlalu pendek."},{status:400});
const c=+b.category;let t=b.theme;if(typeof t==="string"&&/^#[0-9a-fA-F]{6}$/.test(t))t=t.toLowerCase();else t=+t;const sdb=await load();let mu=b.music,okMu;if(typeof mu==="string"&&mu.startsWith("c:"))okMu=(sdb.songs||[]).some(s=>"c:"+s.id===mu&&!s.removed);else{mu=+mu;okMu=!!tracks[mu]&&!sdb.builtin?.[mu]?.removed&&!sdb.builtin?.[mu]?.purged}
if(!cats[c]||(typeof t!=="string"&&!themes[t])||!okMu)return NextResponse.json({error:"Pilihan tidak valid."},{status:400});
let buf=null;if(b.photo){const mm=/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(b.photo));buf=mm&&Buffer.from(mm[1],"base64");
if(!buf||buf.length>600000||buf[0]!==0xff||buf[1]!==0xd8)return NextResponse.json({error:"Foto tidak valid (JPEG, maks. 600 KB)."},{status:400})}
const id=newId();if(buf)await savePhoto(id,buf);await tx(db=>{db.messages.push({id,category:cats[c][0],from,to,text,theme:t,music:mu,createdAt:Date.now(),replies:[],photo:!!buf,reports:0,reporters:[],hidden:false})});
await track(req,"send_message",`untuk ${to} · ${cats[c][0]}`);return NextResponse.json({id})}
