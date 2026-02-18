import React, { useState } from "react";
import ContactDetails from "../steps/ContactDetails";

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
export default function OnboardingProcess() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggleSection = (name: string) =>
    setOpenSection(openSection === name ? null : name);

  /* ================= FORM STATE ================= */
  const [form, setForm] = useState<any>({
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
    branch: "",
  });

  const update = (field: string, value: any) =>
    setForm((p: any) => ({ ...p, [field]: value }));

  /* ================= SPECIAL LOGIC ================= */
  const calculateAge = (dob: string) => {
    update("dob", dob);
    if (!dob) return update("age", "");
    const d = new Date(dob);
    const t = new Date();
    let age = t.getFullYear() - d.getFullYear();
    if (t < new Date(d.setFullYear(t.getFullYear()))) age--;
    update("age", String(age));
  };

  const [samePerm, setSamePerm] = useState(false);
  const syncPermanent = () =>
    samePerm && update("permAddress", form.commAddress);

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
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <div className="flex justify-center mb-6">
        <HeaderSteps current={1} />
      </div>

      <FileUpload />

      {/* ================= PERSONAL DETAILS ================= */}
      <SectionHeader
        title="Personal Details ➤"
        toggle={() => toggleSection("personal")}
      />

      {openSection === "personal" && (
        <>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Name" value={form.name} onChange={(v: any) => update("name", v)} />
            <InputField label="Location" value={form.location} onChange={(v: any) => update("location", v)} />
            <DropdownField
              label="Gender"
              value={form.gender}
              options={["Male", "Female"]}
              onChange={(v: any) => update("gender", v)}
            />
            <InputField type="date" label="DOB" value={form.dob} onChange={calculateAge} />
            <InputField label="Age" readOnly value={form.age} />
            <InputField label="Occupation" value={form.occupation} onChange={(v: any) => update("occupation", v)} />

            <DropdownField
              label="Income"
              value={form.income}
              options={["1–2 LPA", "2–5 LPA", "5–10 LPA", "10+ LPA"]}
              onChange={(v: any) => update("income", v)}
            />

            <InputField label="Company" value={form.company} onChange={(v: any) => update("company", v)} />
            <InputField label="Designation" value={form.designation} onChange={(v: any) => update("designation", v)} />
            <InputField label="PAN No." value={form.pan} onChange={(v: any) => update("pan", v)} />
            <InputField label="Aadhaar Number" value={form.aadhaar} onChange={(v: any) => update("aadhaar", v)} />
            <InputField label="Contact Person Name" value={form.contactPersonName} onChange={(v: any) => update("contactPersonName", v)} />
            <InputField label="Contact Person No." value={form.contactPersonNo} onChange={(v: any) => update("contactPersonNo", v)} />

            <DropdownField
              label="Relationship"
              value={form.relationship}
              options={["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Grand Son", "Grand-Daughter", "Grand Father", "Grand Mother", "Others"]}
              onChange={(v: any) => update("relationship", v)}
            />

            {form.relationship === "Others" && (
              <InputField label="Specify Relationship" value={form.relationshipOther} onChange={(v: any) => update("relationshipOther", v)} />
            )}

            <DropdownField
              label="Client Source"
              value={form.clientSource}
              options={["REFERENCE", "ONLINE", "YES CON", "START-UP", "JUBILAN", "SPOTLIGHT-YES", "OTHERS"]}
              onChange={(v: any) => update("clientSource", v)}
            />

            {form.clientSource === "OTHERS" && (
              <InputField label="Specify Client Source" value={form.clientSourceOther} onChange={(v: any) => update("clientSourceOther", v)} />
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextAreaField label="Communication Address" value={form.commAddress} onChange={(v: any) => update("commAddress", v)} />
            <div>
              <TextAreaField
                label="Permanent Address"
                readOnly={samePerm}
                value={samePerm ? form.commAddress : form.permAddress}
                onChange={(v: any) => update("permAddress", v)}
              />
              <label className="flex items-center gap-2 mt-2 text-sm">
                <input type="checkbox" checked={samePerm} onChange={(e) => { setSamePerm(e.target.checked); syncPermanent(); }} />
                Same as communication address
              </label>
            </div>
          </div>

          <div className="mt-6">
            <FamilyAccounts
              accounts={familyAccounts}
              add={() => setFamilyAccounts([...familyAccounts, ""])}
              update={(i: any, v: any) => { const l = [...familyAccounts]; l[i] = v; setFamilyAccounts(l); }}
              remove={(i: any) => setFamilyAccounts(familyAccounts.filter((_, idx) => idx !== i))}
            />
          </div>
        </>
      )}

      {/* ================= DEMAT ACCOUNT ================= */}
      <SectionHeader
        title="Demat Account ➤"
        toggle={() => toggleSection("demat")}
      />

      {openSection === "demat" && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="DP ID" value={form.dpId} onChange={(v: any) => update("dpId", v)} />
          <InputField label="Client Code" value={form.clientCode} onChange={(v: any) => update("clientCode", v)} />
          <InputField label="Scheme Name" value={form.schemeName} onChange={(v: any) => update("schemeName", v)} />
          <DropdownField
            label="Broker Name"
            value={form.brokerName}
            options={["Motilal Oswal", "Aditya Birla"]}
            onChange={(v: any) => update("brokerName", v)}
          />
          <InputField label="Nominee Name" value={form.nomineeName} onChange={(v: any) => update("nomineeName", v)} />

          <DropdownField
            label="Nominee Relationship"
            value={form.nomineeRelationship}
            options={["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Others"]}
            onChange={(v: any) => update("nomineeRelationship", v)}
          />

          {form.nomineeRelationship === "Others" && (
            <InputField label="Specify Nominee Relationship" value={form.nomineeRelationshipOther} onChange={(v: any) => update("nomineeRelationshipOther", v)} />
          )}

          <InputField label="Nominee Contact" value={form.nomineeContact} onChange={(v: any) => update("nomineeContact", v)} />
          <InputField label="Nominee Email" value={form.nomineeEmail} onChange={(v: any) => update("nomineeEmail", v)} />
          <InputField label="Nominee Aadhaar No." value={form.nomineeAadhar} onChange={(v: any) => update("nomineeAadhar", v)} />
          <InputField label="Nominee PAN No." value={form.nomineePan} onChange={(v: any) => update("nomineePan", v)} />

          <DropdownField
            label="A/C Type"
            value={form.acType}
            options={["Resident India", "NRI", "HUF", "PUT CTD", "Minor", "Joint", "Others"]}
            onChange={(v: any) => update("acType", v)}
          />

          {form.acType === "Others" && (
            <InputField label="Specify A/C Type" value={form.acTypeOther} onChange={(v: any) => update("acTypeOther", v)} />
          )}

          <InputField type="date" label="A/C Opening Date" value={form.accountOpeningDate} onChange={(v: any) => update("accountOpeningDate", v)} />
        </div>
      )}

      {/* CONTACT DETAILS */}
      <SectionHeader
        title="Contact Details ➤"
        //isOpen={openSection === "contact"}
        toggle={() => toggleSection("contact")}
      />

      {openSection === "contact" && (
        <div className="mt-4">
          <ContactDetails form={form} update={update} />
        </div>
      )}

      {/* BILLING DETAILS */}
      <SectionHeader
        title="Billing Details ➤"
        //isOpen={openSection === "billing"}
        toggle={() => toggleSection("billing")}
      />

      {openSection === "billing" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <InputField label="Name" value={form.billName} onChange={(v: any) => update("billName", v)} />
            <InputField label="GST No." value={form.gst} onChange={(v: any) => update("gst", v)} />
          </div>
          <div className="mt-6">
            <TextAreaField label="Billing Address" value={form.billingAddress} onChange={(v: any) => update("billingAddress", v)} />
          </div>
        </>
      )}

      {/* BANK DETAILS */}
      <SectionHeader
        title="Bank Details ➤"
        //isOpen={openSection === "bank"}
        toggle={() => toggleSection("bank")}
      />

      {openSection === "bank" && (
        <div className="mt-4 grid grid-cols-2 gap-6">
          <InputField label="Holder Name" value={form.holderName} onChange={(v: any) => update("holderName", v)} />
          <InputField label="Acc Number" value={form.accNumber} onChange={(v: any) => update("accNumber", v)} />
          <InputField label="Bank Name" value={form.bankName} onChange={(v: any) => update("bankName", v)} />
          <InputField label="Branch" value={form.branch} onChange={(v: any) => update("branch", v)} />
          <InputField label="IFSC" value={form.ifsc} onChange={(v: any) => update("ifsc", v)} />
          <InputField label="MICR No." value={form.micr} onChange={(v: any) => update("micr", v)} />
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

      <PreviewModal open={preview} data={form} onClose={() => setPreview(false)} onSubmit={submitForm} />
      <SuccessPopup open={success} />
    </div>
  );
}
