import { differenceInCalendarDays, isValid, parseISO } from "date-fns";

type AgingInput = {
  agingDays?: number | null;
  approachAt?: string | null;
  createdAt?: string | null;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const normalizeDate = (value?: string | null): Date | null => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const parsed = parseISO(trimmed);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const pickAgingStartDate = (input: AgingInput): Date | null => {
  return normalizeDate(input.approachAt) ?? normalizeDate(input.createdAt) ?? null;
};

export const computeAgingDaysFrom = (value?: string | null): number | null => {
  const parsed = normalizeDate(value);
  if (!parsed) return null;
  return Math.max(0, differenceInCalendarDays(new Date(), parsed));
};

export const resolveLeadAgingDays = (input: AgingInput): number | null => {
  if (isFiniteNumber(input.agingDays)) {
    return Math.max(0, Math.floor(input.agingDays));
  }

  const startDate = pickAgingStartDate(input);
  if (!startDate) return null;

  return Math.max(0, differenceInCalendarDays(new Date(), startDate));
};
