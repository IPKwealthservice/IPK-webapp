import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import { useMutation } from "@apollo/client";
import Label from "../../form/Label";
import { toast } from "react-toastify";
import { UPDATE_LEAD_DETAILS } from "../editLead/update_gql/update_lead.gql";
import { useAuth } from "@/context/AuthContex";
import { UPDATE_LEAD_BIO, CHANGE_STAGE } from "@/components/sales/view_lead/gql/view_lead.gql";
import { valueToLabel } from "@/components/lead/types";
import {
  genderOptions,
  professionOptions,
  leadOptions,
  titleCaseWords,
  LEAD_PIPELINE_STAGES,
  STAGE_FILTER_OPTIONS,
  clientTypeOptions,
} from "@/components/sales/editLead/types/editmodel";

import type { LeadShape } from "../../ui/lead/Validators";

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
  occupations?: Array<{
    profession?: string;
    companyName?: string;
    designation?: string;
    startedAt?: string | Date;
    endedAt?: string | Date;
  }>;
  id?: string;
  leadId?: string;
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

const normalizeClientTypesForState = (value?: string | string[] | null): string[] | undefined => {
  if (!value) return undefined;
  const entries = Array.isArray(value) ? value : [value];
  const normalized: string[] = [];
  for (const entry of entries) {
    String(entry ?? "")
      .split(/[,;]/u)
      .forEach((part) => {
        const trimmed = part.trim();
        if (trimmed) normalized.push(trimmed);
      });
  }
  return normalized.length ? normalized : undefined;
};

