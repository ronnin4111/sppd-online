import type { Participant, TripDetail } from "./types";

export type DocumentKey = "nota" | "spt" | "depan" | "belakang" | "kuitansi";
export type PagePreset = "A4" | "F4" | "CUSTOM";

export type DocumentTemplate = {
  id: DocumentKey;
  label: string;
  layoutVersion: number;
  preset: PagePreset;
  widthMm: number;
  heightMm: number;
  marginTopMm: number;
  marginRightMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  fontFamily: string;
  fontSizePt: number;
  lineHeight: number;
  bodyParagraphGapMm: number;
  headerFontFamily: string;
  headerGovernmentFontSizePt: number;
  headerAgencyFontSizePt: number;
  headerDetailFontSizePt: number;
  headerLineHeight: number;
  headerMinHeightMm: number;
  headerMarginTopMm: number;
  headerMarginBottomMm: number;
  headerTextLeftMm: number;
  headerTextRightMm: number;
  headerPaddingTopMm: number;
  headerPaddingBottomMm: number;
  headerLogoWidthMm: number;
  headerLogoHeightMm: number;
  headerLogoLeftMm: number;
  headerLogoTopMm: number;
  headerAlignment: "left" | "center" | "right";
  html: string;
};

export const documentTabs: Array<[DocumentKey, string]> = [
  ["nota", "Nota Dinas"],
  ["spt", "SPT"],
  ["depan", "SPD Depan"],
  ["belakang", "SPD Belakang"],
  ["kuitansi", "Kuitansi & rincian"],
];

const head = `<div class="letterhead">
  <img src="{{logo_url}}" alt="Lambang instansi">
  <div><strong>{{government_name}}</strong><b>{{agency_name}}</b><span>{{address_line}}</span><span>{{contact_line}}</span></div>
</div>`;

const sign = `<div class="doc-sign">
  <span>{{city_name}}, {{spt_date_text}}</span><span>{{signer_role}}</span>
  <div class="sign-space"></div><strong>{{signer_name}}</strong><span>{{signer_rank}}</span><span>NIP. {{signer_nip}}</span>
</div>`;

const base = (
  id: DocumentKey,
  label: string,
  html: string,
): DocumentTemplate => ({
  id,
  label,
  layoutVersion: 1,
  preset: "A4",
  widthMm: 210,
  heightMm: 297,
  marginTopMm: 16,
  marginRightMm: 18,
  marginBottomMm: 16,
  marginLeftMm: 18,
  fontFamily: "Arial",
  fontSizePt: 10.5,
  lineHeight: 1.35,
  bodyParagraphGapMm: 5,
  headerFontFamily: "Arial",
  headerGovernmentFontSizePt: 14,
  headerAgencyFontSizePt: 16,
  headerDetailFontSizePt: 8.5,
  headerLineHeight: 1.15,
  headerMinHeightMm: 30,
  headerMarginTopMm: 0,
  headerMarginBottomMm: 0,
  headerTextLeftMm: 23,
  headerTextRightMm: 6,
  headerPaddingTopMm: 0,
  headerPaddingBottomMm: 3,
  headerLogoWidthMm: 18,
  headerLogoHeightMm: 25,
  headerLogoLeftMm: 2,
  headerLogoTopMm: 1,
  headerAlignment: "center",
  html,
});

