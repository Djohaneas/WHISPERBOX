import {NextResponse} from "next/server";import {tx,isAdmin,limited,hashIp,AUTO_DELETE_LIMIT,guard,blockedRes,track} from "../../../../../lib/db";
const no=(m,s)=>NextResponse.json({error:m},{status:s});
export async function POST(req,{params}){if(await guard(req))return blockedRes();if(limited(req,5))return no("Terlalu banyak permintaan.",429);const who=hashIp(req);
const r=await tx(db=>{const m=db.messages.find(x=>x.id===params.id&&!x.hidden),p=m?.replies.find(x=>x.id===params.rid&&!x.deleted);if(!p)return null;p.reporters=p.reporters||[];
if(!p.reporters.includes(who)){p.reporters.push(who);p.reports=p.reporters.length;if(p.reports>AUTO_DELETE_LIMIT){p.deleted=true;p.autoDeleted=true}}return true});
if(r)await track(req,"report",`melaporkan balasan di pesan ${params.id}`);return r?NextResponse.json({ok:true}):no("Balasan tidak ditemukan.",404)}
export async function PATCH(req,{params}){if(!isAdmin(req))return no("Tidak diizinkan.",401);
const ok=await tx(db=>{const p=db.messages.find(x=>x.id===params.id)?.replies.find(x=>x.id===params.rid);if(!p)return false;p.deleted=false;p.autoDeleted=false;p.reports=0;p.reporters=[];return true});
return ok?NextResponse.json({ok:true}):no("Balasan tidak ditemukan.",404)}
export async function DELETE(req,{params}){if(!isAdmin(req))return no("Tidak diizinkan.",401);const perm=new URL(req.url).searchParams.get("permanent")==="1";
const r=await tx(db=>{const m=db.messages.find(x=>x.id===params.id),i=m?m.replies.findIndex(x=>x.id===params.rid):-1;if(i<0)return "nf";const p=m.replies[i];
if(perm){if(!p.deleted)return "bad";m.replies.splice(i,1);return "ok"}p.deleted=true;return "ok"});
return r==="nf"?no("Balasan tidak ditemukan.",404):r==="bad"?no("Hapus dulu sebelum hapus permanen.",400):NextResponse.json({ok:true})}
