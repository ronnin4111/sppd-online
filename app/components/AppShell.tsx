"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  ["/", "Dashboard", "▦"],
  ["/perjalanan", "Perjalanan dinas", "↗"],
  ["/arsip", "Arsip dokumen", "▤"],
  ["/template-dokumen", "Templat dokumen", "▧"],
  ["/master-data", "Master data", "⊞"],
  ["/pengaturan", "Pengaturan", "⚙"],
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand"><span>SP</span><div><strong>SPPD Online</strong><small>Administrasi perjalanan</small></div></div>
        <p className="nav-caption">Menu utama</p>
        <nav>
          {navigation.map(([href,label,icon]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={(href === "/" ? pathname === "/" : pathname.startsWith(href)) ? "active" : ""}>
              <i>{icon}</i>{label}
            </Link>
          ))}
        </nav>
        <div className="side-note"><strong>Akses terlindungi</strong><p>Data hanya dapat dibuka setelah pengguna masuk dengan akun ChatGPT.</p></div>
      </aside>
      <div className="main">
        <header className="topbar">
          <button onClick={() => setOpen(!open)} aria-label="Buka menu">☰</button>
          <div><small>Sistem Informasi</small><strong>Perjalanan Dinas</strong></div>
          <div className="account-actions">
            <span className="online"><i /> Online</span>
            <a href="/signout-with-chatgpt?return_to=%2F">Keluar</a>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
      {open ? <button className="backdrop" onClick={() => setOpen(false)} aria-label="Tutup menu" /> : null}
    </div>
  );
}
