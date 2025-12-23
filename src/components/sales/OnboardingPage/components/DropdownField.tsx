import React from "react";

export default function DropdownField({ label, value, options, onChange }: any) {
  return (
    <div className="mobile-padding tablet-padding desktop-padding">
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border p-2 rounded-md bg-white"
      >
        <option value="">Select</option>
        {options.map((opt: string, i: number) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
    </div>
  );
}
