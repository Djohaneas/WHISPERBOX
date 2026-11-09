"use client";import {useState,useEffect,useCallback} from "react";import {Shell,ago} from "../components";
export default function Admin(){
const [key,setKey]=useState(""),[input,setInput]=useState(""),[d,setD]=useState(null),[err,setErr]=useState("");
const load=useCallback(async k=>{setErr("");const r=await fetch("/api/admin/messages",{headers:{"x-admin-key":k}});if(!r.ok){setD(null);setKey("");try{sessionStorage.removeItem("wbk")}catch{}return setErr(r.status===401?"Kunci admin salah atau belum diatur (ADMIN_KEY).":"Gagal memuat.")}
setKey(k);setD(await r.json());try{sessionStorage.setItem("wbk",k)}catch{}},[]);
useEffect(()=>{try{const k=sessionStorage.getItem("wbk");if(k)load(k)}catch{}},[load]);
async function act(id,method){if(method==="DELETE"&&!confirm("Hapus permanen pesan ini?"))return;const r=await fetch(`/api/messages/${id}`,{method,headers:{"x-admin-key":key}});if(!r.ok)setErr("Aksi gagal.");load(key)}
if(!key)return <Shell><section className="card mt-2 bg-white p-8 text-center hover:translate-y-0 sm:p-12"><h1 className="font-display text-5xl">ADMIN</h1>
<form onSubmit={e=>{e.preventDefault();load(input)}} className="mx-auto mt-6 flex max-w-md flex-col gap-3"><input type="password" value={input} onChange={e=>setInput(e.target.value)} placeholder="Kunci admin" aria-label="Kunci admin" className="h-14 rounded-full bg-sage px-6 outline-none focus:ring-4 focus:ring-pine/40"/><button className="pill h-14 bg-pine text-sun">MASUK</button></form>
{err&&<p role="alert" className="mt-4 text-sm text-red-700">{err}</p>}</section></Shell>;
return <Shell><section className="card mt-2 flex flex-wrap items-center justify-between gap-3 bg-sun p-6 hover:translate-y-0"><h1 className="font-display text-4xl">ADMIN · {d?d.total:"…"} pesan</h1><button onClick={()=>{setKey("");setD(null);try{sessionStorage.removeItem("wbk")}catch{}}} className="pill h-11 bg-ink px-6 text-sun">KELUAR</button></section>
{err&&<p role="alert" className="mt-3 rounded-2xl bg-red-100 p-3 text-sm text-red-800">{err}</p>}
<ul className="mt-3 grid gap-3">{d?.items.map(m=><li key={m.id} className={`card p-5 hover:translate-y-0 ${m.hidden?"bg-red-100":"bg-white"}`}>
<div className="flex flex-wrap items-center gap-2 text-xs font-medium"><span>{m.category}</span><span>· {ago(m.createdAt)}</span><span>· 🚩 {m.reports||0}</span>{m.photo&&<span>· 📷</span>}{m.hidden&&<b className="rounded-full bg-red-600 px-2 py-0.5 text-white">DISEMBUNYIKAN</b>}</div>
<p className="mt-2 font-display text-xl break-words">Untuk: {m.to} <span className="font-body text-sm">dari {m.from}</span></p><p className="mt-1 whitespace-pre-wrap break-words">{m.text}</p>
{m.photo&&<img src={`/api/messages/${m.id}/photo`} alt="" className="mt-3 max-h-48 rounded-xl"/>}
<div className="mt-4 flex flex-wrap gap-2"><a href={`/m/${m.id}`} target="_blank" rel="noreferrer" className="pill h-10 bg-sage px-5 text-sm">Buka</a>{(m.hidden||m.reports>0)&&<button onClick={()=>act(m.id,"PATCH")} className="pill h-10 bg-pine px-5 text-sm text-sun">Pulihkan</button>}<button onClick={()=>act(m.id,"DELETE")} className="pill h-10 bg-ink px-5 text-sm text-sun">Hapus</button></div></li>)}</ul></Shell>}
