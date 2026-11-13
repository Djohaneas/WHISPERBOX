import {NextResponse} from "next/server";import {guard,track,ping,didOf} from "../../lib/db";
export const dynamic="force-dynamic";
export async function POST(req){if(await guard(req))return NextResponse.json({blocked:true});
let b={};try{b=await req.json()}catch{}const p=String(b.path||"/").slice(0,120);if(!p.startsWith("/")||p.startsWith("/admin"))return NextResponse.json({blocked:false});
if(b.type==="ping")ping(didOf(req),p);else await track(req,"view",p,p);return NextResponse.json({blocked:false})}
