"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import {
  useRecords, useCreateRecord, useDeleteRecord,
  useMonthly, useCategory,
  type Category,
} from "@/hooks/useRecords";

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  "food","travel","clothing","medicine","entertainment",
  "fitness","skills","investment","hobby","others",
];

const CAT_ICONS: Record<string, string> = {
  food:"🍽", travel:"✈️", clothing:"👗", medicine:"💊",
  entertainment:"🎬", fitness:"💪", skills:"📚",
  investment:"📈", hobby:"🎨", others:"📦",
};

const PIE_COLORS = [
  "#f59e0b","#3b82f6","#22c55e","#ef4444","#a855f7",
  "#06b6d4","#f97316","#84cc16","#ec4899","#6b7280",
];

type Tab = "all" | "monthly" | "category";

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: string | number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n));

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["income", "expense"]),
  category: z.string().optional(),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

// ── Sub-components ───────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <tr>
      {[1,2,3,4,5].map(i => (
        <td key={i} style={{ padding: "1rem 1.25rem" }}>
          <div className="skeleton" style={{ height: 13, width: "65%" }} />
        </td>
      ))}
    </tr>
  );
}

function Empty({ msg = "No data found" }: { msg?: string }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">🗂</span>
      <p>{msg}</p>
    </div>
  );
}

// ── Monthly Tab ──────────────────────────────────────────────────────────────

