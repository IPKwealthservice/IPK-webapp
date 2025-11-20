import type { ReactNode } from "react";

type InfoTileProps = {
  label: string;
  value: ReactNode;
};

export function InfoTile({ label, value }: InfoTileProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/60">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {value ?? "Not set"}
      </p>
    </div>
  );
}
