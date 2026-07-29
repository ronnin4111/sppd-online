import { getDatabaseAdapter } from "../../../db";
import { getAdminSession } from "../../auth";

type Statement = {
  bind: (...values: unknown[]) => Statement;
  run: () => Promise<unknown>;
  first: <T = Record<string, unknown>>() => Promise<T | null>;
  all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
};
type Database = {
  prepare: (sql: string) => Statement;
  batch: (statements: Statement[]) => Promise<unknown>;
};
const db = () => getDatabaseAdapter() as unknown as Database;

const schema = [
  "CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '')",
  `CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, nip TEXT NOT NULL DEFAULT '',
    position TEXT NOT NULL DEFAULT '', rank TEXT NOT NULL DEFAULT '', work_unit TEXT NOT NULL DEFAULT '',
    daily_rate REAL NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS destinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, trip_type TEXT NOT NULL DEFAULT 'dalam',
    transport_rate REAL NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS budget_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, activity_name TEXT NOT NULL,
    account_code TEXT NOT NULL DEFAULT '', active INTEGER NOT NULL DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS signatories (
    id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL, name TEXT NOT NULL,
    nip TEXT NOT NULL DEFAULT '', rank TEXT NOT NULL DEFAULT '', region_line TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT, trip_type TEXT NOT NULL DEFAULT 'dalam',
    destination_name TEXT NOT NULL, purpose TEXT NOT NULL, depart_date TEXT NOT NULL,
    return_date TEXT NOT NULL, spt_number TEXT NOT NULL DEFAULT '', spt_date TEXT NOT NULL,
    letter_code TEXT NOT NULL DEFAULT 'DPKPP-G', signer_id INTEGER, budget_account_id INTEGER,
    status TEXT NOT NULL DEFAULT 'draft', notes TEXT NOT NULL DEFAULT '', stopovers_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS trip_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT, trip_id INTEGER NOT NULL, employee_id INTEGER NOT NULL,
    spd_number TEXT NOT NULL DEFAULT '', sequence_no INTEGER NOT NULL DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT, participant_id INTEGER NOT NULL, item_name TEXT NOT NULL,
    volume REAL NOT NULL DEFAULT 1, rate REAL NOT NULL DEFAULT 0, amount REAL NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 1)`,
  "CREATE INDEX IF NOT EXISTS participants_trip_idx ON trip_participants (trip_id)",
  "CREATE INDEX IF NOT EXISTS expenses_participant_idx ON expenses (participant_id)",
];

const defaults: Record<string, string> = {
  government_name: "PEMERINTAH KABUPATEN MEMPAWAH",
  agency_name: "DINAS PERTANIAN, KETAHANAN PANGAN DAN PERIKANAN",
  address_line: "Jalan Raden Kusno No. 61 Telp. (0561) 691016",
  contact_line: "Fax. (0561) 691434 MEMPAWAH 78912",
  city_name: "Mempawah",
  fiscal_year: new Date().getFullYear().toString(),
  treasurer_name: "NAMA BENDAHARA",
  treasurer_nip: "00000000 000000 0 000",
  letter_code: "DPKPP-G",
  logo_url: "/image1.png",
};

