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


export default function OnboardingProcess() {

  /* -------------------------------------------------------------
      SECTION TOGGLE
  ------------------------------------------------------------- */
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (name: string) => {
    setOpenSection(prev => (prev === name ? null : name));
  };


  /* -------------------------------------------------------------
      FORM STATE
  ------------------------------------------------------------- */
  const [form, setForm] = useState({
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

    mobile: "",
    whatsapp: "",
    language: "",
    email: "",
    tradeNumber: "",

    billName: "",
    gst: "",
    billingAddress: "",

    holderName: "",
    bankName: "",
    accNumber: "",
    ifsc: "",
    micr: "",

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
    setForm(prev => ({ ...prev, [field]: value }));


  /* -------------------------------------------------------------
      AGE CALCULATION
  ------------------------------------------------------------- */
  const calculateAge = (dob: string) => {
    update("dob", dob);
    if (!dob) return update("age", "");

    const d = new Date(dob);
    const t = new Date();

    let age = t.getFullYear() - d.getFullYear();
    const m = t.getMonth() - d.getMonth();

    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;

    update("age", String(age));
  };


  /* -------------------------------------------------------------
      AUTO-FILL LOGIC
  ------------------------------------------------------------- */
  const [samePerm, setSamePerm] = useState(false);
  const [sameWhatsapp, setSameWhatsapp] = useState(false);

  const syncPermanent = () => {
    if (samePerm) update("permAddress", form.commAddress);
  };

  const syncWhatsapp = () => {
    if (sameWhatsapp) update("whatsapp", form.mobile);
  };


  /* -------------------------------------------------------------
      LIST STATES
  ------------------------------------------------------------- */
  const [familyAccounts, setFamilyAccounts] = useState<string[]>([""]);
  const [whatsappList, setWhatsappList] = useState<string[]>([""]);


  /* -------------------------------------------------------------
      PREVIEW & SUCCESS POPUP
  ------------------------------------------------------------- */
  const [preview, setPreview] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitForm = () => {
    setPreview(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
  };


  /* -------------------------------------------------------------
      RENDER UI
  ------------------------------------------------------------- */
  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">

      {/* -------------------------------------------------------------
            STEP HEADER — CENTERED
      ------------------------------------------------------------- */}
      <div className="flex justify-center mb-8">
        <HeaderSteps current={1} />
      </div>


      {/* -------------------------------------------------------------
            PHOTO UPLOAD
      ------------------------------------------------------------- */}
      <FileUpload />


      {/* -------------------------------------------------------------
            PERSONAL DETAILS — COLLAPSIBLE
      ------------------------------------------------------------- */}
      <div className="border p-4 rounded-lg mb-4">
        <div
          onClick={() => toggleSection("personal")}
          className="flex justify-between items-center cursor-pointer text-lg font-semibold text-indigo-700"
        >
          <span>Personal Details</span>
        </div>

        {openSection === "personal" && (
          <>
            <div className="mt-4 grid grid-cols-2 gap-6">
              <InputField label="Name" value={form.name} onChange={(v: any)=>update("name",v)} />
              <InputField label="Location" value={form.location} onChange={(v: any)=>update("location",v)} />
              <InputField label="Gender" value={form.gender} onChange={(v: any)=>update("gender",v)} />
              <InputField type="date" label="DOB" value={form.dob} onChange={calculateAge} />
              <InputField label="Age" value={form.age} readOnly />
              <InputField label="Occupation" value={form.occupation} onChange={(v: any)=>update("occupation",v)} />

              <DropdownField
                label="Income Range"
                value={form.income}
                options={["1–2 LPA","2–5 LPA","5–10 LPA","10+ LPA"]}
                onChange={(v: any)=>update("income",v)}
              />

              <InputField label="Company" value={form.company} onChange={(v: any)=>update("company",v)} />
              <InputField label="Designation" value={form.designation} onChange={(v: any)=>update("designation",v)} />
              <InputField label="PAN No" value={form.pan} onChange={(v: any)=>update("pan",v)} />
              <InputField label="Aadhaar No" value={form.aadhaar} onChange={(v: any)=>update("aadhaar",v)} />
              <InputField label="Contact Person Name" value={form.contactPersonName} onChange={(v: any)=>update("contactPersonName",v)} />
              <InputField label="Contact Person No" value={form.contactPersonNo} onChange={(v: any)=>update("contactPersonNo",v)} />

              <DropdownField
                label="Relationship"
                value={form.relationship}
                options={["Spouse","Son","Daughter","Father","Mother","Brother","Sister","Others"]}
                onChange={(v: any)=>update("relationship",v)}
              />

              <DropdownField
                label="Client Source"
                value={form.clientSource}
                options={["Reference","Online","YES Con","Start-up","Jubilan","Spotlight-YES","Others"]}
                onChange={(v: any)=>update("clientSource",v)}
              />
            </div>

            {/* ADDRESS SECTION */}
            <div className="mt-6 grid grid-cols-2 gap-6">
              <TextAreaField
                label="Communication Address"
                value={form.commAddress}
                onChange={(v: any)=>update("commAddress",v)}
              />

              <div>
                <TextAreaField
                  label="Permanent Address"
                  value={samePerm ? form.commAddress : form.permAddress}
                  readOnly={samePerm}
                  onChange={(v: any)=>update("permAddress",v)}
                />

                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input
                    type="checkbox"
                    checked={samePerm}
                    onChange={(e)=>{
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
                add={()=>setFamilyAccounts([...familyAccounts,""])}
                update={(i: any,v: any)=>{
                  const list=[...familyAccounts];
                  list[i]=v;
                  setFamilyAccounts(list);
                }}
                remove={(i: any)=>{
                  const list=familyAccounts.filter((_,idx)=>idx!==i);
                  setFamilyAccounts(list);
                }}
              />
            </div>
          </>
        )}
      </div>


      {/* -------------------------------------------------------------
            ALL OTHER SECTIONS (DEMAT, CONTACT, BILLING, BANK)
            — You already wrote them, same pattern continues
      ------------------------------------------------------------- */}


      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={()=>setPreview(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Save
        </button>
      </div>

      {/* MODALS */}
      <PreviewModal open={preview} data={form} onClose={()=>setPreview(false)} onSubmit={submitForm}/>
      <SuccessPopup open={success}/>
    </div>
  );
}
