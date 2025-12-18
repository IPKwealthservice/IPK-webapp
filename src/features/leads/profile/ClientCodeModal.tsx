import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";

type ClientCodeModalProps = {
  isOpen: boolean;
  defaultCode?: string | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (clientCode: string) => Promise<void> | void;
};

export default function ClientCodeModal({
  isOpen,
  defaultCode,
  loading = false,
  error,
  onClose,
  onSubmit,
}: ClientCodeModalProps) {
  const [code, setCode] = useState<string>(defaultCode ?? "");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode(defaultCode ?? "");
      setTouched(false);
    }
  }, [defaultCode, isOpen]);

  const showValidation = touched && code.trim().length === 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl shadow-2xl">
      <div className="space-y-5 p-6 sm:p-8">
        <header className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-6-6h12"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              Account opened
            </p>
            <h3 className="text-xl font-semibold text-gray-900">Add client code</h3>
            <p className="text-sm text-gray-600">
              Capture the official client code so the profile header stays in sync with the CRM. You can paste it directly
              from the account opening system.
            </p>
          </div>
        </header>

        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-700">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                1
              </span>
              Confirm the account is opened and the client code is ready.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                2
              </span>
              Enter the code exactly as provided; this is shown on the lead header and shared with teammates.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800" htmlFor="clientCodeInput">
            Client code
          </label>
          <input
            id="clientCodeInput"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onBlur={() => setTouched(true)}
            placeholder="e.g. BNR62025"
            className={`w-full rounded-xl border px-4 py-3 text-base font-semibold tracking-wide text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 ${showValidation || error ? "border-rose-400" : "border-gray-200"}`}
            autoComplete="off"
            spellCheck={false}
            disabled={loading}
          />
          {(showValidation || error) && (
            <p className="text-sm font-medium text-rose-600">
              {showValidation ? "Client code is required to move this lead to Account opened." : error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setTouched(true);
              if (code.trim().length === 0 || loading) return;
              onSubmit(code.trim());
            }}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving…" : "Save & move"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

