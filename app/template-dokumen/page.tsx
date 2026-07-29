"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AppShell from "../components/AppShell";
import {
  defaultDocumentTemplates,
  documentTabs,
  loadDocumentTemplates,
  sanitizeTemplateHtml,
  templateVariables,
  type DocumentKey,
  type DocumentTemplate,
} from "../lib/documentTemplates";

const previewValues: Record<string, string> = {
  government_name: "PEMERINTAH KABUPATEN MEMPAWAH",
  agency_name: "DINAS PERTANIAN, KETAHANAN PANGAN DAN PERIKANAN",
  address_line: "Jalan Raden Kusno No. 61",
  contact_line: "MEMPAWAH 78912",
  logo_url: "/image1.png",
  city_name: "Mempawah",
  fiscal_year: "2026",
  spt_number_full: "094/DPKPP-G/2026",
  spt_number: "094",
  spt_date_text: "28 Juli 2026",
  depart_date_text: "30 Juli 2026",
  return_date_text: "31 Juli 2026",
  purpose: "Melaksanakan koordinasi kegiatan dinas",
  destination_name: "Pontianak",
  activity_name: "Perjalanan Dinas Dalam dan Luar Daerah",
  account_code: "3.03.01.25.01.5.2.2.15.01",
  signer_role: "Kepala Dinas",
  signer_command_title: "Kepala Dinas Pertanian, Ketahanan Pangan dan Perikanan",
  signer_region_line: "KABUPATEN MEMPAWAH",
  signer_name: "NAMA PEJABAT",
  signer_rank: "Pembina Utama Muda",
  signer_nip: "19700101 199001 1 001",
  employee_name: "NAMA PEGAWAI",
  employee_nip: "19800101 200501 1 001",
  employee_rank: "Penata / III c",
  employee_position: "Analis Kebijakan",
  employee_work_unit: "DPKPP Kabupaten Mempawah",
  spd_number: "094/SPD/2026",
  trip_days: "2",
  trip_days_words: "dua",
  total_cost: "Rp1.250.000",
  total_words: "satu juta dua ratus lima puluh ribu rupiah",
  treasurer_name: "NAMA BENDAHARA",
  treasurer_nip: "19800202 200601 2 002",
  notes: "-",
  participants_rows: "<tr><td class=\"center\">1</td><td><strong>NAMA PEGAWAI</strong><br>NIP. 19800101 200501 1 001</td><td>Analis Kebijakan</td><td>Pontianak</td><td>30 Juli 2026 s.d. 31 Juli 2026</td></tr>",
  person_list_rows: "<tr><td>1.</td><td><strong>NAMA PEGAWAI</strong><br>NIP. 19800101 200501 1 001<br>Penata / III c<br>Analis Kebijakan</td></tr>",
  expenses_rows: "<tr><td class=\"center\">1</td><td>Uang harian</td><td class=\"center\">2</td><td class=\"right\">Rp400.000</td><td class=\"right\">Rp800.000</td><td>-</td></tr>",
};

function previewHtml(html: string) {
  return html.replace(/\{\{([a-z0-9_]+)\}\}/gi, (_, key: string) => previewValues[key] ?? `{{${key}}}`);
}

const numeric = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

type EditorSection = "header" | "body";