function MonthlyTab({ filters }: { filters: any }) {
  const { data = [], isLoading } = useMonthly(filters);

  if (isLoading) return <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />;
  if (!data.length) return <Empty msg="No monthly data yet" />;

  return (
    <div className="tab-content animate-fade-up">
      {/* Bar chart */}
      <div className="card chart-wrap">
        <h3 className="chart-heading">Income vs Expense by Month</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border-hover)", borderRadius: 8, fontSize: "0.8rem" }}
              formatter={(v: number) => fmt(v)}
            />
            <Bar dataKey="income" fill="#22c55e" radius={[4,4,0,0]} name="Income" />
            <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} name="Expense" />
          </BarChart>
        </ResponsiveContainer>
        <div className="legend-row">
          <span className="legend-dot" style={{ background: "#22c55e" }} /> Income
          <span className="legend-dot" style={{ background: "#ef4444", marginLeft: "1rem" }} /> Expense
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Month</th>
              <th className="right">Income</th>
              <th className="right">Expense</th>
              <th className="right">Net</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => {
              const net = Number(row.income) - Number(row.expense);
              return (
                <tr key={row.month} className="record-row">
                  <td className="month-cell">{row.month}</td>
                  <td className="right income-val">{fmt(row.income)}</td>
                  <td className="right expense-val">{fmt(row.expense)}</td>
                  <td className={`right amount ${net >= 0 ? "income-val" : "expense-val"}`}>
                    {net >= 0 ? "+" : ""}{fmt(net)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Category Tab ─────────────────────────────────────────────────────────────

function CategoryTab({ filters }: { filters: any }) {
  const { data = [], isLoading } = useCategory(filters);

  if (isLoading) return <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />;
  if (!data.length) return <Empty msg="No expense data yet" />;

  const total = data.reduce((s, d) => s + Number(d.total), 0);

  return (
    <div className="tab-content animate-fade-up">
      <div className="cat-layout">
        {/* Pie chart */}
        <div className="card chart-wrap pie-wrap">
          <h3 className="chart-heading">Expense Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data} dataKey="total" nameKey="category"
                cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3}>
                {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border-hover)", borderRadius: 8, fontSize: "0.8rem" }}
                formatter={(v: number) => fmt(v)}
              />
              <Legend formatter={v => cap(v)} wrapperStyle={{ fontSize: "0.78rem", color: "var(--text-muted)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category list */}
        <div className="card cat-list-card">
          <h3 className="chart-heading">By Category</h3>
          <div className="cat-list">
            {data.map((row, i) => {
              const pct = total ? Math.round((Number(row.total) / total) * 100) : 0;
              return (
                <div key={row.category} className="cat-row">
                  <div className="cat-meta">
                    <span className="cat-icon">{CAT_ICONS[row.category] ?? "📦"}</span>
                    <span className="cat-name">{cap(row.category)}</span>
                    <span className="cat-pct">{pct}%</span>
                    <span className="cat-amt">{fmt(row.total)}</span>
                  </div>
                  <div className="cat-bar-bg">
                    <div
                      className="cat-bar-fill"
                      style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── All Records Tab ───────────────────────────────────────────────────────────

function AllTab({
  filters, setFilters,
}: {
  filters: any;
  setFilters: (f: any) => void;
}) {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const combinedFilters = {
    ...filters,
    page,
    ...(catFilter ? { category: catFilter } : {}),
    ...(typeFilter ? { type: typeFilter } : {}),
  };

  const { data, isLoading } = useRecords(combinedFilters);
  const createRecord = useCreateRecord();
  const deleteRecord = useDeleteRecord();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { type: "expense", category: "others" } });

  const selectedType = watch("type");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const onSubmit = async (d: FormData) => {
    await createRecord.mutateAsync(d as any);
    reset(); setShowForm(false); setPage(1);
    showToast("Record added ✓");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this record?")) return;
    await deleteRecord.mutateAsync(id);
    showToast("Record deleted");
  };

  const records = data?.results ?? [];
  const totalPages = data ? Math.ceil(data.count / 10) : 1;

  return (
    <>
      {/* Add button + form */}
      <div className="all-header">
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? "✕ Cancel" : "+ Add record"}
        </button>
      </div>

      {showForm && (
        <div className="card form-card animate-fade-up">
          <h2 className="form-title">New record</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-grid">
              <div className="field">
                <label className="label">Type</label>
                <select className="input" {...register("type", {
                  onChange: (e) => {
                    if (e.target.value === "income") setValue("category", undefined);
                  }
                })}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Amount (₹)</label>
                <input type="number" step="0.01"
                  className={`input ${errors.amount ? "input-error" : ""}`}
                  placeholder="0.00" {...register("amount")} />
                {errors.amount && <span className="field-error">{errors.amount.message}</span>}
              </div>
              {selectedType === "expense" && (
                <div className="field animate-fade-in">
                  <label className="label">Category</label>
                  <select className="input" {...register("category")}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{cap(c)}</option>)}
                  </select>
                </div>
              )}
              <div className="field full-width">
                <label className="label">Description (optional)</label>
                <input className="input" placeholder="What was this for?" {...register("description")} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save record"}
            </button>
          </form>
        </div>
      )}

      {/* Inline filters */}
      <div className="card filter-bar">
        <div className="filter-group">
          <label className="label">From</label>
          <input type="date" className="input"
            onChange={e => { setFilters((f: any) => ({ ...f, start: e.target.value || undefined })); setPage(1); }} />
        </div>
        <div className="filter-group">
          <label className="label">To</label>
          <input type="date" className="input"
            onChange={e => { setFilters((f: any) => ({ ...f, end: e.target.value || undefined })); setPage(1); }} />
        </div>
        <div className="filter-group">
          <label className="label">Category</label>
          <select className="input" value={catFilter}
            onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{cap(c)}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="label">Type</label>
          <select className="input" value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <button className="btn btn-ghost"
          onClick={() => { setFilters({}); setCatFilter(""); setTypeFilter(""); setPage(1); }}>
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="card table-card animate-fade-up">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th><th>Type</th><th>Category</th>
                <th>Description</th><th className="right">Amount</th><th />
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
                : records.length === 0
                  ? <tr><td colSpan={6} className="empty-row">No records found.</td></tr>
                  : records.map(r => (
                    <tr key={r.id} className="record-row animate-fade-in">
                      <td className="date-cell">{fmtDate(r.date)}</td>
                      <td><span className={`badge badge-${r.type}`}>{r.type_display}</span></td>
                      <td className="cat-cell">
                        {CAT_ICONS[r.category] ?? ""} {r.category_display}
                      </td>
                      <td className="desc-cell">{r.description || "—"}</td>
                      <td className={`right amount ${r.type === "income" ? "income-val" : "expense-val"}`}>
                        {r.type === "income" ? "+" : "-"}{fmt(r.amount)}
                      </td>
                      <td className="action-cell">
                        <button className="btn btn-danger del-btn" onClick={() => handleDelete(r.id)}>✕</button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-ghost pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span className="pag-info">{page} / {totalPages}</span>
            <button className="btn btn-ghost pag-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {toast && <div className="toast animate-fade-up">{toast}</div>}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RecordsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [filters, setFilters] = useState<{ start?: string; end?: string }>({});

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "all",      label: "All Records", icon: "≡" },
    { id: "monthly",  label: "Monthly",     icon: "📅" },
    { id: "category", label: "By Category", icon: "🏷" },
  ];

  return (
    <div className="layout">
      <Sidebar />

      <main className="main">
        {/* Page header */}
        <header className="page-header">
          <div>
            <h1 className="page-title">Records</h1>
            <p className="page-sub">Track, filter and analyse your transactions</p>
          </div>
        </header>

        {/* Tabs */}
        <div className="tabs-bar">
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {tab === "all"      && <AllTab filters={filters} setFilters={setFilters} />}
        {tab === "monthly"  && <MonthlyTab filters={filters} />}
        {tab === "category" && <CategoryTab filters={filters} />}
      </main>

      <style jsx>{`
        .layout { display: flex; min-height: 100vh; }
        .main { margin-left: 220px; flex: 1; padding: 2rem 2.5rem; max-width: 1100px; }

        .page-header { margin-bottom: 1.5rem; }
        .page-title { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.03em; }
        .page-sub { color: var(--text-muted); font-size: 0.875rem; }

        /* Tabs */
        .tabs-bar {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1.5rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0.25rem;
          width: fit-content;
        }
        .tab-btn {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.45rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem; font-weight: 500;
          color: var(--text-muted);
          background: none; border: none; cursor: pointer;
          font-family: var(--font-sans);
          transition: all 0.15s;
        }
        .tab-btn:hover { color: var(--text); }
        .tab-btn.active { background: var(--accent-dim); color: var(--accent); font-weight: 600; }

        /* All tab */
        .all-header { display: flex; justify-content: flex-end; margin-bottom: 1rem; }
        .form-card { margin-bottom: 1.25rem; }
        .form-title { font-size: 1rem; font-weight: 600; margin-bottom: 1.25rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }
        .full-width { grid-column: 1 / -1; }
        .field { display: flex; flex-direction: column; }
        .input-error { border-color: var(--red) !important; }
        .field-error { font-size: 0.75rem; color: var(--red); margin-top: 0.25rem; }

        /* Filter bar */
        .filter-bar {
          display: flex; align-items: flex-end; gap: 1rem;
          margin-bottom: 1.25rem; padding: 1rem 1.25rem; flex-wrap: wrap;
        }
        .filter-group { display: flex; flex-direction: column; }
        .filter-group .input { width: auto; }

        /* Table */
        .table-card { padding: 0; overflow: hidden; }
        .table-wrap { overflow-x: auto; }
        .table { width: 100%; border-collapse: collapse; }
        .table th {
          padding: 0.75rem 1.25rem;
          font-size: 0.72rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--text-muted); text-align: left;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
        }
        .table td {
          padding: 0.875rem 1.25rem; font-size: 0.875rem;
          border-bottom: 1px solid var(--border); vertical-align: middle;
        }
        .record-row:last-child td { border-bottom: none; }
        .record-row:hover td { background: rgba(255,255,255,0.02); }
        .right { text-align: right; }
        .date-cell { color: var(--text-muted); font-size: 0.8rem; white-space: nowrap; }
        .cat-cell { color: var(--text-muted); font-size: 0.8rem; }
        .month-cell { font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); }
        .desc-cell { color: var(--text-muted); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .income-val { color: var(--green); font-weight: 600; }
        .expense-val { color: var(--red); font-weight: 600; }
        .action-cell { text-align: right; }
        .del-btn { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
        .empty-row { text-align: center; padding: 3rem; color: var(--text-muted); }

        .pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 1rem; padding: 1rem 1.25rem;
          border-top: 1px solid var(--border);
        }
        .pag-btn { font-size: 0.8rem; }
        .pag-info { font-size: 0.8rem; color: var(--text-muted); }

        /* Monthly / Category tabs */
        .tab-content { display: flex; flex-direction: column; gap: 1.25rem; }
        .chart-wrap { padding: 1.5rem; }
        .chart-heading { font-size: 0.875rem; font-weight: 600; margin-bottom: 1.25rem; }
        .legend-row {
          display: flex; align-items: center;
          font-size: 0.78rem; color: var(--text-muted); margin-top: 0.75rem;
        }
        .legend-dot {
          display: inline-block; width: 8px; height: 8px;
          border-radius: 50%; margin-right: 0.4rem;
        }

        /* Category layout */
        .cat-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .pie-wrap { display: flex; flex-direction: column; }
        .cat-list-card { padding: 1.5rem; overflow: hidden; }
        .cat-list { display: flex; flex-direction: column; gap: 0.875rem; margin-top: 0.25rem; }
        .cat-row { display: flex; flex-direction: column; gap: 0.3rem; }
        .cat-meta {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.85rem;
        }
        .cat-icon { font-size: 1rem; }
        .cat-name { flex: 1; font-weight: 500; }
        .cat-pct { color: var(--text-muted); font-size: 0.78rem; min-width: 2.5rem; text-align: right; }
        .cat-amt { font-family: var(--font-mono); font-size: 0.82rem; color: var(--red); min-width: 5rem; text-align: right; }
        .cat-bar-bg {
          height: 4px; background: var(--surface-2);
          border-radius: 99px; overflow: hidden;
        }
        .cat-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }

        /* Empty state */
        .empty-state {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 0.75rem;
          padding: 4rem; color: var(--text-muted); font-size: 0.9rem;
        }
        .empty-icon { font-size: 2.5rem; }

        @media (max-width: 900px) {
          .form-grid { grid-template-columns: 1fr 1fr; }
          .cat-layout { grid-template-columns: 1fr; }
          .main { padding: 1.5rem; }
        }
        @media (max-width: 640px) {
          .main { margin-left: 0; padding-bottom: 5rem; }
          .form-grid { grid-template-columns: 1fr; }
          .tabs-bar { width: 100%; }
          .tab-btn { flex: 1; justify-content: center; font-size: 0.78rem; }
        }
      `}</style>
    </div>
  );
}