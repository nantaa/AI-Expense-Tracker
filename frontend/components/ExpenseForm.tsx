"use client";

import { useState } from "react";
import api from "@/lib/api";
import ReceiptUploader from "./ReceiptUploader";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExpenseForm({ onExpenseAdded }: { onExpenseAdded: () => void }) {
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        userId: 1, // Hardcoded for MVP
    });
    const [loading, setLoading] = useState(false);
    const [aiCategorizing, setAiCategorizing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Optimistic AI categorization notice locally? Or just wait for server.
        // Server handles AI on POST.
        try {
            await api.post("/expenses", formData);
            onExpenseAdded();
            setFormData({ ...formData, description: "", amount: "" });
        } catch (error) {
            console.error("Error adding expense:", error);
            alert("Failed to add expense");
        } finally {
            setLoading(false);
        }
    };

    const handleScanComplete = (data: any) => {
        setFormData((prev) => ({
            ...prev,
            description: data.text ? data.text.substring(0, 50) + "..." : "Scanned Receipt",
            amount: data.amount || prev.amount,
            date: data.date ? new Date(data.date).toISOString().split("T")[0] : prev.date,
        }));
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold mb-4">Add New Expense</h2>

            <ReceiptUploader onScanComplete={handleScanComplete} />

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g. Starbucks Coffee"
                    />
                    <p className="text-xs text-blue-500 mt-1">AI will auto-categorize this.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                        "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    )}
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Add Expense"}
                </button>
            </form>
        </div>
    );
}
