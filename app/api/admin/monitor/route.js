import {NextResponse} from "next/server";import {mload,mutate,isAdmin,presence,didOf,clientIp} from "../../../lib/db";
export const dynamic="force-dynamic";
const no=(m,s)=>NextResponse.json({error:m},{status:s});
export async function GET(req){if(!isAdmin(req))return no("Tidak diizinkan.",401);const m=await mload(),pr=presence(),n=Date.now(),bl=m.blocks;
const devices=Object.values(m.devices).map(d=>{const p=pr.get(d.id);return {...d,online:!!p&&n-p.t<75000,curPath:p?.path||d.path,blockedDevice:bl.some(b=>b.kind==="device"&&b.value===d.id),blockedIp:bl.some(b=>b.kind==="ip"&&b.value===d.ip)}}).sort((a,b)=>(+b.online-+a.online)||b.last-a.last);
return NextResponse.json({you:{did:didOf(req),ip:clientIp(req)},online:devices.filter(d=>d.online).length,devices,activity:m.activity.slice(-400).reverse(),blocks:[...bl].reverse()})}
export async function POST(req){if(!isAdmin(req))return no("Tidak diizinkan.",401);let b;try{b=await req.json()}catch{return no("Data tidak valid.",400)}
const kind=b.kind==="ip"?"ip":"device",value=String(b.value||"").trim().slice(0,64),reason=String(b.reason||"").replace(/\s+/g," ").trim().slice(0,120);
if(!value)return no("Nilai kosong.",400);
if(b.action==="unblock"){await mutate(m=>{m.blocks=m.blocks.filter(x=>!(x.kind===kind&&x.value===value))},true);return NextResponse.json({ok:true})}
if(b.action!=="block")return no("Aksi tidak dikenal.",400);
if(kind==="device"&&!/^([a-f0-9]{16,32}|ip-[a-f0-9]+)$/.test(value))return no("ID perangkat tidak valid.",400);
if(value===(kind==="device"?didOf(req):clientIp(req)))return no("Tidak bisa memblokir perangkat/jaringan Anda sendiri.",400);
await mutate(m=>{if(!m.blocks.some(x=>x.kind===kind&&x.value===value))m.blocks.push({kind,value,reason,at:Date.now()})},true);return NextResponse.json({ok:true})}
