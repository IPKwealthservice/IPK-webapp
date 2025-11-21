import { useMemo } from "react";
import {
  CalendarClock,
  NotebookPen,
  PhoneCall,
  UserCircle2,
  MessageSquare,
  CheckCircle2,
  UserRoundCheck,
  UserRound,
} from "lucide-react";
import { STAGE_META } from "@/components/sales/myleads/stageMeta";
import { formatEventTimestamp, humanize } from "./interface/utils";
import type { LeadInteraction } from "./interface/leadInteraction";

type Props = {
  interactions: LeadInteraction[];
  isLoading?: boolean;
  onInteractionClick?: (interaction: LeadInteraction) => void;
};

export default function LeadInteractionTimeline({
  interactions,
  isLoading = false,
  onInteractionClick,
}: Props) {
  const sortedInteractions = useMemo(() => {
    return [...(interactions || [])].sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }, [interactions]);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">Lead Interaction History</h2>
        <div className="mt-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse dark:bg-white/10" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-white/10">
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Lead Interaction History</h2>
          <p className="text-xs text-gray-500 dark:text-white/60 mt-1">
            Complete audit trail of all actions, remarks, and changes
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
          {interactions.length} entries
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {interactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-6 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-white/5">
            <NotebookPen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No interactions recorded yet.</p>
            <p className="text-xs mt-1">Log your first call, meeting, or note to start tracking.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedInteractions.map((interaction) => (
              <InteractionRow
                key={interaction.id}
                interaction={interaction}
                onClick={() => onInteractionClick?.(interaction)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function InteractionRow({
  interaction,
  onClick,
}: {
  interaction: LeadInteraction;
  onClick: () => void;
}) {
  const { icon: Icon, badgeClass, label } = getInteractionDisplay(interaction.type);
  const details = buildInteractionDetails(interaction);

  return (
    <div
      className="group cursor-pointer rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50/30 dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-400/30 dark:hover:bg-emerald-500/10"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`rounded-full border p-2 text-xs font-medium ${badgeClass} flex-shrink-0 mt-0.5`}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${badgeClass}`}>
              {label}
            </span>

            {interaction.channel && (
              <span className="text-xs text-gray-600 dark:text-white/70">- {humanize(interaction.channel)}</span>
            )}

            {interaction.outcome && (
              <span className="text-xs text-gray-600 dark:text-white/70">- {humanize(interaction.outcome)}</span>
            )}

            {interaction.statusFilterFrom && interaction.statusFilterTo && (
              <span className="text-xs text-gray-600 dark:text-white/70">
                - {humanize(interaction.statusFilterFrom)}
                {" -> "}
                {humanize(interaction.statusFilterTo)}
              </span>
            )}

            {interaction.pipelineStageFrom && interaction.pipelineStageTo && (
              <span className="text-xs text-gray-600 dark:text-white/70">
                - {humanize(interaction.pipelineStageFrom)}
                {" -> "}
                {humanize(interaction.pipelineStageTo)}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-white/60">
            <span title={new Date(interaction.occurredAt).toLocaleString()}>
              {formatEventTimestamp(interaction.occurredAt)}
            </span>

            {interaction.authorName && (
              <>
                <span className="text-gray-300 dark:text-white/20">-</span>
                <span className="font-medium text-gray-700 dark:text-white/80">{interaction.authorName}</span>
                {interaction.authorEmail && (
                  <span className="text-gray-400 dark:text-white/50">({interaction.authorEmail})</span>
                )}
              </>
            )}
          </div>

          {interaction.text && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/80">
              {interaction.text}
            </div>
          )}

          {details && Object.keys(details).length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs">
              {details.stageChange && <DetailRow label="Stage Change" value={details.stageChange} />}
              {details.statusChange && <DetailRow label="Status Change" value={details.statusChange} />}
              {details.nextFollowUp && (
                <div className="flex items-center gap-2 rounded bg-blue-50 p-2 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                  <CalendarClock className="h-3.5 w-3.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Next Follow-up:</span>
                    <span className="ml-1">{details.nextFollowUp}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded bg-gray-100 p-2 dark:bg-white/5">
      <span className="font-medium text-gray-600 dark:text-white/70">{label}:</span>
      <span className="text-gray-800 dark:text-white/80">{value}</span>
    </div>
  );
}

function getInteractionDisplay(type: string) {
  const displays: Record<
    string,
    {
      icon: React.ElementType;
      badgeClass: string;
      label: string;
    }
  > = {
    CALL: {
      icon: PhoneCall,
      badgeClass:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-200 dark:border-blue-400/20",
      label: "Call",
    },
    MEETING: {
      icon: UserCircle2,
      badgeClass:
        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-200 dark:border-purple-400/20",
      label: "Meeting",
    },
    WHATSAPP: {
      icon: MessageSquare,
      badgeClass:
        "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-200 dark:border-green-400/20",
      label: "WhatsApp",
    },
    EMAIL: {
      icon: MessageSquare,
      badgeClass:
        "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-200 dark:border-indigo-400/20",
      label: "Email",
    },
    NOTE: {
      icon: NotebookPen,
      badgeClass:
        "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-200 dark:border-yellow-400/20",
      label: "Note",
    },
    INTERACTION: {
      icon: MessageSquare,
      badgeClass:
        "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-200 dark:border-orange-400/20",
      label: "Interaction",
    },
    STATUS_CHANGE: {
      icon: CheckCircle2,
      badgeClass:
        "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-200 dark:border-cyan-400/20",
      label: "Status Changed",
    },
    STAGE_CHANGE: {
      icon: UserRoundCheck,
      badgeClass:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/20",
      label: "Stage Changed",
    },
    REMARK_UPDATED: {
      icon: NotebookPen,
      badgeClass:
        "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-500/15 dark:text-pink-200 dark:border-pink-400/20",
      label: "Remark Updated",
    },
    ASSIGNMENT: {
      icon: UserRound,
      badgeClass:
        "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-200 dark:border-slate-400/20",
      label: "Assigned",
    },
  };

  const display = displays[type] || displays.NOTE;

  return {
    icon: display.icon,
    badgeClass: display.badgeClass,
    label: display.label,
  };
}

function buildInteractionDetails(interaction: LeadInteraction) {
  const details: Record<string, string> = {};

  if (interaction.pipelineStageFrom && interaction.pipelineStageTo) {
    const fromLabel =
      (STAGE_META as any)[interaction.pipelineStageFrom]?.label ?? humanize(interaction.pipelineStageFrom);
    const toLabel = (STAGE_META as any)[interaction.pipelineStageTo]?.label ?? humanize(interaction.pipelineStageTo);
    details.stageChange = `${fromLabel} -> ${toLabel}`;
  }

  if (interaction.statusFilterFrom && interaction.statusFilterTo) {
    details.statusChange = `${humanize(interaction.statusFilterFrom)} -> ${humanize(interaction.statusFilterTo)}`;
  }

  if (interaction.nextActionDueAt) {
    details.nextFollowUp = formatEventTimestamp(interaction.nextActionDueAt);
  }

  return details;
}
