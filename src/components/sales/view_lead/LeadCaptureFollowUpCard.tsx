/**
 * Lead Capture & Follow-up Display Component
 * Shows approachAt (read-only) and nextActionDueAt (editable)
 */

import { useState } from "react";
import { Calendar, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import { toast } from "react-toastify";
import {
  formatApproachDate,
  formatNextActionDue,
  getFollowUpRelativeTime,
  getFollowUpUrgencyClass,
  isFollowUpOverdue,
  isValidFollowUpDate,
} from "./interface/followUpUtils";
import type { LeadTimingInfo, FollowUpFormState } from "./interface/followUpTypes";

type Props = {
  timingInfo: LeadTimingInfo;
  onFollowUpSaved?: (nextActionDueAtIso: string) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
};

export function LeadCaptureFollowUpCard({ timingInfo, onFollowUpSaved, disabled = false, loading = false }: Props) {
  const followUpModal = useModal();
  const [formState, setFormState] = useState<FollowUpFormState>({
    nextActionDueAt: timingInfo.nextActionDueAt || "",
    actionType: "CALL",
    description: "",
    priority: "MEDIUM",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const approachDateDisplay = formatApproachDate(timingInfo.approachAt);
  const nextActionDisplay = formatNextActionDue(timingInfo.nextActionDueAt);
  const nextActionRelative = getFollowUpRelativeTime(timingInfo.nextActionDueAt);
  const urgencyClass = getFollowUpUrgencyClass(timingInfo.nextActionDueAt);
  const isOverdue = isFollowUpOverdue(timingInfo.nextActionDueAt);

  const handleOpenFollowUpModal = () => {
    setFormState({
      nextActionDueAt: timingInfo.nextActionDueAt || "",
      actionType: "CALL",
      description: "",
      priority: "MEDIUM",
    });
    setErrors({});
    followUpModal.openModal();
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formState.nextActionDueAt.trim()) {
      nextErrors.nextActionDueAt = "Follow-up date is required";
    } else if (!isValidFollowUpDate(formState.nextActionDueAt)) {
      nextErrors.nextActionDueAt = "Follow-up date must be in the future";
    }

    if (!formState.actionType.trim()) {
      nextErrors.actionType = "Action type is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveFollowUp = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const isoNextAction = new Date(formState.nextActionDueAt).toISOString();
      await onFollowUpSaved?.(isoNextAction);
      toast.success("Follow-up scheduled successfully");
      followUpModal.closeModal();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save follow-up");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Display Card */}
      <div className="grid gap-4 rounded-2xl border border-gray-100 p-4 dark:border-white/10 sm:grid-cols-2">
        {/* Approach Date - Read Only */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/60">
            <Calendar className="inline-block h-4 w-4 mr-1" />
            Lead captured on
          </label>
          <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/80">
            {approachDateDisplay}
            <p className="mt-1 text-xs text-gray-500 dark:text-white/50">
              Initial contact date (read-only)
            </p>
          </div>
        </div>

        {/* Next Follow-up - Editable */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/60">
            <Clock className="inline-block h-4 w-4 mr-1" />
            Next follow-up
          </label>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.07]">
              <p className={`font-semibold ${urgencyClass}`}>
                {isOverdue && <AlertCircle className="inline-block h-4 w-4 mr-1" />}
                {nextActionDisplay}
              </p>
              {nextActionRelative && (
                <p className="text-xs text-gray-500 dark:text-white/50">{nextActionRelative}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleOpenFollowUpModal}
              disabled={disabled || loading || isSaving}
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-100 dark:hover:bg-emerald-500/20"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Follow-up Modal */}
      <Modal isOpen={followUpModal.isOpen} onClose={followUpModal.closeModal} className="max-w-md">
        <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Next Follow-up</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
            Set when the next action is due for this lead
          </p>

          <div className="mt-6 space-y-4">
            {/* Next Action Due Date */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-white/80">
                Follow-up Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formState.nextActionDueAt}
                onChange={(e) => {
                  setFormState((prev) => ({ ...prev, nextActionDueAt: e.target.value }));
                  if (errors.nextActionDueAt) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.nextActionDueAt;
                      return next;
                    });
                  }
                }}
                className="mt-2 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.07] dark:text-white"
              />
              {errors.nextActionDueAt && (
                <p className="mt-1 text-xs text-red-500">{errors.nextActionDueAt}</p>
              )}
            </div>

            {/* Action Type */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-white/80">
                Action Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formState.actionType}
                onChange={(e) => setFormState((prev) => ({ ...prev, actionType: e.target.value }))}
                className="mt-2 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.07] dark:text-white"
              >
                <option value="CALL">Phone Call</option>
                <option value="MEETING">Meeting</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="EMAIL">Email</option>
                <option value="NOTE">Note/Reminder</option>
              </select>
            </div>

            {/* Priority */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-white/80">Priority</label>
              <select
                value={formState.priority}
                onChange={(e) => setFormState((prev) => ({ ...prev, priority: e.target.value as any }))}
                className="mt-2 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.07] dark:text-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            {/* Description */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-white/80">Description</label>
              <textarea
                value={formState.description}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="What should happen at this follow-up?"
                rows={3}
                className="mt-2 rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none dark:border-white/10 dark:bg-white/[0.07] dark:text-white"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={followUpModal.closeModal}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveFollowUp}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Schedule Follow-up"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
