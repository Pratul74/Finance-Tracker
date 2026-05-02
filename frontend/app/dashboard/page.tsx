"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import { useSummary, useMonthly, useCategory } from "@/hooks/useRecords";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const PIE_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#22c55e",
  "#ef4444",
  "#a855f7",
  "#06b6d4",
  "#f97316",
  "#84cc16",
  "#ec4899",
  "#6b7280",
];

function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="skeleton" style={{ height: 14, width: "50%", marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 28, width: "70%" }} />
    </div>
  );
}

export default function DashboardPage() {
  const [range, setRange] = useState<{ start?: string; end?: string }>({});
  const summary = useSummary(range);
  const monthly  = useMonthly(range);
  const category = useCategory(range);

  const today = new Date();
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [period, setPeriod] = useState("all");

  const setPeriodRange = (p: string) => {
    setPeriod(p);
    const now = new Date();
    if (p === "mtd") {
      setRange({ start: `${thisMonth}-01` });
    } else if (p === "3m") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      setRange({ start: d.toISOString().slice(0, 10) });
    } else if (p === "ytd") {
      setRange({ start: `${now.getFullYear()}-01-01` });
    } else {
      setRange({});
    }
  };

  const data = summary.data;
  const chartData = monthly.data ?? [];
  const catData = category.data ?? [];

  return (
    <div className="layout">
      <Sidebar />

      <main className="main">
        {/* Header */}
        <header className="page-header">
          <div>
            <h1 className="page-title">Overview</h1>
            <p className="page-sub">Your financial summary</p>
          </div>

          <div className="period-tabs">
            {(["all", "mtd", "3m", "ytd"] as const).map((p) => (
              <button
                key={p}
                className={`period-tab ${period === p ? "active" : ""}`}
                onClick={() => setPeriodRange(p)}
              >
                {p === "all" ? "All time" : p === "mtd" ? "This month" : p === "3m" ? "3 months" : "This year"}
              </button>
            ))}
          </div>
        </header>

        {/* Stat cards */}
        <div className="stat-grid">
          {summary.isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <div className="stat-card balance-card animate-fade-up" style={{ animationDelay: "0ms" }}>
                <span className="stat-label">Net Balance</span>
                <span className={`stat-value amount ${(data?.balance ?? 0) >= 0 ? "positive" : "negative"}`}>
                  {fmt(Number(data?.balance ?? 0))}
                </span>
                <span className="stat-tag">
                  {(data?.balance ?? 0) >= 0 ? "▲ Positive" : "▼ Negative"}
                </span>
              </div>

              <div className="stat-card animate-fade-up" style={{ animationDelay: "60ms" }}>
                <span className="stat-label">Total Income</span>
                <span className="stat-value amount income-val">
                  {fmt(Number(data?.total_income ?? 0))}
                </span>
                <div className="stat-bar">
                  <div className="stat-bar-fill income-bar" style={{ width: "100%" }} />
                </div>
              </div>

              <div className="stat-card animate-fade-up" style={{ animationDelay: "120ms" }}>
                <span className="stat-label">Total Expenses</span>
                <span className="stat-value amount expense-val">
                  {fmt(Number(data?.total_expense ?? 0))}
                </span>
                <div className="stat-bar">
                  <div
                    className="stat-bar-fill expense-bar"
                    style={{
                      width: data?.total_income
                        ? `${Math.min(100, (Number(data.total_expense) / Number(data.total_income)) * 100)}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Charts */}
        <div className="charts-grid">
          {/* Monthly chart */}
          <div className="card chart-card animate-fade-up" style={{ animationDelay: "180ms" }}>
            <h2 className="chart-title">Monthly Trend</h2>
            {monthly.isLoading ? (
              <div className="skeleton" style={{ height: 240 }} />
            ) : chartData.length === 0 ? (
              <div className="empty-chart">No data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-hover)",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                    }}
                    formatter={(val: number) => fmt(val)}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#22c55e" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#ef4444" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            <div className="chart-legend">
              <span className="legend-dot" style={{ background: "#22c55e" }} /> Income
              <span className="legend-dot" style={{ background: "#ef4444", marginLeft: "1rem" }} /> Expense
            </div>
          </div>

          {/* Category pie */}
          <div className="card chart-card animate-fade-up" style={{ animationDelay: "240ms" }}>
            <h2 className="chart-title">Expense Breakdown</h2>
            {category.isLoading ? (
              <div className="skeleton" style={{ height: 240 }} />
            ) : catData.length === 0 ? (
              <div className="empty-chart">No expenses found</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={catData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {catData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-hover)",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                    }}
                    formatter={(val: number) => fmt(val)}
                  />
                  <Legend
                    formatter={(value) =>
                      value.charAt(0).toUpperCase() + value.slice(1)
                    }
                    wrapperStyle={{ fontSize: "0.78rem", color: "var(--text-muted)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }
        .main {
          margin-left: 220px;
          flex: 1;
          padding: 2rem 2.5rem;
          max-width: 1100px;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .page-title {
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: -0.03em;
        }
        .page-sub { color: var(--text-muted); font-size: 0.875rem; }

        .period-tabs {
          display: flex;
          gap: 0.25rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0.25rem;
        }
        .period-tab {
          background: none;
          border: none;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s;
          font-family: var(--font-sans);
        }
        .period-tab:hover { color: var(--text); }
        .period-tab.active {
          background: var(--accent-dim);
          color: var(--accent);
          font-weight: 600;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.375rem 1.5rem;
          transition: border-color 0.2s;
        }
        .stat-card:hover { border-color: var(--border-hover); }
        .balance-card { border-color: rgba(245, 158, 11, 0.2); }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .stat-value {
          display: block;
          font-size: 1.65rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }
        .positive { color: var(--green); }
        .negative { color: var(--red); }
        .income-val { color: var(--green); }
        .expense-val { color: var(--red); }

        .stat-tag {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .stat-bar {
          height: 3px;
          background: var(--surface-2);
          border-radius: 99px;
          overflow: hidden;
          margin-top: 0.5rem;
        }
        .stat-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.6s ease;
        }
        .income-bar { background: var(--green); }
        .expense-bar { background: var(--red); }

        .charts-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1rem;
        }
        .chart-card { padding: 1.5rem; }
        .chart-title {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          color: var(--text);
        }
        .chart-legend {
          display: flex;
          align-items: center;
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 0.75rem;
        }
        .legend-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 0.4rem;
        }
        .empty-chart {
          height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        @media (max-width: 900px) {
          .stat-grid { grid-template-columns: 1fr 1fr; }
          .charts-grid { grid-template-columns: 1fr; }
          .main { padding: 1.5rem; }
        }
        @media (max-width: 640px) {
          .stat-grid { grid-template-columns: 1fr; }
          .main { margin-left: 0; padding-bottom: 5rem; }
        }
      `}</style>
    </div>
  );
}