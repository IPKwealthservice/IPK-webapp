import { useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { CheckCircle2, Clock3, RefreshCcw, PencilLine } from "lucide-react";

import LeadStatusBadge from "@/components/sales/myleads/LeadStatusBadge";
import {
  leadOptions,
  valueToLabel,
  productOptions,
  investmentOptions,
  professionOptions,
} from "@/components/lead/types";
import {
  initials,
  resolveStageDisplay,
  formatDateDisplay,
  formatAgingDays,
  formatSipAmount,
  humanize,
} from "../interface/utils";
import { parseISO, differenceInCalendarDays, isValid as isValidDate } from "date-fns";
import type { LeadProfile } from "../interface/types";
import type { LeadEditModalValues } from "../../editLead/LeadEditModal";
import LeadEditModal from "../../editLead/LeadEditModal";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/context/AuthContex";
import { ADD_LEAD_PHONE } from "../gql/view_lead.gql";
import { HoverPreviewCard, RemarkBioModal } from "./HoverRemark";

type Props = {
  lead: LeadProfile;
  loading: boolean;
  canEditProfile: boolean;
  onProfileRefresh?: () => void;
  isAdmin?: boolean;
};

export default function LeadProfileHeader({
  lead,
  loading,
  canEditProfile,
  onProfileRefresh,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [mutAddPhone, { loading: addingPhone }] = useMutation(ADD_LEAD_PHONE);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // ---- DATA COMPUTATIONS ----

  const displayStatus = lead.status === "ASSIGNED" ? "PENDING" : lead.status;
  const headerStatus = (lead.stageFilter as string | null | undefined) ?? null;

  const stageDisplay = resolveStageDisplay({
    rawStage: (lead.clientStageRaw as string | null | undefined) ?? undefined,
    normalizedStage: (lead.clientStage as string | null | undefined) ?? undefined,
    status: displayStatus as string,
  });

  const normalizeText = (value?: string | null) => (value ?? "").toString().trim();

  const occ0 =
    Array.isArray(lead.occupations) && lead.occupations.length > 0
      ? lead.occupations[0]
      : undefined;

  const productRaw = normalizeText(lead.product);
  const genderRaw = normalizeText(lead.gender);
  const referralName = normalizeText(lead.referralName);
  const referralCode = normalizeText(lead.referralCode);
  const investmentRangeRaw = normalizeText(lead.investmentRange);
  const isReferralSource = normalizeText(lead.leadSource).toLowerCase() === "referral";

  // Product logic
  const productDisplay =
    valueToLabel(productRaw || undefined, productOptions) || "Not specified";

  const isSIP = productRaw.toUpperCase() === "SIP";
  const isIAP = productRaw.toUpperCase() === "IAP";

  const investmentLabel =
    valueToLabel(investmentRangeRaw || undefined, investmentOptions) || "";
  const hasInvestmentRange = Boolean(investmentRangeRaw);
  const investmentDisplay =
    investmentLabel || (hasInvestmentRange ? investmentRangeRaw : "Not captured");

  const sipAmountValue =
    typeof lead.sipAmount === "number" && Number.isFinite(lead.sipAmount)
      ? lead.sipAmount
      : null;
  const sipDisplay = formatSipAmount(sipAmountValue);

  const genderDisplay = genderRaw ? humanize(genderRaw) : "Not set";

  const ageRaw = lead.age as any;
  const hasAgeField = typeof ageRaw !== "undefined";
  const ageNumber = Number(ageRaw);
  const hasValidAge = hasAgeField && Number.isFinite(ageNumber) && ageNumber > 0;
  const ageDisplay = hasValidAge ? String(Math.round(ageNumber)) : "Not set";

  const displayName =
    lead.name?.trim() ||
    `${(lead.firstName ?? "").trim()} ${(lead.lastName ?? "").trim()}`.trim() ||
    "Unnamed lead";

  const professionRaw = (occ0?.profession as string) ?? lead.profession ?? "";
  const occupationDisplay =
    valueToLabel(professionRaw || undefined, professionOptions) ||
    (professionRaw ? humanize(professionRaw) : "Not set");

  const designationDisplay = String(
    (occ0?.designation ?? lead.designation ?? "Not set") || "Not set",
  );
  const companyNameDisplay = String(
    (occ0?.companyName ?? lead.companyName ?? "Not set") || "Not set",
  );

  // Contact info
  const rawPrimaryPhone =
    lead.mobile ?? lead.phone ?? lead.phoneNormalized ?? null;
  const emailDisplay = lead.email?.trim() || "Not provided";

  const normalizedPhones = useMemo(() => {
    const entries = new Map<
      string,
      { label?: string | null; isWhatsapp?: boolean; isPrimary?: boolean }
    >();

    const add = (
      value?: string | null,
      meta?: { label?: string | null; isWhatsapp?: boolean; isPrimary?: boolean },
    ) => {
      if (!value) return;
      const trimmed = value.toString().trim();
      if (!trimmed) return;
      const existing = entries.get(trimmed);
      entries.set(trimmed, {
        label: meta?.label ?? existing?.label,
        isWhatsapp: meta?.isWhatsapp ?? existing?.isWhatsapp ?? false,
        isPrimary: meta?.isPrimary ?? existing?.isPrimary ?? false,
      });
    };

    add(rawPrimaryPhone, { isPrimary: true });

    if (Array.isArray(lead.phones)) {
      lead.phones.forEach((phone) =>
        add(phone.number, {
          label: phone.label,
          isWhatsapp: phone.isWhatsapp,
          isPrimary: phone.isPrimary,
        }),
      );
    }

    return Array.from(entries).map(([number, meta]) => ({
      number,
      label: meta.label,
      isWhatsapp: meta.isWhatsapp,
      isPrimary: meta.isPrimary,
    }));
  }, [lead.phones, rawPrimaryPhone]);

  const fallbackPhone = rawPrimaryPhone ? String(rawPrimaryPhone).trim() : "";
  const primaryPhoneEntry =
    normalizedPhones.find((phone) => phone.isPrimary) ?? normalizedPhones[0];
  const primaryPhoneNumber = (primaryPhoneEntry?.number ?? fallbackPhone).trim();
  const primaryPhoneDisplay = primaryPhoneNumber || "Not provided";

  const formatPhoneLabel = (phone: { label?: string | null; isWhatsapp?: boolean }) => {
    if (phone.isWhatsapp) return "WhatsApp";
    if (phone.label) return humanize(phone.label);
    return "Mobile";
  };

  const alternativePhones = normalizedPhones
    .filter((phone) => phone.number && phone.number !== primaryPhoneEntry?.number)
    .map((phone) => ({
      number: phone.number,
      label: formatPhoneLabel(phone),
    }));

  const leadSourceDisplay =
    valueToLabel(lead.leadSource ?? undefined, leadOptions) || "Not set";

  const nextFollowUpDisplay = lead.nextActionDueAt
    ? formatDateDisplay(lead.nextActionDueAt)
    : "Not scheduled";

  // Dates / aging
  const enteredOnRaw = lead.createdAt ?? null;
  const leadCapturedOnRaw = lead.approachAt ?? null;

  const agingSourceRaw = lead.updatedAt?.trim() ? lead.updatedAt : enteredOnRaw;
  const agingDaysNum = useMemo(() => {
    if (agingSourceRaw) {
      try {
        const d = parseISO(agingSourceRaw);
        if (isValidDate(d)) {
          return Math.max(0, differenceInCalendarDays(new Date(), d));
        }
      } catch {
        // ignore
      }
    }
    return null;
  }, [agingSourceRaw]);

  const agingDisplay = formatAgingDays(agingDaysNum ?? undefined);

  const lastActivityAt = useMemo(() => {
    const candidates: number[] = [];

    const pushDate = (value?: string | null) => {
      if (!value) return;
      const ts = Date.parse(value);
      if (Number.isFinite(ts)) candidates.push(ts);
    };

    pushDate(lead.lastContactedAt);
    pushDate(lead.lastSeenAt);
    pushDate(lead.updatedAt);

    if (Array.isArray(lead.events)) {
      lead.events.forEach((ev) => pushDate(ev.occurredAt));
    }
    if (Array.isArray(lead.remarks)) {
      lead.remarks.forEach((remark) => pushDate(remark.createdAt));
    }

    if (candidates.length === 0) return null;
    return new Date(Math.max(...candidates)).toISOString();
  }, [lead.events, lead.lastContactedAt, lead.lastSeenAt, lead.updatedAt, lead.remarks]);

  const lastContactRaw = lead.lastContactedAt ?? lastActivityAt;
  const enteredOnDisplay = enteredOnRaw ? formatDateDisplay(enteredOnRaw) : "Not set";
  const lastContactDisplay = lastContactRaw ? formatDateDisplay(lastContactRaw) : "Not set";

  // ---- EDIT MODAL INITIAL VALUES ----

  const coerceClientTypes = (value?: string | string[] | null) => {
    if (!value) return undefined;
    const list = Array.isArray(value) ? value : String(value).split(/[,;]/u);
    const parsed = list
      .map((entry) => String(entry ?? "").trim())
      .filter((entry) => entry.length > 0);
    return parsed.length ? parsed : undefined;
  };

  const modalInitialValues = useMemo((): LeadEditModalValues => {
    let primaryPhone: string | undefined;
    let whatsappPhone: string | undefined;

    if (Array.isArray(lead.phones) && lead.phones.length > 0) {
      const list = lead.phones as any[];
      const primary = list.find((p: any) => Boolean(p.isPrimary));
      const whatsapp = list.find((p: any) => Boolean(p.isWhatsapp));
      primaryPhone = primary?.number ?? undefined;
      whatsappPhone = whatsapp?.number ?? undefined;
    }

    if (!primaryPhone) {
      primaryPhone = lead.phone ?? lead.mobile ?? undefined;
    }

    const selectedPhone = primaryPhone ?? lead.phone ?? "";

    return {
      id: lead.id,
      leadCode: lead.leadCode ?? "",
      leadSource: lead.leadSource ?? "",
      firstName: lead.firstName ?? "",
      lastName: lead.lastName ?? "",
      fullName: lead.name ?? "",
      leadId: lead.id,
      email: lead.email ?? "",
      primaryPhone: primaryPhone ?? "",
      whatsappPhone: whatsappPhone ?? "",
      phone: selectedPhone,
      location: lead.location ?? "",
      profession: (occ0?.profession as any) ?? (lead.profession as any) ?? "",
      designation: (occ0?.designation as any) ?? lead.designation ?? "",
      companyName: (occ0?.companyName as any) ?? lead.companyName ?? "",
      occupations: occ0
        ? [
            {
              profession: (occ0?.profession as any) ?? undefined,
              designation: (occ0?.designation as any) ?? undefined,
              companyName: (occ0?.companyName as any) ?? undefined,
              startedAt: (occ0 as any)?.startedAt ?? undefined,
              endedAt: (occ0 as any)?.endedAt ?? undefined,
            },
          ]
        : undefined,
      product: lead.product ?? "",
      investmentRange: lead.investmentRange ?? "",
      sipAmount: typeof lead.sipAmount === "number" ? lead.sipAmount : "",
      gender: (lead.gender ?? "").toUpperCase(),
      remark: lead.remark ?? "",
      remarks: Array.isArray(lead.remarks)
        ? lead.remarks.map((r) => ({
            text: r?.text ?? "",
            author: r?.author ?? "",
            createdAt: r?.createdAt ?? new Date().toISOString(),
          }))
        : undefined,
      referralName: lead.referralName ?? "",
      leadSourceOther: lead.leadSourceOther ?? "",
      age: lead.age ?? null,
      referralCode: lead.referralCode ?? "",
      bioText: lead.bioText ?? "",
      clientStage: lead.clientStage ?? "",
      stageFilter: lead.stageFilter ?? "",
      clientTypes: coerceClientTypes(lead.clientTypes ?? undefined),
      nextActionDueAt: lead.nextActionDueAt ?? undefined,
    } as LeadEditModalValues;
  }, [lead, occ0]);

  const remarkModal = useModal(false);
  const bioModal = useModal(false);
  const addPhoneModal = useModal(false);

  const [newPhone, setNewPhone] = useState<string>("");
  const [newLabel, setNewLabel] = useState<string>("MOBILE");
  const [newIsWa, setNewIsWa] = useState<boolean>(false);
  const [newMakePrimary, setNewMakePrimary] = useState<boolean>(false);

  const handleEditClick = () => {
    if (!canEditProfile) return;
    setIsEditing(true);
  };

  const handleModalClose = () => setIsEditing(false);

  const handleModalSubmit = async () => {
    await onProfileRefresh?.();
  };

  const handleAddPhone = async () => {
    const number = newPhone.trim();
    if (!number) {
      toast.warn("Enter a phone number");
      return;
    }
    try {
      await mutAddPhone({
        variables: {
          leadId: lead.id,
          input: {
            number,
            label: (newLabel || "MOBILE") as any,
            isWhatsapp: newIsWa,
            isPrimary: isAdmin ? newMakePrimary : false,
          },
        },
      });
      toast.success("Phone added");
      addPhoneModal.closeModal();
      setNewPhone("");
      setNewIsWa(false);
      setNewMakePrimary(false);
      onProfileRefresh?.();
    } catch (e: any) {
      toast.error(e?.message || "Failed to add phone");
    }
  };

  const latestRemarkText = useMemo(() => {
    const list = Array.isArray(lead.remarks) ? lead.remarks : [];
    const ts = (s?: string | null) => {
      const t = s ? Date.parse(s) : NaN;
      return Number.isFinite(t) ? t : 0;
    };
    if (list && list.length > 0) {
      const sorted = list.slice().sort((a, b) => ts(b.createdAt) - ts(a.createdAt));
      return (sorted[0]?.text ?? "").toString();
    }
    const raw: any = (lead as any).remark;
    if (raw && typeof raw === "object") {
      if (typeof raw.text === "string") return raw.text;
      try {
        return JSON.stringify(raw, null, 2);
      } catch {
        return String(raw);
      }
    }
    return (raw ?? "").toString();
  }, [lead.remarks, lead.remark]);

  const remarksModalBody = useMemo(() => {
    const list = Array.isArray(lead.remarks) ? lead.remarks : [];
    const ts = (s?: string | null) => {
      const t = s ? Date.parse(s) : NaN;
      return Number.isFinite(t) ? t : 0;
    };
    if (list && list.length > 0) {
      const sorted = list.slice().sort((a, b) => ts(b.createdAt) - ts(a.createdAt));
      return sorted
        .map((r) => {
          const dt = r.createdAt ? formatDateDisplay(r.createdAt) : "";
          const by = r.author ? ` — ${r.author}` : "";
          const header = [dt, by].filter(Boolean).join("");
          return header ? `${r.text}\n${header}` : r.text;
        })
        .join("\n\n");
    }
    return (lead.remark ?? "").toString();
  }, [lead.remarks, lead.remark]);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-400 dark:text-white/40">
        Loading lead profile...
      </div>
    );
  }

  return (
    <>
      <div className="card rounded-2xl shadow-lg">
        {/* 3 equal columns so gaps are symmetric */}
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
          {/* Col 1: Profile */}
          <div className="lg:col-span-1">
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-gray-100 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-lg font-semibold text-emerald-700 transition-colors dark:bg-emerald-400/20 dark:text-emerald-100">
                    {initials(lead.name)}
                  </div>
                  {canEditProfile && (
                    <button
                      type="button"
                      onClick={handleEditClick}
                      disabled={loading}
                      aria-label="Edit lead details"
                      title="Edit lead details"
                      className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-75 dark:border-gray-800"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex-grow">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-white/70">
                    {lead.leadCode ?? "No code"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-500 dark:text-white/60">
                <div className="flex items-center gap-3">
                  <span className="w-24 flex-shrink-0 font-semibold text-gray-600 dark:text-gray-400">
                    Mobile
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {primaryPhoneDisplay}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 flex-shrink-0">Gender</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {genderDisplay}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 flex-shrink-0">Age</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {ageDisplay}
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={addPhoneModal.openModal}
                  disabled={!canEditProfile}
                  className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200"
                >
                  Add phone
                </button>
              </div>
            </div>
          </div>

          {/* Col 2: Contact & details */}
          <div className="space-y-4 lg:col-span-1">
            {/* Email + Product card */}
            <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/[0.03]">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/60">
                    Email
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                    {emailDisplay}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/60">
                    Location
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                    {lead.location ?? "Not set"}
                  </span>
                </div>
              </div>

              {/* Product + conditional fields */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/60">
                    Product
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                    {productDisplay}
                  </span>
                </div>

                {isIAP && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/60">
                      Investment range
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                      {investmentDisplay}
                    </span>
                  </div>
                )}

                {isSIP && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/60">
                      SIP amount
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                      {sipDisplay}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Alt numbers */}
            <div className="rounded-2xl bg-white/70 p-4 text-sm text-gray-500 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/60">
                Alternative mobile numbers
              </p>
              {alternativePhones.length ? (
                <div className="mt-3 space-y-2 text-sm font-semibold text-gray-900 dark:text-white">
                  {alternativePhones.map((phone) => (
                    <div
                      key={phone.number}
                      className="flex items-center justify-between gap-4"
                    >
                      <span>{phone.label}</span>
                      <span className="text-right">{phone.number}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-400">Not provided</p>
              )}
            </div>

            {/* Occupation moved below alt numbers */}
            <div className="rounded-2xl bg-white/70 p-4 text-xs dark:bg-white/[0.03]">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/60">
                Occupation
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-white/60">Profession</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {occupationDisplay}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-white/60">Designation</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {designationDisplay}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-white/60">Company name</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {companyNameDisplay}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Lead meta */}
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-2xl border border-gray-100 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/60">
                    Lead source
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {leadSourceDisplay}
                  </p>
                </div>
                <LeadStatusBadge status={headerStatus} size="md" />
              </div>

              {isReferralSource && (
                <div className="mt-3 space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Referral name</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {referralName || "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Referral code</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {referralCode || "Not set"}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-3 space-y-3 text-sm text-gray-500">
                <div className="flex items-center justify-between gap-6">
                  <span>Lead Gen.on</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    {enteredOnDisplay}
                  </span>
                </div>
                {leadCapturedOnRaw && (
                  <div className="flex items-center justify-between gap-6">
                    <span>Lead Appr.on</span>
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      {formatDateDisplay(leadCapturedOnRaw)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-3 text-sm text-gray-500">
                <div className="flex items-center justify-between gap-6">
                  <span>Aging days</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    {agingDisplay}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span>Last contact</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    {lastContactDisplay}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-3 text-sm text-gray-500">
                <div className="flex items-center justify-between gap-6">
                  <span>Stage</span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-base font-semibold ${stageDisplay.pillClass}`}
                  >
                    <StageIcon state={stageDisplay.state} className="h-4 w-4" />
                    {stageDisplay.label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span>Status</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    {headerStatus ? humanize(headerStatus) : "Not set"}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-6 text-sm text-gray-500">
                <span>Next follow-up</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {nextFollowUpDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio row */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
          <HoverPreviewCard
            label="Bio"
            text={lead.bioText ?? ""}
            onViewMore={bioModal.openModal}
          />
        </div>
      </div>

      {/* MODALS */}
      <RemarkBioModal
        title="Lead remark"
        isOpen={remarkModal.isOpen}
        onClose={remarkModal.closeModal}
        body={remarksModalBody || "No remark added yet."}
      />
      <RemarkBioModal
        title="Lead bio"
        isOpen={bioModal.isOpen}
        onClose={bioModal.closeModal}
        body={lead.bioText ?? "No bio added yet."}
      />
      <LeadEditModal
        isOpen={isEditing}
        onClose={handleModalClose}
        initial={modalInitialValues}
        onSubmit={handleModalSubmit}
        title="Edit lead details"
      />

      <Modal
        isOpen={addPhoneModal.isOpen}
        onClose={addPhoneModal.closeModal}
        className="m-4 max-w-[560px]"
      >
        <div className="space-y-3 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add phone</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="form-label">Phone number</label>
              <input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Enter number"
                className="form-input"
                inputMode="tel"
              />
            </div>
            <div>
              <label className="form-label">Label</label>
              <select
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="form-select"
              >
                <option value="MOBILE">Mobile</option>
                <option value="HOME">Home</option>
                <option value="WORK">Work</option>
                <option value="WHATSAPP">Whatsapp</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newIsWa}
                onChange={(e) => setNewIsWa(e.target.checked)}
              />
              Whatsapp
            </label>
            <label className="inline-flex items-center gap-2 text-sm opacity-100">
              <input
                type="checkbox"
                checked={newMakePrimary && isAdmin}
                onChange={(e) => setNewMakePrimary(e.target.checked)}
                disabled={!isAdmin}
              />
              Set as primary {isAdmin ? "" : "(admin only)"}
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={addPhoneModal.closeModal}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddPhone}
              disabled={addingPhone}
              className="btn btn-success"
            >
              {addingPhone ? "Saving..." : "Add phone"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function StageIcon({ state, className }: { state: string; className: string }) {
  if (state === "pending") return <Clock3 className={className} />;
  if (state === "revisit") return <RefreshCcw className={className} />;
  return <CheckCircle2 className={className} />;
}
