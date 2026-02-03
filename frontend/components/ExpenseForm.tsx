"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import ReceiptUploader from "./ReceiptUploader";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExpenseForm({ onExpenseAdded }: { onExpenseAdded: () => void }) {
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        userId: 1,
        items: [] as any[],
        accountId: "", // New field
    });
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState<any[]>([]);

    useEffect(() => {
        api.get("/accounts").then(res => setAccounts(res.data)).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/expenses", formData);
            onExpenseAdded();
            setFormData({ ...formData, description: "", amount: "", items: [] }); // Keep account selected? or reset
        } catch (error) {
            console.error("Error adding expense:", error);
            alert("Failed to add expense");
        } finally {
            setLoading(false);
        }
    };

    const [rawText, setRawText] = useState<string>("");

    const handleScanComplete = (data: any) => {
        setRawText(data.text || "");
        setFormData((prev) => ({
            ...prev,
            description: data.description || (data.text ? data.text.substring(0, 50).replace(/\n/g, " ") + "..." : "Scanned Receipt"),
            amount: data.amount || prev.amount,
            date: data.date ? new Date(data.date).toISOString().split("T")[0] : prev.date,
            items: data.details?.line_items || [],
        }));
    };

    return (
        <div className="glass-card p-6 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
            {/* Visual Header */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

            <h2 className="text-xl font-black text-gray-800 mb-4">Add New Expense</h2>

            <ReceiptUploader onScanComplete={handleScanComplete} />

            {rawText && (
                <details className="bg-gray-50 p-2 rounded text-xs border border-gray-200">
                    <summary className="cursor-pointer font-semibold text-gray-600 mb-1">Raw OCR Debug</summary>
                    <pre className="whitespace-pre-wrap text-gray-500 max-h-40 overflow-y-auto">
                        {rawText}
                    </pre>
                </details>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                    <input
                        type="text"
                        required
                        className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all p-3 text-sm font-medium"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g. Starbucks Coffee"
                    />
                    <p className="text-[10px] text-blue-500 mt-1 flex items-center gap-1">
                        ✨ AI will auto-categorize this
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400">$</span>
                            <input
                                type="number"
                                required
                                step="0.01"
                                className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all p-3 pl-7 text-sm font-bold"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Date</label>
                        <input
                            type="date"
                            required
                            className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all p-3 text-sm font-medium"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Paid From</label>
                    <select
                        className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all p-3 text-sm font-medium"
                        value={formData.accountId}
                        onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    >
                        <option value="">Select Wallet (Optional)</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                        "w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5",
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    )}
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Add Expense"}
                </button>
            </form>
        </div>
    );
}
