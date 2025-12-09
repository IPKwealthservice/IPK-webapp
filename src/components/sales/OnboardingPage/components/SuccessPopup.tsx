import React from "react";

export default function SuccessPopup({ open }: any) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
      <div className="bg-white px-10 py-8 rounded-xl shadow-lg text-center">
        <div className="text-green-600 text-4xl mb-2">✔</div>
        <p className="text-lg font-medium text-green-700">
          Submitted Successfully!
        </p>
      </div>
    </div>
  );
}
