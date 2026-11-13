import {NextResponse} from "next/server";import {tx,newId,limited,clean,guard,blockedRes,track} from "../../../../lib/db";
export async function POST(req,{params}){if(await guard(req))return blockedRes();if(limited(req))return NextResponse.json({error:"Terlalu banyak permintaan."},{status:429});
let b;try{b=await req.json()}catch{return NextResponse.json({error:"Data tidak valid."},{status:400})}
const text=String(b.text||"").trim().slice(0,400),from=clean(b.from,40)||"Anonim";if(text.length<2)return NextResponse.json({error:"Balasan terlalu pendek."},{status:400});
const r=await tx(db=>{const m=db.messages.find(x=>x.id===params.id&&!x.hidden);if(!m)return null;const rep={id:newId(),from,text,createdAt:Date.now()};m.replies.push(rep);return rep});
if(r)await track(req,"reply",`balasan ke pesan ${params.id}`);return r?NextResponse.json(r):NextResponse.json({error:"Pesan tidak ditemukan."},{status:404})}
