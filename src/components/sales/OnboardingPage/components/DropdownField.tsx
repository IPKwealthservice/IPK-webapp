import React from "react";

export default function DropdownField({
  label,
  value,
  options,
  onChange,
}: any) {
  return (
    // 🔑 Single grid-safe wrapper (same as InputField)
    <div className="flex flex-col w-full gap-1">
      <label className="text-sm text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select</option>
        {options.map((opt: string, i: number) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
