"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "./components/AppShell";
import StatusBadge from "./components/StatusBadge";
import type { Dataset } from "./lib/types";

const rupiah = new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0});
const date = (value:string) => new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(`${value}T00:00:00`));

export default function Dashboard(){
  const [data,setData]=useState<Dataset|null>(null);
  const [error,setError]=useState("");
  useEffect(()=>{let cancelled=false;fetch("/api/sppd").then(async response=>{
    const result=await response.json() as Dataset&{error?:string};
    if(!response.ok) throw new Error(result.error||"Data gagal dimuat.");
    if(!cancelled)setData(result);
  }).catch(reason=>{if(!cancelled)setError(reason instanceof Error?reason.message:"Data gagal dimuat.")});return()=>{cancelled=true}},[]);
  const stats=useMemo(()=>{const trips=data?.trips??[];return{
    trips:trips.length,people:trips.reduce((sum,item)=>sum+Number(item.participant_count),0),
    total:trips.reduce((sum,item)=>sum+Number(item.total_amount),0),
    final:trips.filter(item=>item.status!=="draft").length,
  }},[data]);
  return <AppShell>
    <div className="page-heading"><div><p className="eyebrow">Ringkasan administrasi</p><h1>Dashboard SPPD</h1><p>Kelola perjalanan dalam dan luar daerah dari satu formulir hingga dokumen siap cetak.</p></div>
      <Link className="button primary" href="/perjalanan">＋ Buat perjalanan</Link></div>
    {error?<div className="alert error">{error}</div>:null}
    <section className="metric-grid">
      <article className="metric dark"><span className="metric-icon">↗</span><div><span>Perjalanan tersimpan</span><strong>{data?stats.trips:"—"}</strong><small>Dalam dan luar daerah</small></div></article>
      <article className="metric"><span className="metric-icon">◎</span><div><span>Total peserta</span><strong>{data?stats.people:"—"}</strong><small>Dari seluruh perjalanan</small></div></article>
      <article className="metric"><span className="metric-icon">Rp</span><div><span>Nilai perjalanan</span><strong className="money">{data?rupiah.format(stats.total):"—"}</strong><small>Berdasarkan rincian biaya</small></div></article>
      <article className="metric"><span className="metric-icon">✓</span><div><span>Dokumen final</span><strong>{data?stats.final:"—"}</strong><small>Final atau telah dicetak</small></div></article>
    </section>
    <div className="dashboard-grid"><section className="panel"><div className="panel-head"><div><p className="eyebrow">Transaksi terbaru</p><h2>Daftar perjalanan</h2></div><Link href="/arsip">Lihat semua →</Link></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>No. SPT</th><th>Tujuan</th><th>Tanggal</th><th>Peserta</th><th>Status</th><th /></tr></thead><tbody>
        {!data?<tr><td colSpan={6}><div className="empty">Memuat data…</div></td></tr>:data.trips.length?data.trips.slice(0,7).map(trip=><tr key={trip.id}>
          <td><strong>{trip.spt_number||"Belum diisi"}</strong><small>{trip.letter_code}</small></td>
          <td>{trip.destination_name}<small>{trip.trip_type==="luar"?"Luar daerah":"Dalam daerah"}</small></td>
          <td>{date(trip.depart_date)}</td><td>{trip.participant_count} orang</td><td><StatusBadge status={trip.status}/></td>
          <td className="table-actions"><Link href={`/dokumen?tripId=${trip.id}`}>Buka</Link></td></tr>):<tr><td colSpan={6}><div className="empty">Belum ada perjalanan. Buat transaksi pertama.</div></td></tr>}
      </tbody></table></div>
    </section><aside className="quick"><small>Alur singkat</small><strong>Satu input, seluruh dokumen</strong><ol>
      <li><span>1</span><div><strong>Isi perjalanan</strong><p>Tujuan, tanggal, nomor SPT, dan kegiatan.</p></div></li>
      <li><span>2</span><div><strong>Pilih peserta</strong><p>Tambahkan pegawai dan nomor SPD manual.</p></div></li>
      <li><span>3</span><div><strong>Sesuaikan biaya</strong><p>Tarif otomatis tetap dapat diubah.</p></div></li>
      <li><span>4</span><div><strong>Cetak dokumen</strong><p>Nota Dinas, SPT, SPD, dan kuitansi.</p></div></li>
    </ol><Link className="button" href="/master-data">Kelola master data</Link></aside></div>
  </AppShell>
}
