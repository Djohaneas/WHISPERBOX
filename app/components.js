"use client";import Link from "next/link";import {usePathname} from "next/navigation";import {useState,useEffect} from "react";
export const Logo=()=><Link href="/" className="flex items-center gap-2 sm:gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[45%] bg-sun sm:h-16 sm:w-16"><img src="/cherub.png" alt="" className="h-10 w-auto translate-y-1 sm:h-14"/></span><img src="/logo-wordmark.png" alt="WhisperBox" className="h-5 w-auto sm:h-7 md:h-8 min-[900px]:h-6 lg:h-8"/></Link>;
const links=[["Cara Kerja","/#cara"],["Kategori","/#kategori"],["Box Pesan","/box"],["Buat Pesan","/create"]];
const admins=[["Djohan Ericke Ajisaputra","6282298409805","+62 822-9840-9805","djohaneas978@gmail.com","djohan_eas"],["Muhammad Ferly Anggaditama","6285724955167","+62 857-2495-5167","ferlyangga20@gmail.com","notforsomeoneelsep"]];
const chip="flex items-center gap-2 rounded-full bg-sage px-4 py-2.5 font-medium break-all transition hover:scale-[1.02] hover:bg-sun";
function Contact({onClose}){
useEffect(()=>{const k=e=>e.key==="Escape"&&onClose(),o=document.body.style.overflow;addEventListener("keydown",k);document.body.style.overflow="hidden";return()=>{removeEventListener("keydown",k);document.body.style.overflow=o}},[onClose]);
return <div role="dialog" aria-modal="true" aria-label="Contact Person" onClick={onClose} className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/60 p-4">
<div onClick={e=>e.stopPropagation()} className="relative my-auto w-full max-w-3xl animate-pop rounded-[32px] bg-sage p-5 shadow-2xl sm:p-8"><button onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-ink text-sun transition hover:scale-110">✕</button>
<h2 className="pr-12 font-display text-3xl">CONTACT PERSON</h2><p className="mt-1 text-sm">Hubungi admin WhisperBox untuk pertanyaan, laporan, atau bantuan.</p>
<div className="mt-5 grid gap-3 md:grid-cols-2">{admins.map(([n,wa,tel,em,ig])=><div key={n} className="rounded-3xl bg-white p-5"><p className="font-display text-lg leading-tight">{n}</p><p className="text-xs opacity-70">Admin WhisperBox</p>
<ul className="mt-3 grid gap-2"><li><a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={chip}>💬 WhatsApp · {tel}</a></li>
<li><a href={`mailto:${em}`} className={chip}>✉️ Email · {em}</a></li>
<li><a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" className={chip}>📸 Instagram · @{ig}</a></li></ul></div>)}</div></div></div>}
export function Nav(){const p=usePathname(),[open,setOpen]=useState(false),[contact,setContact]=useState(false),lk="font-medium hover:underline hover:underline-offset-4",act=h=>p===h?"underline underline-offset-4":"";
return <><header className="relative flex items-center justify-between px-2 py-3 sm:px-6"><Logo/>
<nav aria-label="Menu utama" className="hidden gap-4 text-[15px] min-[900px]:flex lg:gap-5">{links.map(([t,h])=><Link key={t} href={h} className={`${lk} ${act(h)}`}>{t}</Link>)}</nav>
<div className="flex items-center gap-2"><Link href="/create" className="pill relative hidden h-14 bg-pine px-5 text-lg tracking-wide text-sun sm:inline-flex lg:px-7">KIRIM<span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink text-[11px] text-sun">5</span></Link>
<button aria-label="Menu" aria-expanded={open} onClick={()=>setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-full bg-ink text-sun">{open?"✕":"☰"}</button></div>
{open&&<div className="absolute left-3 right-3 top-[76px] z-30 flex flex-col gap-4 rounded-3xl bg-white p-6 text-lg shadow-xl sm:left-auto sm:w-72">{links.map(([t,h])=><Link key={t} href={h} onClick={()=>setOpen(false)} className={`${lk} ${act(h)}`}>{t}</Link>)}
<button onClick={()=>{setOpen(false);setContact(true)}} className={`${lk} text-left`}>Contact Person</button></div>}</header>
{contact&&<Contact onClose={()=>setContact(false)}/>}</>}
export function Footer(){const [contact,setContact]=useState(false);
return <footer className="mt-3 px-3 py-6 text-sm"><div className="flex flex-wrap items-center justify-between gap-4"><Logo/><nav aria-label="Menu footer" className="flex flex-wrap gap-x-5 gap-y-2 font-medium">{links.map(([t,h])=><Link key={t} href={h} className="hover:underline">{t}</Link>)}<button onClick={()=>setContact(true)} className="hover:underline">Contact Person</button></nav></div>
<p className="mt-4 text-xs opacity-70">© {new Date().getFullYear()} WhisperBox · SMAN 1 Purwakarta (SMANSA) Confessions</p><p className="mt-1 text-xs opacity-60">Demi keamanan, WhisperBox mencatat aktivitas akses (alamat IP dan jenis perangkat).</p>
{contact&&<Contact onClose={()=>setContact(false)}/>}</footer>}
export const Shell=({children})=><main className="mx-auto min-h-screen max-w-[1080px] bg-sage p-3 sm:p-4"><Nav/>{children}<Footer/></main>;
export const ago=t=>{const s=(Date.now()-t)/1000;return s<60?"baru saja":s<3600?`${~~(s/60)} mnt lalu`:s<86400?`${~~(s/3600)} jam lalu`:`${~~(s/86400)} hari lalu`};
