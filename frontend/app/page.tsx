"use client";

import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import ExpenseForm from "@/components/ExpenseForm";
import BudgetCard from "@/components/BudgetCard";
import InsightsPanel from "@/components/InsightsPanel";
import BudgetRecommendations from "@/components/BudgetRecommendations";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-gray-200/50">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              <span className="gradient-text">AI Powered</span> Expense Tracker
            </h1>
            <p className="text-gray-500 text-lg font-light">
              Predictive budgeting & intelligent categorization
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
              Export Report
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg border-2 border-white"></div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-1 rounded-2xl shadow-xl">
              <ExpenseForm onExpenseAdded={handleExpenseAdded} />
            </div>

            <BudgetCard refreshTrigger={refreshTrigger} />

            {/* AI Insights Panel */}
            <InsightsPanel refreshTrigger={refreshTrigger} />

            {/* AI Budget Recommendations */}
            <BudgetRecommendations refreshTrigger={refreshTrigger} />

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              {/* ... existing summary card content ... */}
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" /></svg>
              </div>
              <h4 className="text-blue-100 uppercase text-xs font-bold tracking-widest mb-2">Total Budget</h4>
              <div className="text-4xl font-extrabold mb-1">$2,450.00</div>
              <div className="text-blue-200 text-sm">vs $1,200 last month</div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Dashboard refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </main>
  );
}