export const defaultDocumentTemplates: Record<DocumentKey, DocumentTemplate> = {
  nota: base("nota", "Nota Dinas", `${head}
    <h1 class="doc-title">NOTA DINAS</h1>
    <table class="doc-meta"><tbody>
      <tr><th>Kepada</th><td>Yth. {{signer_role}}</td></tr>
      <tr><th>Dari</th><td>Pejabat Pelaksana Teknis Kegiatan</td></tr>
      <tr><th>Nomor</th><td>{{spt_number_full}}</td></tr>
      <tr><th>Tanggal</th><td>{{spt_date_text}}</td></tr>
      <tr><th>Sifat</th><td>Biasa</td></tr><tr><th>Lampiran</th><td>-</td></tr>
      <tr><th>Hal</th><td>Permohonan persetujuan perjalanan dinas</td></tr>
    </tbody></table>
    <div class="doc-body">
      <p>Sehubungan dengan pelaksanaan kegiatan <strong>{{activity_name}}</strong>, dengan ini dimohon persetujuan untuk menugaskan pegawai sebagai berikut:</p>
      <table class="doc-table"><thead><tr><th>No.</th><th>Nama / NIP</th><th>Jabatan</th><th>Tujuan</th><th>Tanggal</th></tr></thead><tbody>{{participants_rows}}</tbody></table>
      <p>Maksud perjalanan adalah <strong>{{purpose}}</strong>. Biaya dibebankan pada kode rekening <strong>{{account_code}}</strong>.</p>
      <p>Demikian disampaikan untuk mendapat persetujuan.</p>
    </div>${sign}`),
  spt: base("spt", "Surat Perintah Tugas", `${head}
    <h1 class="doc-title">SURAT PERINTAH TUGAS</h1><p class="doc-number">Nomor: {{spt_number_full}}</p>
    <table class="command"><tbody><tr><th>DASAR</th><td>Dokumen Pelaksanaan Anggaran {{agency_name}} Tahun Anggaran {{fiscal_year}}.</td></tr></tbody></table>
    <h2 class="command-title">MEMERINTAHKAN</h2>
    <table class="command"><tbody>
      <tr><th>Kepada</th><td><table class="person-list"><tbody>{{person_list_rows}}</tbody></table></td></tr>
      <tr><th>Untuk</th><td><ol><li>{{purpose}}.</li><li>Melaksanakan perjalanan dinas ke {{destination_name}} dari tanggal {{depart_date_text}} sampai dengan {{return_date_text}}.</li><li>Melaporkan hasil pelaksanaan tugas kepada pejabat pemberi perintah.</li><li>Melaksanakan perintah ini dengan penuh tanggung jawab.</li></ol></td></tr>
    </tbody></table>${sign}`),
  depan: {
    ...base("depan", "SPD Halaman Depan", `${head}
      <section class="spd-front-heading">
        <table class="spd-front-number"><tbody>
          <tr><th>Nomor</th><td>:</td><td>{{spd_number}}</td></tr>
          <tr><th>Lembaran ke</th><td>:</td><td>&nbsp;</td></tr>
        </tbody></table>
        <h1>SURAT PERJALANAN DINAS</h1>
      </section>
      <table class="spd-front-table"><colgroup><col class="spd-col-number"><col class="spd-col-label"><col class="spd-col-colon"><col class="spd-col-value"></colgroup><tbody>
        <tr><td>1.</td><td>Pejabat yang memberi perintah</td><td>:</td><td>{{signer_command_title}}<br>{{signer_region_line}}</td></tr>
        <tr><td>2.</td><td>Nama Pegawai yang diperintah</td><td>:</td><td>{{employee_name}} / {{employee_nip}}</td></tr>
        <tr><td>3.</td><td><span class="spd-subline"><i>a.</i>Pangkat dan Golongan</span><span class="spd-subline"><i>b.</i>Jabatan</span><span class="spd-subline spd-subline-gap"><i>c.</i>Tingkat Menurut Perjalanan Dinas</span></td><td>:<br>:<br><span class="spd-colon-gap">:</span></td><td>{{employee_rank}}<br>{{employee_position}}<br><span class="spd-value-gap">&nbsp;</span></td></tr>
        <tr><td>4.</td><td>Maksud Perjalanan Dinas</td><td>:</td><td>{{purpose}}</td></tr>
        <tr><td>5.</td><td>Alat Angkut yang dipergunakan</td><td>:</td><td>a. Kendaraan Umum<br><span class="spd-second-value">: &nbsp; b. ........................</span></td></tr>
        <tr><td>6.</td><td><span class="spd-subline"><i>a.</i>Tempat Berangkat</span><span class="spd-subline"><i>b.</i>Tempat Tujuan</span></td><td>:<br>:</td><td>{{city_name}}<br>{{destination_name}}</td></tr>
        <tr><td>7.</td><td><span class="spd-subline"><i>1)</i>Perjalanan Dinas direncanakan</span><span class="spd-subline"><i>2)</i>Tanggal berangkat</span><span class="spd-subline"><i>3)</i>Tanggal kembali</span></td><td>:<br>:<br>:</td><td>{{trip_days}} ({{trip_days_words}}) hari<br>{{depart_date_text}}<br>{{return_date_text}}</td></tr>
        <tr><td>8.</td><td>Pengikut</td><td>:</td><td>&nbsp;</td></tr>
        <tr><td>9.</td><td>Pembebanan Anggaran<span class="spd-subline spd-budget-first"><i>a.</i>Instansi</span><span class="spd-subline"><i>b.</i>Mata Anggaran</span></td><td><br>:<br>:</td><td><br>{{agency_name}}<br>{{account_code}}</td></tr>
        <tr><td>10.</td><td>Keterangan Lain - lain</td><td>:</td><td>ST. Nomor : {{spt_number}} /SPT/{{letter_code}}/<br>{{spt_date_text}}</td></tr>
      </tbody></table>
      <div class="spd-front-sign">
        <div class="spd-front-sign-date">{{city_name}}, {{spt_date_text}}</div>
        <div class="spd-front-sign-role"><span>a.n</span> {{signer_command_title}}<br>{{signer_region_line}}</div>
        <div class="spd-front-sign-space"></div>
        <strong>{{signer_name}}</strong><span>{{signer_rank}}</span><span>NIP. {{signer_nip}}</span>
      </div>`),
    layoutVersion: 2,
    preset: "F4",
    widthMm: 215,
    heightMm: 330,
    marginTopMm: 10,
    marginRightMm: 18,
    marginBottomMm: 10,
    marginLeftMm: 18,
    fontFamily: "Arial",
    fontSizePt: 10,
    lineHeight: 1.2,
    bodyParagraphGapMm: 0,
    headerFontFamily: "Times New Roman",
    headerGovernmentFontSizePt: 15,
    headerAgencyFontSizePt: 15,
    headerDetailFontSizePt: 10.5,
    headerLineHeight: 1,
    headerMinHeightMm: 28,
    headerMarginTopMm: 0,
    headerMarginBottomMm: 0,
    headerTextLeftMm: 27,
    headerTextRightMm: 2,
    headerPaddingTopMm: 0,
    headerPaddingBottomMm: 2,
    headerLogoWidthMm: 18,
    headerLogoHeightMm: 24,
    headerLogoLeftMm: 9,
    headerLogoTopMm: 0,
    headerAlignment: "center",
  },
  belakang: {
    ...base("belakang", "SPD Halaman Belakang", `<div class="spd-back">
      <section class="spd-back-one">
        <div class="spd-back-roman">I.</div>
        <div class="spd-back-i-content">
          <table><tbody>
            <tr><th>SPD No.</th><td>:</td><td>{{spd_number}}</td></tr>
            <tr><th>Berangkat dari<br><span>(tempat kedudukan)</span></th><td>:</td><td>{{city_name}}</td></tr>
            <tr><th>Pada tanggal</th><td>:</td><td>{{depart_date_text}}</td></tr>
            <tr><th>Ke</th><td>:</td><td>{{destination_name}}</td></tr>
          </tbody></table>
          <div class="spd-back-sign">
            <div><span>a.n.</span> {{signer_command_title}}<br>{{signer_region_line}}</div>
            <div class="spd-back-sign-space"></div>
            <strong>{{signer_name}}</strong><span>{{signer_rank}}</span><span>NIP. {{signer_nip}}</span>
          </div>
        </div>
      </section>
      <section class="spd-back-row spd-back-two">
        <div class="spd-back-roman">II.</div>
        <div class="spd-back-half">
          <table><tbody><tr><th>Tiba di</th><td>:</td><td>{{stopover_2_arrival_place}}</td></tr><tr><th>Pada tanggal</th><td>:</td><td>{{stopover_2_arrival_date}}</td></tr></tbody></table>
          <div class="spd-back-optional-sign"><span>{{stopover_2_official_position}}</span><em>{{stopover_2_official_signature}}</em><strong>{{stopover_2_official_name}}</strong><span>{{stopover_2_official_nip_line}}</span></div>
        </div>
        <div class="spd-back-half">
          <table><tbody><tr><th>Berangkat dari</th><td>:</td><td>{{stopover_2_arrival_place}}</td></tr><tr><th>Ke</th><td>:</td><td>{{stopover_2_next_destination}}</td></tr><tr><th>Pada tanggal</th><td>:</td><td>{{stopover_2_departure_date}}</td></tr></tbody></table>
          <div class="spd-back-optional-sign"><span>{{stopover_2_official_position}}</span><em>{{stopover_2_official_signature}}</em><strong>{{stopover_2_official_name}}</strong><span>{{stopover_2_official_nip_line}}</span></div>
        </div>
      </section>
      <section class="spd-back-row spd-back-stop">
        <div class="spd-back-roman">III.</div>
        <div class="spd-back-half"><table><tbody><tr><th>Tiba di</th><td>:</td><td>{{stopover_3_arrival_place}}</td></tr><tr><th>Pada tanggal</th><td>:</td><td>{{stopover_3_arrival_date}}</td></tr></tbody></table><div class="spd-back-optional-sign"><span>{{stopover_3_official_position}}</span><em>{{stopover_3_official_signature}}</em><strong>{{stopover_3_official_name}}</strong><span>{{stopover_3_official_nip_line}}</span></div></div>
        <div class="spd-back-half"><table><tbody><tr><th>Berangkat dari</th><td>:</td><td>{{stopover_3_arrival_place}}</td></tr><tr><th>Ke</th><td>:</td><td>{{stopover_3_next_destination}}</td></tr><tr><th>Pada tanggal</th><td>:</td><td>{{stopover_3_departure_date}}</td></tr></tbody></table><div class="spd-back-optional-sign"><span>{{stopover_3_official_position}}</span><em>{{stopover_3_official_signature}}</em><strong>{{stopover_3_official_name}}</strong><span>{{stopover_3_official_nip_line}}</span></div></div>
      </section>
      <section class="spd-back-row spd-back-stop">
        <div class="spd-back-roman">IV.</div>
        <div class="spd-back-half"><table><tbody><tr><th>Tiba di</th><td>:</td><td>{{stopover_4_arrival_place}}</td></tr><tr><th>Pada tanggal</th><td>:</td><td>{{stopover_4_arrival_date}}</td></tr></tbody></table><div class="spd-back-optional-sign"><span>{{stopover_4_official_position}}</span><em>{{stopover_4_official_signature}}</em><strong>{{stopover_4_official_name}}</strong><span>{{stopover_4_official_nip_line}}</span></div></div>
        <div class="spd-back-half"><table><tbody><tr><th>Berangkat dari</th><td>:</td><td>{{stopover_4_arrival_place}}</td></tr><tr><th>Ke</th><td>:</td><td>{{stopover_4_next_destination}}</td></tr><tr><th>Pada tanggal</th><td>:</td><td>{{stopover_4_departure_date}}</td></tr></tbody></table><div class="spd-back-optional-sign"><span>{{stopover_4_official_position}}</span><em>{{stopover_4_official_signature}}</em><strong>{{stopover_4_official_name}}</strong><span>{{stopover_4_official_nip_line}}</span></div></div>
      </section>
      <section class="spd-back-five">
        <div class="spd-back-v-content">
          <table><tbody><tr><th>V. Tiba kembali di</th><td>:</td><td>{{city_name}}</td></tr><tr><th>&nbsp;&nbsp;&nbsp;&nbsp;Pada tanggal</th><td>:</td><td>{{return_date_text}}</td></tr></tbody></table>
          <p>Telah diperiksa, dengan keterangan bahwa Perjalanan tersebut diatas benar dilakukan atas perintahnya dan semata-mata untuk kepentingan jabatan dalam waktu yang sesingkat-singkatnya.</p>
          <div class="spd-back-sign">
            <div><span>a.n.</span> {{signer_command_title}}<br>{{signer_region_line}}</div>
            <div class="spd-back-sign-space"></div>
            <strong>{{signer_name}}</strong><span>{{signer_rank}}</span><span>NIP. {{signer_nip}}</span>
          </div>
        </div>
      </section>
      <section class="spd-back-six"><b>VI.</b><span>CATATAN LAIN-LAIN</span></section>
      <section class="spd-back-seven"><b>VII.</b><div><strong>PERHATIAN</strong><p>Pejabat yang berwenang menerbitkan SPD, Pegawai yang melakukan perjalanan dinas, Pejabat yang mengesahkan tanggal berangkat/tiba serta Bendaharawan bertanggung jawab berdasarkan Peraturan-Peraturan Keuangan Negara apabila Negara mendapat rugi akibat kesalahan, kealpaannya.</p></div></section>
    </div>`),
    layoutVersion: 7,
    preset: "F4",
    widthMm: 215,
    heightMm: 330,
    marginTopMm: 8,
    marginRightMm: 15,
    marginBottomMm: 8,
    marginLeftMm: 15,
    fontFamily: "Arial",
    fontSizePt: 9.5,
    lineHeight: 1.18,
    bodyParagraphGapMm: 0,
  },
  kuitansi: {
    ...base("kuitansi", "Kuitansi dan Rincian Biaya", `<div class="official-receipt">
      <section class="receipt-main">
        <h1>K W I T A N S I</h1>
        <table class="receipt-intro"><tbody>
          <tr><th>Sudah diterima dari</th><td>:</td><td>Pengguna Anggaran {{agency_name}}<br>{{government_name}}</td></tr>
          <tr><th>Uang sebanyak</th><td>:</td><td><strong>==== {{total_words}} ====</strong></td></tr>
          <tr><th>Untuk Pembayaran</th><td>:</td><td>Biaya Perjalanan Dinas {{trip_type_text}} Sub Kegiatan {{activity_name}} di {{destination_name}} Pada tanggal {{depart_date_text}} Sesuai ST Nomor : {{spt_number_full}}, Tanggal {{spt_date_text}}</td></tr>
        </tbody></table>
        <div class="receipt-main-signatures">
          <div class="receipt-left-sign">
            <p>MENGETAHUI / MENYETUJUI :<br>Pengguna Anggaran</p><div class="receipt-sign-space"></div>
            <strong>{{signer_name}}</strong><span>{{signer_rank}}</span><span>NIP. {{signer_nip}}</span>
            <p class="paid-caption">Lunas dibayar<br>Bendahara Pengeluaran</p><div class="receipt-sign-space short"></div>
            <strong>{{treasurer_name}}</strong><span>NIP. {{treasurer_nip}}</span>
            <div class="receipt-total-box"><b>Terbilang&nbsp; Rp.</b><strong>{{total_cost_plain}}</strong></div>
          </div>
          <div class="receipt-right-sign">
            <table class="cash-book"><tbody><tr><th colspan="2">L U N A S</th></tr><tr><th rowspan="3">BUKU<br>KAS</th><td>No.</td></tr><tr><td>Tgl.</td></tr><tr><td>Kode Rek. {{account_code}}</td></tr></tbody></table>
            <p>{{city_name}}, <span class="receipt-date-line">{{return_date_text}}</span><br>Yang menerima,</p>
            <div class="receipt-sign-space receiver"></div><strong>{{employee_name}}</strong><span>NIP. {{employee_nip}}</span>
          </div>
        </div>
      </section>
      <section class="receipt-details">
        <div class="receipt-attachment"><span>Lampiran SPPD Nomor</span><b>:</b><span>{{spd_number}}</span><span>Tanggal</span><b>:</b><span>{{spt_date_text}}</span></div>
        <table class="receipt-expenses"><thead><tr><th>No</th><th>Rincian Biaya</th><th>Jumlah</th><th>Keterangan</th></tr></thead><tbody>
          {{expenses_rows_receipt}}
          <tr class="receipt-sum"><td></td><td>Jumlah</td><td><span>Rp</span><b>{{total_cost_plain}}</b></td><td rowspan="2"></td></tr>
          <tr class="receipt-words"><td></td><td>Terbilang</td><td>{{total_words}}</td></tr>
        </tbody></table>
        <div class="receipt-detail-signatures">
          <div><p>Telah dibayar sejumlah uang sebesar<br><span>Rp</span><b>{{total_cost_plain}}</b></p><p>Bendahara Pengeluaran</p><div class="detail-sign-space"></div><strong>{{treasurer_name}}</strong><span>NIP. {{treasurer_nip}}</span></div>
          <div><p>{{city_name}}, {{return_date_text}}<br>Telah menerima jumlah uang sebesar<br><span>Rp</span><b>{{total_cost_plain}}</b></p><p>Yang menerima</p><div class="detail-sign-space"></div><strong>{{employee_name}}</strong><span>NIP. {{employee_nip}}</span></div>
        </div>
      </section>
      <section class="receipt-final">
        <h2>PERHITUNGAN SPD RAMPUNG</h2>
        <table><tbody><tr><th>Ditetapkan sejumlah</th><td>:</td><td>Rp</td><td>{{total_cost_plain}}</td></tr><tr><th>Yang telah dibayarkan</th><td>:</td><td>Rp</td><td>{{total_cost_plain}}</td></tr><tr><th>Sisa kurang / lebih</th><td>:</td><td>Rp</td><td>-</td></tr></tbody></table>
        <div class="receipt-final-sign"><p>Mengetahui/Menyetujui :<br>{{signer_command_title}}<br>{{signer_region_line}}</p><div class="receipt-sign-space"></div><strong>{{signer_name}}</strong><span>NIP. {{signer_nip}}</span></div>
      </section>
    </div>`),
    layoutVersion: 2,
    preset: "CUSTOM",
    widthMm: 216,
    heightMm: 356,
    marginTopMm: 8,
    marginRightMm: 14,
    marginBottomMm: 8,
    marginLeftMm: 14,
    fontFamily: "Arial",
    fontSizePt: 9.5,
    lineHeight: 1.18,
    bodyParagraphGapMm: 0,
  },
};

