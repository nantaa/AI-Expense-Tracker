"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, Plus, Wallet, CreditCard, Banknote } from "lucide-react";

interface Account {
    id: number;
    name: string;
    type: string;
    balance: number;
}

export default function WalletCard({ refreshTrigger }: { refreshTrigger: number }) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [newAccount, setNewAccount] = useState({ name: "", type: "BANK", balance: "" });

    useEffect(() => {
        fetchAccounts();
    }, [refreshTrigger]);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const res = await api.get("/accounts");
            setAccounts(res.data);
        } catch (error) {
            console.error("Failed to fetch accounts");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/accounts", newAccount);
            setShowAdd(false);
            setNewAccount({ name: "", type: "BANK", balance: "" });
            fetchAccounts();
        } catch (error) {
            alert("Failed to create account");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'CASH': return <Banknote size={20} className="text-green-600" />;
            case 'E_WALLET': return <Wallet size={20} className="text-purple-600" />;
            default: return <CreditCard size={20} className="text-blue-600" />;
        }
    };

    return (
        <div className="glass-card p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Wallet className="text-indigo-600" /> Wallets
                </h3>
                <button onClick={() => setShowAdd(!showAdd)} className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-full text-indigo-600 transition-colors">
                    <Plus size={18} />
                </button>
            </div>

            {showAdd && (
                <form onSubmit={handleCreate} className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-200">
                    <input
                        placeholder="Wallet Name (e.g. BCA)"
                        className="w-full p-2 rounded border text-sm"
                        value={newAccount.name}
                        onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                        required
                    />
                    <div className="flex gap-2">
                        <select
                            className="p-2 rounded border text-sm flex-1"
                            value={newAccount.type}
                            onChange={e => setNewAccount({ ...newAccount, type: e.target.value })}
                        >
                            <option value="BANK">Bank</option>
                            <option value="E_WALLET">E-Wallet</option>
                            <option value="CASH">Cash</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Balance"
                            className="w-24 p-2 rounded border text-sm"
                            value={newAccount.balance}
                            onChange={e => setNewAccount({ ...newAccount, balance: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-1.5 rounded text-sm font-medium">Save</button>
                </form>
            )}

            <div className="space-y-3">
                {loading && <Loader2 className="animate-spin mx-auto text-gray-400" />}

                {!loading && accounts.length === 0 && (
                    <p className="text-sm text-gray-400 text-center italic">No wallets added yet.</p>
                )}

                {accounts.map(acc => (
                    <div key={acc.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg">
                                {getIcon(acc.type)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{acc.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{acc.type.replace('_', ' ').toLowerCase()}</p>
                            </div>
                        </div>
                        <span className="font-mono font-bold text-gray-700">
                            ${acc.balance.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
