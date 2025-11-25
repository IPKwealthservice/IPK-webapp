// LeadUnifiedUpdateCard.tsx
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { ApolloError, useMutation } from "@apollo/client";
import { Listbox, Transition } from "@headlessui/react";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import {
  Flag,
  Milestone,
  Clock3,
  StickyNote,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

import {
  CHANGE_STAGE,
  UPDATE_LEAD_REMARK,
  LEAD_DETAIL_WITH_TIMELINE,
} from "../gql/view_lead.gql";
import { useAuth } from "@/context/AuthContex";
import {
  STATUS_OPTIONS,
  LeadStageFilter,
  LeadStatus,
  LeadStage,
  STAGE_OPTIONS,
} from "../update_card/interface";

type Props = {
  leadId: string;
  /** Stage filter shown as Status dropdown */
  currentStatus: LeadStageFilter | LeadStatus | string;
  /** Pipeline stage */
  currentStage?: LeadStage | string | null;
  /** existing pipeline status if you still use it elsewhere (not used here) */
  pipelineStatus?: LeadStageFilter | string | null;
  onSaved?: () => void;
};

const CARD =
  "rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] flex flex-col overflow-hidden";
const INPUT =
  "rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white";
const BTN =
  "rounded-xl bg-emerald-600 text-white px-4 py-2 border border-emerald-600 disabled:bg-zinc-300 disabled:text-white/70";

export default function LeadUnifiedUpdateCard({
  leadId,
  currentStatus,
  currentStage,
  onSaved,
}: Props) {
  const { user } = useAuth();

  // form state
  const [status, setStatus] = useState<string>(String(currentStatus ?? "OPEN"));
  const [stage, setStage] = useState<string>(String(currentStage ?? "NEW_LEAD"));
  const [followUp, setFollowUp] = useState<Date | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [productExplained, setProductExplained] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  // keep local state synced with parent props
  useEffect(() => {
    setStatus(String(currentStatus ?? "OPEN"));
  }, [currentStatus]);

  useEffect(() => {
    setStage(String(currentStage ?? "NEW_LEAD"));
  }, [currentStage]);

  // mutations – ONLY schema-valid ones
  const [mutChangeStage] = useMutation(CHANGE_STAGE);
  const [mutUpdateRemark] = useMutation(UPDATE_LEAD_REMARK);

  // refetch the lead detail + timeline so right side panels refresh
  const refetchQueries = [
    {
      query: LEAD_DETAIL_WITH_TIMELINE,
      variables: { leadId, eventsLimit: 100 },
    },
  ];

  const nextFollowUpAt = useMemo(() => {
    if (!followUp) return null;
    return followUp.toISOString();
  }, [followUp]);

  // filter out NEW_LEAD / FIRST_TALK_DONE once lead has moved ahead
  const stageOptionsForUi = useMemo(() => {
    const currentUpper = String(stage || "").toUpperCase();
    if (
      !currentUpper ||
      currentUpper === "NEW_LEAD" ||
      currentUpper === "FIRST_TALK_DONE"
    ) {
      return STAGE_OPTIONS;
    }
    return STAGE_OPTIONS.filter(
      (s) =>
        String(s).toUpperCase() !== "NEW_LEAD" &&
        String(s).toUpperCase() !== "FIRST_TALK_DONE"
    );
  }, [stage]);

  const isNewLeadStage = String(stage || "").toUpperCase() === "NEW_LEAD";
  const showProductExplainedReminder = !isNewLeadStage && productExplained;

  const onSave = async () => {
    if (!leadId || saving) return;

    const trimmedNotes = notes.trim();
    const stageChanged = String(stage) !== String(currentStage ?? "");
    const statusChanged = String(status) !== String(currentStatus ?? "");
    const hasFollowUp = Boolean(nextFollowUpAt);
    const hasRemark = Boolean(trimmedNotes);

    const nothingChanged =
      !stageChanged && !statusChanged && !hasFollowUp && !hasRemark;

    if (nothingChanged) {
      toast.info("Nothing to update");
      return;
    }

    setSaving(true);
    const ops: Promise<any>[] = [];

    try {
      // 1) Single canonical mutation to update stage + stageFilter + followUp
      if (stageChanged || statusChanged || hasFollowUp) {
        ops.push(
          mutChangeStage({
            variables: {
              input: {
                leadId,
                stage: stage as LeadStage, // enum name string
                stageFilter: status as LeadStageFilter, // enum name string
                nextFollowUpAt: nextFollowUpAt || undefined,
                // NOTE: send ONLY the user-typed note, not synthesized text
                note: trimmedNotes || undefined,
                // only relevant (and optional) for first contact
                productExplained: isNewLeadStage ? productExplained : undefined,
              },
            },
            refetchQueries,
            update(cache, result) {
              const payload = (result?.data as any)?.changeStage;
              if (!payload?.id) return;
              cache.modify({
                id: cache.identify({
                  __typename: "IpkLeaddEntity",
                  id: payload.id,
                }),
                fields: {
                  clientStage: () => payload.clientStage,
                  stageFilter: () => status,
                  nextActionDueAt: () => payload.nextActionDueAt,
                },
              });
            },
          })
        );
      }

      // 2) Remark history – ONLY the raw notes text
      if (hasRemark) {
        ops.push(
          mutUpdateRemark({
            variables: {
              input: {
                leadId,
                remark: trimmedNotes, // <= ONLY user-entered text
              },
            },
            refetchQueries,
          })
        );
      }

      await Promise.all(ops);

      const successMsg = nextFollowUpAt
        ? `Saved. Next follow-up: ${new Date(
            nextFollowUpAt
          ).toLocaleString()}`
        : "Saved. Timeline and remark updated.";

      toast.success(successMsg);
      setNotes("");
      setFollowUp(null);
      onSaved?.();
    } catch (err) {
      const e = err as ApolloError;
      console.error("Apollo error:", e);

      // show GraphQL error message if present
      if (e?.graphQLErrors?.length) {
        console.error("GraphQL errors:", e.graphQLErrors);
        toast.error(e.graphQLErrors[0]?.message ?? "Failed to save");
      } else if ((e as any)?.networkError?.result?.errors) {
        console.error("Network errors:", (e as any).networkError.result.errors);
        toast.error(
          (e as any).networkError.result.errors[0]?.message ??
            "Network error saving lead"
        );
      } else {
        toast.error(e.message || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={CARD}>
      {/* Header + Save button */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-800 dark:text-white">
          <Flag className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold">Progress &amp; Activity</h3>
        </div>
        <button className={BTN} onClick={onSave} disabled={saving}>
          {saving ? "Updating..." : "Save"}
        </button>
      </div>

      {/* Loading banner */}
      {saving && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent dark:border-emerald-200 dark:border-t-transparent" />
          Activity updating, please wait...
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 gap-5 flex-1">
        {/* Product explained */}
        {isNewLeadStage && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Was the product explained?
            </label>
            <div className="mt-1 flex items-center gap-4 text-xs text-gray-700 dark:text-white/80">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  className="h-3.5 w-3.5 accent-emerald-600"
                  checked={productExplained === true}
                  disabled={saving}
                  onChange={() => setProductExplained(true)}
                />
                <span>Yes</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  className="h-3.5 w-3.5 accent-emerald-600"
                  checked={productExplained === false}
                  disabled={saving}
                  onChange={() => setProductExplained(false)}
                />
                <span>No</span>
              </label>
            </div>
          </div>
        )}

        {showProductExplainedReminder && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <div>
              <p>Product explained</p>
              <p className="text-[11px] font-medium text-emerald-700">
                Captured as yes
              </p>
            </div>
          </div>
        )}

        {/* Stage */}
        <FancySelect
          label="Pipeline stage"
          icon={<Milestone className="h-4 w-4 text-emerald-600" />}
          value={stage}
          onChange={setStage}
          options={stageOptionsForUi.map((s) => ({
            value: s,
            label: toLabel(s),
          }))}
          disabled={saving}
        />

        <FancySelect
          label="LeadStage Filter"
          icon={<ChevronDown className="h-4 w-4 text-emerald-600" />}
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS.map((s) => ({
            value: s,
            label: toLabel(s),
          }))}
          disabled={saving}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500">Next follow-up</label>
          <div className="relative">
            <DatePicker
              selected={followUp}
              onChange={(date) => setFollowUp(date)}
              showTimeSelect
              timeIntervals={15}
              dateFormat="dd MMM, yyyy • h:mm aa"
              placeholderText="Pick date & time"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white"
              popperClassName="z-50"
              calendarClassName="rounded-xl border border-gray-200 shadow-lg dark:border-white/10"
              disabled={saving}
            />
            <Clock3 className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-zinc-400" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Notes (also saved as Remark)
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${INPUT} w-full resize-y ${
                saving ? "opacity-80" : ""
              }`}
              placeholder="Add context, commitments, objections, etc."
              disabled={saving}
            />
            <StickyNote className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-zinc-400" />
          </div>
        </div>
      </div>
    </section>
  );
}

type FancyOption = { value: string; label: string };

function toLabel(value: string) {
  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function FancySelect({
  label,
  value,
  onChange,
  options,
  icon,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: FancyOption[];
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <Listbox value={selected?.value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className={`flex w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-3 py-2 text-left text-sm font-medium text-gray-800 shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white ${
              disabled ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <span className="flex items-center gap-2">
              {icon}
              <span>{selected?.label ?? "Select"}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Listbox.Options className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 focus:outline-none dark:border-white/10 dark:bg-gray-900">
              {options.map((opt) => (
                <Listbox.Option
                  key={opt.value}
                  value={opt.value}
                  className={({ active, selected: isSel }) =>
                    `flex items-center justify-between px-3 py-2 text-sm transition ${
                      active ? "bg-emerald-50 text-emerald-700" : "text-gray-800 dark:text-white"
                    } ${isSel ? "font-semibold" : "font-medium"}`
                  }
                >
                  {({ selected: isSel }) => (
                    <>
                      <span>{opt.label}</span>
                      {isSel && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
