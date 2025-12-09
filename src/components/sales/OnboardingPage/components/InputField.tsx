import React from "react";

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  readOnly = false,
}: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={`border p-2 rounded-md bg-white ${
          readOnly ? "bg-gray-200 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}
