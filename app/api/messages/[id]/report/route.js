import {NextResponse} from "next/server";import {tx,limited,hashIp,REPORT_LIMIT,AUTO_DELETE_LIMIT,guard,blockedRes,track} from "../../../../lib/db";
export async function POST(req,{params}){if(await guard(req))return blockedRes();if(limited(req,5))return NextResponse.json({error:"Terlalu banyak permintaan."},{status:429});
const who=hashIp(req);
const r=await tx(db=>{const m=db.messages.find(x=>x.id===params.id);if(!m)return null;m.reporters=m.reporters||[];
if(!m.reporters.includes(who)){m.reporters.push(who);m.reports=m.reporters.length;if(m.reports>=REPORT_LIMIT)m.hidden=true;if(m.reports>AUTO_DELETE_LIMIT){m.deleted=true;m.hidden=true;m.autoDeleted=true}}
return {hidden:!!m.hidden}});
if(r)await track(req,"report",`melaporkan pesan ${params.id}`);return r?NextResponse.json({ok:true,...r}):NextResponse.json({error:"Pesan tidak ditemukan."},{status:404})}
