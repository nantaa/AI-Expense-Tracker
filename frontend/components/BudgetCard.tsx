"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function BudgetCard({ refreshTrigger }: { refreshTrigger: number }) {
    const [budget, setBudget] = useState<{ amount: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");

    const handleSetBudget = async () => {
        setLoading(true);
        try {
            // Hardcoded user/category/date for MVP demo
            await api.post("/budgets", {
                amount,
                categoryId: 1,
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
            });
            setBudget({ amount: parseFloat(amount) });
            alert("Budget set!");
        } catch (e) {
            console.error(e);
            alert("Failed to set budget");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-6 rounded-2xl shadow-xl bg-gradient-to-br from-indigo-50 to-blue-50">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Monthly Budget</h3>

            <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-700">$</span>
                <input
                    type="number"
                    className="p-2 rounded-lg border border-gray-300 w-full"
                    placeholder="Set Limit..."
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button
                    onClick={handleSetBudget}
                    disabled={loading}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Set"}
                </button>
            </div>

            {budget && (
                <div className="mt-4">
                    <p className="text-sm text-gray-500">Current Limit</p>
                    <p className="text-2xl font-extrabold text-blue-600">${budget.amount.toFixed(2)}</p>
                </div>
            )}
        </div>
    );
}
