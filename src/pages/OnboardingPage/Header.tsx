import React from "react";

export default function Header() {
  return (
    <header className="w-full bg-indigo-700 text-white py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4">
        <h1 className="text-xl font-semibold tracking-wide">Onboarding Process</h1>

        <nav className="flex gap-6 text-sm opacity-90">
          <span className="cursor-pointer hover:opacity-100">Client Profile</span>
          <span className="cursor-pointer hover:opacity-100">Authentication</span>
          <span className="cursor-pointer hover:opacity-100">Risk Type</span>
          <span className="cursor-pointer hover:opacity-100">Suitability</span>
          <span className="cursor-pointer hover:opacity-100">Agreement</span>
          <span className="cursor-pointer hover:opacity-100">E-Sign</span>
        </nav>
      </div>
    </header>
  );
}
