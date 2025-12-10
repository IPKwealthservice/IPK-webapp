import React, { useState } from "react";

// ------------------------ COMPONENTS ------------------------
import Section from "../components/Section";
import InputField from "../components/InputField";
import TextAreaField from "../components/TextAreaField";
import DropdownField from "../components/DropdownField";
import FileUpload from "../components/FileUpload";
import FamilyAccounts from "../components/FamilyAccounts";
import WhatsappList from "../components/WhatsappList";
import PreviewModal from "../components/PreviewModal";
import SuccessPopup from "../components/SuccessPopup";
import HeaderSteps from "./HeaderSteps";

/* ===========================================================
   REUSABLE SECTION HEADER WITH ARROW
=========================================================== */
const SectionHeader = ({
  title,
  isOpen,
  toggle,
}: {
  title: string;
  isOpen: boolean;
  toggle: () => void;
}) => (
  <div
    onClick={toggle}
    className="flex justify-between items-center cursor-pointer text-lg font-semibold text-indigo-700 py-3 border-b"
  >
    <span>{title}</span>
  </div>
);

/* ===========================================================
   MAIN ONBOARDING PROCESS PAGE
=========================================================== */
export default function OnboardingProcess() {
  const [openSection, setOpenSection] = useState<null | string>(null);

  const toggleSection = (name: string) => {
    setOpenSection(openSection === name ? null : name);
  };

  /* ================================
        FORM STATE
  =================================*/
  const [form, setForm] = useState({
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
    clientSource: "",

    // CONTACT
    mobile: "",
    whatsapp: "",
    language: "",
    email: "",
    tradeNumber: "",

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

    // DEMAT
    dpId: "",
    clientCode: "",
    schemeName: "",
    brokerName: "",
    nomineeName: "",
    nomineeRelation: "",
    nomineeContact: "",
    nomineeEmail: "",
    nomineeAadhar: "",
    nomineePan: "",
    accountType: "",
    accountOpeningDate: "",
  });

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  /* ================================
        SPECIAL FIELD LOGIC
  =================================*/
  const calculateAge = (dob: string) => {
    update("dob", dob);
    if (!dob) return update("age", "");

    const d = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();

    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;

    update("age", String(age));
  };

  const [samePerm, setSamePerm] = useState(false);
  const syncPermanent = () => samePerm && update("permAddress", form.commAddress);

  const [sameWhatsapp, setSameWhatsapp] = useState(false);
  const syncWhatsapp = () => sameWhatsapp && update("whatsapp", form.mobile);

  const [familyAccounts, setFamilyAccounts] = useState([""]);
  const [whatsappList, setWhatsappList] = useState([""]);

  /* ================================
        PREVIEW & SUCCESS
  =================================*/
  const [preview, setPreview] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitForm = () => {
    setPreview(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
  };

  /* ================================
        UI RENDER
  =================================*/
  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">

      {/* STEP HEADER CENTERED */}
      <div className="flex justify-center mb-6">
        <HeaderSteps current={1} />
      </div>

      {/* PHOTO UPLOAD */}
      <FileUpload />

      {/* =====================================================
            PERSONAL DETAILS
      ===================================================== */}
      <SectionHeader
        title="Personal Details"
        isOpen={openSection === "personal"}
        toggle={() => toggleSection("personal")}
      />

      {openSection === "personal" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <InputField label="Name" value={form.name} onChange={(v: any) => update("name", v)} />
            <InputField label="Location" value={form.location} onChange={(v: any) => update("location", v)} />
            <InputField label="Gender" value={form.gender} onChange={(v: any) => update("gender", v)} />
            <InputField type="date" label="DOB" value={form.dob} onChange={calculateAge} />
            <InputField label="Age" readOnly value={form.age} />
            <InputField label="Occupation" value={form.occupation} onChange={(v: any) => update("occupation", v)} />

            <DropdownField
              label="Income Range"
              options={["1–2 LPA", "2–5 LPA", "5–10 LPA", "10+ LPA"]}
              value={form.income}
              onChange={(v: any) => update("income", v)}
            />

            <InputField label="Company" value={form.company} onChange={(v: any) => update("company", v)} />
            <InputField label="Designation" value={form.designation} onChange={(v: any) => update("designation", v)} />
            <InputField label="PAN No" value={form.pan} onChange={(v: any) => update("pan", v)} />
            <InputField label="Aadhaar No." value={form.aadhaar} onChange={(v: any) => update("aadhaar", v)} />
            <InputField label="Contact Person Name" value={form.contactPersonName} onChange={(v: any) => update("contactPersonName", v)} />
            <InputField label="Contact Person No" value={form.contactPersonNo} onChange={(v: any) => update("contactPersonNo", v)} />

            <DropdownField
              label="Relationship"
              options={[
                "Spouse", "Son", "Daughter", "Father", "Mother",
                "Brother", "Sister", "Grand Son", "Grand-Daughter",
                "Grand Father", "Grand Mother", "Others"
              ]}
              value={form.relationship}
              onChange={(v: any) => update("relationship", v)}
            />

            <DropdownField
              label="Client Source"
              options={[
                "Reference", "Online", "YES Con", "Start-up",
                "Jubilan", "Spotlight-YES", "Others"
              ]}
              value={form.clientSource}
              onChange={(v: any) => update("clientSource", v)}
            />
          </div>

          {/* ADDRESSES */}
          <div className="mt-6 grid grid-cols-2 gap-6">
            <TextAreaField
              label="Communication Address"
              value={form.commAddress}
              onChange={(v: any) => update("commAddress", v)}
            />

            <div>
              <TextAreaField
                label="Permanent Address"
                readOnly={samePerm}
                value={samePerm ? form.commAddress : form.permAddress}
                onChange={(v: any) => update("permAddress", v)}
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

          {/* FAMILY ACCOUNTS */}
          <div className="mt-6">
            <FamilyAccounts
              accounts={familyAccounts}
              add={() => setFamilyAccounts([...familyAccounts, ""])}
              update={(i: any, v: any) => {
                const list = [...familyAccounts];
                list[i] = v;
                setFamilyAccounts(list);
              }}
              remove={(i: any) => {
                const list = familyAccounts.filter((_, idx) => idx !== i);
                setFamilyAccounts(list);
              }}
            />
          </div>
        </>
      )}

      {/* =====================================================
            DEMAT ACCOUNT
      ===================================================== */}
      <SectionHeader
        title="Demat Account"
        isOpen={openSection === "demat"}
        toggle={() => toggleSection("demat")}
      />

      {openSection === "demat" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <InputField label="DP ID" value={form.dpId} onChange={(v: any) => update("dpId", v)} />
            <InputField label="Client Code" value={form.clientCode} onChange={(v: any) => update("clientCode", v)} />
            <InputField label="Scheme Name" value={form.schemeName} onChange={(v: any) => update("schemeName", v)} />
            <InputField label="Broker Name" value={form.brokerName} onChange={(v: any) => update("brokerName", v)} />
            <InputField label="Nominee Name" value={form.nomineeName} onChange={(v: any) => update("nomineeName", v)} />

            <DropdownField
              label="Nominee Relationship"
              options={[
                "Spouse","Son","Daughter","Father","Mother",
                "Brother","Sister","Grand Son","Grand-Daughter",
                "Grand Father","Grand Mother","Others"
              ]}
              value={form.nomineeRelation}
              onChange={(v: any) => update("nomineeRelation", v)}
            />

            <InputField label="Nominee Contact" value={form.nomineeContact} onChange={(v: any) => update("nomineeContact", v)} />
            <InputField label="Nominee Email" value={form.nomineeEmail} onChange={(v: any) => update("nomineeEmail", v)} />
            <InputField label="Nominee Aadhar No." value={form.nomineeAadhar} onChange={(v: any) => update("nomineeAadhar", v)} />
            <InputField label="Nominee PAN No." value={form.nomineePan} onChange={(v: any) => update("nomineePan", v)} />

            <DropdownField
              label="A/C Type"
              options={["Resident India","NRI","HUF","PUT CTD","Minor","Joint","Others"]}
              value={form.accountType}
              onChange={(v: any) => update("accountType", v)}
            />

            <InputField type="date" label="A/C Opening Date" value={form.accountOpeningDate} onChange={(v: any) => update("accountOpeningDate", v)} />
          </div>
        </>
      )}

      {/* =====================================================
            CONTACT DETAILS
      ===================================================== */}
      <SectionHeader
        title="Contact Details"
        isOpen={openSection === "contact"}
        toggle={() => toggleSection("contact")}
      />

      {openSection === "contact" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <InputField label="Mobile No." value={form.mobile} onChange={(v: any) => update("mobile", v)} />

            <div>
              <InputField
                label="WhatsApp Number"
                readOnly={sameWhatsapp}
                value={sameWhatsapp ? form.mobile : form.whatsapp}
                onChange={(v: any) => update("whatsapp", v)}
              />

              <label className="flex items-center gap-2 mt-2 text-sm">
                <input
                  type="checkbox"
                  checked={sameWhatsapp}
                  onChange={(e) => {
                    setSameWhatsapp(e.target.checked);
                    syncWhatsapp();
                  }}
                />
                Same as Mobile Number
              </label>
            </div>

            <InputField label="Language" value={form.language} onChange={(v: any) => update("language", v)} />
            <InputField label="Email" type="email" value={form.email} onChange={(v: any) => update("email", v)} />
            <InputField label="Trade Confirmation Number" value={form.tradeNumber} onChange={(v: any) => update("tradeNumber", v)} />
          </div>

          <div className="mt-6">
            <WhatsappList
              list={whatsappList}
              add={() => setWhatsappList([...whatsappList, ""])}
              update={(i: any, v: any) => {
                const list = [...whatsappList];
                list[i] = v;
                setWhatsappList(list);
              }}
              remove={(i: any) => {
                const list = whatsappList.filter((_, idx) => idx !== i);
                setWhatsappList(list);
              }}
            />
          </div>
        </>
      )}

      {/* =====================================================
            BILLING DETAILS
      ===================================================== */}
      <SectionHeader
        title="Billing Details"
        isOpen={openSection === "billing"}
        toggle={() => toggleSection("billing")}
      />

      {openSection === "billing" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <InputField label="Name" value={form.billName} onChange={(v: any) => update("billName", v)} />
            <InputField label="GST No." value={form.gst} onChange={(v: any) => update("gst", v)} />
          </div>

          <div className="mt-6">
            <TextAreaField
              label="Billing Address"
              value={form.billingAddress}
              onChange={(v: any) => update("billingAddress", v)}
            />
          </div>
        </>
      )}

      {/* =====================================================
            BANK DETAILS
      ===================================================== */}
      <SectionHeader
        title="Bank Details"
        isOpen={openSection === "bank"}
        toggle={() => toggleSection("bank")}
      />

      {openSection === "bank" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <InputField label="Holder Name" value={form.holderName} onChange={(v: any) => update("holderName", v)} />
            <InputField label="Bank Name" value={form.bankName} onChange={(v: any) => update("bankName", v)} />
            <InputField label="Acc Number" value={form.accNumber} onChange={(v: any) => update("accNumber", v)} />
            <InputField label="IFSC" value={form.ifsc} onChange={(v: any) => update("ifsc", v)} />
            <InputField label="MICR No." value={form.micr} onChange={(v: any) => update("micr", v)} />
          </div>
        </>
      )}

      {/* SAVE BUTTON */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => setPreview(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Save
        </button>
      </div>

      {/* MODALS */}
      <PreviewModal open={preview} data={form} onClose={() => setPreview(false)} onSubmit={submitForm} />
      <SuccessPopup open={success} />
    </div>
  );
}
