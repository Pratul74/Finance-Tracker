"use client";

import { useSummary } from "@/hooks/useSummary";

export default function Dashboard() {
  const { data, isLoading } = useSummary();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      <div className="bg-gray-900 p-4 rounded-xl">
        <h2>Total Balance</h2>
        <p className="text-2xl">₹{data.balance}</p>
      </div>

      <div className="bg-gray-900 p-4 rounded-xl">
        <h2>Income</h2>
        <p className="text-green-400">₹{data.total_income}</p>
      </div>

      <div className="bg-gray-900 p-4 rounded-xl">
        <h2>Expense</h2>
        <p className="text-red-400">₹{data.total_expense}</p>
      </div>
    </div>
  );
}