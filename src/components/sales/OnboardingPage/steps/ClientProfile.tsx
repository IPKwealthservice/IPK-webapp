import React, { useState } from "react";
//import ContactDetails from "../steps/ContactDetails";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

// COMPONENTS
import InputField from "../components/InputField";
import TextAreaField from "../components/TextAreaField";
import DropdownField from "../components/DropdownField";
import FileUpload from "../components/FileUpload";
import FamilyAccounts from "../components/FamilyAccounts";
import PreviewModal from "../components/PreviewModal";
import SuccessPopup from "../components/SuccessPopup";
import HeaderSteps from "../components/HeaderSteps";

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
    name: "",
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
    tradeNumber: "",

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
    accountOpeningDate: "",

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

  /* ================= PREVIEW ================= */
  const [preview, setPreview] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitForm = () => {
    setPreview(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
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
            <InputField label="Name" value={form.name} onChange={(v:unknown)=>update("name",v)} />
            <InputField label="Location" value={form.location} onChange={(v:unknown)=>update("location",v)} />
            <InputField label="Gender" value={form.gender} onChange={(v:unknown)=>update("gender",v)} />
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
            <InputField label="Occupation" value={form.occupation} onChange={(v:unknown)=>update("occupation",v)} />

            <DropdownField
              label="Income Range"
              value={form.income}
              options={["1–2 LPA","2–3 LPA","3–4 LPA","4–5 LPA","5–6 LPA","6–7 LPA","7–8 LPA","8–9 LPA","9–10 LPA","10+ LPA"]}
              onChange={(v:unknown)=>update("income",v)}
            />

            <InputField label="Company" value={form.company} onChange={(v:unknown)=>update("company",v)} />
            <InputField label="Designation" value={form.designation} onChange={(v:unknown)=>update("designation",v)} />
            <InputField label="PAN No" value={form.pan} onChange={(v:unknown)=>update("pan",v)} />
            <InputField label="Aadhaar No" value={form.aadhaar} onChange={(v:unknown)=>update("aadhaar",v)} />
            <InputField label="Contact Person Name" value={form.contactPersonName} onChange={(v:unknown)=>update("contactPersonName",v)} />
            <InputField label="Contact Person No" value={form.contactPersonNo} onChange={(v:unknown)=>update("contactPersonNo",v)} />

            <DropdownField
              label="Relationship"
              value={form.relationship}
              options={["Spouse","Son","Daughter","Father","Mother","Brother","Sister","Others"]}
              onChange={(v:unknown)=>update("relationship",v)}
            />

            {form.relationship === "Others" && (
              <InputField
                label="Specify Relationship"
                value={form.relationshipOther}
                onChange={(v:unknown)=>update("relationshipOther",v)}
              />
            )}

            <DropdownField
              label="Client Source"
              value={form.clientSource}
              options={["Reference","Online","YES Con","Start-up","Others"]}
              onChange={(v:unknown)=>update("clientSource",v)}
            />

            {form.clientSource === "Others" && (
              <InputField
                label="Specify Client Source"
                value={form.clientSourceOther}
                onChange={(v:unknown)=>update("clientSourceOther",v)}
              />
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextAreaField label="Communication Address" value={form.commAddress} onChange={(v:unknown)=>update("commAddress",v)} />
            <div>
              <TextAreaField
                label="Permanent Address"
                readOnly={samePerm}
                value={samePerm ? form.commAddress : form.permAddress}
                onChange={(v:unknown)=>update("permAddress",v)}
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
        </>
      )}

      {/* ================= DEMAT ACCOUNT ================= */}
      <SectionHeader
        title="Demat Info ➤"
        toggle={() => toggleSection("demat")}
      />

      {openSection === "demat" && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="DP ID" value={form.dpId} onChange={(v:unknown)=>update("dpId",v)} />
          <InputField label="Client Code" value={form.clientCode} onChange={(v:unknown)=>update("clientCode",v)} />
          <InputField label="Scheme Name" value={form.schemeName} onChange={(v:unknown)=>update("schemeName",v)} />
          <InputField label="Broker Name" value={form.brokerName} onChange={(v:unknown)=>update("brokerName",v)} />
          <InputField label="Nominee Name" value={form.nomineeName} onChange={(v:unknown)=>update("nomineeName",v)} />
          <InputField label="Nominee Relationship" value={form.nomineeRelationship} onChange={(v:unknown)=>update("nomineeRelationship",v)} />
          <InputField label="Nominee Contact" value={form.nomineeContact} onChange={(v:unknown)=>update("nomineeContact",v)} />
          <InputField label="Nominee Email" value={form.nomineeEmail} onChange={(v:unknown)=>update("nomineeEmail",v)} />
          <InputField label="Nominee Aadhar" value={form.nomineeAadhar} onChange={(v:unknown)=>update("nomineeAadhar",v)} />
          <InputField label="Nominee PAN" value={form.nomineePan} onChange={(v:unknown)=>update("nomineePan",v)} />
          <InputField label="A/C Type" value={form.acType} onChange={(v:unknown)=>update("acType",v)} />
          <InputField label="A/C Opening Date" value={form.acOpeningDate} onChange={(v:unknown)=>update("acOpeningDate",v)} />
        </div>
      )}

      {/* ================= CONTACT DETAILS ================= */}
      {/* =============== CONTACT DETAILS =============== */}
<SectionHeader
  title="Contact Info ➤"
  toggle={() => toggleSection("contact")}
/>

{openSection === "contact" && (
  <div className="mt-4 grid grid-cols-2 gap-6">
    <InputField
      label="Mobile No"
      value={form.mobile}
      onChange={(v:unknown) => update("mobile", v)}
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
)}

      {/* ================= BILLING DETAILS ================= */}
      <SectionHeader
        title="Billing Info ➤"
        toggle={() => toggleSection("billing")}
      />

      {openSection === "billing" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <InputField label="Billing Name" value={form.billName} onChange={(v:unknown)=>update("billName",v)} />
            <InputField label="GST No" value={form.gst} onChange={(v:unknown)=>update("gst",v)} />
          </div>
          <div className="mt-6">
            <TextAreaField label="Billing Address" value={form.billingAddress} onChange={(v:unknown)=>update("billingAddress",v)} />
          </div>
        </>
      )}

      {/* ================= BANK DETAILS ================= */}
      <SectionHeader
        title="Bank Info ➤"
        toggle={() => toggleSection("bank")}
      />

      {openSection === "bank" && (
        <div className="mt-4 grid grid-cols-2 gap-6">
          <InputField label="Holder Name" value={form.holderName} onChange={(v:unknown)=>update("holderName",v)} />
          <InputField label="Bank Name" value={form.bankName} onChange={(v:unknown)=>update("bankName",v)} />
          <InputField label="Account Number" value={form.accNumber} onChange={(v:unknown)=>update("accNumber",v)} />
          <InputField label="IFSC" value={form.ifsc} onChange={(v:unknown)=>update("ifsc",v)} />
          <InputField label="MICR" value={form.micr} onChange={(v:unknown)=>update("micr",v)} />
        </div>
      )}

      {/* SAVE */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => setPreview(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
    //</div>
  );
}




