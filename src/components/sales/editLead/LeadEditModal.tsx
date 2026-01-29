import { useEffect, useMemo, useRef, useState, type ReactNode, type FormEvent } from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import { useMutation } from "@apollo/client";
import Label from "../../form/Label";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";
import { Edit3, NotebookPen, Clock3, UserRound, BriefcaseBusiness, Flag } from "lucide-react";

import { UPDATE_LEAD_DETAILS } from "./update_gql/update_lead.gql";
import { useAuth } from "@/context/authContext";
import {
  UPDATE_LEAD_BIO,
  CHANGE_STAGE,
  UPDATE_LEAD_REMARK,
} from "@/components/sales/view_lead/gql/view_lead.gql";
import {
  LEAD_INTERACTION_HISTORY,
  UPDATE_LEAD_REMARK_WITH_INTERACTION,
} from "@/components/sales/view_lead/gql/leadInteraction.gql";
import { valueToLabel, productOptions, investmentOptions } from "@/components/lead/types";
import {
  genderOptions,
  professionOptions,
  leadOptions,
  titleCaseWords,
  LEAD_PIPELINE_STAGES,
  STAGE_FILTER_OPTIONS,
} from "@/components/sales/editLead/types/editmodel";

import type { LeadShape } from "../../ui/lead/Validators";
import type { LeadPhone } from "../view_lead/interface/types";

type OptionalExtras = Partial<{
  leadSourceOther: string | null;
  referralName: string | null;
  assignedRM: string | null;
  age: number | null;
  referralCode: string | null;
  bioText: string | null;
}>;

export type LeadEditModalValues = Partial<LeadShape & OptionalExtras> & {
  fullName?: string;
  name?: string | null;
  leadCode?: string | null;
  clientStage?: string | null;
  stageFilter?: string | null;
  nextActionDueAt?: string | null;
  occupations?: Array<{
    profession?: string;
    companyName?: string;
    designation?: string;
    startedAt?: string | Date;
    endedAt?: string | Date;
  }>;
  phones?: PhoneDraft[];
  id?: string;
  leadId?: string;
};

type PhoneDraft = {
  id?: string;
  localId?: string;
  number: string;
  label: string;
  isPrimary: boolean;
  isWhatsapp: boolean;
  normalized?: string | null;
};

type LeadEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initial?: LeadEditModalValues;
  onSubmit: (values: LeadEditModalValues) => Promise<void> | void;
  saving?: boolean;
  title?: string;
};

const INPUT =
  "mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:placeholder:text-white/40";

const formatForDatetimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(date.getTime() - offsetMs);
  return localDate.toISOString().slice(0, 16);
};

