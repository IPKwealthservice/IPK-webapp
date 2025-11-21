import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Loader2, AlertCircle, Users } from "lucide-react";
import { toast } from "react-toastify";

import { useAuth } from "@/context/AuthContex";
import {
  LEAD_DETAIL_WITH_TIMELINE,
  UPDATE_LEAD_STATUS,
  CHANGE_STAGE,
  CREATE_LEAD_EVENT,
  UPDATE_LEAD_REMARK,
} from "./gql/view_lead.gql";
import { LEAD_INTERACTION_HISTORY } from "./gql/leadInteraction.gql";

import LeadProfileHeader from "./leadProfileheader/LeadProfileHeader";
import LeadUnifiedUpdateCard from "./update_card/LeadUnifiedUpdateCard";
import TimelineList from "./TimelineList";
import LeadRemarkHistory from "./LeadRemarkHistory";
import { pickLeadStage, pickLeadStatus } from "./interface/utils";
import { shouldAutoOpenLead } from "./autoStatus";
import type { LeadEvent, LeadProfile } from "./interface/types";
import type {
  LeadInteractionHistory as LeadInteractionHistoryType,
  RemarkEntry,
} from "./interface/leadInteraction";
import RmLeadsDrawer from "./RmLeadsDrawer";

type LeadDetailResp = { leadDetailWithTimeline: LeadProfile };
type LeadDetailVars = { leadId: string; eventsLimit?: number };
type InteractionHistoryResp = { leadInteractionHistory: LeadInteractionHistoryType };
type InteractionHistoryVars = { leadId: string; limit?: number; offset?: number };

