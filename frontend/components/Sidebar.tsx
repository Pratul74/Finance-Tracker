"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "⬡" },
  { href: "/records",   label: "Records",  icon: "≡" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <span className="sidebar-logo">◈</span>
          <span>Fintrack</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${pathname === href ? "active" : ""}`}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
        <button className="btn btn-ghost logout-btn" onClick={logout}>
          ↪ Sign out
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 220px;
          min-height: 100vh;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem 1rem;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 10;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 1.05rem;
          letter-spacing: -0.02em;
          padding: 0 0.5rem;
          margin-bottom: 2rem;
        }
        .sidebar-logo { color: var(--accent); font-size: 1.3rem; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 0.25rem; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.6rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.18s;
        }
        .nav-item:hover { background: var(--surface-2); color: var(--text); }
        .nav-item.active {
          background: var(--accent-dim);
          color: var(--accent);
        }
        .nav-icon { font-size: 1.1rem; width: 1.2rem; text-align: center; }

        .sidebar-bottom { display: flex; flex-direction: column; gap: 0.75rem; }
        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-dim);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
          flex-shrink: 0;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .user-name {
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-email {
          font-size: 0.7rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .logout-btn { width: 100%; font-size: 0.8rem; justify-content: flex-start; }
      `}</style>
    </aside>
  );
}