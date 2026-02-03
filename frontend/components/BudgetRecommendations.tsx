"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, Zap, ArrowDown, Shield, TrendingDown, ArrowRight } from "lucide-react";

export default function BudgetRecommendations({ refreshTrigger }: { refreshTrigger: number }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchRecs();
    }, [refreshTrigger]);

    const fetchRecs = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await api.get("/budgets/recommendations");
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch budget recs", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading || error) return null; // Hide on error or loading to keep dashboard clean
    if (!data || !data.recommendations || data.recommendations.length === 0) return null;

    return (
        <div className="glass-card p-8 rounded-3xl shadow-xl bg-gradient-to-br from-indigo-50 to-white relative overflow-hidden mt-8 border border-white/60">

            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600">
                    <Zap size={24} className="fill-yellow-500" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-800">Smart Budget Recommendations</h3>
                    <p className="text-sm text-gray-500">AI-optimized spending limits based on your history</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <span className="font-bold text-lg text-gray-800">{rec.category}</span>
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500 border border-gray-200">
                                Avg: ${rec.current_avg_spend}/mo
                            </span>
                        </div>

                        <p className="text-xs text-gray-500 mb-5 leading-relaxed bg-gray-50 p-2 rounded-lg">
                            AI Insight: {rec.rationale}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="relative overflow-hidden group p-3 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-all text-left">
                                <div className="relative z-10">
                                    <div className="text-[10px] font-bold text-green-700 uppercase mb-1 flex items-center gap-1">
                                        <Shield size={10} /> Safe (-10%)
                                    </div>
                                    <div className="text-xl font-black text-green-900">
                                        ${rec.recommended_budget}
                                    </div>
                                </div>
                            </button>

                            <button className="relative overflow-hidden group p-3 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 transition-all text-left">
                                <div className="relative z-10">
                                    <div className="text-[10px] font-bold text-orange-700 uppercase mb-1 flex items-center gap-1">
                                        <TrendingDown size={10} /> Aggressive
                                    </div>
                                    <div className="text-xl font-black text-orange-900">
                                        ${rec.aggressive_budget}
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
