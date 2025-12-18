// Lead Profile Page
//
// Managers get a consistent snapshot of the lead at the top, can change the
// current stage inline, and log follow-up notes/events without leaving the page.
// New events appear instantly via Apollo cache updates.

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ApolloError, useMutation, useQuery } from "@apollo/client";
import LeadSnapshot from "@/features/leads/profile/LeadSnapshot";
import StageSelect from "@/features/leads/profile/StageSelect";
import EventComposer from "@/features/leads/profile/EventComposer";
import EventTimeline from "@/features/leads/profile/EventTimeline";
import {
  LEAD_PROFILE_QUERY,
  CHANGE_LEAD_STAGE_MUTATION,
  UPDATE_LEAD_DETAILS_MUTATION,
  type StageOption,
} from "@/features/leads/profile/gql";
import ClientCodeModal from "@/features/leads/profile/ClientCodeModal";

export default function LeadProfilePage() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(LEAD_PROFILE_QUERY, {
    variables: { id: leadId },
    skip: !leadId,
  });

  const [changeStage, { loading: changingStage }] = useMutation(CHANGE_LEAD_STAGE_MUTATION);
  const [updateLeadDetails, { loading: updatingClientCode }] = useMutation(UPDATE_LEAD_DETAILS_MUTATION);

  const [isClientCodeModalOpen, setClientCodeModalOpen] = React.useState(false);
  const [pendingStage, setPendingStage] = React.useState<StageOption | null>(null);
  const [clientCodeError, setClientCodeError] = React.useState<string | null>(null);
  const [clientCodeDraft, setClientCodeDraft] = React.useState<string>("");

  async function commitStageChange(next: StageOption, leadCodeOverride?: string) {
    if (!data?.lead?.id) return;
    const id = data.lead.id as string;
    const optimisticCode = leadCodeOverride ?? data.lead.leadCode;

    await changeStage({
      variables: { id, stage: next },
      optimisticResponse: {
        __typename: "Mutation",
        updateLead: { __typename: "IpkLeaddEntity", id, clientStage: next, leadCode: optimisticCode },
      },
      update(cache, result) {
        const newCode =
          (result?.data as any)?.updateLead?.leadCode ?? leadCodeOverride ?? (data?.lead?.leadCode as string | undefined);

        cache.modify({
          id: cache.identify({ __typename: "IpkLeaddEntity", id }),
          fields: {
            clientStage: () => next,
            ...(newCode ? { leadCode: () => newCode } : {}),
          },
        });
      },
    });
  }

  async function handleClientCodeSubmit(code: string) {
    if (!data?.lead?.id || !pendingStage) return;
    setClientCodeError(null);
    const id = data.lead.id as string;

    try {
      await updateLeadDetails({
        variables: { input: { leadId: id, clientCode: code } },
        optimisticResponse: {
          __typename: "Mutation",
          updateLeadDetails: { __typename: "IpkLeaddEntity", id, clientCode: code },
        },
        update(cache, result) {
          const newCode = (result?.data as any)?.updateLeadDetails?.clientCode ?? code;
          cache.modify({
            id: cache.identify({ __typename: "IpkLeaddEntity", id }),
            fields: {
              leadCode: () => newCode,
            },
          });
        },
      });

      await commitStageChange(pendingStage, code);
      setPendingStage(null);
      setClientCodeModalOpen(false);
    } catch (err: any) {
      setClientCodeError(err?.message || "Unable to update client code. Please try again.");
    }
  }

  function handleStageChange(next: StageOption) {
    if (!data?.lead?.id) return;
    if (next === "ACCOUNT_OPENED") {
      setPendingStage(next);
      setClientCodeDraft((data.lead.leadCode as string | undefined) ?? "");
      setClientCodeError(null);
      setClientCodeModalOpen(true);
      return;
    }

    void commitStageChange(next);
  }

  if (loading) return <div className="p-6">Loading lead details…</div>;
  if (error)
    return (
      <div className="p-6 text-rose-600">
        Error loading lead: {(error as ApolloError).message}
      </div>
    );
  if (!data?.lead) return <div className="p-6">Lead not found.</div>;

  const lead = data.lead as any;

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Profile</h1>
        <div className="relative w-full max-w-lg">
          <input
            placeholder="Search leads by name, phone, code…"
            className="h-10 w-full rounded-xl border border-gray-200 bg-transparent px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-emerald-300 focus:outline-hidden focus:ring-3 focus:ring-emerald-200 dark:border-white/10 dark:text-white/90 dark:placeholder:text-white/30"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const v = (e.target as HTMLInputElement).value.trim();
                if (v) navigate(`/sales/leads?q=${encodeURIComponent(v)}&page=1`);
              }
            }}
          />
        </div>
      </div>
      <LeadSnapshot
        lead={lead}
        stageSelect={
          <StageSelect
            value={lead.clientStage as StageOption | null}
            onChange={handleStageChange}
            disabled={changingStage || updatingClientCode}
          />
        }
      />

      <section className="divide-y rounded-lg border">
        <EventComposer leadId={lead.id} />
        <EventTimeline events={lead.events ?? []} />
      </section>

      <ClientCodeModal
        isOpen={isClientCodeModalOpen}
        onClose={() => {
          setClientCodeModalOpen(false);
          setPendingStage(null);
          setClientCodeError(null);
        }}
        defaultCode={clientCodeDraft}
        loading={updatingClientCode || changingStage}
        error={clientCodeError}
        onSubmit={(code) => handleClientCodeSubmit(code)}
      />
    </div>
  );
}