const formatClientTypesForPayload = (value?: string | string[] | null): string | null => {
  const entries = Array.isArray(value) ? value : value ? [value] : [];
  const cleaned = entries
    .map((entry) => String(entry ?? "").trim())
    .filter((entry) => entry.length > 0);
  return cleaned.length ? cleaned.join(", ") : null;
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
    next.clientTypes = normalizeClientTypesForState(next.clientTypes);
    setForm(next);
    setErrors({});
    setTimeout(() => firstRef.current?.focus(), 0);
  }, [isOpen, initial]);

  const handle = (k: keyof LeadEditModalValues, v: unknown) => {
    setForm((prev) => ({ ...(prev ?? {}), [k]: v }));
  };

  const toggleClientType = (value: string) => {
    setForm((prev) => {
      const normalized = String(value ?? "").trim();
      if (!normalized) return prev ?? {};
      const current = Array.isArray(prev?.clientTypes)
        ? [...prev.clientTypes]
        : prev?.clientTypes
        ? [prev.clientTypes]
        : [];

      const exists = current.includes(normalized);
      const nextList = exists
        ? current.filter((item) => item !== normalized)
        : [...current, normalized];

      return { ...(prev ?? {}), clientTypes: nextList.length ? nextList : undefined };
    });
  };

  const stageOptions = useMemo(() => {
    const currentStage = String((form as any).clientStage ?? (initial as any)?.clientStage ?? "").toUpperCase();
    return !currentStage || currentStage === "NEW_LEAD" || currentStage === "FIRST_TALK_DONE"
      ? LEAD_PIPELINE_STAGES
      : LEAD_PIPELINE_STAGES.filter((s) => s !== "NEW_LEAD" && s !== "FIRST_TALK_DONE");
  }, [form.clientStage, initial]);

  const isSaving = saving || mutating || stageUpdating || bioSaving;

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
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
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

    try {
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
        phone: normalize((form as any).phone) ?? undefined,
        product: normalize((form as any).product) ?? undefined,
        investmentRange: normalize((form as any).investmentRange) ?? undefined,
        sipAmount: (() => {
          const sv = String((form as any).sipAmount ?? '').trim();
          if (!sv) return undefined;
          const n = Number(sv);
          return Number.isFinite(n) ? n : undefined;
        })(),
        referralCode: normalize((form as any).referralCode) ?? undefined,
        referralName: normalize((form as any).referralName) ?? undefined,
        leadSource: normalize((form as any).leadSource) ?? undefined,
        stageFilter: normalize((form as any).stageFilter) ?? undefined,
        clientTypes: formatClientTypesForPayload((form as any).clientTypes) ?? undefined,
      };
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

      toast.success("✓ Lead details updated successfully. Refreshing...");
      await onSubmit?.(payload);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update lead");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-screen-lg w-full p-4">
      <form onSubmit={submit} className="relative flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-gray-900">
        <div className="sticky top-0 z-10 flex flex-col gap-1 border-b border-gray-100 bg-white/90 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">{title}</h4>
          <p className="text-sm text-gray-500 dark:text-white/50">Update contact, profiling and opportunity details.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[70vh] space-y-6">
          <div className="grid gap-3 rounded-2xl border border-gray-100 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-2">
            <InfoTile label="Lead code" value={String((form as any).leadCode ?? "Not generated")} />
            <InfoTile label="Lead source" value={leadSourceLabel} />
          </div>

          <div className="grid gap-4 rounded-2xl border border-gray-100 p-4 dark:border-white/10 sm:grid-cols-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name">
                <div className={INPUT + " cursor-not-allowed bg-gray-50 dark:bg-white/[0.03]"}>
                  {String(form.firstName ?? "")}
                </div>
              </Field>
              <Field label="Last name">
                <div className={INPUT + " cursor-not-allowed bg-gray-50 dark:bg-white/[0.03]"}>
                  {String(form.lastName ?? "")}
                </div>
              </Field>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <input className={INPUT} value={String((form as any).email ?? "")} onChange={(e) => (handle as any)("email", e.target.value)} placeholder="email@example.com" />
              </Field>
              <Field label="Phone">
                <div className={INPUT + " cursor-not-allowed bg-gray-50 dark:bg-white/[0.03]"}>
                  {String((form as any).phone ?? "")}
                </div>
              </Field>
            </div>

            <Field label="Location">
              <input className={INPUT} value={String(form.location ?? "")} onChange={(e) => handle("location", e.target.value)} placeholder="City / Area" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
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

              <Field label="Age">
                <input
                  className={INPUT}
                  value={String(form.age ?? "")}
                  onChange={(e) => handle("age", e.target.value)}
                  placeholder="Optional"
                  inputMode="numeric"
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Profession">
                <select
                  className={INPUT}
                  value={String((form.occupations?.[0]?.profession ?? form.profession) ?? "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    // update nested occupation[0]
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
              <Field label="Designation">
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
              <Field label="Company / Organisation">
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

            {/* Opportunity */}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Product">
                <input className={INPUT} value={String((form as any).product ?? "")} onChange={(e) => (handle as any)("product", e.target.value)} placeholder="e.g. SIP" />
              </Field>
              <Field label="Investment range">
                <input className={INPUT} value={String((form as any).investmentRange ?? "")} onChange={(e) => (handle as any)("investmentRange", e.target.value)} placeholder="e.g. 1L-5L" />
              </Field>
              <Field label="SIP amount">
                <input className={INPUT} value={String((form as any).sipAmount ?? "")} onChange={(e) => (handle as any)("sipAmount", e.target.value)} placeholder="e.g. 5000" inputMode="numeric" />
              </Field>
            </div>

            <Field label="Client type">
              <div className="flex flex-wrap gap-2">
                {clientTypeOptions.map((type) => {
                  const isActive = Array.isArray(form.clientTypes)
                    ? form.clientTypes.includes(type)
                    : false;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleClientType(type)}
                      aria-pressed={isActive}
                      className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300 ${
                        isActive
                          ? "border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:border-emerald-300 dark:bg-emerald-400/20 dark:text-emerald-50"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-white/10 dark:text-white/60 dark:hover:border-white/30"
                      }`}
                    >
                      {titleCaseWords(type)}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-gray-500">Select one or more categories.</p>
            </Field>

            {/* Referral + source */}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Referral code">
                <input className={INPUT} value={String((form as any).referralCode ?? "")} onChange={(e) => (handle as any)("referralCode", e.target.value)} />
              </Field>
              <Field label="Referral name">
                <input className={INPUT} value={String((form as any).referralName ?? "")} onChange={(e) => (handle as any)("referralName", e.target.value)} />
              </Field>
              <Field label="Lead source">
                <div className={INPUT + " cursor-not-allowed bg-gray-50 dark:bg-white/[0.03]"}>
                  {leadSourceLabel}
                </div>
              </Field>
            </div>

            {/* Stage controls */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pipeline stage">
                <select
                  className={INPUT}
                  value={String((form as any).clientStage ?? "")}
                  onChange={(e) => (handle as any)("clientStage", e.target.value)}
                >
                  {stageOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Lead status (Stage filter)">
                <select className={INPUT} value={String((form as any).stageFilter ?? "")} onChange={(e) => (handle as any)("stageFilter", e.target.value)}>
                  {STAGE_FILTER_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </Field>
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
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-100">
            <p className="font-semibold">Fields you can update</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Contact: Email only (Phone, Name, Lead Source are read-only after registration)</li>
              <li>Profile: Age, Gender, Location, Profession, Designation, Company</li>
              <li>Opportunity: Product, Investment Range, SIP Amount</li>
              <li>Client Info: Type, Referral details</li>
              <li>Bio: Any updates here will be timestamped automatically</li>
              <li>Pipeline Stage & Lead Status for RM workflow</li>
            </ul>
          </div>
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

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
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
