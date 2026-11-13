import {NextResponse} from "next/server";import {load,tx,isAdmin,newId,saveSong,clean,guard,blockedRes} from "../../lib/db";import {songs} from "../../lib/data";
export const dynamic="force-dynamic";
export async function GET(req){if(await guard(req))return blockedRes();const db=await load(),ov=db.builtin||{},adm=isAdmin(req)&&new URL(req.url).searchParams.get("all")==="1";
const all=[...songs.map((t,k)=>({key:k+4,title:ov[k+4]?.title||t,builtin:true,removed:!!ov[k+4]?.removed,purged:!!ov[k+4]?.purged})).filter(s=>!s.purged),...(db.songs||[]).map(s=>({key:"c:"+s.id,id:s.id,title:s.title,builtin:false,removed:!!s.removed}))];
return NextResponse.json(adm?all:all.filter(s=>!s.removed))}
export async function POST(req){if(!isAdmin(req))return NextResponse.json({error:"Tidak diizinkan."},{status:401});
let fd;try{fd=await req.formData()}catch{return NextResponse.json({error:"Data tidak valid."},{status:400})}
const file=fd.get("file"),title=clean(fd.get("title"),80);
if(!file||typeof file==="string"||!title)return NextResponse.json({error:"Pilih file MP3 dan isi judul."},{status:400});
const MAXB=process.env.VERCEL?4000000:8000000;if(file.size>MAXB)return NextResponse.json({error:`File terlalu besar (maks. ${MAXB/1000000} MB).`},{status:400});
const buf=Buffer.from(await file.arrayBuffer()),ok=buf.subarray(0,3).toString()==="ID3"||(buf[0]===0xff&&(buf[1]&0xe0)===0xe0);
if(!ok)return NextResponse.json({error:"File bukan MP3 yang valid."},{status:400});
const id=newId();await saveSong(id,buf);await tx(db=>{db.songs=db.songs||[];db.songs.push({id,title,createdAt:Date.now()})});
return NextResponse.json({id,title})}
