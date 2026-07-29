"use client";
import Link from "next/link";
import { useEffect,useMemo,useState } from "react";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import type { Dataset } from "../lib/types";
const rupiah=new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0});
export default function Archive(){
  const [data,setData]=useState<Dataset|null>(null),[query,setQuery]=useState(""),[kind,setKind]=useState("semua"),[status,setStatus]=useState("semua"),[error,setError]=useState("");
  useEffect(()=>{let cancel=false;fetch("/api/sppd").then(async r=>{const j=await r.json() as Dataset&{error?:string};if(!r.ok)throw new Error(j.error||"Gagal memuat.");if(!cancel)setData(j)}).catch(e=>{if(!cancel)setError(e instanceof Error?e.message:"Gagal memuat.")});return()=>{cancel=true}},[]);
  const rows=useMemo(()=>(data?.trips??[]).filter(item=>(kind==="semua"||item.trip_type===kind)&&(status==="semua"||item.status===status)&&(!query||`${item.spt_number} ${item.destination_name} ${item.purpose}`.toLowerCase().includes(query.toLowerCase()))),[data,query,kind,status]);
  return <AppShell><div className="page-heading"><div><p className="eyebrow">Penyimpanan transaksi</p><h1>Arsip dokumen</h1><p>Temukan perjalanan, biaya, dan paket dokumen yang pernah dibuat.</p></div><Link className="button primary" href="/perjalanan">＋ Buat perjalanan</Link></div>
    {error?<div className="error-banner">{error}</div>:null}<section className="panel"><div className="archive-filters">
      <label>Cari dokumen<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nomor SPT, tujuan, atau maksud"/></label>
      <label>Jenis<select value={kind} onChange={e=>setKind(e.target.value)}><option value="semua">Semua jenis</option><option value="dalam">Dalam daerah</option><option value="luar">Luar daerah</option></select></label>
      <label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="semua">Semua status</option><option value="draft">Draf</option><option value="final">Final</option><option value="printed">Dicetak</option></select></label>
    </div><div className="table-scroll"><table className="data-table"><thead><tr><th>No. SPT</th><th>Tujuan</th><th>Maksud</th><th>Peserta</th><th>Total</th><th>Status</th><th /></tr></thead><tbody>
      {!data?<tr><td colSpan={7}><div className="empty">Memuat arsip…</div></td></tr>:rows.length?rows.map(item=><tr key={item.id}><td><strong>{item.spt_number||"Belum diisi"}</strong><small>{item.letter_code}</small></td><td>{item.destination_name}<small>{item.trip_type==="luar"?"Luar daerah":"Dalam daerah"}</small></td><td>{item.purpose}</td><td>{item.participant_count} orang</td><td>{rupiah.format(item.total_amount)}</td><td><StatusBadge status={item.status}/></td><td className="table-actions"><Link href={`/dokumen?tripId=${item.id}`}>Buka dokumen</Link></td></tr>):<tr><td colSpan={7}><div className="empty">Tidak ada data yang cocok.</div></td></tr>}
    </tbody></table></div></section></AppShell>
}
