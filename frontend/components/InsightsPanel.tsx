"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, TrendingUp, AlertTriangle, PiggyBank, Activity, CheckCircle2 } from "lucide-react";

export default function InsightsPanel({ refreshTrigger }: { refreshTrigger: number }) {
    const [insights, setInsights] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchInsights();
    }, [refreshTrigger]);

    const fetchInsights = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await api.get("/expenses/insights");
            setInsights(res.data);
        } catch (error) {
            console.error("Failed to fetch insights", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="glass-card p-8 rounded-3xl shadow-lg border border-white/50 bg-gradient-to-br from-white to-blue-50/30 flex flex-col items-center justify-center min-h-[200px]">
            <Loader2 className="animate-spin w-8 h-8 text-blue-500 mb-3" />
            <p className="text-sm font-medium text-blue-800 animate-pulse">AI is analyzing your finances...</p>
        </div>
    );

    if (error || !insights) return null; // Gracefully hide if server error (e.g. 404 before restart)

    const scoreColor =
        insights.financial_health_score >= 80 ? 'text-green-600 bg-green-50 border-green-200' :
            insights.financial_health_score >= 50 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                'text-red-600 bg-red-50 border-red-200';

    return (
        <div className="glass-card p-6 md:p-8 rounded-3xl shadow-xl bg-white relative overflow-hidden">
            {/* Decorative Background Blob */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                        <Activity className="text-blue-600 fill-blue-100" />
                        Financial Health Check
                    </h3>
                    <p className="text-gray-500 mt-1 max-w-lg">{insights.financial_health_assessment}</p>
                </div>

                <div className={`mt-4 md:mt-0 px-6 py-3 rounded-2xl border-2 flex flex-col items-center ${scoreColor}`}>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Health Score</span>
                    <span className="text-4xl font-black">{insights.financial_health_score}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="bg-gradient-to-b from-blue-50 to-white p-5 rounded-2xl border border-blue-100 hover:shadow-lg transition-shadow duration-300">
                    <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <TrendingUp size={18} /> Spending Patterns
                    </h4>
                    <ul className="text-sm space-y-2 text-gray-600">
                        {insights.spending_patterns?.map((p: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 leading-relaxed">
                                <span className="text-blue-400 mt-1">•</span> {p}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gradient-to-b from-red-50 to-white p-5 rounded-2xl border border-red-100 hover:shadow-lg transition-shadow duration-300">
                    <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                        <AlertTriangle size={18} /> Anomalies
                    </h4>
                    {insights.anomalies?.length > 0 ? (
                        <ul className="text-sm space-y-2 text-gray-600">
                            {insights.anomalies.map((a: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 leading-relaxed">
                                    <span className="text-red-400 mt-0.5">⚠️</span> {a}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400 italic">No anomalies detected. Good job!</p>
                    )}
                </div>

                <div className="bg-gradient-to-b from-green-50 to-white p-5 rounded-2xl border border-green-100 hover:shadow-lg transition-shadow duration-300 col-span-1 md:col-span-1">
                    <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                        <PiggyBank size={18} /> Opportunity
                    </h4>
                    <div className="bg-green-100/50 rounded-lg p-2 mb-3 text-center">
                        <span className="text-xs uppercase text-green-600 font-bold">Potential Savings</span>
                        <div className="text-xl font-black text-green-700">{insights.monthly_savings_potential}</div>
                    </div>
                    <ul className="text-sm space-y-2 text-gray-600">
                        {insights.top_recommendations?.map((rec: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 leading-relaxed">
                                <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" /> {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
