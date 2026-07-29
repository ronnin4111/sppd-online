"use client";
/* eslint-disable @next/next/no-img-element */
import { FormEvent,useEffect,useState } from "react";
import AppShell from "../components/AppShell";
import type { Dataset } from "../lib/types";
const fields=[["government_name","Nama pemerintah daerah"],["agency_name","Nama perangkat daerah"],["address_line","Alamat dan telepon"],["contact_line","Faksimile, kota, kode pos"],["city_name","Kota penerbitan"],["fiscal_year","Tahun anggaran"],["treasurer_name","Nama bendahara"],["treasurer_nip","NIP bendahara"],["letter_code","Kode surat awal"]] as const;
export default function Settings(){
  const [values,setValues]=useState<Record<string,string>>({}),[error,setError]=useState(""),[success,setSuccess]=useState(""),[saving,setSaving]=useState(false);
  useEffect(()=>{let cancel=false;fetch("/api/sppd").then(async r=>{const j=await r.json() as Dataset&{error?:string};if(!r.ok)throw new Error(j.error||"Gagal memuat.");if(!cancel)setValues(j.settings)}).catch(e=>{if(!cancel)setError(e instanceof Error?e.message:"Gagal memuat.")});return()=>{cancel=true}},[]);
  async function submit(e:FormEvent){e.preventDefault();setSaving(true);setError("");try{const r=await fetch("/api/sppd",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"saveSettings",payload:{values}})});const j=await r.json() as Dataset&{error?:string};if(!r.ok)throw new Error(j.error||"Gagal menyimpan.");setValues(j.settings);setSuccess("Pengaturan dokumen berhasil disimpan.")}catch(reason){setError(reason instanceof Error?reason.message:"Gagal menyimpan.")}finally{setSaving(false)}}
  return <AppShell><div className="page-heading"><div><p className="eyebrow">Identitas dokumen</p><h1>Pengaturan</h1><p>Data ini tampil pada kop surat, tanda tangan, dan kuitansi.</p></div></div>
    <div className="security"><span>!</span><div><strong>Aplikasi dapat dibuka tanpa login</strong>Jangan membagikan alamat situs kepada pihak yang tidak berkepentingan.</div></div>
    {error?<div className="alert error">{error}</div>:null}{success?<div className="alert success">{success}</div>:null}
    <form className="form-panel settings" onSubmit={submit}><div className="section-title"><div><h2>Identitas instansi</h2><p>Semua isian dapat diubah tanpa mengubah kode aplikasi.</p></div></div><div className="form-grid">
      {fields.map(([name,label])=><label className={`field ${["government_name","agency_name","address_line","contact_line"].includes(name)?"s12":"s6"}`} key={name}>{label}<input value={values[name]||""} onChange={e=>setValues(current=>({...current,[name]:e.target.value}))}/></label>)}
    </div><div className="preview-card"><div className="mini-head"><img src="/image1.png" alt="Logo"/><div><strong>{values.government_name||"PEMERINTAH DAERAH"}</strong><b>{values.agency_name||"NAMA PERANGKAT DAERAH"}</b><span>{values.address_line}</span><span>{values.contact_line}</span></div></div></div>
    <div className="form-actions"><button className="button primary" disabled={saving}>{saving?"Menyimpan…":"Simpan pengaturan"}</button></div></form>
  </AppShell>
}
