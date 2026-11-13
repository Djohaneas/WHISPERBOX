import "@fontsource/bagel-fat-one/400.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/700.css";
import "./globals.css";
import Tracker from "./tracker";
export const metadata={title:"WhisperBox — Platform Ungkapan Hati & Pesan Spesial Interaktif",description:"Kirim confess, ucapan ulang tahun, permintaan maaf, dan terima kasih lewat kartu digital interaktif — anonim atau terang-terangan."};
export default function L({children}){return <html lang="id"><body>{children}<Tracker/></body></html>}
