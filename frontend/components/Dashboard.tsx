"use client";

import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function Dashboard({ refreshTrigger }: { refreshTrigger: number }) {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenses();
    }, [refreshTrigger]);

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

    if (loading && expenses.length === 0) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    }

    // Process data for charts
    const categories: Record<string, number> = {};
    expenses.forEach((exp: any) => {
        const catName = exp.category?.name || "Uncategorized";
        categories[catName] = (categories[catName] || 0) + exp.amount;
    });

    const doughnutData = {
        labels: Object.keys(categories),
        datasets: [
            {
                label: "Expenses by Category",
                data: Object.values(categories),
                backgroundColor: [
                    "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
        },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-100 rounded-full blur-xl opacity-50 pointer-events-none"></div>
                <h3 className="text-xl font-bold mb-6 text-gray-800 tracking-tight flex items-center">
                    <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
                    Spending by Category
                </h3>
                <div className="h-72 flex justify-center items-center relative z-10">
                    {Object.keys(categories).length > 0 ? (
                        <Doughnut data={doughnutData} options={options} />
                    ) : (
                        <div className="text-center">
                            <p className="text-gray-400 mb-2">No expenses recorded yet.</p>
                            <p className="text-xs text-blue-400">Add an expense to see analytics</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-purple-100 rounded-full blur-xl opacity-50 pointer-events-none"></div>
                <h3 className="text-xl font-bold mb-6 text-gray-800 tracking-tight flex items-center">
                    <span className="w-2 h-8 bg-purple-500 rounded-full mr-3"></span>
                    Recent Transactions
                </h3>
                <div className="overflow-y-auto h-72 pr-2 custom-scrollbar space-y-3 z-10 relative">
                    {expenses.map((exp) => (
                        <div key={exp.id} className="flex justify-between items-center p-3 hover:bg-white/50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm">
                                    {exp.category?.name?.substring(0, 2).toUpperCase() || "??"}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm truncate max-w-[120px]">{exp.description}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500">{new Date(exp.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className="font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-full text-sm shadow-sm border border-gray-100">
                                ${exp.amount.toFixed(2)}
                            </span>
                        </div>
                    ))}
                    {expenses.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <p>No recent transactions.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
