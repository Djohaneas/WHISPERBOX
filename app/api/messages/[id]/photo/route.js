import {NextResponse} from "next/server";import {load,isAdmin,readPhoto,guard,blockedRes} from "../../../../lib/db";
export const dynamic="force-dynamic";
export async function GET(req,{params}){if(await guard(req))return blockedRes();const m=(await load()).messages.find(x=>x.id===params.id);
if(!m||!m.photo||(m.hidden&&!isAdmin(req)))return NextResponse.json({error:"Foto tidak ditemukan."},{status:404});
const buf=await readPhoto(params.id);if(!buf)return NextResponse.json({error:"Foto tidak ditemukan."},{status:404});
return new Response(buf,{headers:{"Content-Type":"image/jpeg","X-Content-Type-Options":"nosniff","Cache-Control":"private, max-age=300"}})}
