"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import {
  documentTabs,
  loadDocumentTemplates,
  renderDocumentTemplate,
  type DocumentKey,
} from "../lib/documentTemplates";
import type { TripDetail } from "../lib/types";

function Screen() {
  const id = Number(useSearchParams().get("tripId"));
  const [detail, setDetail] = useState<TripDetail | null>(null);
  const [doc, setDoc] = useState<DocumentKey>("nota");
  const [personId, setPersonId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancel = false;
    fetch(`/api/sppd?tripId=${id}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as TripDetail & { error?: string };
        if (!response.ok) throw new Error(result.error || "Gagal memuat.");
        if (!cancel) {
          setDetail(result);
          setPersonId(result.participants[0]?.id || null);
        }
      })
      .catch((reason) => {
        if (!cancel) setError(reason instanceof Error ? reason.message : "Gagal memuat.");
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => { cancel = true; };
  }, [id]);

  const person = useMemo(
    () => detail?.participants.find((item) => item.id === personId) || detail?.participants[0],
    [detail, personId],
  );
  const templates = useMemo(
    () => loadDocumentTemplates(detail?.settings.document_templates_v1),
    [detail],
  );
  const template = templates[doc];
  const rendered = useMemo(
    () => detail ? renderDocumentTemplate(template, detail, person) : "",
    [detail, person, template],
  );
  const pageStyle = {
    "--paper-width": `${template.widthMm}mm`,
    "--paper-height": `${template.heightMm}mm`,
    "--paper-margin-top": `${template.marginTopMm}mm`,
    "--paper-margin-right": `${template.marginRightMm}mm`,
    "--paper-margin-bottom": `${template.marginBottomMm}mm`,
    "--paper-margin-left": `${template.marginLeftMm}mm`,
    "--paper-font": template.fontFamily,
    "--paper-font-size": `${template.fontSizePt}pt`,
    "--paper-line-height": String(template.lineHeight),
    "--body-paragraph-gap": `${template.bodyParagraphGapMm}mm`,
    "--kop-font": template.headerFontFamily,
    "--kop-government-size": `${template.headerGovernmentFontSizePt}pt`,
    "--kop-agency-size": `${template.headerAgencyFontSizePt}pt`,
    "--kop-detail-size": `${template.headerDetailFontSizePt}pt`,
    "--kop-line-height": String(template.headerLineHeight),
    "--kop-min-height": `${template.headerMinHeightMm}mm`,
    "--kop-margin-top": `${template.headerMarginTopMm}mm`,
    "--kop-margin-bottom": `${template.headerMarginBottomMm}mm`,
    "--kop-text-left": `${template.headerTextLeftMm}mm`,
    "--kop-text-right": `${template.headerTextRightMm}mm`,
    "--kop-padding-top": `${template.headerPaddingTopMm}mm`,
    "--kop-padding-bottom": `${template.headerPaddingBottomMm}mm`,
    "--kop-logo-width": `${template.headerLogoWidthMm}mm`,
    "--kop-logo-height": `${template.headerLogoHeightMm}mm`,
    "--kop-logo-left": `${template.headerLogoLeftMm}mm`,
    "--kop-logo-top": `${template.headerLogoTopMm}mm`,
    "--kop-alignment": template.headerAlignment,
  } as React.CSSProperties;

  async function setStatus(status: "final" | "printed") {
    if (!detail) return;
    setSaving(true);
    try {
      const response = await fetch("/api/sppd", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "updateTripStatus", payload: { trip_id: detail.trip.id, status } }),
      });
      if (!response.ok) throw new Error("Status gagal diperbarui.");
      setDetail({ ...detail, trip: { ...detail.trip, status } });
      if (status === "printed") window.print();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Status gagal diperbarui.");
    } finally {
      setSaving(false);
    }
  }

  return <AppShell>
    <style>{`@media print{@page{size:${template.widthMm}mm ${template.heightMm}mm;margin:0}html,body{width:${template.widthMm}mm!important;height:${template.heightMm}mm!important}}`}</style>
    <div className="page-heading">
      <div><p className="eyebrow">Keluaran dokumen</p><h1>Paket dokumen perjalanan dinas</h1><p>Periksa hasilnya, pilih pegawai, lalu cetak sesuai ukuran halaman templat.</p></div>
      {detail ? <StatusBadge status={detail.trip.status}/> : null}
    </div>
    {loading ? <div className="panel empty">Memuat dokumen…</div> : null}
    {error || !id ? <div className="error-banner">{error || "Pilih perjalanan dari dashboard atau arsip."}</div> : null}
    {detail && person ? <div className="document-workspace">
      <div className="doc-toolbar">
        <div className="doc-tabs">{documentTabs.map(([key, label]) =>
          <button key={key} className={doc === key ? "active" : ""} onClick={() => setDoc(key)}>{label}</button>,
        )}</div>
        <div className="doc-controls">
          {["depan", "belakang", "kuitansi"].includes(doc)
            ? <select value={person.id} onChange={(event) => setPersonId(Number(event.target.value))}>{detail.participants.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            : null}
          <span className="page-size-badge">{template.preset === "CUSTOM" ? "Khusus" : template.preset} · {template.widthMm} × {template.heightMm} mm</span>
          <button className="button secondary" disabled={saving} onClick={() => void setStatus("final")}>Tandai final</button>
          <button className="button primary" disabled={saving} onClick={() => void setStatus("printed")}>Cetak {template.preset === "CUSTOM" ? "dokumen" : template.preset}</button>
        </div>
      </div>
      <div className="doc-canvas">
        <article className="paper template-paper" style={pageStyle} dangerouslySetInnerHTML={{ __html: rendered }}/>
      </div>
    </div> : null}
  </AppShell>;
}

export default function Documents() {
  return <Suspense fallback={<AppShell><div className="panel empty">Memuat dokumen…</div></AppShell>}><Screen/></Suspense>;
}
