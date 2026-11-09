import {NextResponse} from "next/server";import {load,tx,isAdmin,publicView,rmPhoto} from "../../../lib/db";
export const dynamic="force-dynamic";
export async function GET(req,{params}){const m=(await load()).messages.find(x=>x.id===params.id);
return m&&(!m.hidden||isAdmin(req))?NextResponse.json(publicView(m)):NextResponse.json({error:"Pesan tidak ditemukan."},{status:404})}
export async function DELETE(req,{params}){if(!isAdmin(req))return NextResponse.json({error:"Tidak diizinkan."},{status:401});
const ok=await tx(db=>{const i=db.messages.findIndex(x=>x.id===params.id);if(i<0)return false;db.messages.splice(i,1);return true});
if(ok)await rmPhoto(params.id);
return ok?NextResponse.json({ok:true}):NextResponse.json({error:"Pesan tidak ditemukan."},{status:404})}
export async function PATCH(req,{params}){if(!isAdmin(req))return NextResponse.json({error:"Tidak diizinkan."},{status:401});
const ok=await tx(db=>{const m=db.messages.find(x=>x.id===params.id);if(!m)return false;m.hidden=false;m.reports=0;m.reporters=[];return true});
return ok?NextResponse.json({ok:true}):NextResponse.json({error:"Pesan tidak ditemukan."},{status:404})}