async function ensureDb() {
  const database = db();
  await database.batch(schema.map((sql) => database.prepare(sql)));
  const tripColumns = await database.prepare("PRAGMA table_info(trips)").all<{ name: string }>();
  if (!tripColumns.results.some((column) => column.name === "stopovers_json")) {
    await database.prepare("ALTER TABLE trips ADD COLUMN stopovers_json TEXT NOT NULL DEFAULT '[]'").run();
  }
  await database.batch(
    Object.entries(defaults).map(([key, value]) =>
      database.prepare("INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)").bind(key, value),
    ),
  );
  const employeeCount = await database.prepare("SELECT COUNT(*) count FROM employees").first<{ count: number }>();
  if (!employeeCount?.count) {
    await database.prepare(
      "INSERT INTO employees (name,nip,position,rank,work_unit,daily_rate) VALUES (?,?,?,?,?,?)",
    ).bind("Pegawai Contoh, S.Pi", "00000000 000000 0 000", "Staf Pelaksana", "Penata Muda / III a", "DPKPP Kabupaten Mempawah", 250000).run();
  }
  const destinationCount = await database.prepare("SELECT COUNT(*) count FROM destinations").first<{ count: number }>();
  if (!destinationCount?.count) {
    await database.batch([
      database.prepare("INSERT INTO destinations (name,trip_type,transport_rate) VALUES (?,?,?)").bind("Pontianak", "dalam", 300000),
      database.prepare("INSERT INTO destinations (name,trip_type,transport_rate) VALUES (?,?,?)").bind("Jakarta", "luar", 1500000),
    ]);
  }
  const accountCount = await database.prepare("SELECT COUNT(*) count FROM budget_accounts").first<{ count: number }>();
  if (!accountCount?.count) {
    await database.prepare("INSERT INTO budget_accounts (activity_name,account_code) VALUES (?,?)")
      .bind("Perjalanan Dinas Dalam dan Luar Daerah", "3.03.01.25.01.5.2.2.15.01").run();
  }
  const signerCount = await database.prepare("SELECT COUNT(*) count FROM signatories").first<{ count: number }>();
  if (!signerCount?.count) {
    await database.prepare("INSERT INTO signatories (role,name,nip,rank,region_line) VALUES (?,?,?,?,?)")
      .bind("Kepala Dinas", "PEJABAT PENANDA TANGAN", "00000000 000000 0 000", "Pembina Tk. I", "KABUPATEN MEMPAWAH").run();
  }
}

async function dataset() {
  const database = db();
  const [settings, employees, destinations, accounts, signatories, trips] = await Promise.all([
    database.prepare("SELECT key,value FROM settings").all(),
    database.prepare("SELECT * FROM employees WHERE active=1 ORDER BY name").all(),
    database.prepare("SELECT * FROM destinations WHERE active=1 ORDER BY name").all(),
    database.prepare("SELECT * FROM budget_accounts WHERE active=1 ORDER BY activity_name").all(),
    database.prepare("SELECT * FROM signatories WHERE active=1 ORDER BY role").all(),
    database.prepare(`SELECT t.*, COUNT(DISTINCT p.id) participant_count,
      COALESCE(SUM(e.amount),0) total_amount FROM trips t
      LEFT JOIN trip_participants p ON p.trip_id=t.id
      LEFT JOIN expenses e ON e.participant_id=p.id
      GROUP BY t.id ORDER BY t.id DESC LIMIT 100`).all(),
  ]);
  return {
    settings: Object.fromEntries(settings.results.map((row) => [String((row as {key:string}).key), String((row as {value:string}).value)])),
    employees: employees.results, destinations: destinations.results, accounts: accounts.results,
    signatories: signatories.results, trips: trips.results,
  };
}

async function detail(id: number) {
  const database = db();
  const trip = await database.prepare(`SELECT t.*, a.activity_name, a.account_code,
    s.role signer_role, s.name signer_name, s.nip signer_nip, s.rank signer_rank,
    s.region_line signer_region_line FROM trips t
    LEFT JOIN budget_accounts a ON a.id=t.budget_account_id
    LEFT JOIN signatories s ON s.id=t.signer_id WHERE t.id=?`).bind(id).first();
  if (!trip) return null;
  const participants = await database.prepare(`SELECT p.*, e.name,e.nip,e.position,e.rank,e.work_unit,e.daily_rate
    FROM trip_participants p JOIN employees e ON e.id=p.employee_id
    WHERE p.trip_id=? ORDER BY p.sequence_no,p.id`).bind(id).all();
  const expenses = await database.prepare(`SELECT x.* FROM expenses x
    JOIN trip_participants p ON p.id=x.participant_id WHERE p.trip_id=?
    ORDER BY x.participant_id,x.sort_order,x.id`).bind(id).all();
  const settings = await database.prepare("SELECT key,value FROM settings").all();
  return {
    trip: {
      ...trip,
      stopovers: (() => {
        try {
          const value = JSON.parse(String((trip as { stopovers_json?: string }).stopovers_json || "[]"));
          return Array.isArray(value) ? value : [];
        } catch { return []; }
      })(),
    },
    participants: participants.results.map((participant) => ({
      ...participant,
      expenses: expenses.results.filter((expense) =>
        Number((expense as { participant_id: number }).participant_id) === Number((participant as { id: number }).id)),
    })),
    settings: Object.fromEntries(settings.results.map((row) => [String((row as {key:string}).key), String((row as {value:string}).value)])),
  };
}