const toIsoString = (value?: string | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const DEFAULT_PHONE_LABEL = "MOBILE";

const normalizePhoneDrafts = (
  initialPhones: PhoneDraft[] | undefined,
  fallbackPrimary?: string | null,
): PhoneDraft[] => {
  const rows: PhoneDraft[] = [];
  const seenKeys = new Set<string>();
  const seenNumbers = new Set<string>();
  const genLocalId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const add = (phone?: Partial<PhoneDraft> | null, meta?: Partial<PhoneDraft>) => {
    const number = String(phone?.number ?? "").trim();
    if (!number) return;
    const normalizedNum = number.replace(/\s+/g, "");
    const key = (phone?.id ?? phone?.localId ?? number).toString();
    if (seenKeys.has(key) || seenNumbers.has(normalizedNum)) return;
    seenKeys.add(key);
    seenNumbers.add(normalizedNum);
    rows.push({
      id: phone?.id,
      localId: phone?.localId ?? (phone?.id ? `persisted-${phone.id}` : genLocalId()),
      number,
      normalized: phone?.normalized,
      label: phone?.label ?? meta?.label ?? DEFAULT_PHONE_LABEL,
      isPrimary: Boolean(phone?.isPrimary ?? meta?.isPrimary),
      isWhatsapp: Boolean(phone?.isWhatsapp ?? meta?.isWhatsapp),
    });
  };

  (initialPhones ?? []).forEach((p) => add(p));

  if (rows.length === 0) {
    const fallback = String(fallbackPrimary ?? "").trim();
    if (fallback) add({ number: fallback, isPrimary: true, label: DEFAULT_PHONE_LABEL });
  }

  if (!rows.length) {
    rows.push({
      localId: genLocalId(),
      number: "",
      label: DEFAULT_PHONE_LABEL,
      isPrimary: true,
      isWhatsapp: false,
    });
  }

  let primarySeen = false;
  const normalized = rows.map((row, idx) => {
    if (row.isPrimary && !primarySeen) {
      primarySeen = true;
      return row;
    }
    if (row.isPrimary && primarySeen) {
      return { ...row, isPrimary: false };
    }
    return row;
  });
  if (!primarySeen && normalized.length) {
    normalized[0] = { ...normalized[0], isPrimary: true };
  }
  return normalized;
};

export default function LeadEditModal({
  isOpen,
  onClose,
  initial = {},
  onSubmit,
  saving = false,
  title = "Edit lead details",
}: LeadEditModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [form, setForm] = useState<LeadEditModalValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstRef = useRef<HTMLInputElement | null>(null);
  const [mutUpdate, { loading: mutating }] = useMutation(UPDATE_LEAD_DETAILS);
  const [mutBio, { loading: bioSaving }] = useMutation(UPDATE_LEAD_BIO);
  const [mutStage, { loading: stageUpdating }] = useMutation(CHANGE_STAGE);
  const [mutRemark, { loading: remarkUpdating }] = useMutation(UPDATE_LEAD_REMARK);
  const [mutRemarkWithInteraction, { loading: remarkTimelineUpdating }] = useMutation(
    UPDATE_LEAD_REMARK_WITH_INTERACTION
  );
  const [remarkDraft, setRemarkDraft] = useState("");
  const [latestRemarkLocal, setLatestRemarkLocal] = useState<any | null>(null);
  const [phones, setPhones] = useState<PhoneDraft[]>([]);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const primaryPhoneDisplay = useMemo(() => {
    const topLevel = String((form as any)?.phone ?? "").trim();
    if (topLevel) return topLevel;
    const primary = phones.find((p) => Boolean(p.isPrimary) && String(p.number ?? "").trim());
    if (primary?.number) return primary.number;
    const firstFilled = phones.find((p) => String(p.number ?? "").trim().length > 0);
    return firstFilled?.number ?? "";
  }, [form, phones]);

  const setPhonesSynced = (updater: (prev: PhoneDraft[]) => PhoneDraft[]) => {
    setPhones((prev) => {
      const next = ensurePrimary(updater(prev));
      setForm((f) => ({ ...(f ?? {}), phones: next }));
      return next;
    });
  };

  const ensurePrimary = (list: PhoneDraft[]) => {
    let primarySeen = false;
    const normalized = list.map((row) => {
      const isPrimary = Boolean(row.isPrimary);
      if (isPrimary && !primarySeen) {
        primarySeen = true;
        return row;
      }
      return { ...row, isPrimary: false };
    });
    if (!primarySeen && normalized.length) {
      normalized[0] = { ...normalized[0], isPrimary: true };
    }
    return normalized;
  };

  const handlePhoneChange = (index: number, patch: Partial<PhoneDraft>) => {
    setPhonesSynced((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const handlePrimaryChange = (index: number) => {
    setPhonesSynced((prev) => prev.map((row, i) => ({ ...row, isPrimary: i === index })));
  };

  const requestRemovePhone = (index: number) => {
    if (phones.length <= 1) return;
    setPendingDeleteIndex(index);
  };

  const commitRemovePhone = () => {
    if (pendingDeleteIndex === null) return;
    setPhonesSynced((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== pendingDeleteIndex);
      return next.length
        ? next
        : [{ number: "", label: DEFAULT_PHONE_LABEL, isPrimary: true, isWhatsapp: false, localId: `local-fallback-${Date.now()}` }];
    });
    setPendingDeleteIndex(null);
  };

  const cancelRemovePhone = () => setPendingDeleteIndex(null);

  const handleAddPhoneRow = () => {
    setPhonesSynced((prev) => [
      ...prev,
      {
        localId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        id: undefined,
        number: "",
        label: DEFAULT_PHONE_LABEL,
        isPrimary: prev.length === 0,
        isWhatsapp: false,
      },
    ]);
  };

  const leadIdFromUrl = useMemo(() => {
    try {
      const m = typeof window !== "undefined" ? window.location.pathname.match(/leads\/(\w+)/i) : null;
      return m?.[1];
    } catch {
      return undefined;
    }
  }, []);

  const leadSourceLabel = useMemo(() => {
    const raw = String(form.leadSource ?? "");
    if (!raw) return "Not captured";
    if (raw.toLowerCase() === "others") {
      const other = String(form.leadSourceOther ?? initial.leadSourceOther ?? "Others");
      return titleCaseWords(other);
    }
    if (raw.toLowerCase() === "referral" || raw.toLowerCase() === "referred") {
      const refName = String(form.referralName ?? initial.referralName ?? "");
      return refName ? `Referral - ${titleCaseWords(refName)}` : "Referral";
    }
    return valueToLabel(raw, leadOptions) || raw;
  }, [form.leadSource, form.leadSourceOther, form.referralName, initial.leadSourceOther, initial.referralName]);

  const latestRemark = useMemo(() => {
    if (latestRemarkLocal) return latestRemarkLocal;
    const list = Array.isArray((initial as any)?.remarks) ? [...((initial as any).remarks as any[])] : [];
    list.sort((a, b) => Date.parse(String(b?.createdAt || "")) - Date.parse(String(a?.createdAt || "")));
    if (list.length > 0) return list[0];

    const fallbackText = (initial as any)?.remark;
    if (fallbackText) {
      return {
        text: fallbackText,
        author: (initial as any)?.remarks?.[0]?.author ?? (initial as any)?.updatedBy ?? "Unknown",
        createdAt: (initial as any)?.updatedAt ?? new Date().toISOString(),
      };
    }
    return null;
  }, [initial, latestRemarkLocal]);

  const latestRemarkRelative = useMemo(() => {
    if (!latestRemark?.createdAt) return null;
    const ts = Date.parse(latestRemark.createdAt);
    if (!Number.isFinite(ts)) return null;
    return formatDistanceToNow(new Date(ts), { addSuffix: true });
  }, [latestRemark]);

  useEffect(() => {
    if (!isOpen) return;
    const next: LeadEditModalValues = { ...(initial || {}) };
    // Normalize occupations: if missing but legacy fields exist, map to one occupation
    const hasLegacyOcc = next.profession || next.companyName || next.designation;
    if (!next.occupations && hasLegacyOcc) {
      next.occupations = [
        {
          profession: next.profession,
          companyName: next.companyName,
          designation: next.designation,
        },
      ];
    }
    const normalizedPhones = normalizePhoneDrafts(
      (initial as any)?.phones as PhoneDraft[] | undefined,
      (initial as any)?.primaryPhone ?? (initial as any)?.phone ?? null,
    );
    next.phones = normalizedPhones;
    setPhones(normalizedPhones);
    setForm(next);
    setErrors({});
    setRemarkDraft("");
    setTimeout(() => firstRef.current?.focus(), 0);
  }, [isOpen, initial]);

  const handle = (k: keyof LeadEditModalValues, v: unknown) => {
    setForm((prev) => ({ ...(prev ?? {}), [k]: v }));
  };

  const stageOptions = useMemo(() => {
    const currentStage = String((form as any).clientStage ?? (initial as any)?.clientStage ?? "").toUpperCase();
    return !currentStage || currentStage === "NEW_LEAD" || currentStage === "FIRST_TALK_DONE"
      ? LEAD_PIPELINE_STAGES
      : LEAD_PIPELINE_STAGES.filter((s) => s !== "NEW_LEAD" && s !== "FIRST_TALK_DONE");
  }, [form.clientStage, initial]);

  const productValue = String((form as any).product ?? "");
  const productUpper = productValue.trim().toUpperCase();
  const showIapFields = productUpper === "IAP";
  const showSipFields = productUpper === "SIP";

  const isSaving = saving || mutating || stageUpdating || bioSaving || remarkUpdating || remarkTimelineUpdating;

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const nameOrFirst = String((form as any).name ?? form.firstName ?? "").trim();
    if (!nameOrFirst) nextErrors.name = "Name is required";

    // Age: optional, must be a number between 0 and 120
    const ageRaw = String(form.age ?? "").trim();
    if (ageRaw) {
      const n = Number(ageRaw);
      if (Number.isNaN(n) || n < 0 || n > 120) {
        nextErrors.age = "Enter a valid age (0-120)";
      }
    }

    // Occupation rules similar to lead entry
    const occ = form.occupations && form.occupations[0];
    const prof = String(occ?.profession ?? form.profession ?? "").trim();
    const company = String(occ?.companyName ?? form.companyName ?? "").trim();
    const desig = String(occ?.designation ?? form.designation ?? "").trim();
    if (prof === "SELF_EMPLOYED" && !desig) {
      nextErrors.designation = "Designation is required for self-employed";
    }
    if ((prof === "BUSINESS" || prof === "EMPLOYEE") && !company) {
      nextErrors.companyName = "Company is required for business/employee";
    }

    // Product-specific validation
    const productRaw = String((form as any).product ?? "").trim().toUpperCase();
    const investmentRangeRaw = String((form as any).investmentRange ?? "").trim();
    const sipAmountRaw = String((form as any).sipAmount ?? "").trim();
    if (productRaw === "IAP" && !investmentRangeRaw) {
      nextErrors.investmentRange = "Select investment range for IAP";
    }
    if (productRaw === "SIP") {
      const sipNum = Number(sipAmountRaw);
      if (!sipAmountRaw || Number.isNaN(sipNum) || sipNum <= 0) {
        nextErrors.sipAmount = "Enter a valid SIP amount";
      }
    }

    const phonePattern = /^[0-9+\-\s()]{8,}$/;
    const filledPhones = (phones || [])
      .map((p) => ({ ...p, number: String(p.number ?? "").trim() }))
      .filter((p) => p.number.length > 0);
    const invalidPhone = filledPhones.find((p) => !phonePattern.test(p.number));
    if (invalidPhone) {
      nextErrors.phones = "Enter a valid phone number (min 8 digits)";
    }
    if (filledPhones.length > 0 && !filledPhones.some((p) => p.isPrimary)) {
      nextErrors.phones = nextErrors.phones ?? "Mark one phone as primary";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const normalize = (s: unknown) => {
      const t = String(s ?? "").trim();
      return t.length ? t : null;
    };

    const payload: any = {
      ...form,
      name: normalize((form as any).name ?? `${form.firstName ?? ""} ${form.lastName ?? ""}`) ?? undefined,
      firstName: normalize(form.firstName) ?? undefined,
      lastName: normalize(form.lastName) ?? undefined,
      location: normalize(form.location) ?? undefined,
      gender: normalize(form.gender) ?? undefined,
      age: ((): number | undefined => {
        const av: any = (form as any).age;
        if (av === null || av === undefined || String(av) === "") return undefined;
        const n = Number(av);
        return Number.isFinite(n) ? n : undefined;
      })(),
      bioText: normalize((form as any).bioText) ?? undefined,
      occupations:
        (form.occupations && form.occupations.length)
          ? form.occupations.map((o) => ({
            profession: normalize(o.profession) ?? undefined,
            companyName: normalize(o.companyName) ?? undefined,
            designation: normalize(o.designation) ?? undefined,
            startedAt: o.startedAt ? new Date(o.startedAt as any).toISOString() : undefined,
            endedAt: o.endedAt ? new Date(o.endedAt as any).toISOString() : undefined,
          }))
          : [
            {
              profession: normalize(form.profession) ?? undefined,
              companyName: normalize(form.companyName) ?? undefined,
              designation: normalize(form.designation) ?? undefined,
            },
          ],
    };

    const cleanedPhones = ensurePrimary(
      (phones.length ? phones : (form.phones as PhoneDraft[] | undefined) || []).map((p) => ({
        ...p,
        number: String(p.number ?? "").trim(),
      })),
    );
    const phoneInputs = cleanedPhones
      .map((p) => ({
        id: p.id,
        number: p.number,
        label: (p.label || DEFAULT_PHONE_LABEL) as any,
        isPrimary: Boolean(p.isPrimary),
        isWhatsapp: Boolean(p.isWhatsapp),
      }))
      .filter((p) => p.number.length > 0);
    const primaryPhoneInput = phoneInputs.find((p) => p.isPrimary)?.number;
    // Top-level phone is admin-only; RMs should not update it
    const topLevelPhone = isAdmin
      ? normalize((form as any).phone ?? primaryPhoneInput ?? (initial as any)?.phone) ?? undefined
      : undefined;

    const input: any = {
      leadId: (initial as any).id ?? (initial as any).leadId ?? leadIdFromUrl,
      name: (payload as any).name,
      firstName: payload.firstName,
      lastName: payload.lastName,
      location: payload.location,
      gender: payload.gender,
      age: payload.age ?? undefined,
      occupations: payload.occupations,
      bioText: payload.bioText,
      email: normalize((form as any).email) ?? undefined,
      phone: topLevelPhone,
      phones: phoneInputs,
      product: normalize((form as any).product) ?? undefined,
      investmentRange: (() => {
        const productRaw = String((form as any).product ?? "").trim().toUpperCase();
        if (productRaw !== "IAP") return undefined;
        return normalize((form as any).investmentRange) ?? undefined;
      })(),
      sipAmount: (() => {
        const productRaw = String((form as any).product ?? "").trim().toUpperCase();
        if (productRaw !== "SIP") return undefined;
        const sv = String((form as any).sipAmount ?? "").trim();
        if (!sv) return undefined;
        const n = Number(sv);
        return Number.isFinite(n) ? n : undefined;
      })(),
      referralCode: normalize((form as any).referralCode) ?? undefined,
      referralName: normalize((form as any).referralName) ?? undefined,
      stageFilter: normalize((form as any).stageFilter) ?? undefined,
      nextActionDueAt: toIsoString(String((form as any).nextActionDueAt ?? "")) ?? undefined,
      permAddress: normalize(form.permAddress) ?? undefined,
      acOpeningDate: toIsoString(String(form.acOpeningDate ?? "")) ?? undefined,
      tradeNumber: normalize(form.tradeConfirmationNo) ?? undefined,
    };

    try {
      Object.keys(input).forEach((k) => input[k] === undefined && delete input[k]);
      if (!input.leadId) throw new Error("Missing leadId for update");

      await mutUpdate({ variables: { input } });

      // Update stage if changed
      const nextStage = String((form as any).clientStage ?? '').trim();
      const prevStage = String((initial as any)?.clientStage ?? '').trim();
      const stageLeadId = input.leadId;
      if (nextStage && nextStage !== prevStage && stageLeadId) {
        await mutStage({ variables: { input: { leadId: stageLeadId, stage: nextStage } } });
      }

      const leadId = input.leadId;
      const nextBio = String(payload.bioText ?? "").trim();
      const prevBio = String((initial as any)?.bioText ?? "").trim();
      if (nextBio !== prevBio) {
        // Capture bio updated timestamp
        const bioUpdatedAt = new Date().toISOString();
        await mutBio({ variables: { input: { leadId, bioText: nextBio } } });
        // Store bio update timestamp in local state/cache for UI reflection
        toast.info(`Bio updated at ${new Date(bioUpdatedAt).toLocaleString()}`);
      }

      const trimmedRemark = remarkDraft.trim();
      if (trimmedRemark && leadId) {
        const authorName = user?.name ?? "Unknown";
        const authorId = user?.id ?? null;
        const nowIso = new Date().toISOString();

        try {
          console.log("Saving remark:", { leadId, remark: trimmedRemark, authorName, authorId });

          // Primary mutation: Update remark with interaction tracking
          const remarkResult = await mutRemarkWithInteraction({
            variables: {
              input: {
                leadId,
                remark: trimmedRemark,
                nextActionDueAt: input.nextActionDueAt ?? undefined,
                createInteractionEvent: true,
              },
            },
            refetchQueries: [
              "LeadInteractionHistory",
              "LeadDetailWithTimeline",
            ],
            awaitRefetchQueries: true,
          });

          console.log("Remark mutation result:", remarkResult);

          // Backup: Also save via basic remark mutation
          await mutRemark({
            variables: {
              input: {
                leadId,
                remark: trimmedRemark,
                ...(authorId && authorName ? { authorId, authorName } : {}),
              },
            },
            refetchQueries: ["LeadDetailWithTimeline"],
            awaitRefetchQueries: false,
          });

          // Update local UI state for immediate feedback
          setLatestRemarkLocal({
            text: trimmedRemark,
            author: authorName,
            authorId,
            createdAt: nowIso,
            updatedAt: nowIso,
          });

          toast.success("Remark saved successfully!");
          console.log("Remark saved, local state updated");
        } catch (remarkErr: any) {
          console.error("Failed to save remark:", remarkErr);
          toast.error(remarkErr?.message || "Failed to save remark");
          throw remarkErr;
        }
      }

      toast.success("Lead details updated successfully!");

      // Clear remark draft
      setRemarkDraft("");

      // Call parent onSubmit to trigger refetch
      try {
        await onSubmit?.(payload);
        // Give server a moment to process before refetching
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (submitErr) {
        console.error("onSubmit error:", submitErr);
      }

      // Close modal
      onClose();
    } catch (err: any) {
      const networkResult = (err?.networkError as any)?.result;
      const networkErrors = Array.isArray(networkResult?.errors)
        ? networkResult.errors.map((e: any) => e?.message).filter(Boolean)
        : [];
      const gqlErrors = Array.isArray(err?.graphQLErrors)
        ? err.graphQLErrors.map((e: any) => e?.message).filter(Boolean)
        : [];
      const message = [...gqlErrors, ...networkErrors].filter(Boolean).join("; ");
      console.error("Lead update failed", {
        err,
        gqlErrors,
        networkErrors,
        networkResult,
        variables: { input },
      });
      toast.error(message || err?.message || "Failed to update lead");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-screen-lg w-full p-4">
      <form onSubmit={submit} className="relative flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-gray-900">
        <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/90 via-white/90 to-white/90 px-6 py-4 backdrop-blur dark:border-white/10 dark:from-indigo-500/10 dark:via-gray-900/80 dark:to-gray-900/80">
          <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 shadow-sm dark:bg-indigo-500/30 dark:text-white">
            <Edit3 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">{title}</h4>
            <p className="text-sm text-gray-500 dark:text-white/50">
              Update contact, profiling and opportunity details. Notes saved here also appear in the Activity Timeline.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 dark:border-white/10 dark:text-white/70">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Changes auto-sync
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[72vh] space-y-5">
          <div className="grid gap-3 rounded-3xl border border-gray-100 bg-white/70 p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-2">
            <InfoTile label="Lead code" value={String((form as any).leadCode ?? "Not generated")} />
            <InfoTile label="Lead source" value={leadSourceLabel} />
          </div>

          <SectionCard
            title="Identity & Contact"
            description="Keep the core contact information up to date."
            icon={<UserRound className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="First name" error={errors.name}>
                <input
                  className={INPUT}
                  value={String(form.firstName ?? "")}
                  onChange={(e) => handle("firstName", e.target.value)}
                  placeholder="First name"
                  ref={firstRef}
                />
              </Field>
              <Field label="Last name">
                <input
                  className={INPUT}
                  value={String(form.lastName ?? "")}
                  onChange={(e) => handle("lastName", e.target.value)}
                  placeholder="Last name"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Email">
                <input
                  className={INPUT}
                  value={String((form as any).email ?? "")}
                  onChange={(e) => (handle as any)("email", e.target.value)}
                  placeholder="email@example.com"
                />
              </Field>
              <Field label="Location">
                <input
                  className={INPUT}
                  value={String(form.location ?? "")}
                  onChange={(e) => handle("location", e.target.value)}
                  placeholder="City / Area"
                />
              </Field>
            </div>

            <Field label="Permanent Address">
              <textarea
                rows={2}
                className={INPUT + " resize-none"}
                value={String(form.permAddress ?? "")}
                onChange={(e) => handle("permAddress", e.target.value)}
                placeholder="Full permanent address..."
              />
            </Field>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field
                label={isAdmin ? "Primary phone (admin only)" : "Primary phone (read-only)"}
              >
                {isAdmin ? (
                  <input
                    className={INPUT}
                    value={String((form as any)?.phone ?? primaryPhoneDisplay ?? "")}
                    onChange={(e) => (handle as any)("phone", e.target.value)}
                    placeholder="Primary phone (admin controls)"
                  />
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70">
                    <span>{primaryPhoneDisplay || "Not set"}</span>
                    <span className="text-[11px] text-gray-400">Read-only</span>
                  </div>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Gender">
                <select className={INPUT} value={String(form.gender ?? "")} onChange={(e) => handle("gender", e.target.value)}>
                  <option value="">Select gender</option>
                  {genderOptions.map((o: any) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Age" error={errors.age}>
                <input
                  className={INPUT}
                  value={String(form.age ?? "")}
                  onChange={(e) => handle("age", e.target.value)}
                  placeholder="Optional"
                  inputMode="numeric"
                />
              </Field>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label className="text-xs font-semibold text-gray-700 dark:text-white/70">
                    Phone numbers
                  </Label>
                  <p className="text-[11px] text-gray-500 dark:text-white/50">
                    Set the primary contact and manage alternative/WhatsApp numbers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPhoneRow}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-300"
                >
                  + Add number
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {phones.map((phone, idx) => (
                  <div
                    key={phone.id ?? phone.localId ?? `${idx}-phone`}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-end"
                  >
                    <div className="sm:col-span-4">
                      <Label className="text-[11px] text-gray-600 dark:text-white/60">Number</Label>
                      <input
                        className={INPUT}
                        value={phone.number ?? ""}
                        onChange={(e) => handlePhoneChange(idx, { number: e.target.value })}
                        placeholder="Enter phone"
                        inputMode="tel"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label className="text-[11px] text-gray-600 dark:text-white/60">Label</Label>
                      <select
                        className={INPUT}
                        value={phone.label ?? DEFAULT_PHONE_LABEL}
                        onChange={(e) => handlePhoneChange(idx, { label: e.target.value })}
                      >
                        <option value="MOBILE">Mobile</option>
                        <option value="HOME">Home</option>
                        <option value="WORK">Work</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="sm:col-span-4">
                      <Label className="text-[11px] text-gray-600 dark:text-white/60">Flags</Label>
                      <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(phone.isPrimary)}
                            onChange={() => handlePrimaryChange(idx)}
                          />
                          Primary
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(phone.isWhatsapp)}
                            onChange={(e) => handlePhoneChange(idx, { isWhatsapp: e.target.checked })}
                          />
                          WhatsApp
                        </label>
                      </div>
                    </div>
                    <div className="sm:col-span-1 flex items-center justify-end">
                      {phones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => requestRemovePhone(idx)}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {errors.phones && (
                <p className="mt-2 text-xs font-semibold text-rose-500">{errors.phones}</p>
              )}
            </div>
          </SectionCard>

          {/* Delete phone confirmation */}
          <Modal
            isOpen={pendingDeleteIndex !== null}
            onClose={cancelRemovePhone}
            className="max-w-sm"
          >
            <div className="space-y-4 p-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Remove number?</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-white/70">
                  {(() => {
                    const target = pendingDeleteIndex !== null ? phones[pendingDeleteIndex] : null;
                    const label = String(target?.number ?? "").trim();
                    return label
                      ? `Are you sure you want to delete ${label} from this lead?`
                      : "Are you sure you want to delete this phone from this lead?";
                  })()}
                </p>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  className="text-gray-700 hover:text-gray-900 dark:text-white/80"
                  onClick={cancelRemovePhone}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="border-rose-200 text-rose-600 ring-rose-200 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-200 dark:hover:bg-rose-900/30"
                  onClick={commitRemovePhone}
                >
                  Yes, remove
                </Button>
              </div>
            </div>
          </Modal>

          <SectionCard
            title="Professional Snapshot"
            description="Capture what the lead does so every RM has context."
            icon={<BriefcaseBusiness className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <Field label="Profession">
                <select
                  className={INPUT}
                  value={String((form.occupations?.[0]?.profession ?? form.profession) ?? "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => {
                      const occ = [...(prev.occupations ?? [{}])];
                      if (!occ.length) occ.push({});
                      occ[0] = { ...(occ[0] ?? {}), profession: val };
                      return { ...(prev ?? {}), occupations: occ, profession: val };
                    });
                  }}
                >
                  <option value="">Select profession</option>
                  {professionOptions.map((o: any) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Designation" error={errors.designation}>
                <input
                  className={INPUT}
                  value={String((form.occupations?.[0]?.designation ?? form.designation) ?? "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => {
                      const occ = [...(prev.occupations ?? [{}])];
                      if (!occ.length) occ.push({});
                      occ[0] = { ...(occ[0] ?? {}), designation: val };
                      return { ...(prev ?? {}), occupations: occ, designation: val };
                    });
                  }}
                  placeholder="Optional"
                />
              </Field>
              <Field label="Company / Organisation" error={errors.companyName}>
                <input
                  className={INPUT}
                  value={String((form.occupations?.[0]?.companyName ?? form.companyName) ?? "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => {
                      const occ = [...(prev.occupations ?? [{}])];
                      if (!occ.length) occ.push({});
                      occ[0] = { ...(occ[0] ?? {}), companyName: val };
                      return { ...(prev ?? {}), occupations: occ, companyName: val };
                    });
                  }}
                  placeholder="Optional"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <Field label="Product" error={errors.product}>
                <select
                  className={INPUT}
                  value={productValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => ({
                      ...(prev ?? {}),
                      product: val,
                      // reset dependent fields
                      investmentRange: val.toUpperCase() === "IAP" ? (prev as any)?.investmentRange ?? "" : "",
                      sipAmount: val.toUpperCase() === "SIP" ? (prev as any)?.sipAmount ?? "" : "",
                    }));
                  }}
                >
                  <option value="">Select product</option>
                  {productOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              {showIapFields && (
                <Field label="Investment range" error={errors.investmentRange}>
                  <select
                    className={INPUT}
                    value={String((form as any).investmentRange ?? "")}
                    onChange={(e) => (handle as any)("investmentRange", e.target.value)}
                  >
                    <option value="">Select range</option>
                    {investmentOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {showSipFields && (
                <Field label="SIP amount" error={errors.sipAmount}>
                  <input
                    className={INPUT}
                    value={String((form as any).sipAmount ?? "")}
                    onChange={(e) => (handle as any)("sipAmount", e.target.value)}
                    placeholder="e.g. 5000"
                    inputMode="numeric"
                  />
                </Field>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="A/C Opening Date">
                <input
                  type="date"
                  className={INPUT}
                  value={form.acOpeningDate ? new Date(form.acOpeningDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => handle("acOpeningDate", e.target.value)}
                />
              </Field>
              <Field label="Trade Confirmation No">
                <input
                  className={INPUT}
                  value={String(form.tradeConfirmationNo ?? "")}
                  onChange={(e) => handle("tradeConfirmationNo", e.target.value)}
                  placeholder="Order / Trade ID"
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            title="Opportunity & Pipeline"
            description="Control referral context, stage and follow-ups."
            icon={<Flag className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <Field label="Referral code">
                <input
                  className={INPUT}
                  value={String((form as any).referralCode ?? "")}
                  onChange={(e) => (handle as any)("referralCode", e.target.value)}
                />
              </Field>
              <Field label="Referral name">
                <input
                  className={INPUT}
                  value={String((form as any).referralName ?? "")}
                  onChange={(e) => (handle as any)("referralName", e.target.value)}
                />
              </Field>
              <Field label="Lead source">
                <div className={INPUT + " flex items-center justify-between bg-gray-50 font-medium dark:bg-white/[0.03]"}>
                  <span>{leadSourceLabel}</span>
                  <span className="text-[11px] text-gray-400">Read-only</span>
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Pipeline stage">
                <select
                  className={INPUT}
                  value={String((form as any).clientStage ?? "")}
                  onChange={(e) => (handle as any)("clientStage", e.target.value)}
                >
                  <option value="">Select pipeline stage</option>
                  {stageOptions.map((s) => (
                    <option key={s} value={s}>
                      {titleCaseWords(s)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Lead status (Stage filter)">
                <select className={INPUT} value={String((form as any).stageFilter ?? "")} onChange={(e) => (handle as any)("stageFilter", e.target.value)}>
                  <option value="">Select lead status</option>
                  {STAGE_FILTER_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {titleCaseWords(s)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Next action">
              <div className="relative">
                <input
                  type="datetime-local"
                  className={INPUT + " pr-10"}
                  value={formatForDatetimeLocal((form as any).nextActionDueAt ?? null)}
                  onChange={(e) => handle("nextActionDueAt", toIsoString(e.target.value))}
                />
                <Clock3 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </Field>
          </SectionCard>

          <SectionCard
            title="Notes & History"
            description="Every remark added here is tracked with author and timestamp in the Activity Timeline."
            icon={<NotebookPen className="h-4 w-4" />}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold text-gray-600 dark:text-white/70">Add a new remark</Label>
                <textarea
                  rows={4}
                  className={INPUT + " mt-2 min-h-[120px] resize-none"}
                  value={remarkDraft}
                  onChange={(e) => setRemarkDraft(e.target.value)}
                  placeholder="Capture objections, commitments, or next steps. This will be logged to the timeline."
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-white/60">
                  Saved with your name ({user?.name ?? "current user"}) and visible on lead history.
                </p>
              </div>

              <div className="rounded-2xl border border-dashed border-gray-200 bg-gradient-to-br from-emerald-50/60 to-white p-4 text-sm dark:border-white/10 dark:from-emerald-500/5 dark:to-white/5">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-200">
                  <div className="flex items-center gap-2">
                    <NotebookPen className="h-4 w-4" />
                    <span>Last saved remark</span>
                  </div>
                  {latestRemarkRelative && (
                    <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-white/10 dark:text-white">
                      {latestRemarkRelative}
                    </span>
                  )}
                </div>
                {latestRemark ? (
                  <>
                    <p className="mt-3 rounded-xl border border-emerald-100 bg-white/80 p-3 text-gray-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                      {latestRemark.text}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-white/60">
                      <span className="font-semibold text-gray-700 dark:text-white">
                        {latestRemark.author || "Unknown"}
                      </span>
                      {latestRemark?.createdAt && (
                        <>
                          <span aria-hidden="true" className="text-gray-400">•</span>
                          <span>{new Date(latestRemark.createdAt).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-gray-500 dark:text-white/70">No remarks have been saved yet.</p>
                )}
              </div>
            </div>

            <Field label="Biography (optional)">
              <textarea
                rows={3}
                className={INPUT + " resize-none"}
                value={String(form.bioText ?? "")}
                onChange={(e) => handle("bioText", e.target.value)}
                placeholder="Short biography or notes about the lead..."
              />
            </Field>
          </SectionCard>
        </div>
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-gray-100 bg-white/80 px-6 py-3 backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
          <Button size="sm" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={isSaving}>
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </span>
            ) : (
              "Confirm & Save"
            )}
          </Button>
        </div>
        {isSaving && (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-white/70 backdrop-blur dark:bg-gray-900/70">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-emerald-500 dark:border-gray-600 dark:border-t-emerald-400" />
            <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-white">Updating lead details...</p>
          </div>
        )}
      </form>
    </Modal>
  );
}

function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <div className="flex flex-col">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <span className="mt-1 text-xs text-rose-500">{error}</span>}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs text-gray-500 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60">
      <p className="font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  icon,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mb-4 flex items-start gap-3">
        {icon && (
          <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">{title}</h3>
          {description && <p className="text-xs text-gray-500 dark:text-white/60">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
