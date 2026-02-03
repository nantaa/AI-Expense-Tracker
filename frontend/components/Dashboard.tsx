"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { Loader2, TrendingUp, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement
);

interface Expense {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: { name: string } | null;
}

export default function Dashboard({ refreshTrigger }: { refreshTrigger: number }) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                setLoading(true);
                const res = await api.get("/expenses");
                setExpenses(res.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExpenses();
    }, [refreshTrigger]);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;

    // Calculate Totals
    const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlySpend = expenses
        .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
        .reduce((sum, e) => sum + e.amount, 0);

    // Prepare Chart Data
    const categories: Record<string, number> = {};
    expenses.forEach((e) => {
        const catName = e.category?.name || "Uncategorized";
        categories[catName] = (categories[catName] || 0) + e.amount;
    });

    const chartData = {
        labels: Object.keys(categories),
        datasets: [
            {
                data: Object.values(categories),
                backgroundColor: [
                    "#3B82F6", "#8B5CF6", "#F472B6", "#10B981", "#F59E0B", "#EF4444", "#6366F1"
                ],
                borderWidth: 0,
                hoverOffset: 10,
            },
        ],
    };

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-2xl shadow-sm bg-blue-50/50 border border-blue-100 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="z-10">
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Total Spend</p>
                        <h3 className="text-2xl font-black text-blue-900 mt-1">${totalSpend.toFixed(2)}</h3>
                    </div>
                    <div className="z-10 bg-white/60 backdrop-blur w-fit px-2 py-1 rounded-lg text-xs font-semibold text-blue-700 flex items-center gap-1">
                        <TrendingUp size={12} /> +12% vs last mo
                    </div>
                    <DollarSign className="absolute -bottom-4 -right-4 w-24 h-24 text-blue-200/50 group-hover:scale-110 transition-transform" />
                </div>

                <div className="glass-card p-4 rounded-2xl shadow-sm bg-purple-50/50 border border-purple-100 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="z-10">
                        <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">This Month</p>
                        <h3 className="text-2xl font-black text-purple-900 mt-1">${monthlySpend.toFixed(2)}</h3>
                    </div>
                    <Calendar className="absolute -bottom-4 -right-4 w-24 h-24 text-purple-200/50 group-hover:scale-110 transition-transform" />
                </div>

                {/* Placeholder for more stats */}
                <div className="glass-card p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center h-32">
                    <span className="text-3xl font-bold text-gray-300">TODO</span>
                    <span className="text-xs text-gray-400">Savings Goal</span>
                </div>
                <div className="glass-card p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center h-32">
                    <span className="text-3xl font-bold text-gray-300">TODO</span>
                    <span className="text-xs text-gray-400">Daily Avg</span>
                </div>
            </div>

            {/* Charts & Recent Transactions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart Section */}
                <div className="glass-card p-6 rounded-3xl shadow-xl bg-white relative">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                        Spending by Category
                    </h3>
                    <div className="relative h-64 w-full flex items-center justify-center">
                        {expenses.length > 0 ? (
                            <Doughnut
                                data={chartData}
                                options={{
                                    cutout: '70%',
                                    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }
                                }}
                            />
                        ) : (
                            <div className="text-center text-gray-400">No data to display</div>
                        )}

                        {/* Center Text Overlay */}
                        {expenses.length > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                <span className="text-3xl font-black text-gray-800">${totalSpend.toLocaleString()}</span>
                                <span className="text-xs font-medium text-gray-400 uppercase">Total</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Transactions List */}
                <div className="glass-card p-6 rounded-3xl shadow-xl bg-white overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                        Recent Transactions
                    </h3>
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {expenses.length === 0 ? (
                            <p className="text-gray-400 text-center py-10">No transactions yet.</p>
                        ) : (
                            expenses.map((expense) => (
                                <div key={expense.id} className="group flex justify-between items-center p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-default border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <DollarSign size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{expense.description}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                {new Date(expense.date).toLocaleDateString()} •
                                                <span className="bg-gray-100 px-1.5 rounded text-[10px] uppercase font-bold text-gray-600">
                                                    {expense.category?.name || "Uncategorized"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                        -${expense.amount.toFixed(2)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
