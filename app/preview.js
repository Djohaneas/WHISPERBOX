"use client";import {useState,useEffect,useRef} from "react";import Link from "next/link";import {cats,themeOf} from "./lib/data";
export default function Preview(){const [items,setItems]=useState(null),ref=useRef(null);
useEffect(()=>{fetch("/api/messages").then(r=>r.json()).then(d=>setItems((d.items||[]).slice(0,12))).catch(()=>setItems([]))},[]);
const n=items?.length||0,copies=n?Math.max(2,Math.ceil(1500/(n*312))):0;
useEffect(()=>{const el=ref.current;if(!n||!el||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
let raf,last=0,pos=el.scrollLeft;
const step=t=>{if(!last)last=t;const dt=Math.min(t-last,50);last=t;const a=el.children[0],b=el.children[n],set=a&&b?b.offsetLeft-a.offsetLeft:0;
if(Math.abs(el.scrollLeft-pos)>2)pos=el.scrollLeft;
pos+=0.04*dt;if(set>0&&pos>=set)pos-=set;el.scrollLeft=pos;raf=requestAnimationFrame(step)};
raf=requestAnimationFrame(step);return()=>cancelAnimationFrame(raf)},[n]);
if(!items)return <p className="mt-8 text-sm" aria-live="polite">Memuat pesan…</p>;
return <div className="mt-8 text-left"><p className="mb-3 px-1 text-sm font-medium">Pesan terbaru di Box</p>
{n?<ul ref={ref} aria-label="Pratinjau pesan" className="no-sb flex gap-3 overflow-x-auto pb-3">{Array.from({length:copies}).flatMap((_,c)=>items.map(m=>{const [,bg,fg]=themeOf(m.theme),ic=cats.find(x=>x[0]===m.category)?.[2];
return <li key={m.id+"-"+c} aria-hidden={c>0||undefined} className="w-[260px] shrink-0 sm:w-[300px]"><Link href={`/m/${m.id}`} tabIndex={c>0?-1:undefined} style={{background:bg,color:fg}} className="card flex h-full min-h-[180px] flex-col p-5 shadow-md ring-1 ring-black/10"><span className="text-xs font-medium opacity-80">{ic} {m.category}</span><b className="mt-1 break-words font-display text-xl font-normal">Untuk: {m.to}</b><p className="mt-1 line-clamp-3 flex-1 break-words text-sm leading-snug">{m.text}</p><span className="mt-3 text-xs font-medium">— {m.from}</span></Link></li>}))}</ul>
:<p className="rounded-3xl bg-white/60 p-6 text-center text-sm">Belum ada pesan. <Link href="/create" className="font-bold underline">Jadilah yang pertama</Link>.</p>}
<div className="mt-2 text-center"><Link href="/box" className="pill h-11 bg-ink px-6 text-sm text-sun">LIHAT SEMUA PESAN</Link></div></div>}
