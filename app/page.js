"use client";import {useState} from "react";import Link from "next/link";import {useRouter} from "next/navigation";import {Shell} from "./components";import Preview from "./preview";import {cats} from "./lib/data";
const steps=[["Pilih Kategori","Confess, Birthday, Say Sorry, Thank You, atau General Message."],["Isi Pengirim & Penerima","Kirim anonim, atau cantumkan nama/inisial dan nama penerima."],["Tulis & Kustomisasi","Ketik pesan, pilih tema kartu, warna, musik, atau tambah foto."],["Generate Link","Sistem otomatis membuat link unik khusus untuk pesanmu."],["Kirim ke Penerima","Salin link ke WhatsApp/IG, atau bagikan publik di feed."],["Dibuka & Dibalas","Penerima melihat animasi kartu, mendengar musik, lalu membalas."]];
const perks=[["bg-sky","Bagi Pengirim","Memudahkan yang pemalu atau canggung menyampaikan perasaan, selamat, atau maaf dengan cara estetik dan kreatif."],["bg-tang","Bagi Penerima","Pengalaman berkesan dan spesial saat menerima serta membaca ucapan."],["bg-sun","Responsif & Mudah","Nyaman dibuka di HP maupun laptop, dengan link unik dan balasan di halaman yang sama."]];
const Plus=()=><svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke="#F4BC62" strokeWidth="2.4" strokeLinecap="round"/></svg>;
export default function Home(){
const [sel,setSel]=useState(0),[q,setQ]=useState(""),router=useRouter();
return <Shell>

<section className="mt-2 grid gap-3 lg:grid-cols-[1fr_310px]">
<div className="flex flex-col gap-3">
<div className="card relative flex min-h-[700px] flex-col justify-end overflow-hidden bg-sun p-5 sm:min-h-[555px] sm:p-9">
<div className="hero-wrap pointer-events-none absolute inset-x-0 top-[17%] select-none"><div className="hero-title whitespace-nowrap text-center font-display leading-[.82] text-white">SAY IT<br/>SOFTLY!</div></div>
<img src="/cherub.png" alt="Malaikat WhisperBox membawa bunga" className="absolute left-1/2 top-[8%] w-[34%] min-w-[150px] max-w-[250px] animate-float drop-shadow-[0_24px_24px_rgba(120,70,0,.35)]"/>
<Link href={`/create?c=${sel}&anon=1`} aria-label="Kirim pesan anonim" className="pill absolute left-1/2 top-[46%] z-10 h-[88px] w-[132px] -translate-x-1/2 flex-col bg-pine leading-none text-sun"><small className="font-body text-xs font-medium">BISA</small><b className="text-xl font-normal">ANONIM</b></Link>
<div className="relative z-10 flex flex-wrap items-end justify-between gap-5">
<p className="w-full max-w-[260px] text-[15px] leading-snug sm:w-auto sm:max-w-[210px]">{cats[sel][1]}. Dikemas jadi kartu digital interaktif.</p>
<div className="flex items-center gap-2 font-display text-white"><span className="text-4xl text-white/70">(</span><div className="text-center leading-none"><div className="text-[44px]">5</div><div className="font-body text-sm">kategori pesan</div></div><span className="text-4xl text-white/70">)</span></div>
<div className="flex gap-2">{cats.slice(0,3).map((c,i)=><button key={i} aria-label={c[0]} onClick={()=>setSel(i)} className={`grid h-11 w-11 place-items-center rounded-2xl text-xl sm:h-[52px] sm:w-[52px] sm:text-2xl transition hover:scale-110 ${sel===i?"bg-white/90 ring-2 ring-white":"bg-white/40"}`}>{c[2]}</button>)}</div></div></div>

<div id="kategori" className="card scroll-mt-4 bg-white p-6 sm:p-9"><div className="grid gap-6 md:grid-cols-[200px_1fr]">
<h2 className="font-display text-[clamp(44px,7vw,64px)] leading-[.95]">TOP-5<br/>PICKS</h2>
<ul>{cats.map((c,i)=><li key={c[0]} className="flex items-center gap-3 border-b border-ink/10 py-3 last:border-0 sm:gap-4">
<span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky text-2xl">{c[2]}</span>
<b className="min-w-0 flex-1 text-sm leading-tight sm:w-28 sm:flex-none">{c[0]}</b><p className="hidden flex-1 text-sm sm:block">{c[1]}</p>
<div className="ml-auto hidden text-right text-xs leading-tight min-[420px]:block sm:ml-0"><b className="text-sm">Anonim</b><br/>atau nama</div>
<button aria-label={`Pilih ${c[0]}`} onClick={()=>router.push(`/create?c=${i}`)} className="pill h-9 w-11 shrink-0 bg-pine hover:rotate-12"><Plus/></button></li>)}</ul></div></div></div>

<div className="flex flex-col gap-3">
<div className="card relative min-h-[285px] overflow-hidden bg-sky p-6 text-center"><h3 className="font-display text-[56px] leading-none">CONFESS</h3><p className="mt-1 text-[15px]">Ungkapkan perasaan tanpa canggung</p>
<svg viewBox="0 0 160 110" className="mx-auto mt-4 h-24"><rect x="10" y="20" width="140" height="85" rx="14" fill="#fff"/><path d="M10 34l70 44 70-44" fill="none" stroke="#8BBDE0" strokeWidth="6" strokeLinejoin="round"/><path d="M80 52c-14-12-20 4-8 12l8 7 8-7c12-8 6-24-8-12z" fill="#EE9559" transform="translate(0 -22)"/></svg>
<span className="absolute left-6 top-28 -rotate-12 font-display text-lg leading-none text-white">COBA<br/>SEKARANG</span>
<div className="absolute bottom-5 left-6 flex gap-2"><Link href="/create?c=0" className="pill h-14 bg-ink px-8 text-lg tracking-wide text-sun">MULAI</Link><Link href="/box" aria-label="Buka Box Pesan" className="pill h-14 w-14 bg-sun text-2xl">✉️</Link></div></div>
<div className="card relative min-h-[425px] flex-1 overflow-hidden bg-tang p-6 text-center"><h3 className="font-display text-[clamp(44px,12vw,54px)] leading-none">BIRTHDAY</h3>
<Link href="/create?c=1" aria-label="Buat ucapan ulang tahun" className="mt-8 block text-[150px] leading-none drop-shadow-[0_20px_16px_rgba(90,40,0,.3)] transition hover:scale-105 hover:-rotate-6">🎂</Link>
<Link href="/create?c=1" className="pill absolute right-8 top-40 h-[58px] w-[88px] -rotate-6 bg-pine text-lg text-sun">+ MUSIK</Link>
<p className="absolute inset-x-6 bottom-6 text-[15px] leading-snug">Ucapan dengan kartu animasi, musik, dan foto — langsung ke chat penerima!</p></div></div></section>

<section id="cara" className="scroll-mt-4 py-14 sm:py-20"><h2 className="px-3 text-center font-display text-[clamp(40px,8vw,72px)] leading-none">CARA KERJA</h2>
<ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{steps.map(([t,d],i)=><li key={t} className="card bg-white p-7"><span className="pill h-12 w-12 bg-pine text-xl text-sun">{i+1}</span><h3 className="mt-4 font-display text-2xl">{t}</h3><p className="mt-2 text-[15px] leading-snug">{d}</p></li>)}</ol></section>

<section id="manfaat" className="scroll-mt-4"><h2 className="px-3 text-center font-display text-[clamp(40px,8vw,72px)] leading-none">MANFAAT</h2>
<div className="mt-10 grid gap-3 md:grid-cols-3">{perks.map(([c,t,d])=><div key={t} className={`card ${c} p-8`}><h3 className="font-display text-3xl">{t}</h3><p className="mt-3 leading-snug">{d}</p></div>)}</div></section>

<section id="cari" className="card mt-3 bg-sun p-8 text-center sm:p-14"><h2 className="font-display text-[clamp(36px,7vw,64px)] leading-none">ADA PESAN UNTUKMU?</h2><p className="mx-auto mt-3 max-w-md">Cari namamu di Box Pesan untuk melihat semua pesan yang ditujukan kepadamu.</p>
<form onSubmit={e=>{e.preventDefault();router.push(`/box?q=${encodeURIComponent(q.trim())}`)}} className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:flex-row"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ketik namamu…" aria-label="Cari nama penerima" className="h-14 flex-1 rounded-full bg-white px-6 text-lg outline-none focus:ring-4 focus:ring-pine/40"/><button className="pill h-14 bg-ink px-9 text-lg text-sun">CARI</button></form><Preview/></section>
<section id="kontak" className="card mt-3 scroll-mt-4 bg-pine p-8 text-center text-sun sm:p-14 mb-3"><img src="/logo-sticker.png" alt="WhisperBox — SMAN 1 Purwakarta (SMANSA) Confessions" className="mx-auto h-40 w-auto rounded-[32px] sm:h-52"/>
<h2 className="mt-6 font-display text-[clamp(36px,7vw,64px)] leading-none">SIAP BERBISIK?</h2><p className="mx-auto mt-3 max-w-md text-white/90">Pilih kategori, tulis pesanmu, dan biarkan kartu digital yang berbicara.</p>
<Link href="/create" className="pill mt-7 h-14 bg-sun px-10 text-xl text-ink">BUAT PESAN</Link></section>
</Shell>}
