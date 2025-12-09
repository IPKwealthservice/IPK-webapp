import React from "react";

export default function TextAreaField({ label, value, onChange, readOnly = false }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-700">{label}</label>
      <textarea
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={`border p-2 rounded-md bg-white h-28 ${
          readOnly ? "bg-gray-200 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}
