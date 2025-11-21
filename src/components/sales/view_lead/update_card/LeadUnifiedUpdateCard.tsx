import { useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Flag, Milestone, Clock3, StickyNote, ChevronDown, CheckCircle2 } from 'lucide-react';

import {
  UPDATE_LEAD_STATUS,
} from '../gql/view_lead.gql';
import {
  RECORD_STAGE_CHANGE,
  RECORD_STATUS_FILTER_CHANGE,
  UPDATE_LEAD_REMARK_WITH_INTERACTION,
} from '../gql/leadInteraction.gql';
import { UPDATE_NEXT_ACTION_DUE } from '@/components/sales/view_lead/gql/followUp.gql';
import { shouldAutoOpenLead } from '../autoStatus';
import { useAuth } from '@/context/AuthContex';

import { STATUS_OPTIONS,LeadStageFilter, LeadStatus, LeadStage, STAGE_OPTIONS } from '../update_card/interface';

type Props = {
  leadId: string;
  currentStatus: LeadStatus | string;
  currentStage?: LeadStage | string | null;
  /** Pipeline status (PENDING/OPEN/...) for automation rules */
  pipelineStatus?: LeadStageFilter | string | null;
  onSaved?: () => void;
};

const CARD = 'rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] flex flex-col overflow-hidden';
const INPUT = 'rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white';
const BTN = 'rounded-xl bg-emerald-600 text-white px-4 py-2 border border-emerald-600 disabled:bg-zinc-300 disabled:text-white/70';


