"use client";import {useState,useEffect} from "react";import {useRouter} from "next/navigation";import {Shell} from "../components";import {cats,themes,tracks,playMusic,stopMusic} from "../lib/data";
const inp="h-14 w-full rounded-2xl bg-white px-5 text-base outline-none focus:ring-4 focus:ring-pine/30";
export default function Create(){
const r=useRouter(),[f,setF]=useState({category:0,anonymous:false,from:"",to:"",text:"",theme:0,music:0,photo:""}),[err,setErr]=useState(""),[busy,setBusy]=useState(false);
const set=(k,v)=>setF(s=>({...s,[k]:v}));
useEffect(()=>{const p=new URLSearchParams(location.search),c=+p.get("c");if(p.get("c")!==null&&cats[c])set("category",c);if(p.get("anon"))set("anonymous",true);if(p.get("to"))set("to",p.get("to"));return stopMusic},[]);
async function pickPhoto(e){const file=e.target.files?.[0];if(!file)return;setErr("");if(!file.type.startsWith("image/"))return setErr("File harus berupa gambar.");
try{const bmp=await createImageBitmap(file),sc=Math.min(1,900/Math.max(bmp.width,bmp.height)),c=document.createElement("canvas");c.width=Math.round(bmp.width*sc);c.height=Math.round(bmp.height*sc);c.getContext("2d").drawImage(bmp,0,0,c.width,c.height);set("photo",c.toDataURL("image/jpeg",.8))}catch{setErr("Gagal membaca foto.")}}
async function submit(e){e.preventDefault();setErr("");setBusy(true);stopMusic();
try{const res=await fetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)}),d=await res.json();if(!res.ok)throw new Error(d.error);r.push(`/m/${d.id}?new=1`)}catch(x){setErr(x.message||"Gagal mengirim.");setBusy(false)}}
const mb=(i,full)=><button type="button" key={i} onClick={()=>{set("music",i);i?playMusic(i):stopMusic()}} className={`rounded-full px-4 py-2 text-sm font-medium transition hover:scale-[1.02] ${full?"text-left":""} ${f.music===i?"bg-ink text-sun":"bg-sage"}`}>{i?"🎵 ":""}{tracks[i]}</button>;
const [,bg,fg]=themes[f.theme];
return <Shell><h1 className="mt-4 px-3 text-center font-display text-[clamp(40px,8vw,72px)] leading-none">BUAT PESAN</h1>
<div className="mt-8 grid gap-3 lg:grid-cols-[1fr_380px]">
<form onSubmit={submit} className="card flex flex-col gap-6 bg-white p-6 hover:translate-y-0 sm:p-9">
<fieldset><legend className="mb-3 font-display text-xl">1. Kategori</legend><div className="flex flex-wrap gap-2">{cats.map((c,i)=><button type="button" key={c[0]} onClick={()=>set("category",i)} className={`rounded-full px-4 py-2 text-sm font-medium transition hover:scale-105 ${f.category===i?"bg-pine text-sun":"bg-sage"}`}>{c[2]} {c[0]}</button>)}</div></fieldset>
<fieldset className="grid gap-3"><legend className="mb-3 font-display text-xl">2. Pengirim & Penerima</legend>
<label className="flex cursor-pointer items-center gap-3 font-medium"><input type="checkbox" checked={f.anonymous} onChange={e=>set("anonymous",e.target.checked)} className="h-5 w-5 accent-[#22604A]"/>Kirim sebagai Anonim</label>
{!f.anonymous&&<input className={inp} placeholder="Nama pengirim (mis. Djohan)" maxLength={40} value={f.from} onChange={e=>set("from",e.target.value)}/>}
<input className={inp} placeholder="Nama penerima (mis. Ferly)" maxLength={40} required value={f.to} onChange={e=>set("to",e.target.value)}/></fieldset>
<fieldset><legend className="mb-3 font-display text-xl">3. Pesan</legend><textarea required rows={5} maxLength={600} className="w-full rounded-2xl bg-white p-5 outline-none ring-1 ring-ink/10 focus:ring-4 focus:ring-pine/30" placeholder="Tulis pesanmu di sini…" value={f.text} onChange={e=>set("text",e.target.value)}/><p className="mt-1 text-right text-xs">{f.text.length}/600</p></fieldset>
<fieldset><legend className="mb-3 font-display text-xl">Foto (opsional)</legend><input type="file" accept="image/*" onChange={pickPhoto} aria-label="Pilih foto" className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-sage file:px-4 file:py-2 file:font-medium"/>{f.photo&&<div className="mt-3 flex items-center gap-3"><img src={f.photo} alt="Pratinjau foto" className="h-20 rounded-xl"/><button type="button" onClick={()=>set("photo","")} className="rounded-full bg-sage px-4 py-2 text-sm font-medium">Hapus foto</button></div>}</fieldset>
<fieldset><legend className="mb-3 font-display text-xl">4. Tema & Musik</legend><div className="flex gap-3">{themes.map((t,i)=><button type="button" key={t[0]} aria-label={`Tema ${t[0]}`} onClick={()=>set("theme",i)} style={{background:t[1]}} className={`h-11 w-11 rounded-full transition hover:scale-110 ${f.theme===i?"ring-4 ring-ink":""}`}/>)}</div>
<div className="mt-4 flex flex-wrap gap-2">{[0,1,2,3].map(i=>mb(i))}</div>
<p className="mb-2 mt-5 text-sm font-medium">Lagu (ketuk untuk pratinjau, pilih "Tanpa musik" untuk berhenti)</p>
<div className="grid max-h-72 gap-2 overflow-y-auto pr-1">{tracks.slice(4).map((_,k)=>mb(k+4,true))}</div></fieldset>
<p className="text-sm">Pesan akan tampil di <b>Box Pesan</b> dan bisa dilihat siapa pun yang mencari nama penerima.</p>
{err&&<p role="alert" className="rounded-2xl bg-red-100 p-3 text-sm text-red-800">{err}</p>}
<button disabled={busy} className="pill h-14 bg-pine text-xl text-sun disabled:opacity-60">{busy?"MENGIRIM…":"KIRIM PESAN"}</button></form>
<aside className="lg:sticky lg:top-4 lg:self-start"><p className="mb-2 px-3 font-display text-lg">Pratinjau</p><div style={{background:bg,color:fg}} className="card min-h-[260px] p-8 transition-colors"><p className="text-sm font-medium opacity-80">{cats[f.category][2]} {cats[f.category][0]}</p><p className="mt-3 font-display text-3xl">Untuk: {f.to||"…"}</p><p className="mt-4 whitespace-pre-wrap break-words leading-snug">{f.text||"Pesanmu akan tampil di sini."}</p>{f.photo&&<img src={f.photo} alt="" className="mt-4 max-h-48 w-full rounded-2xl object-cover"/>}<p className="mt-6 text-sm font-medium">— {f.anonymous?"Anonim":f.from||"…"}</p></div></aside></div></Shell>}
