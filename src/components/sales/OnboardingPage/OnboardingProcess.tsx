import React, { useState } from "react";

// ------------------------ COMPONENTS ------------------------
import Section from "./components/Section";
import InputField from "./components/InputField";
import TextAreaField from "./components/TextAreaField";
import DropdownField from "./components/DropdownField";
import FileUpload from "./components/FileUpload";
import FamilyAccounts from "./components/FamilyAccounts";
import WhatsappList from "./components/WhatsappList";
import PreviewModal from "./components/PreviewModal";
import SuccessPopup from "./components/SuccessPopup";

export default function OnboardingProcess() {
  // -------------------------------------------------
  // SECTION COLLAPSE HANDLING
  // -------------------------------------------------
  const [openSection, setOpenSection] = useState<null | string>(null);

  const toggleSection = (name: string) => {
    setOpenSection(openSection === name ? null : name);
  };

  // -------------------------------------------------
  // FORM STATE
  // -------------------------------------------------
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

  // -------------------------------------------------
  // SPECIAL FIELD LOGIC
  // -------------------------------------------------
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

  // Permanent Address = Communication Address
  const [samePerm, setSamePerm] = useState(false);

  const syncPermanent = () => {
    if (samePerm) update("permAddress", form.commAddress);
  };

  // WhatsApp Number = Mobile Number
  const [sameWhatsapp, setSameWhatsapp] = useState(false);

  const syncWhatsapp = () => {
    if (sameWhatsapp) update("whatsapp", form.mobile);
  };

  // FAMILY ACCOUNTS & WHATSAPP LIST
  const [familyAccounts, setFamilyAccounts] = useState<string[]>([""]);
  const [whatsappList, setWhatsappList] = useState<string[]>([""]);

  // -------------------------------------------------
  // PREVIEW & SUCCESS
  // -------------------------------------------------
  const [preview, setPreview] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitForm = () => {
    setPreview(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
  };

  // -------------------------------------------------
  // UI RENDER
  // -------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">

      {/* ===================== PHOTO ===================== */}
      <FileUpload />

      {/* =====================================================
            PERSONAL DETAILS
      ===================================================== */}
      <div className="border p-4 rounded-lg mb-4">
        <button
          className="w-full text-left text-lg font-semibold text-indigo-700"
          onClick={() => toggleSection("personal")}
        >
          Personal Details
        </button>

        {openSection === "personal" && (
          <div className="mt-4 grid grid-cols-2 gap-6">

            <InputField label="Name" value={form.name} onChange={(v: any) => update("name", v)} />

            <InputField label="Location" value={form.location} onChange={(v: any) => update("location", v)} />

            <InputField label="Gender" value={form.gender} onChange={(v: any) => update("gender", v)} />

            <InputField type="date" label="DOB" value={form.dob} onChange={calculateAge} />

            <InputField label="Age" value={form.age} readOnly />

            <InputField label="Occupation" value={form.occupation} onChange={(v: any) => update("occupation", v)} />

            <DropdownField
              label="Income Range"
              value={form.income}
              options={["1–2 LPA", "2–5 LPA", "5–10 LPA", "10+ LPA"]}
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
              value={form.relationship}
              options={[
                "Spouse", "Son", "Daughter", "Father", "Mother",
                "Brother", "Sister", "Grand Son", "Grand-Daughter",
                "Grand Father", "Grand Mother", "Others"
              ]}
              onChange={(v: any) => update("relationship", v)}
            />

            <DropdownField
              label="Client Source"
              value={form.clientSource}
              options={[
                "Reference", "Online", "YES Con", "Start-up",
                "Jubilan", "Spotlight-YES", "Others"
              ]}
              onChange={(v: any) => update("clientSource", v)}
            />
          </div>
        )}

        {/* ADDRESSES */}
        {openSection === "personal" && (
          <div className="mt-6 grid grid-cols-2 gap-6">
            <TextAreaField
              label="Communication Address"
              value={form.commAddress}
              onChange={(v: any) => update("commAddress", v)}
            />

            <div>
              <TextAreaField
                label="Permanent Address"
                value={samePerm ? form.commAddress : form.permAddress}
                readOnly={samePerm}
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
        )}

        {/* FAMILY ACCOUNTS */}
        {openSection === "personal" && (
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
        )}
      </div>

      {/* =====================================================
            DEMAT ACCOUNT
      ===================================================== */}
      <div className="border p-4 rounded-lg mb-4">
        <button
          className="w-full text-left text-lg font-semibold text-indigo-700"
          onClick={() => toggleSection("demat")}
        >
          Demat Account
        </button>

        {openSection === "demat" && (
          <div className="mt-4 grid grid-cols-2 gap-6">
            <InputField label="DP ID" value={form.dpId} onChange={(v: any)=>update("dpId",v)} />
            <InputField label="Client Code" value={form.clientCode} onChange={(v: any)=>update("clientCode",v)} />
            <InputField label="Scheme Name" value={form.schemeName} onChange={(v: any)=>update("schemeName",v)} />
            <InputField label="Broker Name" value={form.brokerName} onChange={(v: any)=>update("brokerName",v)} />
            <InputField label="Nominee Name" value={form.nomineeName} onChange={(v: any)=>update("nomineeName",v)} />

            <DropdownField
              label="Nominee Relationship"
              value={form.nomineeRelation}
              options={[
                "Spouse","Son","Daughter","Father","Mother",
                "Brother","Sister","Grand Son","Grand-Daughter",
                "Grand Father","Grand Mother","Others"
              ]}
              onChange={(v: any)=>update("nomineeRelation",v)}
            />

            <InputField label="Nominee Contact" value={form.nomineeContact} onChange={(v: any)=>update("nomineeContact",v)} />
            <InputField label="Nominee Email" value={form.nomineeEmail} onChange={(v: any)=>update("nomineeEmail",v)} />
            <InputField label="Nominee Aadhar" value={form.nomineeAadhar} onChange={(v: any)=>update("nomineeAadhar",v)} />
            <InputField label="Nominee PAN" value={form.nomineePan} onChange={(v: any)=>update("nomineePan",v)} />

            <DropdownField
              label="A/C Type"
              value={form.accountType}
              options={[
                "Resident India","NRI","HUF","PUT CTD","Minor","Joint","Others"
              ]}
              onChange={(v: any)=>update("accountType",v)}
            />

            <InputField type="date" label="A/C Opening Date" value={form.accountOpeningDate} onChange={(v: any)=>update("accountOpeningDate",v)} />
          </div>
        )}
      </div>

      {/* =====================================================
            CONTACT DETAILS
      ===================================================== */}
      <div className="border p-4 rounded-lg mb-4">
        <button
          className="w-full text-left text-lg font-semibold text-indigo-700"
          onClick={() => toggleSection("contact")}
        >
          Contact Details
        </button>

        {openSection === "contact" && (
          <div className="mt-4 grid grid-cols-2 gap-6">
            <InputField label="Mobile No." value={form.mobile} onChange={(v: any)=>update("mobile",v)} />

            <div>
              <InputField
                label="WhatsApp Number"
                value={sameWhatsapp ? form.mobile : form.whatsapp}
                readOnly={sameWhatsapp}
                onChange={(v: any)=>update("whatsapp",v)}
              />

              <label className="flex items-center gap-2 mt-2 text-sm">
                <input
                  type="checkbox"
                  checked={sameWhatsapp}
                  onChange={(e)=>{
                    setSameWhatsapp(e.target.checked);
                    syncWhatsapp();
                  }}
                />
                Same as Mobile Number
              </label>
            </div>

            <InputField label="Language" value={form.language} onChange={(v: any)=>update("language",v)} />
            <InputField label="Email" type="email" value={form.email} onChange={(v: any)=>update("email",v)} />
            <InputField label="Trade Confirmation Number" value={form.tradeNumber} onChange={(v: any)=>update("tradeNumber",v)} />
          </div>
        )}

        {openSection === "contact" && (
          <div className="mt-6">
            <WhatsappList
              list={whatsappList}
              add={()=>setWhatsappList([...whatsappList,""])}
              update={(i: any,v: any)=>{
                const list=[...whatsappList];
                list[i]=v;
                setWhatsappList(list);
              }}
              remove={(i: any)=>{
                const list=whatsappList.filter((_,idx)=>idx!==i);
                setWhatsappList(list);
              }}
            />
          </div>
        )}
      </div>

      {/* =====================================================
            BILLING DETAILS
      ===================================================== */}
      <div className="border p-4 rounded-lg mb-4">
        <button
          className="w-full text-left text-lg font-semibold text-indigo-700"
          onClick={() => toggleSection("billing")}
        >
          Billing Details
        </button>

        {openSection === "billing" && (
          <>
            <div className="mt-4 grid grid-cols-2 gap-6">
              <InputField label="Name" value={form.billName} onChange={(v: any)=>update("billName",v)} />
              <InputField label="GST No." value={form.gst} onChange={(v: any)=>update("gst",v)} />
            </div>

            <div className="mt-6">
              <TextAreaField
                label="Billing Address"
                value={form.billingAddress}
                onChange={(v: any)=>update("billingAddress",v)}
              />
            </div>
          </>
        )}
      </div>

      {/* =====================================================
            BANK DETAILS
      ===================================================== */}
      <div className="border p-4 rounded-lg mb-10">
        <button
          className="w-full text-left text-lg font-semibold text-indigo-700"
          onClick={() => toggleSection("bank")}
        >
          Bank Details
        </button>

        {openSection === "bank" && (
          <div className="mt-4 grid grid-cols-2 gap-6">
            <InputField label="Holder Name" value={form.holderName} onChange={(v: any)=>update("holderName",v)} />
            <InputField label="Bank Name" value={form.bankName} onChange={(v: any)=>update("bankName",v)} />
            <InputField label="Acc Number" value={form.accNumber} onChange={(v: any)=>update("accNumber",v)} />
            <InputField label="IFSC" value={form.ifsc} onChange={(v: any)=>update("ifsc",v)} />
            <InputField label="MICR No." value={form.micr} onChange={(v: any)=>update("micr",v)} />
          </div>
        )}
      </div>

      {/* =====================================================
            SAVE BUTTON
      ===================================================== */}
      <div className="flex justify-end">
        <button
          onClick={() => setPreview(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Save
        </button>
      </div>

      {/* =====================================================
            MODALS
      ===================================================== */}
      <PreviewModal open={preview} data={form} onClose={()=>setPreview(false)} onSubmit={submitForm} />
      <SuccessPopup open={success} />
    </div>
  );
}