export default function TemplateDocuments() {
  const [templates, setTemplates] = useState(() => loadDocumentTemplates());
  const [selected, setSelected] = useState<DocumentKey>("nota");
  const [editorSection, setEditorSection] = useState<EditorSection>("header");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);
  const template = templates[selected];

  useEffect(() => {
    let cancelled = false;
    fetch("/api/sppd", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as { settings?: Record<string, string>; error?: string };
        if (!response.ok) throw new Error(data.error || "Tampilan templat gagal dimuat.");
        if (!cancelled) setTemplates(loadDocumentTemplates(data.settings?.document_templates_v1));
      })
      .catch((error) => {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Tampilan templat gagal dimuat.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (editorRef.current && !preview) editorRef.current.innerHTML = template.html;
  }, [selected, preview, template.html]);

  const pageStyle = useMemo(() => ({
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
  }) as React.CSSProperties, [template]);

  const hasHeader = template.html.includes("letterhead");
  const activeFont = editorSection === "header" ? template.headerFontFamily : template.fontFamily;
  const activeFontSize = editorSection === "header" ? template.headerDetailFontSizePt : template.fontSizePt;

  function update(values: Partial<DocumentTemplate>) {
    setTemplates((current) => ({
      ...current,
      [selected]: { ...current[selected], ...values },
    }));
  }

  function applyPreset(preset: DocumentTemplate["preset"]) {
    if (preset === "A4") update({ preset, widthMm: 210, heightMm: 297 });
    else if (preset === "F4") update({ preset, widthMm: 215, heightMm: 330 });
    else update({ preset });
  }

  function rememberSelection() {
    const selection = window.getSelection();
    if (selection?.rangeCount && editorRef.current?.contains(selection.anchorNode)) {
      selectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  }

  function command(name: string, value?: string) {
    if (preview) return;
    editorRef.current?.focus();
    if (selectionRef.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(selectionRef.current);
    }
    document.execCommand(name, false, value);
    rememberSelection();
    if (editorRef.current) update({ html: sanitizeTemplateHtml(editorRef.current.innerHTML) });
  }

  function updateActiveFont(fontFamily: string) {
    if (editorSection === "header") update({ headerFontFamily: fontFamily });
    else update({ fontFamily });
    command("fontName", fontFamily);
  }

  function updateActiveFontSize(fontSizePt: number) {
    if (editorSection === "header") update({ headerDetailFontSizePt: fontSizePt });
    else update({ fontSizePt });
  }

  function detectSection(target: EventTarget | null) {
    if (!(target instanceof Element)) return;
    setEditorSection(target.closest(".letterhead") ? "header" : "body");
  }

  function insertVariable(variable: string) {
    command("insertText", variable);
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const cleaned = Object.fromEntries(documentTabs.map(([key]) => [
        key,
        { ...templates[key], html: sanitizeTemplateHtml(templates[key].html) },
      ]));
      const response = await fetch("/api/sppd", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "saveDocumentTemplates", payload: { templates: JSON.stringify(cleaned) } }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Templat gagal disimpan.");
      setTemplates(cleaned as Record<DocumentKey, DocumentTemplate>);
      setMessage("Templat berhasil disimpan dan langsung digunakan pada dokumen.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Templat gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  function resetCurrent() {
    setTemplates((current) => ({
      ...current,
      [selected]: structuredClone(defaultDocumentTemplates[selected]),
    }));
    setPreview(false);
    setMessage("Format dokumen aktif telah dikembalikan ke templat awal. Klik Simpan untuk menerapkannya.");
  }

  return <AppShell>
    <div className="page-heading template-heading">
      <div><p className="eyebrow">Pengaturan dokumen</p><h1>Desainer templat dokumen</h1><p>Edit isi dan tata letak seperti dokumen pengolah kata, lalu simpan sebagai format cetak resmi.</p></div>
      <div className="template-heading-actions">
        <button className="button secondary" onClick={() => setPreview((value) => !value)}>{preview ? "Kembali mengedit" : "Pratinjau data"}</button>
        <button className="button primary" disabled={saving || loading} onClick={() => void save()}>{saving ? "Menyimpan…" : "Simpan semua templat"}</button>
      </div>
    </div>
    {message ? <div className={message.includes("berhasil") ? "alert success" : "alert"}>{message}</div> : null}
    <div className="template-app">
      <aside className="template-side">
        <strong>Jenis dokumen</strong>
        <div className="template-list">{documentTabs.map(([key, label]) =>
          <button key={key} className={selected === key ? "active" : ""} onClick={() => {
            setSelected(key);
            setPreview(false);
            if (!templates[key].html.includes("letterhead")) setEditorSection("body");
          }}>{label}</button>,
        )}</div>
        <div className="template-settings">
          <strong>Bagian yang diatur</strong>
          <div className="section-switch" aria-label="Pilih bagian dokumen">
            <button className={editorSection === "header" ? "active" : ""} disabled={!hasHeader} onClick={() => setEditorSection("header")}>KOP Surat</button>
            <button className={editorSection === "body" ? "active" : ""} onClick={() => setEditorSection("body")}>Isi Dokumen</button>
          </div>
          {!hasHeader ? <p className="setting-note">Dokumen ini tidak menggunakan KOP.</p> : null}
          {editorSection === "header" && hasHeader ? <>
            <div className="settings-group">
              <strong>Huruf KOP</strong>
              <label>Jenis huruf<select value={template.headerFontFamily} onChange={(event) => update({ headerFontFamily: event.target.value })}><option>Arial</option><option>Times New Roman</option><option>Calibri</option><option>Georgia</option><option>Verdana</option></select></label>
              <div className="mini-fields">
                <label>Pemerintah (pt)<input type="number" min="6" max="36" step=".5" value={template.headerGovernmentFontSizePt} onChange={(event) => update({ headerGovernmentFontSizePt: numeric(event.target.value, 14) })}/></label>
                <label>Instansi (pt)<input type="number" min="6" max="36" step=".5" value={template.headerAgencyFontSizePt} onChange={(event) => update({ headerAgencyFontSizePt: numeric(event.target.value, 16) })}/></label>
                <label>Alamat (pt)<input type="number" min="6" max="24" step=".5" value={template.headerDetailFontSizePt} onChange={(event) => update({ headerDetailFontSizePt: numeric(event.target.value, 8.5) })}/></label>
                <label>Spasi baris<input type="number" min=".8" max="3" step=".05" value={template.headerLineHeight} onChange={(event) => update({ headerLineHeight: numeric(event.target.value, 1.15) })}/></label>
              </div>
              <label>Perataan<select value={template.headerAlignment} onChange={(event) => update({ headerAlignment: event.target.value as DocumentTemplate["headerAlignment"] })}><option value="left">Rata kiri</option><option value="center">Rata tengah</option><option value="right">Rata kanan</option></select></label>
            </div>
            <div className="settings-group">
              <strong>Posisi KOP</strong>
              <div className="mini-fields">
                <label>Tinggi min. (mm)<input type="number" min="10" max="80" step=".5" value={template.headerMinHeightMm} onChange={(event) => update({ headerMinHeightMm: numeric(event.target.value, 30) })}/></label>
                <label>Jarak sesudah (mm)<input type="number" min="0" max="40" step=".5" value={template.headerMarginBottomMm} onChange={(event) => update({ headerMarginBottomMm: numeric(event.target.value, 0) })}/></label>
                <label>Geser dari atas (mm)<input type="number" min="-20" max="60" step=".5" value={template.headerMarginTopMm} onChange={(event) => update({ headerMarginTopMm: numeric(event.target.value, 0) })}/></label>
                <label>Isi dari atas (mm)<input type="number" min="0" max="40" step=".5" value={template.headerPaddingTopMm} onChange={(event) => update({ headerPaddingTopMm: numeric(event.target.value, 0) })}/></label>
                <label>Teks dari kiri (mm)<input type="number" min="0" max="80" step=".5" value={template.headerTextLeftMm} onChange={(event) => update({ headerTextLeftMm: numeric(event.target.value, 23) })}/></label>
                <label>Teks dari kanan (mm)<input type="number" min="0" max="80" step=".5" value={template.headerTextRightMm} onChange={(event) => update({ headerTextRightMm: numeric(event.target.value, 6) })}/></label>
              </div>
            </div>
            <div className="settings-group">
              <strong>Logo KOP</strong>
              <div className="mini-fields">
                <label>Lebar (mm)<input type="number" min="5" max="60" step=".5" value={template.headerLogoWidthMm} onChange={(event) => update({ headerLogoWidthMm: numeric(event.target.value, 18) })}/></label>
                <label>Tinggi (mm)<input type="number" min="5" max="70" step=".5" value={template.headerLogoHeightMm} onChange={(event) => update({ headerLogoHeightMm: numeric(event.target.value, 25) })}/></label>
                <label>Dari kiri (mm)<input type="number" min="-20" max="100" step=".5" value={template.headerLogoLeftMm} onChange={(event) => update({ headerLogoLeftMm: numeric(event.target.value, 2) })}/></label>
                <label>Dari atas (mm)<input type="number" min="-20" max="100" step=".5" value={template.headerLogoTopMm} onChange={(event) => update({ headerLogoTopMm: numeric(event.target.value, 1) })}/></label>
              </div>
            </div>
          </> : <>
            <div className="settings-group">
              <strong>Huruf isi</strong>
              <label>Jenis huruf<select value={template.fontFamily} onChange={(event) => update({ fontFamily: event.target.value })}><option>Arial</option><option>Times New Roman</option><option>Calibri</option><option>Georgia</option><option>Verdana</option></select></label>
              <div className="mini-fields">
                <label>Ukuran (pt)<input type="number" min="6" max="36" step=".5" value={template.fontSizePt} onChange={(event) => update({ fontSizePt: numeric(event.target.value, 10.5) })}/></label>
                <label>Spasi baris<input type="number" min=".8" max="3" step=".05" value={template.lineHeight} onChange={(event) => update({ lineHeight: numeric(event.target.value, 1.35) })}/></label>
                <label>Jarak paragraf (mm)<input type="number" min="0" max="30" step=".5" value={template.bodyParagraphGapMm} onChange={(event) => update({ bodyParagraphGapMm: numeric(event.target.value, 5) })}/></label>
              </div>
            </div>
          </>}
          <strong>Ukuran halaman</strong>
          <label>Preset<select value={template.preset} onChange={(event) => applyPreset(event.target.value as DocumentTemplate["preset"])}><option value="A4">A4 — 210 × 297 mm</option><option value="F4">F4 — 215 × 330 mm</option><option value="CUSTOM">Ukuran khusus</option></select></label>
          <div className="mini-fields"><label>Lebar (mm)<input type="number" min="100" max="400" value={template.widthMm} onChange={(event) => update({ preset: "CUSTOM", widthMm: numeric(event.target.value, 210) })}/></label><label>Tinggi (mm)<input type="number" min="100" max="500" value={template.heightMm} onChange={(event) => update({ preset: "CUSTOM", heightMm: numeric(event.target.value, 297) })}/></label></div>
          <strong>Margin halaman</strong>
          <div className="mini-fields margin-fields">
            {([["marginTopMm", "Atas"], ["marginRightMm", "Kanan"], ["marginBottomMm", "Bawah"], ["marginLeftMm", "Kiri"]] as const).map(([key, label]) =>
              <label key={key}>{label} (mm)<input type="number" min="0" max="60" value={template[key]} onChange={(event) => update({ [key]: numeric(event.target.value, 0) })}/></label>,
            )}
          </div>
          <button className="reset-template" onClick={resetCurrent}>Kembalikan format awal</button>
        </div>
      </aside>
      <section className="template-main">
        <div className="word-toolbar" aria-label="Peralatan format teks">
          <button title="Urungkan" onMouseDown={(event) => event.preventDefault()} onClick={() => command("undo")}>↶</button>
          <button title="Ulangi" onMouseDown={(event) => event.preventDefault()} onClick={() => command("redo")}>↷</button>
          <span className="active-section-label">{editorSection === "header" ? "KOP" : "ISI"}</span>
          <select value={activeFont} onChange={(event) => updateActiveFont(event.target.value)}><option>Arial</option><option>Times New Roman</option><option>Calibri</option><option>Georgia</option><option>Verdana</option></select>
          <select value={activeFontSize} onChange={(event) => updateActiveFontSize(Number(event.target.value))}>{[8, 8.5, 9, 10, 10.5, 11, 12, 14, 16, 18].map((size) => <option key={size} value={size}>{size} pt</option>)}</select>
          <span className="toolbar-divider"/>
          <button className="bold-tool" title="Tebal" onMouseDown={(event) => event.preventDefault()} onClick={() => command("bold")}>B</button>
          <button className="italic-tool" title="Miring" onMouseDown={(event) => event.preventDefault()} onClick={() => command("italic")}>I</button>
          <button className="underline-tool" title="Garis bawah" onMouseDown={(event) => event.preventDefault()} onClick={() => command("underline")}>U</button>
          <span className="toolbar-divider"/>
          <button title="Rata kiri" onMouseDown={(event) => event.preventDefault()} onClick={() => command("justifyLeft")}>≡</button>
          <button title="Rata tengah" onMouseDown={(event) => event.preventDefault()} onClick={() => command("justifyCenter")}>≣</button>
          <button title="Rata kanan" onMouseDown={(event) => event.preventDefault()} onClick={() => command("justifyRight")}>≡</button>
          <button title="Rata kiri-kanan" onMouseDown={(event) => event.preventDefault()} onClick={() => command("justifyFull")}>☰</button>
          <button title="Daftar bernomor" onMouseDown={(event) => event.preventDefault()} onClick={() => command("insertOrderedList")}>1.</button>
          <button title="Daftar berpoin" onMouseDown={(event) => event.preventDefault()} onClick={() => command("insertUnorderedList")}>•</button>
        </div>
        <div className="editing-help"><strong>{editorSection === "header" ? "Mengatur KOP Surat" : "Mengatur Isi Dokumen"}</strong><span>Klik bagian yang ingin diedit. Enter membuat baris baru dan tombol spasi dapat digunakan untuk menggeser teks.</span></div>
        <div className="template-stage">
          {loading ? <div className="panel empty">Memuat templat…</div> :
            <article className="paper template-paper" style={pageStyle}>
              {preview
                ? <div className="template-preview" dangerouslySetInnerHTML={{ __html: previewHtml(template.html) }}/>
                : <div ref={editorRef} className="template-editor" data-section={editorSection} contentEditable suppressContentEditableWarning spellCheck onClick={(event) => detectSection(event.target)} onInput={(event) => update({ html: sanitizeTemplateHtml(event.currentTarget.innerHTML) })} onMouseUp={rememberSelection} onKeyUp={rememberSelection} onBlur={rememberSelection}/>}
            </article>}
        </div>
      </section>
      <aside className="variable-side">
        <strong>Data otomatis</strong><p>Letakkan kursor pada dokumen, lalu klik variabel yang ingin dimasukkan.</p>
        <div>{templateVariables.map(([variable, label]) => <button key={variable} disabled={preview} onMouseDown={(event) => event.preventDefault()} onClick={() => insertVariable(variable)}><span>{label}</span><code>{variable}</code></button>)}</div>
      </aside>
    </div>
  </AppShell>;
}