export const templateVariables = [
  ["{{government_name}}", "Nama pemerintah"],
  ["{{agency_name}}", "Nama instansi"],
  ["{{address_line}}", "Alamat instansi"],
  ["{{contact_line}}", "Kontak instansi"],
  ["{{city_name}}", "Kota/kabupaten"],
  ["{{spt_number_full}}", "Nomor SPT lengkap"],
  ["{{spt_date_text}}", "Tanggal SPT"],
  ["{{purpose}}", "Maksud perjalanan"],
  ["{{destination_name}}", "Tujuan"],
  ["{{depart_date_text}}", "Tanggal berangkat"],
  ["{{return_date_text}}", "Tanggal kembali"],
  ["{{employee_name}}", "Nama pegawai"],
  ["{{employee_nip}}", "NIP pegawai"],
  ["{{employee_position}}", "Jabatan pegawai"],
  ["{{signer_name}}", "Nama penandatangan"],
  ["{{signer_nip}}", "NIP penandatangan"],
  ["{{stopover_2_arrival_place}}", "Bagian II: tempat tiba"],
  ["{{stopover_2_arrival_date}}", "Bagian II: tanggal tiba"],
  ["{{stopover_2_departure_date}}", "Bagian II: tanggal berangkat"],
  ["{{stopover_2_next_destination}}", "Bagian II: tujuan berikutnya"],
  ["{{stopover_2_official_position}}", "Bagian II: jabatan pejabat"],
  ["{{stopover_2_official_name}}", "Bagian II: nama pejabat"],
  ["{{stopover_3_arrival_place}}", "Bagian III: tempat tiba"],
  ["{{stopover_3_arrival_date}}", "Bagian III: tanggal tiba"],
  ["{{stopover_3_departure_date}}", "Bagian III: tanggal berangkat"],
  ["{{stopover_3_next_destination}}", "Bagian III: tujuan berikutnya"],
  ["{{stopover_3_official_position}}", "Bagian III: jabatan pejabat"],
  ["{{stopover_3_official_name}}", "Bagian III: nama pejabat"],
  ["{{stopover_3_official_signature}}", "Bagian III: tanda tangan/keterangan"],
  ["{{stopover_4_arrival_place}}", "Bagian IV: tempat tiba"],
  ["{{stopover_4_arrival_date}}", "Bagian IV: tanggal tiba"],
  ["{{stopover_4_departure_date}}", "Bagian IV: tanggal berangkat"],
  ["{{stopover_4_next_destination}}", "Bagian IV: tujuan berikutnya"],
  ["{{stopover_4_official_position}}", "Bagian IV: jabatan pejabat"],
  ["{{stopover_4_official_name}}", "Bagian IV: nama pejabat"],
  ["{{stopover_4_official_signature}}", "Bagian IV: tanda tangan/keterangan"],
  ["{{account_code}}", "Kode rekening"],
  ["{{total_cost}}", "Total biaya"],
] as const;

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const dateText = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};
const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
})[character] ?? character);
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);
function spellSmall(n: number): string {
  const words = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
  if (n < 12) return words[n];
  if (n < 20) return `${spellSmall(n - 10)} belas`;
  if (n < 100) return `${spellSmall(Math.floor(n / 10))} puluh ${spellSmall(n % 10)}`.trim();
  if (n < 200) return `seratus ${spellSmall(n - 100)}`.trim();
  return `${spellSmall(Math.floor(n / 100))} ratus ${spellSmall(n % 100)}`.trim();
}
function amountWords(input: number) {
  let n = Math.floor(input);
  if (!n) return "nol rupiah";
  const parts: string[] = [];
  for (const [value, label] of [[1e12, "triliun"], [1e9, "miliar"], [1e6, "juta"], [1e3, "ribu"]] as Array<[number, string]>) {
    if (n >= value) {
      const amount = Math.floor(n / value);
      parts.push(value === 1e3 && amount === 1 ? "seribu" : `${spellSmall(amount)} ${label}`);
      n %= value;
    }
  }
  if (n) parts.push(spellSmall(n));
  return `${parts.join(" ")} rupiah`;
}
const participantTotal = (person?: Participant) => person?.expenses.reduce(
  (sum, item) => sum + (Number(item.amount) || Number(item.volume) * Number(item.rate)),
  0,
) ?? 0;

