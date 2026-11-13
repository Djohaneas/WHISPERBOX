import {NextResponse} from "next/server";import {load,tx,isAdmin,publicView,rmPhoto,guard,blockedRes} from "../../../lib/db";
export const dynamic="force-dynamic";
export async function GET(req,{params}){if(await guard(req))return blockedRes();const m=(await load()).messages.find(x=>x.id===params.id);
return m&&(!m.hidden||isAdmin(req))?NextResponse.json(publicView(m,isAdmin(req))):NextResponse.json({error:"Pesan tidak ditemukan."},{status:404})}
export async function DELETE(req,{params}){if(!isAdmin(req))return NextResponse.json({error:"Tidak diizinkan."},{status:401});
const perm=new URL(req.url).searchParams.get("permanent")==="1";
const r=await tx(db=>{const i=db.messages.findIndex(x=>x.id===params.id);if(i<0)return "nf";const m=db.messages[i];
if(perm){if(!m.deleted)return "bad";db.messages.splice(i,1);return "gone"}m.deleted=true;m.hidden=true;return "soft"});
if(r==="gone")await rmPhoto(params.id);
if(r==="nf")return NextResponse.json({error:"Pesan tidak ditemukan."},{status:404});
if(r==="bad")return NextResponse.json({error:"Hapus dulu (ke daftar Terhapus) sebelum hapus permanen."},{status:400});
return NextResponse.json({ok:true})}
export async function PATCH(req,{params}){if(!isAdmin(req))return NextResponse.json({error:"Tidak diizinkan."},{status:401});
const ok=await tx(db=>{const m=db.messages.find(x=>x.id===params.id);if(!m)return false;m.deleted=false;m.autoDeleted=false;m.hidden=false;m.reports=0;m.reporters=[];return true});
return ok?NextResponse.json({ok:true}):NextResponse.json({error:"Pesan tidak ditemukan."},{status:404})}
