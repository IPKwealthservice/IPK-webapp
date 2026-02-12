import { gql, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GET_ONBOARDING_PROFILE } from "@/graphql/onboardingAgreement.gql";

const UPSERTONBOARDING_MUTATION = gql`
  mutation UpsertOnboarding($input: SaveOnboardingInput!) {
    upsertOnboarding(input: $input) {
      id
      status
    }
  }
`;
//import ContactDetails from "../steps/ContactDetails";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

// COMPONENTS
import DropdownField from "../components/DropdownField";
import FamilyAccounts from "../components/FamilyAccounts";
import FileUpload from "../components/FileUpload";
import HeaderSteps from "../components/HeaderSteps";
import InputField from "../components/InputField";
import PreviewModal from "../components/PreviewModal";
import SuccessPopup from "../components/SuccessPopup";
import TextAreaField from "../components/TextAreaField";

/* ================= SECTION HEADER ================= */
const SectionHeader = ({
  title,
  toggle,
}: {
  title: string;
  toggle: () => void;
}) => (
  <div
    onClick={toggle}
    className="flex justify-between items-center cursor-pointer text-lg font-semibold text-indigo-700 py-3 border-b"
  >
    <span>{title}</span>
  </div>
);

/* ================= MAIN PAGE ================= */
export default function ClientProfile() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggleSection = (name: string) =>
    setOpenSection(openSection === name ? null : name);

  /* ================= FORM STATE ================= */
  const [form, setForm] = useState<Record<string, string>>({
    // PERSONAL
    firstName: "",
    lastName: "",
    commAddress: "",
    permAddress: "",
    location: "",
    gender: "",
    dob: "",
    age: "",
    occupation: "",
    income: "",
    company: "",
    designation: "",
    pan: "",
    aadhaar: "",
    contactPersonName: "",
    contactPersonNo: "",
    relationship: "",
    relationshipOther: "",
    clientSource: "",
    clientSourceOther: "",

    // CONTACT
    mobile: "",
    whatsapp: "",
    language: "",
    email: "",
    tradeConfirmationNo: "",

    // DEMAT
    dpId: "",
    clientCode: "",
    schemeName: "",
    brokerName: "",
    nomineeName: "",
    nomineeRelationship: "",
    nomineeRelationshipOther: "",
    nomineeContact: "",
    nomineeEmail: "",
    nomineeAadhar: "",
    nomineePan: "",
    acType: "",
    acTypeOther: "",
    acOpeningDate: "",

    // BILLING
    billName: "",
    gst: "",
    billingAddress: "",

    // BANK
    holderName: "",
    bankName: "",
    accNumber: "",
    ifsc: "",
    micr: "",
  });

  const update = (field: string, value: unknown) =>
    setForm((prev: Record<string, string>) => ({ ...prev, [field]: String(value ?? "") }));

  const handleDobChange = (value: Dayjs | null) => {
    if (!value) {
      update("dob", "");
      update("age", "");
      return;
    }

    const birthDate = value.toDate();
    const today = new Date();

    if (birthDate > today) {
      alert("Date of birth cannot be in the future");
      update("dob", "");
      update("age", "");
      return;
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    update("dob", value.format("YYYY-MM-DD"));
    update("age", age);
  };

  /* ================= ADDRESS LOGIC ================= */
  const [samePerm, setSamePerm] = useState(false);
  const syncPermanent = () =>
    samePerm && update("permAddress", form.commAddress);

  /* ================= FAMILY ACCOUNTS ================= */
  const [familyAccounts, setFamilyAccounts] = useState<string[]>([""]);

  /* ================= SAVING DATA ================= */
  const leadId = localStorage.getItem("onboarding_lead_id");
  const [upsertOnboarding] = useMutation(UPSERTONBOARDING_MUTATION);

  /* ================= FETCHING DATA ================= */
  const { data: profileData, loading: fetching } = useQuery(GET_ONBOARDING_PROFILE, {
    variables: { leadId },
    skip: !leadId,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (profileData?.getOnboardingByLeadId) {
      const p = profileData.getOnboardingByLeadId;
      setForm((prev) => ({
        ...prev,
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        location: p.location || "",
        gender: p.gender || "",
        dob: p.dob || "",
        age: p.age?.toString() || "",
        occupation: p.occupation || "",
        income: p.income || "",
        company: p.company || "",
        designation: p.designation || "",
        pan: p.pan || "",
        aadhaar: p.aadhaar || "",
        contactPersonName: p.contactPersonName || "",
        contactPersonNo: p.contactPersonNo || "",
        relationship: p.relationship || "",
        relationshipOther: p.relationshipOther || "",
        clientSource: p.source || "",
        clientSourceOther: p.clientSourceOther || "",
        mobile: p.mobile || "",
        whatsapp: p.whatsapp || "",
        language: p.language || "",
        email: p.email || "",
        tradeConfirmationNo: p.tradeNumber || "",
        dpId: p.dpId || "",
        clientCode: p.clientCode || "",
        schemeName: p.schemeName || "",
        brokerName: p.brokerName || "",
        nomineeName: p.nomineeName || "",
        nomineeRelationship: p.nomineeRelationship || "",
        nomineeRelationshipOther: p.nomineeRelationshipOther || "",
        nomineeContact: p.nomineeContact || "",
        nomineeEmail: p.nomineeEmail || "",
        nomineeAadhar: p.nomineeAadhar || "",
        nomineePan: p.nomineePan || "",
        acType: p.acType || "",
        acTypeOther: p.acTypeOther || "",
        acOpeningDate: p.accountOpeningDate || "",
        billName: p.billName || "",
        gst: p.gst || "",
        billingAddress: p.billingAddress || "",
        holderName: p.holderName || "",
        bankName: p.bankName || "",
        accNumber: p.accNumber || "",
        ifsc: p.ifsc || "",
        micr: p.micr || "",
      }));

      if (p.permAddress && p.commAddress === p.permAddress) {
        setSamePerm(true);
      } else {
        setForm(prev => ({ ...prev, permAddress: p.permAddress || "" }));
      }
    }
  }, [profileData]);

  /* ================= VALIDATION ================= */
  const REQUIRED_FIELDS = [
    "firstName", "gender", "dob", "pan", "aadhaar", "clientSource",
    "mobile", "email", "language",
    "holderName", "bankName", "accNumber", "ifsc",
    "commAddress", "permAddress"
  ];

  const FIELD_LABELS: Record<string, string> = {
    firstName: "First Name",
    lastName: "Last Name",
    gender: "Gender",
    dob: "Date of Birth",
    pan: "PAN",
    aadhaar: "Aadhaar",
    clientSource: "Client Source",
    mobile: "Mobile Number",
    email: "Email",
    language: "Language",
    holderName: "Account Holder Name",
    bankName: "Bank Name",
    accNumber: "Account Number",
    ifsc: "IFSC Code",
    commAddress: "Communication Address",
    permAddress: "Permanent Address"
  };

  const getMissingFields = () => {
    return REQUIRED_FIELDS.filter(field => {
      const value = field === "permAddress" && samePerm ? form.commAddress : form[field];
      return !value || String(value).trim() === "";
    });
  };

  const isFormComplete = getMissingFields().length === 0;

  const [preview, setPreview] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSaveClick = () => {
    setPreview(true);
  };

  const handleSectionSave = async (sectionFields: string[]) => {
    try {
      if (!leadId) {
        alert("Missing Lead ID. Cannot save.");
        return;
      }

      // 1. Filter missing required fields ONLY for this section
      const missingInSection = sectionFields.filter(f =>
        REQUIRED_FIELDS.includes(f) && (!form[f] || String(form[f]).trim() === "")
      );

      if (missingInSection.length > 0) {
        const labels = missingInSection.map(f => FIELD_LABELS[f] || f).join(", ");
        alert(`Please fill the following required fields in this section: ${labels}`);
        return;
      }

      // 2. Prepare payload with ONLY section fields + leadId + mobile (mobile is mandatory in backend likely)
      const input: any = { leadId, mobile: form.mobile };

      sectionFields.forEach(f => {
        if (f === "dob") {
          input.dob = form.dob || null;
          input.age = (form.age && !isNaN(parseInt(form.age))) ? parseInt(form.age) : null;
        } else if (f === "clientSource") {
          input.source = form.clientSource || null;
        } else if (f === "tradeConfirmationNo") {
          input.tradeNumber = form.tradeConfirmationNo || null;
        } else if (f === "acOpeningDate") {
          input.accountOpeningDate = form.acOpeningDate || null;
        } else if (f === "permAddress") {
          input.permAddress = samePerm ? form.commAddress : (form.permAddress || null);
        } else {
          input[f] = form[f] || null;
        }
      });

      await upsertOnboarding({
        variables: { input }
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    } catch (error: any) {
      console.error("❌ Failed to save section:", error);
      const msg = error.graphQLErrors?.[0]?.message || error.message || "Unknown error";
      alert(`Error saving section: ${msg}`);
    }
  };

  const submitForm = async () => {
    try {
      setPreview(false);

      if (!leadId) {
        alert("Missing Lead ID in URL. Cannot save.");
        return;
      }

      // Map frontend form to backend input
      const input = {
        leadId,
        mobile: form.mobile,
        // Personal
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        location: form.location || null,
        gender: form.gender || null,
        dob: form.dob || null,
        age: (form.age && !isNaN(parseInt(form.age))) ? parseInt(form.age) : null,
        occupation: form.occupation || null,
        income: form.income || null,
        company: form.company || null,
        designation: form.designation || null,
        pan: form.pan || null,
        aadhaar: form.aadhaar || null,

        // New Personal Fields
        contactPersonName: form.contactPersonName || null,
        contactPersonNo: form.contactPersonNo || null,
        relationship: form.relationship || null,
        relationshipOther: form.relationshipOther || null,
        clientSourceOther: form.clientSourceOther || null,
        source: form.clientSource || null, // Mapped

        // Address
        commAddress: form.commAddress || null,
        permAddress: samePerm ? form.commAddress : (form.permAddress || null),

        // Contact
        email: form.email || null,
        whatsapp: form.whatsapp || null,
        tradeNumber: form.tradeConfirmationNo || null, // Mapped
        language: form.language || null,

        // Demat
        dpId: form.dpId || null,
        clientCode: form.clientCode || null,
        schemeName: form.schemeName || null,
        brokerName: form.brokerName || null,
        nomineeName: form.nomineeName || null,
        nomineeRelationship: form.nomineeRelationship || null,
        nomineeRelationshipOther: form.nomineeRelationshipOther || null,
        nomineeContact: form.nomineeContact || null,
        nomineeEmail: form.nomineeEmail || null,
        nomineeAadhar: form.nomineeAadhar || null,
        nomineePan: form.nomineePan || null,
        acType: form.acType || null,
        acTypeOther: form.acTypeOther || null,
        accountOpeningDate: form.acOpeningDate || null,

        // Billing
        billName: form.billName || null,
        gst: form.gst || null,
        billingAddress: form.billingAddress || null,

        // Bank
        holderName: form.holderName || null,
        bankName: form.bankName || null,
        accNumber: form.accNumber || null,
        ifsc: form.ifsc || null,
        micr: form.micr || null,
      };

      await upsertOnboarding({
        variables: { input }
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate("/sales/onboarding/process/authentication");
      }, 1500);
    } catch (error: any) {
      console.error("❌ Failed to save onboarding:", error);
      console.log("Full Error Object:", JSON.stringify(error, null, 2));
      const msg = error.graphQLErrors?.[0]?.message || error.networkError?.result?.errors?.[0]?.message || error.message || "Unknown error";
      alert(`Error saving data: ${msg}`);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="mobile-padding tablet-padding desktop-padding">

      {/* HEADER STEPS (ONLY FORM, NOT PREVIEW) */}
      <div className="flex justify-center mb-6">
        <HeaderSteps current={1} />
      </div>

      <FileUpload />

      {/* ================= PERSONAL DETAILS ================= */}
      <SectionHeader
        title="Personal Info ➤"
        toggle={() => toggleSection("personal")}
      />

      {openSection === "personal" && (
        <>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="First Name"
                value={form.firstName}
                onChange={(v: unknown) => update("firstName", v)}
              />
              <InputField
                label="Last Name"
                value={form.lastName}
                onChange={(v: unknown) => update("lastName", v)}
              />
            </div>
            <InputField label="Location" value={form.location} onChange={(v: unknown) => update("location", v)} />
            <DropdownField
              label="Gender"
              value={form.gender}
              options={["Male", "Female"]}
              onChange={(v: unknown) => update("gender", v)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">
                Date of Birth
              </label>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={form.dob ? dayjs(form.dob) : null}
                  onChange={handleDobChange}
                  format="DD/MM/YYYY"
                  disableFuture
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      sx: {
                        "& .MuiPickersOutlinedInput-root": {
                          height: "42px",
                          borderRadius: "0.375rem",
                          backgroundColor: "#ffffff",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#e5e7eb",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#d1d5db",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#6366f1",
                        },
                        "& input": {
                          padding: "8px 12px",
                          fontSize: "14px",
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>

            <InputField label="Age" value={form.age} readOnly />
            <InputField label="Occupation" value={form.occupation} onChange={(v: unknown) => update("occupation", v)} />

            <DropdownField
              label="Income Range"
              value={form.income}
              options={["1–2 LPA", "2–3 LPA", "3–4 LPA", "4–5 LPA", "5–6 LPA", "6–7 LPA", "7–8 LPA", "8–9 LPA", "9–10 LPA", "10+ LPA"]}
              onChange={(v: unknown) => update("income", v)}
            />

            <InputField label="Company" value={form.company} onChange={(v: unknown) => update("company", v)} />
            <InputField label="Designation" value={form.designation} onChange={(v: unknown) => update("designation", v)} />
            <InputField label="PAN No" value={form.pan} onChange={(v: unknown) => update("pan", v)} />
            <InputField label="Aadhaar No" value={form.aadhaar} onChange={(v: unknown) => update("aadhaar", v)} />
            <InputField label="Contact Person Name" value={form.contactPersonName} onChange={(v: unknown) => update("contactPersonName", v)} />
            <InputField label="Contact Person No" value={form.contactPersonNo} onChange={(v: unknown) => update("contactPersonNo", v)} />

            <DropdownField
              label="Relationship"
              value={form.relationship}
              options={["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Others"]}
              onChange={(v: unknown) => update("relationship", v)}
            />

            {form.relationship === "Others" && (
              <InputField
                label="Specify Relationship"
                value={form.relationshipOther}
                onChange={(v: unknown) => update("relationshipOther", v)}
              />
            )}

            <DropdownField
              label="Client Source"
              value={form.clientSource}
              options={["REFERENCE", "ONLINE", "YES CON", "START-UP", "OTHERS"]}
              onChange={(v: unknown) => update("clientSource", v)}
            />

            {form.clientSource === "OTHERS" && (
              <InputField
                label="Specify Client Source"
                value={form.clientSourceOther}
                onChange={(v: unknown) => update("clientSourceOther", v)}
              />
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextAreaField label="Communication Address" value={form.commAddress} onChange={(v: unknown) => update("commAddress", v)} />
            <div>
              <TextAreaField
                label="Permanent Address"
                readOnly={samePerm}
                value={samePerm ? form.commAddress : form.permAddress}
                onChange={(v: unknown) => update("permAddress", v)}
              />
              <label className="flex items-center gap-2 mt-2 text-sm">
                <input
                  type="checkbox"
                  checked={samePerm}
                  onChange={(e) => {
                    setSamePerm(e.target.checked);
                    syncPermanent();
                  }}
                />
                Same as communication address
              </label>
            </div>
          </div>

          <div className="mt-8">
            <FamilyAccounts
              accounts={familyAccounts}
              add={() => setFamilyAccounts([...familyAccounts, ""])}
              update={(i: number, v: string) => {
                const list = [...familyAccounts];
                list[i] = v;
                setFamilyAccounts(list);
              }}
              remove={(i: number) =>
                setFamilyAccounts(familyAccounts.filter((_, idx) => idx !== i))
              }
            />
          </div>

          <div className="flex justify-end mt-4 px-2">
            <button
              onClick={() => handleSectionSave([
                "firstName", "lastName", "location", "gender", "dob", "occupation", "income", "company", "designation",
                "pan", "aadhaar", "contactPersonName", "contactPersonNo", "relationship", "relationshipOther",
                "clientSource", "clientSourceOther", "commAddress", "permAddress"
              ])}
              className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded shadow hover:bg-indigo-700 transition-all"
            >
              Save Section
            </button>
          </div>
        </>
      )}

      {/* ================= DEMAT ACCOUNT ================= */}
      <SectionHeader
        title="Demat Info ➤"
        toggle={() => toggleSection("demat")}
      />

      {openSection === "demat" && (
        <>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="DP ID" value={form.dpId} onChange={(v: unknown) => update("dpId", v)} />
            <InputField label="Client Code" value={form.clientCode} onChange={(v: unknown) => update("clientCode", v)} />
            <InputField label="Scheme Name" value={form.schemeName} onChange={(v: unknown) => update("schemeName", v)} />
            <DropdownField
              label="Broker Name"
              value={form.brokerName}
              options={["Motilal Oswal", "Aditya Birla"]}
              onChange={(v: unknown) => update("brokerName", v)}
            />
            <InputField label="Nominee Name" value={form.nomineeName} onChange={(v: unknown) => update("nomineeName", v)} />
            <InputField label="Nominee Relationship" value={form.nomineeRelationship} onChange={(v: unknown) => update("nomineeRelationship", v)} />
            <InputField label="Nominee Contact" value={form.nomineeContact} onChange={(v: unknown) => update("nomineeContact", v)} />
            <InputField label="Nominee Email" value={form.nomineeEmail} onChange={(v: unknown) => update("nomineeEmail", v)} />
            <InputField label="Nominee Aadhar" value={form.nomineeAadhar} onChange={(v: unknown) => update("nomineeAadhar", v)} />
            <InputField label="Nominee PAN" value={form.nomineePan} onChange={(v: unknown) => update("nomineePan", v)} />
            <InputField label="A/C Type" value={form.acType} onChange={(v: unknown) => update("acType", v)} />
            <InputField label="A/C Opening Date" value={form.acOpeningDate} onChange={(v: unknown) => update("acOpeningDate", v)} />
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => handleSectionSave([
                "dpId", "clientCode", "schemeName", "brokerName", "nomineeName", "nomineeRelationship",
                "nomineeRelationshipOther", "nomineeContact", "nomineeEmail", "nomineeAadhar", "nomineePan",
                "acType", "acTypeOther", "acOpeningDate"
              ])}
              className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded shadow hover:bg-indigo-700 transition-all"
            >
              Save Section
            </button>
          </div>
        </>
      )}

      {/* ================= CONTACT DETAILS ================= */}
      <SectionHeader
        title="Contact Info ➤"
        toggle={() => toggleSection("contact")}
      />

      {openSection === "contact" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <InputField
              label="Mobile No"
              value={form.mobile}
              onChange={(v: unknown) => update("mobile", v)}
            />

            <InputField
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(v: unknown) => update("whatsapp", v)}
            />

            <InputField
              label="Language"
              value={form.language}
              onChange={(v: unknown) => update("language", v)}
            />

            <InputField
              label="Email"
              value={form.email}
              onChange={(v: unknown) => update("email", v)}
            />

            <InputField
              label="Trade Confirmation No"
              value={form.tradeConfirmationNo}
              onChange={(v: unknown) => update("tradeConfirmationNo", v)}
            />
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => handleSectionSave([
                "mobile", "whatsapp", "language", "email", "tradeConfirmationNo"
              ])}
              className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded shadow hover:bg-indigo-700 transition-all"
            >
              Save Section
            </button>
          </div>
        </>
      )}

      {/* ================= BILLING DETAILS ================= */}
      <SectionHeader
        title="Billing Info ➤"
        toggle={() => toggleSection("billing")}
      />

      {openSection === "billing" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <InputField label="Billing Name" value={form.billName} onChange={(v: unknown) => update("billName", v)} />
            <InputField label="GST No" value={form.gst} onChange={(v: unknown) => update("gst", v)} />
          </div>
          <div className="mt-6">
            <TextAreaField label="Billing Address" value={form.billingAddress} onChange={(v: unknown) => update("billingAddress", v)} />
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => handleSectionSave([
                "billName", "gst", "billingAddress"
              ])}
              className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded shadow hover:bg-indigo-700 transition-all"
            >
              Save Section
            </button>
          </div>
        </>
      )}

      {/* ================= BANK DETAILS ================= */}
      <SectionHeader
        title="Bank Info ➤"
        toggle={() => toggleSection("bank")}
      />

      {openSection === "bank" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <InputField label="Holder Name" value={form.holderName} onChange={(v: unknown) => update("holderName", v)} />
            <InputField label="Bank Name" value={form.bankName} onChange={(v: unknown) => update("bankName", v)} />
            <InputField label="Account Number" value={form.accNumber} onChange={(v: unknown) => update("accNumber", v)} />
            <InputField label="IFSC" value={form.ifsc} onChange={(v: unknown) => update("ifsc", v)} />
            <InputField label="MICR" value={form.micr} onChange={(v: unknown) => update("micr", v)} />
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => handleSectionSave([
                "holderName", "bankName", "accNumber", "ifsc", "micr"
              ])}
              className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded shadow hover:bg-indigo-700 transition-all"
            >
              Save Section
            </button>
          </div>
        </>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSaveClick}
          disabled={!isFormComplete}
          className={`px-6 py-2 rounded-lg text-white font-medium transition-all ${isFormComplete
            ? "bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95"
            : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          Save
        </button>
      </div>

      <PreviewModal
        open={preview}
        data={form}
        onClose={() => setPreview(false)}
        onSubmit={submitForm}
      />
      <SuccessPopup open={success} />

    </div>
  );
}




