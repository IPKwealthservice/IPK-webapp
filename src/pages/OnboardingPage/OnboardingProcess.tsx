import React, { useState } from "react";

import Header from "./Header";

import PersonalDetails from "./sections/PersonalDetails";
import DematDetails from "./sections/DematDetails";
import ContactDetails from "./sections/ContactDetails";
import BillingDetails from "./sections/BillingDetails";
import BankDetails from "./sections/BankDetails";

import PreviewModal from "./components/PreviewModal";
import SuccessPopup from "./components/SuccessPopup";
import FileUpload from "./components/FileUpload";

export default function OnboardingProcess() {
  // ------------------------------------
  // MASTER FORM STATE
  // ------------------------------------
  const [form, setForm] = useState({
    // Personal
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

    // Demat
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
    accountType: "",
    accountTypeOther: "",
    accountOpeningDate: "",

    // Contact
    mobile: "",
    whatsappPrimary: "",
    language: "",
    email: "",
    tradeNumber: "",

    // Billing
    billingName: "",
    gstNo: "",
    billingAddress: "",

    // Bank
    holderName: "",
    bankName: "",
    accNumber: "",
    ifsc: "",
    micr: "",
  });

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Family A/C and WhatsApp Lists
  const [familyAccounts, setFamilyAccounts] = useState<string[]>([""]);
  const [whatsappList, setWhatsappList] = useState<string[]>([""]);

  // ------------------------------------
  // Preview + Success Popup
  // ------------------------------------
  const [openPreview, setOpenPreview] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitForm = () => {
    setOpenPreview(false);
    setSuccess(true);

    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 pb-10">
      {/* HEADER */}
      <Header />

      {/* MAIN WRAPPER */}
      <div className="max-w-5xl mx-auto bg-white p-8 shadow-xl rounded-xl mt-6">
        {/* PHOTO UPLOAD */}
        <FileUpload />

        {/* PERSONAL DETAILS */}
        <PersonalDetails
          form={form}
          update={update}
          familyAccounts={familyAccounts}
          setFamilyAccounts={setFamilyAccounts}
        />

        {/* DEMAT DETAILS */}
        <DematDetails form={form} update={update} />

        {/* CONTACT DETAILS */}
        <ContactDetails
          form={form}
          update={update}
          whatsappList={whatsappList}
          setWhatsappList={setWhatsappList}
        />

        {/* BILLING DETAILS */}
        <BillingDetails form={form} update={update} />

        {/* BANK DETAILS */}
        <BankDetails form={form} update={update} />

        {/* SAVE BUTTON */}
        <div className="flex justify-end mt-8">
          <button
            onClick={() => setOpenPreview(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>

      {/* MODALS */}
      <PreviewModal
        open={openPreview}
        data={{ ...form, familyAccounts, whatsappList }}
        onClose={() => setOpenPreview(false)}
        onSubmit={submitForm}
      />

      <SuccessPopup open={success} />
    </div>
  );
}
