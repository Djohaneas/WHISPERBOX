import {NextResponse} from "next/server";import {load,isAdmin,publicView} from "../../../lib/db";
export const dynamic="force-dynamic";
export async function GET(req){if(!isAdmin(req))return NextResponse.json({error:"Tidak diizinkan."},{status:401});
const items=(await load()).messages.map(publicView).sort((a,b)=>(!!b.hidden-!!a.hidden)||(b.reports||0)-(a.reports||0)||b.createdAt-a.createdAt);
return NextResponse.json({total:items.length,items})}
