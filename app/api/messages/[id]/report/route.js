import {NextResponse} from "next/server";import {tx,limited,hashIp,REPORT_LIMIT} from "../../../../lib/db";
export async function POST(req,{params}){if(limited(req,5))return NextResponse.json({error:"Terlalu banyak permintaan."},{status:429});
const who=hashIp(req);
const r=await tx(db=>{const m=db.messages.find(x=>x.id===params.id);if(!m)return null;m.reporters=m.reporters||[];
if(!m.reporters.includes(who)){m.reporters.push(who);m.reports=m.reporters.length;if(m.reports>=REPORT_LIMIT)m.hidden=true}
return {hidden:!!m.hidden}});
return r?NextResponse.json({ok:true,...r}):NextResponse.json({error:"Pesan tidak ditemukan."},{status:404})}
