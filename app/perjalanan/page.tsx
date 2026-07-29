"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import type { Dataset, Expense, Stopover } from "../lib/types";

type PersonDraft={key:number;employee_id:number;spd_number:string;expenses:Expense[]};
const today=()=>new Date().toISOString().slice(0,10);
const blank=(key:number):PersonDraft=>({key,employee_id:0,spd_number:"",expenses:[
  {item_name:"Uang Harian",volume:1,rate:0},{item_name:"Transport",volume:1,rate:0},
]});
const rupiah=new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0});
const blankStopover=(enabled=false):Stopover=>({enabled,arrival_place:"",arrival_date:"",departure_date:"",next_destination:"",official_position:"",official_name:"",official_nip:"",official_signature:""});

export default function TripPage(){
  const router=useRouter();
  const [data,setData]=useState<Dataset|null>(null),[message,setMessage]=useState("");
  const [tripType,setTripType]=useState<"dalam"|"luar">("dalam"),[destinationName,setDestinationName]=useState("");
  const [purpose,setPurpose]=useState(""),[departDate,setDepartDate]=useState(today()),[returnDate,setReturnDate]=useState(today());
  const [sptDate,setSptDate]=useState(today()),[sptNumber,setSptNumber]=useState(""),[letterCode,setLetterCode]=useState("DPKPP-G");
  const [signerId,setSignerId]=useState(0),[accountId,setAccountId]=useState(0),[notes,setNotes]=useState("");
  const [people,setPeople]=useState<PersonDraft[]>([blank(1)]),[saving,setSaving]=useState(false);
  const [stopovers,setStopovers]=useState<Stopover[]>([blankStopover(true),blankStopover(),blankStopover()]);
  useEffect(()=>{let cancelled=false;fetch("/api/sppd").then(async response=>{
    const result=await response.json() as Dataset&{error?:string};if(!response.ok)throw new Error(result.error||"Data gagal dimuat.");
    if(!cancelled){setData(result);setLetterCode(result.settings.letter_code||"DPKPP-G");setSignerId(result.signatories[0]?.id||0);setAccountId(result.accounts[0]?.id||0)}
  }).catch(error=>{if(!cancelled)setMessage(error instanceof Error?error.message:"Data gagal dimuat.")});return()=>{cancelled=true}},[]);
  const destinations=useMemo(()=>data?.destinations.filter(item=>item.trip_type===tripType)??[],[data,tripType]);
  const total=people.reduce((sum,person)=>sum+person.expenses.reduce((part,cost)=>part+Number(cost.volume)*Number(cost.rate),0),0);
  function syncFirstStop(changes:Partial<Stopover>){setStopovers(current=>current.map((item,index)=>index===0?{...item,...changes,enabled:true}:item))}
  function chooseDestination(name:string){setDestinationName(name);syncFirstStop({arrival_place:name});const item=data?.destinations.find(destination=>destination.name===name);if(!item)return;
    setPeople(current=>current.map(person=>({...person,expenses:person.expenses.map(cost=>cost.item_name.toLowerCase().includes("transport")?{...cost,rate:item.transport_rate}:cost)})))}
  function updateStopover(index:number,changes:Partial<Stopover>){setStopovers(current=>{
    const next=current.map((item,i)=>i===index?{...item,...changes}:item);
    if(changes.next_destination!==undefined&&next[index+1]?.enabled)next[index+1]={...next[index+1],arrival_place:changes.next_destination};
    if(changes.departure_date!==undefined&&next[index+1]?.enabled)next[index+1]={...next[index+1],arrival_date:changes.departure_date};
    return next;
  })}
  function toggleStopover(index:number,enabled:boolean){setStopovers(current=>current.map((item,i)=>{
    if(i!==index)return item;
    const previous=current[index-1];
    return {...item,enabled,arrival_place:enabled&&previous?previous.next_destination:item.arrival_place,arrival_date:enabled&&previous?previous.departure_date:item.arrival_date};
  }))}
  function chooseEmployee(index:number,id:number){const employee=data?.employees.find(item=>item.id===id);setPeople(current=>current.map((person,i)=>i!==index?person:{...person,employee_id:id,expenses:person.expenses.map(cost=>cost.item_name.toLowerCase().includes("uang harian")?{...cost,rate:employee?.daily_rate||0}:cost)}))}
  function updateCost(personIndex:number,costIndex:number,changes:Partial<Expense>){setPeople(current=>current.map((person,i)=>i!==personIndex?person:{...person,expenses:person.expenses.map((cost,j)=>j===costIndex?{...cost,...changes}:cost)}))}
  async function submit(){setMessage("");if(!destinationName||!purpose||!people.every(person=>person.employee_id)){setMessage("Lengkapi tujuan, maksud perjalanan, dan seluruh peserta.");return}setSaving(true);
    try{const response=await fetch("/api/sppd",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"createTrip",payload:{
      trip_type:tripType,destination_name:destinationName,purpose,depart_date:departDate,return_date:returnDate,spt_number:sptNumber,spt_date:sptDate,letter_code:letterCode,
      signer_id:signerId,budget_account_id:accountId,notes,participants:people,stopovers,
    }})});const result=await response.json() as {error?:string;tripId?:number};if(!response.ok||!result.tripId)throw new Error(result.error||"Gagal menyimpan.");router.push(`/dokumen?tripId=${result.tripId}`)}
    catch(error){setMessage(error instanceof Error?error.message:"Gagal menyimpan.")}finally{setSaving(false)}}
  return <AppShell>
    <div className="page-heading"><div><p className="eyebrow">Transaksi baru</p><h1>Buat perjalanan dinas</h1><p>Satu input akan digunakan untuk seluruh dokumen. Nomor dan biaya tetap dapat diisi manual.</p></div>
      <div className="segmented"><button className={tripType==="dalam"?"active":""} onClick={()=>{setTripType("dalam");setDestinationName("")}}>Dalam daerah</button><button className={tripType==="luar"?"active":""} onClick={()=>{setTripType("luar");setDestinationName("")}}>Luar daerah</button></div></div>
    {message?<div className="alert error">{message}</div>:null}
    <div className="form-panel"><section className="form-section"><div className="section-title"><div><p className="eyebrow">01 — Surat tugas</p><h2>Informasi perjalanan</h2></div></div>
      <div className="form-grid">
        <label className="field s6">Tujuan dari master<select value={destinations.some(item=>item.name===destinationName)?destinationName:""} onChange={e=>chooseDestination(e.target.value)}><option value="">Pilih tujuan atau isi manual</option>{destinations.map(item=><option key={item.id}>{item.name}</option>)}</select></label>
        <label className="field s6">Tujuan manual<input value={destinationName} onChange={e=>{setDestinationName(e.target.value);syncFirstStop({arrival_place:e.target.value})}} placeholder="Nama kota / lokasi"/></label>
        <label className="field s12">Maksud perjalanan<textarea value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="Uraian lengkap maksud perjalanan"/></label>
        <label className="field">Tanggal berangkat<input type="date" value={departDate} onChange={e=>{setDepartDate(e.target.value);syncFirstStop({arrival_date:e.target.value})}}/></label>
        <label className="field">Tanggal kembali<input type="date" value={returnDate} onChange={e=>setReturnDate(e.target.value)}/></label>
        <label className="field">Tanggal SPT<input type="date" value={sptDate} onChange={e=>setSptDate(e.target.value)}/></label>
        <label className="field">Nomor SPT manual<input value={sptNumber} onChange={e=>setSptNumber(e.target.value)} placeholder="Contoh: 094/123"/></label>
        <label className="field">Kode surat<input value={letterCode} onChange={e=>setLetterCode(e.target.value)}/></label>
        <label className="field">Penanda tangan<select value={signerId} onChange={e=>setSignerId(Number(e.target.value))}>{data?.signatories.map(item=><option value={item.id} key={item.id}>{item.role} — {item.name}</option>)}</select></label>
        <label className="field s8">Kegiatan / kode rekening<select value={accountId} onChange={e=>setAccountId(Number(e.target.value))}>{data?.accounts.map(item=><option value={item.id} key={item.id}>{item.activity_name} — {item.account_code}</option>)}</select></label>
        <label className="field s12">Catatan<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Opsional"/></label>
      </div></section>
      <section className="form-section"><div className="section-title"><div><p className="eyebrow">02 — SPPD Belakang</p><h2>Alur Bagian II, III, dan IV</h2><p>Bagian II selalu digunakan. Bagian III dan IV tetap tercetak, tetapi kosong jika tidak diaktifkan. Tujuan berikutnya otomatis menjadi tempat tiba pada bagian selanjutnya.</p></div></div>
        <div className="stopover-grid">{stopovers.map((stopover,index)=><article className={`optional-section ${stopover.enabled?"enabled":""}`} key={index}>
          <label className="option-toggle"><input type="checkbox" disabled={index===0} checked={stopover.enabled} onChange={e=>toggleStopover(index,e.target.checked)}/><span>{index===0?"Bagian II — tujuan pertama":`Gunakan Bagian ${index===1?"III":"IV"}`}</span></label>
          <div className="form-grid">
            <label className="field s6">Tempat tiba<input disabled={!stopover.enabled} value={stopover.arrival_place} onChange={e=>setStopovers(current=>current.map((item,i)=>i===index?{...item,arrival_place:e.target.value}:item))}/></label>
            <label className="field s6">Tujuan berikutnya<input disabled={!stopover.enabled} value={stopover.next_destination} onChange={e=>updateStopover(index,{next_destination:e.target.value})}/></label>
            <label className="field s6">Tanggal tiba<input disabled={!stopover.enabled} type="date" value={stopover.arrival_date} onChange={e=>setStopovers(current=>current.map((item,i)=>i===index?{...item,arrival_date:e.target.value}:item))}/></label>
            <label className="field s6">Tanggal berangkat<input disabled={!stopover.enabled} type="date" value={stopover.departure_date} onChange={e=>updateStopover(index,{departure_date:e.target.value})}/></label>
            <label className="field s6">Jabatan pejabat<input disabled={!stopover.enabled} value={stopover.official_position} onChange={e=>setStopovers(current=>current.map((item,i)=>i===index?{...item,official_position:e.target.value}:item))}/></label>
            <label className="field s6">Nama pejabat<input disabled={!stopover.enabled} value={stopover.official_name} onChange={e=>setStopovers(current=>current.map((item,i)=>i===index?{...item,official_name:e.target.value}:item))}/></label>
            <label className="field s6">NIP pejabat (opsional)<input disabled={!stopover.enabled} value={stopover.official_nip} onChange={e=>setStopovers(current=>current.map((item,i)=>i===index?{...item,official_nip:e.target.value}:item))}/></label>
            <label className="field s12">Tanda tangan/keterangan pejabat<input disabled={!stopover.enabled} value={stopover.official_signature} onChange={e=>setStopovers(current=>current.map((item,i)=>i===index?{...item,official_signature:e.target.value}:item))} placeholder="Kosongkan jika akan ditandatangani manual"/></label>
          </div>
        </article>)}</div>
      </section>
      <section className="form-section"><div className="section-title"><div><p className="eyebrow">03 — Peserta dan biaya</p><h2>Daftar pelaksana</h2><p>Jumlah peserta tidak dibatasi. Setiap peserta memiliki nomor SPD dan rincian biaya sendiri.</p></div><button className="button secondary" onClick={()=>setPeople(current=>[...current,blank(Math.max(...current.map(item=>item.key))+1)])}>＋ Peserta</button></div>
      {people.map((person,personIndex)=><article className="participant" key={person.key}><div className="participant-head"><strong>Peserta {personIndex+1}</strong>{people.length>1?<button className="link-button" onClick={()=>setPeople(current=>current.filter(item=>item.key!==person.key))}>Hapus peserta</button>:null}</div>
        <div className="form-grid"><label className="field s8">Nama pegawai<select value={person.employee_id} onChange={e=>chooseEmployee(personIndex,Number(e.target.value))}><option value={0}>Pilih pegawai</option>{data?.employees.map(item=><option key={item.id} value={item.id}>{item.name} — {item.nip}</option>)}</select></label>
        <label className="field">Nomor SPD manual<input value={person.spd_number} onChange={e=>setPeople(current=>current.map((item,i)=>i===personIndex?{...item,spd_number:e.target.value}:item))}/></label></div>
        <div className="table-scroll"><table className="data-table expense-table"><thead><tr><th>Uraian biaya</th><th>Volume</th><th>Tarif</th><th>Jumlah</th><th /></tr></thead><tbody>
          {person.expenses.map((cost,costIndex)=><tr key={costIndex}><td><input className="wide" value={cost.item_name} onChange={e=>updateCost(personIndex,costIndex,{item_name:e.target.value})}/></td>
            <td><input type="number" value={cost.volume} onChange={e=>updateCost(personIndex,costIndex,{volume:Number(e.target.value)})}/></td>
            <td><input type="number" value={cost.rate} onChange={e=>updateCost(personIndex,costIndex,{rate:Number(e.target.value)})}/></td>
            <td>{rupiah.format(Number(cost.volume)*Number(cost.rate))}</td><td><button className="link-button" onClick={()=>setPeople(current=>current.map((item,i)=>i!==personIndex?item:{...item,expenses:item.expenses.filter((_,j)=>j!==costIndex)}))}>Hapus</button></td></tr>)}
        </tbody></table></div><button className="button secondary" onClick={()=>setPeople(current=>current.map((item,i)=>i!==personIndex?item:{...item,expenses:[...item.expenses,{item_name:"Biaya lainnya",volume:1,rate:0}]}))}>＋ Tambah biaya</button>
      </article>)}
      <div className="cost-total"><div><small>Perkiraan total seluruh peserta</small><strong>{rupiah.format(total)}</strong></div><small>Dihitung ulang dari volume × tarif</small></div></section>
      <div className="form-actions"><button className="button primary" disabled={saving} onClick={()=>void submit()}>{saving?"Menyimpan…":"Simpan & lihat dokumen"}</button></div>
    </div>
  </AppShell>
}