export default function LeadUnifiedUpdateCard({
  leadId,
  currentStatus,
  currentStage,
  pipelineStatus,
  onSaved,
}: Props) {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>(String(currentStatus ?? 'OPEN'));
  const [stage, setStage] = useState<string>(String(currentStage ?? 'NEW_LEAD'));
  const [followUp, setFollowUp] = useState<string>('');
  // REMOVED: channel and outcome state
  const [notes, setNotes] = useState<string>('');
  const [productExplained, setProductExplained] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  const [mutUpdateStatus] = useMutation(UPDATE_LEAD_STATUS);
  const [mutRecordStageChange] = useMutation(RECORD_STAGE_CHANGE);
  const [mutRecordStatusFilterChange] = useMutation(RECORD_STATUS_FILTER_CHANGE);
  const [mutUpdateNextAction] = useMutation(UPDATE_NEXT_ACTION_DUE);
  const [mutRemarkWithInteraction] = useMutation(UPDATE_LEAD_REMARK_WITH_INTERACTION);

  const nextFollowUpAt = useMemo(() => {
    if (!followUp) return null;
    const t = Date.parse(followUp);
    return isNaN(t) ? null : new Date(t).toISOString();
  }, [followUp]);

  // Once a lead has moved beyond the early pipeline (FIRST_TALK_DONE),
  // hide NEW_LEAD and FIRST_TALK_DONE from the stage dropdown so RMs
  // don't accidentally move it backwards.
  const stageOptionsForUi = useMemo(() => {
    const currentUpper = String(stage || '').toUpperCase();
    if (!currentUpper || currentUpper === 'NEW_LEAD' || currentUpper === 'FIRST_TALK_DONE') {
      return STAGE_OPTIONS;
    }
    return STAGE_OPTIONS.filter(
      (s) => String(s).toUpperCase() !== 'NEW_LEAD' && String(s).toUpperCase() !== 'FIRST_TALK_DONE',
    );
  }, [stage]);

  const isNewLeadStage = String(stage || '').toUpperCase() === 'NEW_LEAD';
  const showProductExplainedReminder = !isNewLeadStage && productExplained;

  const onSave = async () => {
    if (!leadId) return;
    const ops: Promise<any>[] = [];
    setSaving(true);
    try {
      const stageChanged = String(stage) !== String(currentStage);
      const statusChanged = String(status) !== String(currentStatus);
      const hasNotes = Boolean(notes.trim());
      const shouldUpdateNextActionDirectly =
        !!nextFollowUpAt && !stageChanged && !statusChanged && !hasNotes;
      // Stage filter change (shown as Status in UI) - with interaction tracking
      if (statusChanged) {
        ops.push(
          mutRecordStatusFilterChange({
            variables: {
              leadId,
              from: String(currentStatus),
              to: status,
              note: notes || undefined,
              nextActionDueAt: nextFollowUpAt || undefined,
            },
            update(cache, result) {
              const payload = (result?.data as any)?.recordStatusFilterChange;
              if (!payload?.id) return;
              cache.modify({
                id: cache.identify({ __typename: 'IpkLeaddEntity', id: leadId }),
                fields: {
                  stageFilter: () => status,
                  nextActionDueAt: () => nextFollowUpAt,
                },
              });
            },
          })
        );
      }

      // Pipeline stage change - with interaction tracking
      if (stageChanged) {
        ops.push(
          mutRecordStageChange({
            variables: {
              leadId,
              from: String(currentStage),
              to: stage,
              note: notes || undefined,
              nextActionDueAt: nextFollowUpAt || undefined,
            },
            update(cache, result) {
              const payload = (result?.data as any)?.recordStageChange;
              if (!payload?.id) return;
              cache.modify({
                id: cache.identify({ __typename: 'IpkLeaddEntity', id: leadId }),
                fields: {
                  clientStage: () => stage,
                  nextActionDueAt: () => nextFollowUpAt,
                },
              });
            },
          })
        );
      }

      // Remark/Notes with interaction tracking
      if (hasNotes) {
        ops.push(
          mutRemarkWithInteraction({
            variables: {
              leadId,
              text: notes,
              nextActionDueAt: nextFollowUpAt || undefined,
              createInteractionEvent: true,
            },
          })
        );
      }

      if (shouldUpdateNextActionDirectly) {
        ops.push(
          mutUpdateNextAction({
            variables: {
              input: {
                leadId,
                nextActionDueAt: nextFollowUpAt,
              },
            },
            update(cache, result) {
              const payload = (result?.data as any)?.updateNextActionDue;
              const targetId = payload?.id ?? leadId;
              if (!targetId) return;
              cache.modify({
                id: cache.identify({ __typename: 'IpkLeaddEntity', id: targetId }),
                fields: {
                  nextActionDueAt: () => payload?.nextActionDueAt,
                },
              });
            },
          }),
        );
      }

      // Auto-open rule: when first talk is done on a pending lead,
      // quietly flip pipeline status from PENDING -> OPEN so
      // marketing "Open leads" views stay accurate.
      if (
        shouldAutoOpenLead({
          previousStatus: pipelineStatus as string | null,
          nextStage: stage,
        })
      ) {
        ops.push(
          mutUpdateStatus({
            variables: { leadId, status: 'OPEN' as LeadStatus },
            update(cache, result) {
              const payload = (result?.data as any)?.updateLeadStatus;
              if (!payload?.id) return;
              cache.modify({
                id: cache.identify({ __typename: 'IpkLeaddEntity', id: payload.id }),
                fields: {
                  status: () => payload.status,
                  clientStage: () => payload.clientStage,
                  ...(payload.leadCode ? { leadCode: () => payload.leadCode } : {}),
                },
              });
            },
          })
        );
      }

      // Note: When hasNotes is true, mutRemarkWithInteraction (lines 151-161) already handles
      // creating both the remark entry AND the interaction timeline entry with proper history tracking.
      // We don't need to call mutInteraction and mutRemark separately here.

      await Promise.all(ops);
      const successMsg = nextFollowUpAt 
        ? `Saved. Next follow-up: ${new Date(nextFollowUpAt).toLocaleString()}`
        : 'Saved. Timeline and remark updated.';
      toast.success(successMsg);
      setNotes('');
      onSaved?.();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={CARD}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-800 dark:text-white">
          <Flag className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold">Progress & Activity</h3>
        </div>
        <button className={BTN} onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* REORDERED: Fields are now in the requested order */}
      <div className="grid grid-cols-1 gap-5 flex-1">
        
        {/* Product explained */}
        {isNewLeadStage && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Was the product explained?</label>
            <div className="mt-1 flex items-center gap-4 text-xs text-gray-700 dark:text-white/80">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  className="h-3.5 w-3.5 accent-emerald-600"
                  checked={productExplained === true}
                  onChange={() => setProductExplained(true)}
                />
                <span>Yes</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  className="h-3.5 w-3.5 accent-emerald-600"
                  checked={productExplained === false}
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
              <p className="text-[11px] font-medium text-emerald-700">Captured as yes</p>
            </div>
          </div>
        )}

        {/* Stage */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Pipeline stage</label>
          <div className="relative">
            <select className={`${INPUT} w-full appearance-none pr-8`} value={stage} onChange={(e) => setStage(e.target.value)}>
              {stageOptionsForUi.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <Milestone className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-zinc-400" />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">LeadStage Filter</label>
          <div className="relative">
            <select className={`${INPUT} w-full appearance-none pr-8`} value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-zinc-400" />
          </div>
        </div>

        {/* Follow-up */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Next follow-up</label>
          <div className="relative">
            <input type="datetime-local" className={`${INPUT} w-full`} value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
            <Clock3 className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-zinc-400" />
          </div>
        </div>



        {/* Notes */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Notes (also saved as Remark)</label>
          <div className="relative">
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${INPUT} w-full resize-y`} placeholder="Add context, commitments, objections, etc." />
            <StickyNote className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-zinc-400" />
          </div>
        </div>
      </div>
    </section>
  );
}