export function loadDocumentTemplates(raw?: string): Record<DocumentKey, DocumentTemplate> {
  if (!raw) return structuredClone(defaultDocumentTemplates);
  try {
    const parsed = JSON.parse(raw) as Partial<Record<DocumentKey, Partial<DocumentTemplate>>>;
    const merged = {} as Record<DocumentKey, DocumentTemplate>;
    for (const [id] of documentTabs) {
      const candidate = parsed[id] ?? {};
      const currentDefault = defaultDocumentTemplates[id];
      const useUpdatedOfficialLayout = ["depan", "belakang", "kuitansi"].includes(id)
        && Number(candidate.layoutVersion || 0) < currentDefault.layoutVersion;
      merged[id] = useUpdatedOfficialLayout
        ? structuredClone(currentDefault)
        : { ...currentDefault, ...candidate, id };
    }
    return merged;
  } catch {
    return structuredClone(defaultDocumentTemplates);
  }
}

export function renderDocumentTemplate(template: DocumentTemplate, detail: TripDetail, person?: Participant) {
  const trip = detail.trip;
  const year = new Date(`${trip.spt_date}T00:00:00`).getFullYear();
  const total = participantTotal(person);
  const tripDays = Math.max(1, Math.round((new Date(`${trip.return_date}T00:00:00`).getTime() - new Date(`${trip.depart_date}T00:00:00`).getTime()) / 86400000) + 1);
  const agencyCore = String(detail.settings.agency_name || "").replace(/^DINAS\s+/i, "").trim();
  const signerRole = String(trip.signer_role || "Kepala Dinas").trim();
  const signerCommandTitle = agencyCore && !signerRole.toLowerCase().includes(agencyCore.toLowerCase())
    ? `${signerRole} ${agencyCore}`
    : signerRole;
  const emptyStopover = { enabled: false, arrival_place: "", arrival_date: "", departure_date: "", next_destination: "", official_position: "", official_name: "", official_nip: "", official_signature: "" };
  const storedStopovers = trip.stopovers || [];
  const [stopover2, stopover3, stopover4] = storedStopovers.length >= 3
    ? [storedStopovers[0], storedStopovers[1], storedStopovers[2]]
    : [
        { ...emptyStopover, enabled: true, arrival_place: trip.destination_name, arrival_date: trip.depart_date, departure_date: trip.return_date, next_destination: detail.settings.city_name || "" },
        storedStopovers[0] || emptyStopover,
        storedStopovers[1] || emptyStopover,
      ];
  const stopoverValues = (prefix: string, row: typeof emptyStopover) => row.enabled ? {
    [`${prefix}_arrival_place`]: row.arrival_place,
    [`${prefix}_arrival_date`]: row.arrival_date ? dateText(row.arrival_date) : "",
    [`${prefix}_departure_date`]: row.departure_date ? dateText(row.departure_date) : "",
    [`${prefix}_next_destination`]: row.next_destination,
    [`${prefix}_official_position`]: row.official_position,
    [`${prefix}_official_name`]: row.official_name,
    [`${prefix}_official_nip_line`]: row.official_nip ? `NIP. ${row.official_nip}` : "",
    [`${prefix}_official_signature`]: row.official_signature,
  } : {
    [`${prefix}_arrival_place`]: "", [`${prefix}_arrival_date`]: "", [`${prefix}_departure_date`]: "",
    [`${prefix}_next_destination`]: "", [`${prefix}_official_position`]: "", [`${prefix}_official_name`]: "",
    [`${prefix}_official_nip_line`]: "",
    [`${prefix}_official_signature`]: "",
  };
  const simple: Record<string, unknown> = {
    ...detail.settings,
    ...trip,
    logo_url: detail.settings.logo_url || "/image1.png",
    spt_number_full: `${trip.spt_number || "........"}/${trip.letter_code}/${year}`,
    spt_date_text: dateText(trip.spt_date),
    depart_date_text: dateText(trip.depart_date),
    return_date_text: dateText(trip.return_date),
    trip_days: tripDays,
    trip_days_words: spellSmall(tripDays),
    signer_command_title: signerCommandTitle,
    employee_name: person?.name || "Nama Pegawai",
    employee_nip: person?.nip || "-",
    employee_rank: person?.rank || "-",
    employee_position: person?.position || "-",
    employee_work_unit: person?.work_unit || "-",
    spd_number: person?.spd_number || "................................",
    total_cost: money(total),
    total_cost_plain: new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total),
    total_words: amountWords(total),
    trip_type_text: trip.trip_type === "dalam" ? "Dalam Kota" : "Luar Daerah",
    notes: trip.notes || "-",
    ...stopoverValues("stopover_2", stopover2),
    ...stopoverValues("stopover_3", stopover3),
    ...stopoverValues("stopover_4", stopover4),
  };
  const safe: Record<string, string> = Object.fromEntries(Object.entries(simple).map(([key, value]) => [key, esc(value)]));
  safe.participants_rows = detail.participants.map((item, index) =>
    `<tr><td class="center">${index + 1}</td><td><strong>${esc(item.name)}</strong><br>NIP. ${esc(item.nip || "-")}</td><td>${esc(item.position || item.work_unit)}</td><td>${esc(trip.destination_name)}</td><td>${esc(dateText(trip.depart_date))} s.d. ${esc(dateText(trip.return_date))}</td></tr>`,
  ).join("");
  safe.person_list_rows = detail.participants.map((item, index) =>
    `<tr><td>${index + 1}.</td><td><strong>${esc(item.name)}</strong><br>NIP. ${esc(item.nip || "-")}<br>${esc(item.rank || "-")}<br>${esc(item.position || item.work_unit)}</td></tr>`,
  ).join("");
  safe.expenses_rows = (person?.expenses ?? []).map((item, index) => {
    const amount = Number(item.amount) || Number(item.volume) * Number(item.rate);
    return `<tr><td class="center">${index + 1}</td><td>${esc(item.item_name)}</td><td class="center">${esc(item.volume)}</td><td class="right">${esc(money(item.rate))}</td><td class="right">${esc(money(amount))}</td><td>${esc(item.notes || "-")}</td></tr>`;
  }).join("");
  safe.expenses_rows_receipt = (person?.expenses ?? []).map((item, index) => {
    const amount = Number(item.amount) || Number(item.volume) * Number(item.rate);
    const detailText = Number(item.volume) > 0 && Number(item.rate) > 0
      ? `${item.item_name} ${item.volume} x Rp. ${new Intl.NumberFormat("id-ID").format(item.rate)}`
      : item.item_name;
    const amountText = amount ? new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) : "-";
    return `<tr><td>${index + 1}</td><td>${esc(detailText)}</td><td><span>Rp</span><b>${esc(amountText)}</b></td><td>${esc(item.notes || "")}</td></tr>`;
  }).join("");
  return template.html.replace(/\{\{([a-z0-9_]+)\}\}/gi, (_, key: string) => safe[key] ?? `{{${key}}}`);
}

export function sanitizeTemplateHtml(html: string) {
  return html
    .replace(/<(script|style|iframe|object|embed|form)[\s\S]*?<\/\1>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "");
}
