import fs from "fs/promises";import path from "path";import crypto from "crypto";

/* ===== Penyimpanan =====
   - Ada env Upstash/KV Redis (Vercel)  -> semua data disimpan di Upstash Redis lewat REST (tanpa paket tambahan).
   - Tidak ada (komputer sendiri/Render/VPS) -> file JSON di DATA_DIR (default folder data/), seperti sebelumnya. */
const REST_URL=(process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL||"").replace(/\/+$/,"");
const REST_TOKEN=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN||"";
const useRedis=!!(REST_URL&&REST_TOKEN);
function needDb(){if(!useRedis&&process.env.VERCEL)throw new Error("Database belum disambungkan. Hubungkan Upstash Redis di tab Storage proyek Vercel lalu redeploy.")}

/* ----- Redis REST ----- */
const HK="wb:db",K_DEV="wb:dev",K_ACT="wb:act",K_BL="wb:blocks",K_PRES="wb:pres",PK="wb:photo:",SK="wb:song:";
async function rest(url,body){const r=await fetch(url,{method:"POST",headers:{Authorization:"Bearer "+REST_TOKEN,"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});
const j=await r.json().catch(()=>null);if(!r.ok||j==null)throw new Error("Redis error "+r.status);return j}
async function cmd(args){const j=await rest(REST_URL,args);if(j.error)throw new Error("Redis: "+j.error);return j.result}
async function pipeR(cmds){if(!cmds.length)return [];const j=await rest(REST_URL+"/pipeline",cmds);if(!Array.isArray(j)||j.some(x=>x&&x.error))throw new Error("Redis pipeline gagal");return j.map(x=>x.result)}
const pairsOf=raw=>Array.isArray(raw)?raw:Object.entries(raw||{}).flat();
const parse=s=>{try{return JSON.parse(s)}catch{return null}};

/* Data utama (pesan, lagu unggahan, pengaturan lagu bawaan) = satu hash: m:<id>, s:<id>, b */
async function readRedis(){const pairs=pairsOf(await cmd(["HGETALL",HK]));const db={messages:[],songs:[],builtin:{}},snap=new Map();
for(let i=0;i+1<pairs.length;i+=2){const f=pairs[i],v=parse(pairs[i+1]);if(v==null)continue;
if(f.startsWith("m:"))db.messages.push(v);else if(f.startsWith("s:"))db.songs.push(v);else if(f==="b")db.builtin=v;else continue;snap.set(f,JSON.stringify(v))}
db.songs.sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));return {db,snap}}
async function txRedis(fn){const {db,snap}=await readRedis();const out=await fn(db);const want=new Map();
for(const m of db.messages)want.set("m:"+m.id,JSON.stringify(m));for(const s of db.songs||[])want.set("s:"+s.id,JSON.stringify(s));
if(db.builtin&&Object.keys(db.builtin).length)want.set("b",JSON.stringify(db.builtin));
const set=[],del=[];for(const [f,s] of want)if(snap.get(f)!==s)set.push(f,s);for(const f of snap.keys())if(!want.has(f))del.push(f);
const cmds=[];if(set.length)cmds.push(["HSET",HK,...set]);if(del.length)cmds.push(["HDEL",HK,...del]);await pipeR(cmds);return out}

/* ----- File JSON ----- */
const dir=process.env.DATA_DIR||path.join(process.cwd(),"data"),file=path.join(dir,"db.json");let chain=Promise.resolve();
async function read(){try{return JSON.parse(await fs.readFile(file,"utf8"))}catch{return {messages:[]}}}
async function txFile(fn){const db=await read(),out=await fn(db);await fs.mkdir(dir,{recursive:true});await fs.writeFile(file+".tmp",JSON.stringify(db));await fs.rename(file+".tmp",file);return out}

export const load=()=>chain.then(async()=>{needDb();return useRedis?(await readRedis()).db:read()});
export function tx(fn){const r=chain.then(async()=>{needDb();return useRedis?txRedis(fn):txFile(fn)});chain=r.catch(()=>{});return r}
export const validId=id=>/^[a-f0-9]{12}$/.test(id);

/* ----- Foto ----- */
const upDir=()=>path.join(dir,"uploads"),upFile=id=>path.join(upDir(),id+".jpg");
export async function savePhoto(id,buf){needDb();if(useRedis){await cmd(["SET",PK+id,buf.toString("base64")]);return}await fs.mkdir(upDir(),{recursive:true});await fs.writeFile(upFile(id),buf)}
export async function readPhoto(id){if(!validId(id))return null;needDb();if(useRedis){const v=await cmd(["GET",PK+id]);return v?Buffer.from(v,"base64"):null}return fs.readFile(upFile(id)).catch(()=>null)}
export async function rmPhoto(id){if(!validId(id))return null;needDb();if(useRedis){await cmd(["DEL",PK+id]);return}return fs.rm(upFile(id),{force:true})}

export const newId=()=>crypto.randomBytes(6).toString("hex");
const hits=new Map();
export const clientIp=req=>(req.headers.get("x-forwarded-for")||req.headers.get("x-real-ip")||"local").split(",")[0].trim();
export function limited(req,max=10){const ip=clientIp(req),n=Date.now(),a=(hits.get(ip)||[]).filter(t=>n-t<60000);a.push(n);hits.set(ip,a);
if(hits.size>5000)for(const [k,v] of hits)if(!v.some(t=>n-t<60000))hits.delete(k);return a.length>max}
export const hashIp=req=>crypto.createHash("sha256").update(clientIp(req)+(process.env.ADMIN_KEY||"")).digest("hex").slice(0,16);
export const REPORT_LIMIT=+process.env.REPORT_LIMIT||3;
export const AUTO_DELETE_LIMIT=+process.env.AUTO_DELETE_LIMIT||15;
export const isAdmin=req=>{const k=process.env.ADMIN_KEY;return !!k&&req.headers.get("x-admin-key")===k};
export const publicView=({reporters,...m},admin=false)=>({...m,replies:(m.replies||[]).filter(r=>admin||!r.deleted).map(({reporters:_r,...r})=>r)});
export const clean=(s,m)=>String(s??"").replace(/\s+/g," ").trim().slice(0,m);

/* ----- Lagu unggahan (mp3) ----- */
const sgDir=()=>path.join(dir,"songs"),sgFile=id=>path.join(sgDir(),id+".mp3"),CH=2000000; /* di Redis disimpan per potongan 2 MB */
export async function saveSong(id,buf){needDb();if(useRedis){const n=Math.ceil(buf.length/CH);
for(let i=0;i<n;i++)await cmd(["SET",SK+id+":"+i,buf.subarray(i*CH,(i+1)*CH).toString("base64")]);await cmd(["SET",SK+id+":n",String(n)]);return}
await fs.mkdir(sgDir(),{recursive:true});await fs.writeFile(sgFile(id),buf)}
export async function readSong(id){if(!validId(id))return null;needDb();if(useRedis){const n=+(await cmd(["GET",SK+id+":n"]));if(!n)return null;
const parts=await Promise.all(Array.from({length:n},(_,i)=>cmd(["GET",SK+id+":"+i])));if(parts.some(p=>!p))return null;return Buffer.concat(parts.map(p=>Buffer.from(p,"base64")))}
return fs.readFile(sgFile(id)).catch(()=>null)}
export async function rmSong(id){if(!validId(id))return null;needDb();if(useRedis){const n=+(await cmd(["GET",SK+id+":n"]))||0;
await cmd(["DEL",SK+id+":n",...Array.from({length:n},(_,i)=>SK+id+":"+i)]);return}return fs.rm(sgFile(id),{force:true})}

export const rmStatic=name=>fs.rm(path.join(process.cwd(),"public","songs",name+".mp3"),{force:true}).catch(()=>{});

/* ===== Pengawas: perangkat, aktivitas, blokir =====
   File: data/monitor.json (+ cache memori).  Redis: hash perangkat, daftar aktivitas, hash blokir, hash kehadiran. */
const mFile=()=>path.join(dir,"monitor.json");
const pres=()=>globalThis.__wbPres||(globalThis.__wbPres=new Map());
export const presence=pres;
const blKey=b=>b.kind+"|"+b.value;
async function blocksR(force){const g=globalThis,c=g.__wbBl;if(!force&&c&&Date.now()-c.t<15000)return c.list;
const p=pairsOf(await cmd(["HGETALL",K_BL])),list=[];for(let i=0;i+1<p.length;i+=2){const b=parse(p[i+1]);if(b)list.push(b)}
list.sort((a,b)=>(a.at||0)-(b.at||0));g.__wbBl={t:Date.now(),list};return list}
async function mloadR(){const [dv,act,bl,pr]=await pipeR([["HGETALL",K_DEV],["LRANGE",K_ACT,0,399],["HGETALL",K_BL],["HGETALL",K_PRES]]);
const devices={},stale=[],dp=pairsOf(dv);for(let i=0;i+1<dp.length;i+=2){const d=parse(dp[i+1]);if(d)devices[dp[i]]=d}
const ks=Object.keys(devices);if(ks.length>1000){ks.sort((a,b)=>(devices[a].last||0)-(devices[b].last||0));const old=ks.slice(0,ks.length-1000);old.forEach(k=>delete devices[k]);await cmd(["HDEL",K_DEV,...old]).catch(()=>{})}
const activity=(act||[]).map(parse).filter(Boolean).reverse(),pp=pairsOf(pr),m=pres(),n=Date.now();m.clear();
for(let i=0;i+1<pp.length;i+=2){const v=parse(pp[i+1]);if(!v)continue;if(n-v.t>600000)stale.push(pp[i]);else m.set(pp[i],v)}
if(stale.length)await cmd(["HDEL",K_PRES,...stale]).catch(()=>{});
const blocks=pairsOf(bl).filter((_,i)=>i%2).map(parse).filter(Boolean).sort((a,b)=>(a.at||0)-(b.at||0));
return {devices,activity,blocks}}
async function mutateR(fn){const cur=await blocksR(true),m={devices:{},activity:[],blocks:cur.map(b=>({...b}))},before=new Map(cur.map(b=>[blKey(b),JSON.stringify(b)]));
const out=fn(m),after=new Map(m.blocks.map(b=>[blKey(b),JSON.stringify(b)])),cmds=[];
for(const [k,s] of after)if(before.get(k)!==s)cmds.push(["HSET",K_BL,k,s]);for(const k of before.keys())if(!after.has(k))cmds.push(["HDEL",K_BL,k]);
await pipeR(cmds);globalThis.__wbBl=null;return out}

export function mload(){if(useRedis)return mloadR();const g=globalThis;g.__wbMonP=g.__wbMonP||(async()=>{let o={};try{o=JSON.parse(await fs.readFile(mFile(),"utf8"))}catch{}return {devices:{},activity:[],blocks:[],...o}})();return g.__wbMonP}
async function mflush(now){const g=globalThis,run=async()=>{g.__wbT=null;try{const m=await mload();await fs.mkdir(dir,{recursive:true});await fs.writeFile(mFile()+".tmp",JSON.stringify(m));await fs.rename(mFile()+".tmp",mFile())}catch{}};
if(now){if(g.__wbT)clearTimeout(g.__wbT);return run()}if(!g.__wbT)g.__wbT=setTimeout(run,4000)}
export async function mutate(fn,now){if(useRedis)return mutateR(fn);const m=await mload(),out=fn(m);await mflush(now);return out}
export const didOf=req=>{const m=/(?:^|;\s*)wb_did=([a-f0-9]{16,32})/.exec(req.headers.get("cookie")||"");return m?m[1]:"ip-"+hashIp(req)};
/* ping: di Redis mengembalikan Promise, jadi harus di-await oleh pemanggil */
export function ping(did,p){if(useRedis)return cmd(["HSET",K_PRES,did,JSON.stringify({t:Date.now(),path:p||""})]).catch(()=>{});
const m=pres(),o=m.get(did),n=Date.now();m.set(did,{t:n,path:p||o?.path});if(m.size>5000)for(const [k,v] of m)if(n-v.t>600000)m.delete(k)}
export async function guard(req){if(isAdmin(req))return false;let bl;try{bl=useRedis?await blocksR():(await mload()).blocks}catch{return false}
const did=didOf(req),ip=clientIp(req);return bl.some(b=>b.kind==="device"?b.value===did:b.value===ip)}
export const blockedRes=()=>new Response(JSON.stringify({error:"Akses diblokir oleh admin."}),{status:403,headers:{"content-type":"application/json"}});
async function trackR(req,type,detail,p){const did=didOf(req),ip=clientIp(req),ua=(req.headers.get("user-agent")||"").slice(0,200),n=Date.now();
try{const cur=parse(await cmd(["HGET",K_DEV,did]))||{id:did,first:n,hits:0,ips:[]};cur.last=n;cur.hits=(cur.hits||0)+1;cur.ua=ua;cur.ip=ip;cur.path=p||cur.path;cur.ips=cur.ips||[];
if(!cur.ips.includes(ip)){cur.ips.push(ip);if(cur.ips.length>5)cur.ips.shift()}
await pipeR([["HSET",K_DEV,did,JSON.stringify(cur)],["LPUSH",K_ACT,JSON.stringify({t:n,did,ip,type,detail:String(detail).slice(0,120)})],["LTRIM",K_ACT,0,1499],["HSET",K_PRES,did,JSON.stringify({t:n,path:p||cur.path||""})]])}catch{}}
export async function track(req,type,detail="",p){if(useRedis)return trackR(req,type,detail,p);
const did=didOf(req),ip=clientIp(req),ua=(req.headers.get("user-agent")||"").slice(0,200),n=Date.now();ping(did,p);
try{await mutate(m=>{const d=m.devices[did]=m.devices[did]||{id:did,first:n,hits:0,ips:[]};d.last=n;d.hits++;d.ua=ua;d.ip=ip;d.path=p||d.path;if(!d.ips.includes(ip)){d.ips.push(ip);if(d.ips.length>5)d.ips.shift()}
const ks=Object.keys(m.devices);if(ks.length>1000){ks.sort((a,b)=>m.devices[a].last-m.devices[b].last);ks.slice(0,ks.length-1000).forEach(k=>delete m.devices[k])}
m.activity.push({t:n,did,ip,type,detail:String(detail).slice(0,120)});if(m.activity.length>1500)m.activity.splice(0,m.activity.length-1500)})}catch{}}
