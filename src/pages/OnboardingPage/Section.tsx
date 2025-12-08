import React, { useState } from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: Props) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="border rounded-lg p-4 mb-6 shadow-sm bg-white">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <h2 className="text-lg font-semibold text-indigo-700">{title}</h2>
        <span
          className={`transition-transform ${
            open ? "rotate-90" : "rotate-0"
          } text-gray-600`}
        >
          ▶
        </span>
      </div>

      {open && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default Section;

