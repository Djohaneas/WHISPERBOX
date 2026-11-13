import {NextResponse} from "next/server";import {load,tx,isAdmin,readSong,rmSong,rmStatic,clean,guard,blockedRes} from "../../../lib/db";import {songs,files} from "../../../lib/data";
export const dynamic="force-dynamic";
const no=(m,s)=>NextResponse.json({error:m},{status:s}),ok=()=>NextResponse.json({ok:true}),bk=id=>{const m=/^b(\d+)$/.exec(id);return m&&songs[+m[1]-4]?+m[1]:0};
export async function GET(req,{params}){if(await guard(req))return blockedRes();const s=((await load()).songs||[]).find(x=>x.id===params.id),buf=s&&(!s.removed||isAdmin(req))&&await readSong(params.id);if(!buf)return no("Lagu tidak ditemukan.",404);
const h={"Content-Type":"audio/mpeg","Accept-Ranges":"bytes","Cache-Control":"public, max-age=3600","X-Content-Type-Options":"nosniff"},r=/^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range")||"");
if(!r)return new Response(buf,{headers:{...h,"Content-Length":String(buf.length)}});
const a=r[1]===""?Math.max(0,buf.length-+r[2]):+r[1],e=r[1]!==""&&r[2]!==""?Math.min(+r[2],buf.length-1):buf.length-1;
if(a>e||a>=buf.length)return new Response(null,{status:416,headers:{"Content-Range":`bytes */${buf.length}`}});
return new Response(buf.subarray(a,e+1),{status:206,headers:{...h,"Content-Range":`bytes ${a}-${e}/${buf.length}`,"Content-Length":String(e-a+1)}})}
export async function PATCH(req,{params}){if(!isAdmin(req))return no("Tidak diizinkan.",401);let b;try{b=await req.json()}catch{return no("Data tidak valid.",400)}
const k=bk(params.id),title=clean(b.title,80);if(!b.restore&&!title)return no("Judul wajib diisi.",400);
if(k){await tx(db=>{db.builtin=db.builtin||{};const o=db.builtin[k]=db.builtin[k]||{};if(o.purged)return;if(b.restore)o.removed=false;else o.title=title});return ok()}
const f=await tx(db=>{const s=(db.songs||[]).find(x=>x.id===params.id);if(!s)return false;if(b.restore)s.removed=false;else s.title=title;return true});return f?ok():no("Lagu tidak ditemukan.",404)}
export async function DELETE(req,{params}){if(!isAdmin(req))return no("Tidak diizinkan.",401);const k=bk(params.id),perm=new URL(req.url).searchParams.get("permanent")==="1";
if(k){const r=await tx(db=>{db.builtin=db.builtin||{};const o=db.builtin[k]=db.builtin[k]||{};if(perm&&!o.removed)return "bad";if(perm)o.purged=true;else o.removed=true;return "ok"});
if(r==="bad")return no("Hapus dulu sebelum hapus permanen.",400);if(perm)await rmStatic(files[k-4]);return ok()}
const r=await tx(db=>{db.songs=db.songs||[];const s=db.songs.find(x=>x.id===params.id);if(!s)return "nf";if(perm){if(!s.removed)return "bad";db.songs=db.songs.filter(x=>x!==s);return "gone"}s.removed=true;return "ok"});
if(r==="nf")return no("Lagu tidak ditemukan.",404);if(r==="bad")return no("Hapus dulu sebelum hapus permanen.",400);if(r==="gone")await rmSong(params.id);return ok()}