export default function ViewLead() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const passedLead = (location.state as { lead?: Partial<LeadProfile> } | null)?.lead;

  const leadId = useMemo(() => {
    if (typeof id === "string" && id.trim()) return id;
    if (passedLead?.id) return String(passedLead.id);
    return "";
  }, [id, passedLead?.id]);

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const canEditProfile = isAdmin || user?.role === "RM";

  const { data, loading, error, refetch } = useQuery<LeadDetailResp, LeadDetailVars>(
    LEAD_DETAIL_WITH_TIMELINE,
    { variables: { leadId, eventsLimit: 100 }, skip: !leadId, fetchPolicy: "cache-and-network" }
  );
  const {
    data: interactionHistoryData,
    loading: loadingInteractionHistory,
    refetch: refetchInteractionHistory,
  } = useQuery<InteractionHistoryResp, InteractionHistoryVars>(LEAD_INTERACTION_HISTORY, {
    variables: { leadId, limit: 100, offset: 0 },
    skip: !leadId,
    fetchPolicy: "cache-and-network",
  });

  const [mutUpdateStatus] = useMutation(UPDATE_LEAD_STATUS);
  const [mutChangeStage] = useMutation(CHANGE_STAGE);
  const [mutCreateEvent] = useMutation(CREATE_LEAD_EVENT);
  const [mutUpdateRemark] = useMutation(UPDATE_LEAD_REMARK);

  const lead = data?.leadDetailWithTimeline;

  const remarkHistory = useMemo<RemarkEntry[]>(() => {
    const fallbackAuthor = user?.name ?? "Unknown";
    const fromQueryRaw = interactionHistoryData?.leadInteractionHistory?.remarkHistory ?? [];
    const normalizedFromQuery = fromQueryRaw.map((entry, idx) => {
      const createdAt =
        entry.createdAt || (entry as any)?.at || (entry as any)?.occurredAt || new Date().toISOString();
      const updatedAt = entry.updatedAt || (entry as any)?.updatedAt || createdAt;
      const author =
        entry.author ??
        (entry as any)?.authorName ??
        (entry as any)?.byName ??
        fallbackAuthor;
      const authorId = entry.authorId ?? (entry as any)?.by ?? (entry as any)?.authorId ?? undefined;
      const associatedInteractionId =
        (entry as any)?.associatedInteractionId ?? (entry as any)?.interactionId ?? undefined;

      return {
        id: entry.id ?? `remark-${idx}`,
        text: entry.text ?? (entry as any)?.note ?? "",
        author,
        authorId,
        createdAt,
        updatedAt,
        associatedInteractionId,
      };
    });
    if (normalizedFromQuery.length > 0) return normalizedFromQuery;

    const fromHistory: RemarkEntry[] = Array.isArray(lead?.history)
      ? lead.history
          .filter((entry) => (entry?.type ?? "").toUpperCase() === "REMARK_UPDATED" && entry?.text)
          .map((entry, idx) => {
            const createdAt = entry?.at ?? (entry as any)?.createdAt ?? new Date().toISOString();
            const author =
              entry?.authorName ??
              (entry as any)?.byName ??
              (entry as any)?.author ??
              (entry as any)?.by ??
              fallbackAuthor;
            return {
              id: entry?.id ?? `timeline-remark-${idx}`,
              text: entry?.text ?? "",
              author,
              authorId: entry?.authorId ?? ((entry as any)?.by as string | undefined),
              createdAt,
              updatedAt: (entry as any)?.updatedAt ?? createdAt,
              associatedInteractionId: entry?.id ?? undefined,
            };
          })
      : [];
    if (fromHistory.length > 0) return fromHistory;

    const fromLeadRemarks: RemarkEntry[] =
      Array.isArray(lead?.remarks) && lead.remarks.length > 0
        ? lead.remarks.map((remark, idx) => ({
            id: `lead-remark-${idx}`,
            text: remark?.text ?? "",
            author: remark?.author ?? fallbackAuthor,
            authorId: (remark as any)?.authorId ?? undefined,
            createdAt: remark?.createdAt ?? new Date().toISOString(),
            updatedAt: remark?.createdAt ?? undefined,
          }))
        : [];

    return fromLeadRemarks;
  }, [interactionHistoryData?.leadInteractionHistory?.remarkHistory, lead?.history, lead?.remarks, user?.name]);

  const remarkByInteractionId = useMemo(() => {
    const lookup = new Map<string, RemarkEntry>();
    remarkHistory.forEach((remark) => {
      if (remark.associatedInteractionId) {
        lookup.set(String(remark.associatedInteractionId), remark);
      }
    });
    return lookup;
  }, [remarkHistory]);

  const interactionEvents = useMemo<LeadEvent[]>(() => {
    const interactions = interactionHistoryData?.leadInteractionHistory?.interactions ?? [];
    return interactions.map((interaction) => {
      const linkedRemark = interaction?.id ? remarkByInteractionId.get(String(interaction.id)) : undefined;
      const prev =
        interaction.pipelineStageFrom || interaction.statusFilterFrom
          ? { stage: interaction.pipelineStageFrom, status: interaction.statusFilterFrom }
          : undefined;
      const next =
        interaction.pipelineStageTo || interaction.statusFilterTo
          ? { stage: interaction.pipelineStageTo, status: interaction.statusFilterTo }
          : undefined;
      const followUp = interaction.nextActionDueAt ?? null;
      const meta = {
        ...(interaction.meta ?? {}),
        authorId: interaction.authorId,
        authorName: interaction.authorName,
        authorEmail: interaction.authorEmail,
        nextActionDueAt: interaction.nextActionDueAt,
        pipelineStageFrom: interaction.pipelineStageFrom,
        pipelineStageTo: interaction.pipelineStageTo,
        statusFilterFrom: interaction.statusFilterFrom,
        statusFilterTo: interaction.statusFilterTo,
      };
      const resolvedAuthorName =
        linkedRemark?.author ||
        interaction.authorName ||
        (interaction.authorId && interaction.authorId === user?.id ? user?.name : undefined) ||
        undefined;
      const resolvedText = linkedRemark?.text ?? interaction.text ?? "";

      return {
        id: `interaction-${interaction.id}`,
        type: (interaction.type as any) ?? "INTERACTION",
        text: resolvedText,
        note: resolvedText || null,
        tags: interaction.tags ?? null,
        occurredAt: interaction.occurredAt,
        followUpOn: followUp,
        prev,
        next,
        meta,
        authorId: interaction.authorId ?? null,
        authorName: resolvedAuthorName ?? null,
        authorEmail: interaction.authorEmail ?? null,
      };
    });
  }, [interactionHistoryData?.leadInteractionHistory?.interactions, remarkByInteractionId, user?.id, user?.name]);

  const remarkEvents = useMemo<LeadEvent[]>(() => {
    return remarkHistory
      .filter((remark) => !remark.associatedInteractionId)
      .map((remark) => ({
        id: remark.id ?? `remark-${remark.createdAt}`,
        type: "REMARK_UPDATED",
        text: remark.text ?? "",
        note: remark.text ?? "",
        tags: ["REMARK"],
        occurredAt: remark.createdAt,
        meta: {
          authorId: remark.authorId ?? null,
          authorName: remark.author ?? null,
        },
        authorId: remark.authorId ?? null,
        authorName: remark.author ?? null,
        authorEmail: null,
      }));
  }, [remarkHistory]);

  const events: LeadEvent[] = useMemo(() => {
    const baseEvents = (lead?.events ?? []).map((ev) => {
      const meta = (ev as any)?.meta ?? {};
      const authorFromMeta =
        meta?.authorName || meta?.actorName || meta?.by || meta?.author?.name || undefined;
      const authorEmailFromMeta = meta?.authorEmail || meta?.author?.email || undefined;
      const followUp =
        (ev as any)?.followUpOn ??
        meta?.nextActionDueAt ??
        meta?.followUpOn ??
        meta?.nextAction ??
        null;
      return {
        ...ev,
        note: (ev as any)?.note ?? ev.text ?? null,
        authorName: (ev as any)?.authorName ?? authorFromMeta ?? null,
        authorEmail: (ev as any)?.authorEmail ?? authorEmailFromMeta ?? null,
        authorId: (ev as any)?.authorId ?? meta?.authorId ?? null,
        followUpOn: followUp,
        meta,
      };
    });

    const combined = [...interactionEvents, ...remarkEvents, ...baseEvents];
    const seen = new Set<string>();
    return combined
      .filter((ev) => {
        if (!ev?.occurredAt) return false;
        const key = ev.id ?? `${ev.type}-${ev.occurredAt}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  }, [interactionEvents, remarkEvents, lead?.events]);

  const [stageValue, setStageValue] = useState<string | undefined>(lead?.clientStage as string | undefined);

  useEffect(() => {
    setStageValue(lead?.clientStage as string | undefined);
  }, [lead?.clientStage]);

  const refetchAll = useCallback(async () => {
    const runs: Promise<unknown>[] = [refetch()];
    if (leadId) {
      runs.push(refetchInteractionHistory());
    }
    await Promise.all(runs);
  }, [leadId, refetch, refetchInteractionHistory]);

  const handleStatusChange = async (next: string) => {
    if (!leadId) return;
    try {
      await mutUpdateStatus({
        variables: { leadId, status: next },
        update(cache, result) {
          const payload = (result?.data as any)?.updateLeadStatus;
          if (!payload?.id) return;
          cache.modify({
            id: cache.identify({ __typename: "IpkLeaddEntity", id: payload.id }),
            fields: {
              status: () => payload.status,
              clientStage: () => payload.clientStage,
              ...(payload.leadCode ? { leadCode: () => payload.leadCode } : {}),
            },
          });
        },
      });
      toast.success("Status updated");
      await refetchAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    }
  };

  const handleStageChange = async (next: string) => {
    if (!leadId) return;
    try {
      await mutChangeStage({
        variables: {
          input: {
            leadId,
            stage: next,
            note: null,
            channel: null,
            nextFollowUpAt: null,
            productExplained: null,
          },
        },
        update(cache, result) {
          const payload = (result?.data as any)?.changeStage;
          if (!payload?.id) return;
          cache.modify({
            id: cache.identify({ __typename: "IpkLeaddEntity", id: payload.id }),
            fields: {
              clientStage: () => payload.clientStage,
              approachAt: () => payload.approachAt,
              lastSeenAt: () => payload.lastSeenAt,
              ...(payload.leadCode ? { leadCode: () => payload.leadCode } : {}),
            },
          });
        },
      });

      // Auto-open rule for simple stage dropdown as well.
      if (
        shouldAutoOpenLead({
          previousStatus: lead?.status as string | null,
          nextStage: next,
        })
      ) {
        try {
          await mutUpdateStatus({
            variables: { leadId, status: "OPEN" },
            update(cache, result) {
              const payload = (result?.data as any)?.updateLeadStatus;
              if (!payload?.id) return;
              cache.modify({
                id: cache.identify({ __typename: "IpkLeaddEntity", id: payload.id }),
                fields: {
                  status: () => payload.status,
                  clientStage: () => payload.clientStage,
                  ...(payload.leadCode ? { leadCode: () => payload.leadCode } : {}),
                },
              });
            },
          });
        } catch (e) {
          // non-blocking; ignore auto-open failures
        }
      }

      toast.success("Stage updated");
      await refetchAll();
    } catch (e: any) {
      toast.error(e.message || "Failed to update stage");
    }
  };

  const [eventType, setEventType] = useState<string>("NOTE");
  const [note, setNote] = useState("");
  const [followUpOn, setFollowUpOn] = useState("");
  const [channel, setChannel] = useState<string>("");
  const [outcome, setOutcome] = useState<string>("");
  const [reactivateToStage, setReactivateToStage] = useState<string | null>(null);
  const [isRmDrawerOpen, setRmDrawerOpen] = useState(false);

  const handleCreateEventEnhanced = async () => {
    const actorMeta = {
      authorId: user?.id ?? null,
      authorName: user?.name ?? null,
      authorEmail: user?.email ?? null,
    };
    const nowIso = new Date().toISOString();

    if (!leadId) return;
    const text = note.trim();
    if (!text) {
      toast.warn("Add a note before saving");
      return;
    }
    const nextFollowUpAt =
      followUpOn && !isNaN(Date.parse(followUpOn)) ? new Date(followUpOn).toISOString() : undefined;

    try {
      // If reactivation chosen, move stage first
      if (reactivateToStage && reactivateToStage !== stageValue) {
        await mutChangeStage({
          variables: {
            input: {
              leadId,
              stage: reactivateToStage,
              note: "Reactivated via new activity",
              channel: channel || null,
              nextFollowUpAt: nextFollowUpAt ?? null,
              productExplained: null,
            },
          },
        });
      }

      await mutCreateEvent({
        variables: {
          input: {
            leadId,
            type: eventType || "NOTE",
            text,
            tags: [eventType, "MANUAL_ENTRY"],
            channel: channel || null,
            outcome: outcome || null,
            nextFollowUpAt,
            dormantReason: null,
            occurredAt: nowIso,
            meta: {
              ...actorMeta,
              source: "view-lead-add-event",
              nextActionDueAt: nextFollowUpAt,
            },
          },
        },
      });
      // Keep the Latest remark in sync with the newest note
      try {
        await mutUpdateRemark({
          variables: {
            input: {
              leadId,
              remark: text,
              ...(actorMeta.authorId && actorMeta.authorName
                ? { authorId: actorMeta.authorId, authorName: actorMeta.authorName }
                : {}),
            },
          },
        });
      } catch (_) {
        // non-blocking; ignore failures
      }
      toast.success("Event logged");
      setEventType("NOTE");
      setNote("");
      setFollowUpOn("");
      setChannel("");
      setOutcome("");
      setReactivateToStage(null);
      await refetchAll();
    } catch (e: any) {
      toast.error(e.message || "Failed to log event");
    }
  };

  if (!leadId) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm">Missing lead id.</div>;
  }
  if (loading && !lead) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-500" /> Loading lead details...
      </div>
    );
  }
  if (error && !lead) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4 w-4" /> Unable to load this lead.
        </div>
        <div className="mt-2 text-xs opacity-80">{error.message}</div>
        <button
          onClick={() => {
            void refetchAll();
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  }
  if (!lead) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm">Lead not found.</div>;
  }

  return (
    <>
    <div className="space-y-6">
      <LeadProfileHeader
        lead={lead}
        loading={loading}
        isAdmin={isAdmin}
        canEditProfile={canEditProfile}
        onProfileRefresh={refetchAll}
      />

      <div className="flex flex-col gap-6 lg:gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="h-full min-h-0">
            <LeadUnifiedUpdateCard
              leadId={leadId}
              currentStatus={(lead.stageFilter as any) ?? (pickLeadStatus<string>(lead.status) as any)}
              currentStage={pickLeadStage(lead.clientStage as any) as any}
              pipelineStatus={lead.status as any}
              onSaved={refetchAll}
              onStatusChange={handleStatusChange}
            />
          </div>
          <div className="h-full min-h-0 space-y-6">
            <LeadRemarkHistory
              remarks={remarkHistory}
              isLoading={loadingInteractionHistory}
              title="Lead Interaction History"
              subtitle="Lead notes and remarks with editors and timestamps"
            />
            <TimelineList events={events} />
          </div>
        </div>
      </div>
    </div>
    {/* Floating trigger (desktop) */}
    <div className="fixed right-6 top-28 z-[60] hidden md:block">
      <button
        onClick={() => setRmDrawerOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-white/80 dark:ring-white/10"
        title="View all my leads"
      >
        <Users className="h-4 w-4 text-brand-600" />
        <span>My Leads</span>
      </button>
    </div>

    {/* Floating trigger (mobile / tablet) */}
    <div className="fixed bottom-6 right-4 z-[60] md:hidden">
      <button
        onClick={() => setRmDrawerOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-brand-700/20"
        title="My Leads"
        aria-label="Open my leads"
      >
        <Users className="h-5 w-5 text-white" />
        <span className="sr-only">My Leads</span>
      </button>
    </div>

    {/* Right-side drawer */}
    <RmLeadsDrawer
      isOpen={isRmDrawerOpen}
      onClose={() => setRmDrawerOpen(false)}
      onPick={(l) => {
        setRmDrawerOpen(false);
        if (l.id) {
          navigate(`/sales/leads/${l.id}`, { state: { lead: { id: l.id, leadCode: l.leadCode, name: l.name } } });
        }
      }}
    />
    </>
  );
}


