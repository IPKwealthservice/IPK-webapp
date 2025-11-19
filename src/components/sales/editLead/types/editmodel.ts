import { LeadShape } from "@/components/ui/lead/Validators";
import {
  clientTypeOptions as sharedClientTypeOptions,
  genderOptions as sharedGenderOptions,
  investmentOptions as sharedInvestmentOptions,
  leadOptions as sharedLeadOptions,
  productOptions as sharedProductOptions,
  professionOptions as sharedProfessionOptions,
  titleCaseWords as sharedTitleCaseWords,
} from "@/components/lead/types";

export type OptionalExtras = Partial<{
  leadSourceOther: string | null;
  referralName: string | null;
  assignedRM: string | null;
  age: number | null;
  referralCode: string | null;
  bioText: string | null;
}>;

export type LeadEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initial?: LeadEditModalValues;
};

export type LeadEditModalValues = Partial<LeadShape & OptionalExtras> & {
  fullName?: string;
  primaryPhone?: string;
  whatsappPhone?: string;
};

export interface Lead {
  id: string;
  leadCode: string;

  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  leadSource: string;
  remark?: string;

  assignedRM?: string | null;
  assignedRmId?: string | null;

  createdAt: string;
  updatedAt: string;

  gender?: "MALE" | "FEMALE" | "OTHER";
  age?: number | "";
  profession?: "SELF_EMPLOYED" | "BUSINESS" | "EMPLOYEE" | "";
  companyName?: string;
  designation?: string;
  location?: string;

  product?: "IAP" | "SIP" | "";
  investmentRange?: "" | "<5L" | "10-25L" | "50L+";
  sipAmount?: number | "";

  clientTypes?:
    | Array<"Interested" | "Enquiry" | "Important">
    | "Interested"
    | "Enquiry"
    | "Important";

  selected?: boolean;
}

export const genderOptions = sharedGenderOptions;
export const professionOptions = sharedProfessionOptions;
export const productOptions = sharedProductOptions;
export const clientTypeOptions = sharedClientTypeOptions;
export const leadOptions = sharedLeadOptions;
export const investmentOptions = sharedInvestmentOptions;

export const LEAD_PIPELINE_STAGES = [
  "NEW_LEAD",
  "FIRST_TALK_DONE",
  "FOLLOWING_UP",
  "CLIENT_INTERESTED",
  "ACCOUNT_OPENED",
  "NO_RESPONSE_DORMANT",
  "NOT_INTERESTED_DORMANT",
  "RISKY_CLIENT_DORMANT",
  "HIBERNATED",
] as const;

export const STAGE_FILTER_OPTIONS = [
  "FUTURE_INTERESTED",
  "HIGH_PRIORITY",
  "LOW_PRIORITY",
  "NEED_CLARIFICATION",
  "NOT_ELIGIBLE",
  "NOT_INTERESTED",
  "ON_PROCESS",
] as const;

export const titleCaseWords = sharedTitleCaseWords;
