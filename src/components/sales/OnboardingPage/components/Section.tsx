import React from "react";

export default function Section({ title, children }: any) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-indigo-700 mb-3">
        {title}
      </h2>
      <div className="border border-indigo-200 p-6 rounded-lg shadow-sm bg-gray-50">
        {children}
      </div>
    </div>
  );
}
