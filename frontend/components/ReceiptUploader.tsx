"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReceiptUploaderProps {
    onScanComplete: (data: any) => void;
}

export default function ReceiptUploader({ onScanComplete }: ReceiptUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        const formData = new FormData();
        formData.append("receipt", file);

        try {
            const response = await api.post("/expenses/scan", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            onScanComplete(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to scan receipt. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <label
                htmlFor="receipt-upload"
                className={cn(
                    "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors",
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                )}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    ) : (
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    )}
                    <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                </div>
                <input
                    id="receipt-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
            </label>
            {error && (
                <div className="mt-2 flex items-center text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {error}
                </div>
            )}
        </div>
    );
}
