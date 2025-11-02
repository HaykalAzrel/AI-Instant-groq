"use client";
import { Upload } from "lucide-react";

export default function FileUpload({ onSelect }: { onSelect: (f: File) => void }) {
  return (
    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
      <Upload className="w-6 h-6 mb-1 text-gray-600 dark:text-gray-300" />
      <span className="text-sm text-gray-600 dark:text-gray-400">Upload PDF / DOCX</span>
      <input type="file" accept=".pdf,.docx" hidden onChange={(e) => {
        if (e.target.files?.[0]) onSelect(e.target.files[0]);
      }}/>
    </label>
  );
}
