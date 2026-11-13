"use client";import {useEffect,useState} from "react";import {usePathname} from "next/navigation";
function did(){try{let d=localStorage.getItem("wb_did");if(!d||!/^[a-f0-9]{32}$/.test(d)){d=[...crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,"0")).join("");localStorage.setItem("wb_did",d)}document.cookie=`wb_did=${d}; path=/; max-age=31536000; SameSite=Lax`;return d}catch{return null}}
const send=(type,path)=>fetch("/api/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,path})}).then(r=>r.json());
export default function Tracker(){const p=usePathname(),[blocked,setBlocked]=useState(false);
useEffect(()=>{if(p.startsWith("/admin"))return;did();send("view",p+location.search).then(d=>setBlocked(!!d.blocked)).catch(()=>{})},[p]);
useEffect(()=>{if(p.startsWith("/admin"))return;const t=setInterval(()=>{if(document.visibilityState==="visible")send("ping",p).then(d=>d.blocked&&setBlocked(true)).catch(()=>{})},30000);return()=>clearInterval(t)},[p]);
if(!blocked)return null;
return <div role="alert" className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-ink p-6 text-center text-sage"><div><p className="text-6xl">🚫</p><h1 className="mt-4 font-display text-4xl">AKSES DIBLOKIR</h1><p className="mx-auto mt-3 max-w-md">Perangkat atau jaringan ini diblokir oleh admin karena pelanggaran. Hubungi admin jika ini sebuah kesalahan.</p></div></div>}
