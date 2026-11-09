import fs from "fs/promises";import path from "path";import crypto from "crypto";

/* ===== Penyimpanan =====
   - Di Vercel (atau di mana pun ada env Upstash/KV Redis): data disimpan di Upstash Redis lewat REST (tanpa paket tambahan).
   - Di komputer sendiri / Render / VPS: tetap memakai file JSON di DATA_DIR (default folder data/). */
const REST_URL=(process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL||"").replace(/\/+$/,"");
const REST_TOKEN=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN||"";
const useRedis=!!(REST_URL&&REST_TOKEN);
function guard(){if(!useRedis&&process.env.VERCEL)throw new Error("Database belum disambungkan. Hubungkan Upstash Redis di tab Storage proyek Vercel lalu redeploy.")}

/* --- Redis (REST) --- */
const HK="whisperbox:messages",PK="whisperbox:photo:";
async function rest(url,body){const r=await fetch(url,{method:"POST",headers:{Authorization:"Bearer "+REST_TOKEN,"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});
const j=await r.json().catch(()=>null);if(!r.ok||j==null)throw new Error("Redis error "+r.status);return j}
async function cmd(args){const j=await rest(REST_URL,args);if(j.error)throw new Error("Redis: "+j.error);return j.result}
async function pipe(cmds){if(!cmds.length)return;const j=await rest(REST_URL+"/pipeline",cmds);if(!Array.isArray(j)||j.some(x=>x&&x.error))throw new Error("Redis pipeline gagal")}
async function readRedis(){const raw=await cmd(["HGETALL",HK]);const pairs=Array.isArray(raw)?raw:Object.entries(raw||{}).flat();
const messages=[],snap=new Map();
for(let i=0;i+1<pairs.length;i+=2){try{const m=JSON.parse(pairs[i+1]);messages.push(m);snap.set(m.id,JSON.stringify(m))}catch{}}
return {messages,snap}}
async function txRedis(fn){const {messages,snap}=await readRedis();const db={messages};const out=await fn(db);
const cmds=[],seen=new Set();
for(const m of db.messages){seen.add(m.id);const s=JSON.stringify(m);if(snap.get(m.id)!==s)cmds.push(["HSET",HK,m.id,s])}
for(const id of snap.keys())if(!seen.has(id))cmds.push(["HDEL",HK,id]);
await pipe(cmds);return out}

/* --- File JSON --- */
const dir=process.env.DATA_DIR||path.join(process.cwd(),"data"),file=path.join(dir,"db.json");let chain=Promise.resolve();
async function read(){try{return JSON.parse(await fs.readFile(file,"utf8"))}catch{return {messages:[]}}}
async function txFile(fn){const db=await read(),out=await fn(db);await fs.mkdir(dir,{recursive:true});await fs.writeFile(file+".tmp",JSON.stringify(db));await fs.rename(file+".tmp",file);return out}

export const load=()=>chain.then(async()=>{guard();return useRedis?{messages:(await readRedis()).messages}:read()});
export function tx(fn){const r=chain.then(async()=>{guard();return useRedis?txRedis(fn):txFile(fn)});chain=r.catch(()=>{});return r}
export const validId=id=>/^[a-f0-9]{12}$/.test(id);

/* --- Foto --- */
const upDir=()=>path.join(dir,"uploads"),upFile=id=>path.join(upDir(),id+".jpg");
export async function savePhoto(id,buf){guard();if(useRedis){await cmd(["SET",PK+id,buf.toString("base64")]);return}await fs.mkdir(upDir(),{recursive:true});await fs.writeFile(upFile(id),buf)}
export async function readPhoto(id){if(!validId(id))return null;guard();if(useRedis){const v=await cmd(["GET",PK+id]);return v?Buffer.from(v,"base64"):null}return fs.readFile(upFile(id)).catch(()=>null)}
export async function rmPhoto(id){if(!validId(id))return null;guard();if(useRedis){await cmd(["DEL",PK+id]);return}return fs.rm(upFile(id),{force:true})}

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
