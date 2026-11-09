import fs from "fs/promises";import path from "path";import crypto from "crypto";
const dir=process.env.DATA_DIR||path.join(process.cwd(),"data"),file=path.join(dir,"db.json");let chain=Promise.resolve();
async function read(){try{return JSON.parse(await fs.readFile(file,"utf8"))}catch{return {messages:[]}}}
export const load=()=>chain.then(read);
export function tx(fn){const r=chain.then(async()=>{const db=await read(),out=await fn(db);await fs.mkdir(dir,{recursive:true});await fs.writeFile(file+".tmp",JSON.stringify(db));await fs.rename(file+".tmp",file);return out});chain=r.catch(()=>{});return r}
export const validId=id=>/^[a-f0-9]{12}$/.test(id);
const upDir=()=>path.join(dir,"uploads"),upFile=id=>path.join(upDir(),id+".jpg");
export async function savePhoto(id,buf){await fs.mkdir(upDir(),{recursive:true});await fs.writeFile(upFile(id),buf)}
export const readPhoto=id=>validId(id)?fs.readFile(upFile(id)).catch(()=>null):null;
export const rmPhoto=id=>validId(id)?fs.rm(upFile(id),{force:true}):null;
export const newId=()=>crypto.randomBytes(6).toString("hex");
const hits=new Map();
export const clientIp=req=>(req.headers.get("x-forwarded-for")||req.headers.get("x-real-ip")||"local").split(",")[0].trim();
export function limited(req,max=10){const ip=clientIp(req),n=Date.now(),a=(hits.get(ip)||[]).filter(t=>n-t<60000);a.push(n);hits.set(ip,a);
if(hits.size>5000)for(const [k,v] of hits)if(!v.some(t=>n-t<60000))hits.delete(k);return a.length>max}
export const hashIp=req=>crypto.createHash("sha256").update(clientIp(req)+(process.env.ADMIN_KEY||"")).digest("hex").slice(0,16);
export const REPORT_LIMIT=+process.env.REPORT_LIMIT||3;
export const isAdmin=req=>{const k=process.env.ADMIN_KEY;return !!k&&req.headers.get("x-admin-key")===k};
export const publicView=({reporters,...m})=>m;
export const clean=(s,m)=>String(s??"").replace(/\s+/g," ").trim().slice(0,m);