const text = (value: unknown, max = 5000) => String(value ?? "").trim().slice(0, max);
const number = (value: unknown) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
const stopovers = (value: unknown) => {
  const rows = Array.isArray(value) ? value.slice(0, 3) as Array<Record<string, unknown>> : [];
  return rows.map((row) => ({
    enabled: Boolean(row.enabled), arrival_place: text(row.arrival_place, 200),
    arrival_date: text(row.arrival_date, 20), departure_date: text(row.departure_date, 20),
    next_destination: text(row.next_destination, 200), official_position: text(row.official_position, 200),
    official_name: text(row.official_name, 200), official_nip: text(row.official_nip, 50),
    official_signature: text(row.official_signature, 500),
  }));
};
const sanitizeTemplateHtml = (value: string) => value
  .replace(/<(script|style|iframe|object|embed|form)[\s\S]*?<\/\1>/gi, "")
  .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
  .replace(/javascript\s*:/gi, "");

export async function GET(request: Request) {
  try {
    if (!(await getAdminSession())) {
      return Response.json(
        { error: "Silakan masuk untuk mengakses data SPPD." },
        { status: 401 },
      );
    }
    await ensureDb();
    const id = Number(new URL(request.url).searchParams.get("tripId"));
    if (id) {
      const result = await detail(id);
      return result ? Response.json(result) : Response.json({ error: "Perjalanan tidak ditemukan." }, { status: 404 });
    }
    return Response.json(await dataset());
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kesalahan server." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await getAdminSession())) {
      return Response.json(
        { error: "Silakan masuk untuk mengubah data SPPD." },
        { status: 401 },
      );
    }
    await ensureDb();
    const database = db();
    const body = await request.json() as { action?: string; payload?: Record<string, unknown> };
    const payload = body.payload ?? {};
    if (body.action === "createTrip") {
      const people = Array.isArray(payload.participants) ? payload.participants as Array<Record<string, unknown>> : [];
      if (!people.length) return Response.json({ error: "Minimal satu peserta wajib dipilih." }, { status: 400 });
      const inserted = await database.prepare(`INSERT INTO trips
        (trip_type,destination_name,purpose,depart_date,return_date,spt_number,spt_date,letter_code,signer_id,budget_account_id,notes,stopovers_json)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id`).bind(
          text(payload.trip_type, 10) === "luar" ? "luar" : "dalam", text(payload.destination_name, 300),
          text(payload.purpose), text(payload.depart_date, 20), text(payload.return_date, 20),
          text(payload.spt_number, 100), text(payload.spt_date, 20), text(payload.letter_code, 50) || "DPKPP-G",
          number(payload.signer_id) || null, number(payload.budget_account_id) || null, text(payload.notes, 1000),
          JSON.stringify(stopovers(payload.stopovers)),
        ).first<{ id: number }>();
      if (!inserted?.id) throw new Error("Data perjalanan gagal disimpan.");
      for (let index = 0; index < people.length; index += 1) {
        const person = people[index];
        const employeeId = number(person.employee_id);
        if (!employeeId) continue;
        const saved = await database.prepare("INSERT INTO trip_participants (trip_id,employee_id,spd_number,sequence_no) VALUES (?,?,?,?) RETURNING id")
          .bind(inserted.id, employeeId, text(person.spd_number, 100), index + 1).first<{ id: number }>();
        const costs = Array.isArray(person.expenses) ? person.expenses as Array<Record<string, unknown>> : [];
        if (saved?.id && costs.length) {
          await database.batch(costs.map((cost, costIndex) => {
            const volume = number(cost.volume), rate = number(cost.rate);
            return database.prepare("INSERT INTO expenses (participant_id,item_name,volume,rate,amount,notes,sort_order) VALUES (?,?,?,?,?,?,?)")
              .bind(saved.id, text(cost.item_name, 200) || "Biaya lainnya", volume, rate, volume * rate, text(cost.notes, 300), costIndex + 1);
          }));
        }
      }
      return Response.json({ ok: true, tripId: inserted.id }, { status: 201 });
    }
    if (body.action === "addEmployee") {
      await database.prepare("INSERT INTO employees (name,nip,position,rank,work_unit,daily_rate) VALUES (?,?,?,?,?,?)")
        .bind(text(payload.name,200), text(payload.nip,80), text(payload.position,200), text(payload.rank,120), text(payload.work_unit,200), number(payload.daily_rate)).run();
    } else if (body.action === "addDestination") {
      await database.prepare("INSERT INTO destinations (name,trip_type,transport_rate) VALUES (?,?,?)")
        .bind(text(payload.name,200), text(payload.trip_type,10)==="luar"?"luar":"dalam", number(payload.transport_rate)).run();
    } else if (body.action === "addAccount") {
      await database.prepare("INSERT INTO budget_accounts (activity_name,account_code) VALUES (?,?)")
        .bind(text(payload.activity_name,1000), text(payload.account_code,200)).run();
    } else if (body.action === "addSignatory") {
      await database.prepare("INSERT INTO signatories (role,name,nip,rank,region_line) VALUES (?,?,?,?,?)")
        .bind(text(payload.role,200), text(payload.name,200), text(payload.nip,80), text(payload.rank,120), text(payload.region_line,200)).run();
    } else if (body.action === "saveSettings") {
      const values = payload.values && typeof payload.values === "object" ? payload.values as Record<string, unknown> : {};
      const allowed = new Set(Object.keys(defaults));
      const statements = Object.entries(values).filter(([key]) => allowed.has(key)).map(([key,value]) =>
        database.prepare("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(key,text(value,1000)));
      if (statements.length) await database.batch(statements);
    } else if (body.action === "saveDocumentTemplates") {
      const raw = text(payload.templates, 250000);
      const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>;
      const allowedDocuments = new Set(["nota", "spt", "depan", "belakang", "kuitansi"]);
      for (const [key, template] of Object.entries(parsed)) {
        if (!allowedDocuments.has(key) || !template || typeof template !== "object") {
          throw new Error("Struktur templat dokumen tidak valid.");
        }
        const width = Number(template.widthMm), height = Number(template.heightMm);
        if (!Number.isFinite(width) || !Number.isFinite(height) || width < 100 || width > 400 || height < 100 || height > 500) {
          throw new Error("Ukuran halaman templat tidak valid.");
        }
        template.html = sanitizeTemplateHtml(text(template.html, 100000));
      }
      await database.prepare("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
        .bind("document_templates_v1", JSON.stringify(parsed)).run();
    } else if (body.action === "updateTripStatus") {
      const status = ["draft","final","printed"].includes(text(payload.status,20)) ? text(payload.status,20) : "draft";
      await database.prepare("UPDATE trips SET status=? WHERE id=?").bind(status, number(payload.trip_id)).run();
    } else {
      return Response.json({ error: "Aksi tidak dikenali." }, { status: 400 });
    }
    return Response.json({ ok: true, ...await dataset() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kesalahan server." }, { status: 500 });
  }
}
