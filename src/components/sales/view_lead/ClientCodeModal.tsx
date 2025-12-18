import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { X, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { UPDATE_LEAD_DETAILS } from "../editLead/update_gql/update_lead.gql";
import { LEAD_DETAIL_WITH_TIMELINE } from "./gql/view_lead.gql";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  currentClientCode?: string | null;
  onSuccess?: (clientCode: string) => void;
};

export default function ClientCodeModal({
  isOpen,
  onClose,
  leadId,
  currentClientCode,
  onSuccess,
}: Props) {
  const [clientCode, setClientCode] = useState<string>(currentClientCode || "");
  const [error, setError] = useState<string | null>(null);
  const [updateLeadDetails, { loading: saving }] = useMutation(UPDATE_LEAD_DETAILS);

  useEffect(() => {
    if (isOpen) {
      setClientCode(currentClientCode || "");
      setError(null);
    }
  }, [isOpen, currentClientCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedCode = clientCode.trim();
    if (!trimmedCode) {
      setError("Client code is required");
      return;
    }

    // Basic validation: allow alphanumeric and common characters
    if (!/^[A-Za-z0-9_-]+$/.test(trimmedCode)) {
      setError("Client code can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    try {
      const { data } = await updateLeadDetails({
        variables: {
          input: {
            leadId,
            clientCode: trimmedCode,
          },
        },
        refetchQueries: [
          {
            query: LEAD_DETAIL_WITH_TIMELINE,
            variables: { leadId, eventsLimit: 100 },
          },
        ],
        update(cache, result) {
          const payload = result?.data?.updateLeadDetails;
          if (payload?.id) {
            cache.modify({
              id: cache.identify({ __typename: "IpkLeaddEntity", id: payload.id }),
              fields: {
                clientCode: () => payload.clientCode,
              },
            });
          }
        },
      });

      toast.success("Client code saved successfully");
      onSuccess?.(trimmedCode);
      onClose();
    } catch (err: any) {
      const errorMessage =
        err?.graphQLErrors?.[0]?.message ||
        err?.message ||
        "Failed to save client code. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
              <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Enter Client Code
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Required when account is opened
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Info banner */}
            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium">Account Opening Stage</p>
                <p className="text-xs text-blue-700 dark:text-blue-200">
                  Please enter the client code assigned to this account. This code will be displayed in the lead profile.
                </p>
              </div>
            </div>

            {/* Input field */}
            <div>
              <label
                htmlFor="clientCode"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Client Code <span className="text-red-500">*</span>
              </label>
              <input
                id="clientCode"
                type="text"
                value={clientCode}
                onChange={(e) => {
                  setClientCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="e.g., BNR62025"
                className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 ${
                  error
                    ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-200 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-200"
                    : "border-gray-300 bg-white text-gray-900 focus:border-emerald-500 focus:ring-emerald-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-emerald-500"
                }`}
                autoFocus
                disabled={saving}
                maxLength={50}
              />
              {error && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {error}
                </p>
              )}
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Alphanumeric characters, hyphens, and underscores only
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !clientCode.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save & Continue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

