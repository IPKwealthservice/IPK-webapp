import { useState } from "react";
import Section from "../components/Section";
import Field from "../components/Field";
import TextAreaField from "../components/TextAreaField";
import PhotoPicker from "../components/PhotoPicker";
import PreviewModal from "../components/PreviewModal";
import SuccessPopup from "../components/SuccessPopup";

export default function Onboarding() {
  // -----------------------------
  // FORM STATE
  // -----------------------------
  const [photo, setPhoto] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [form, setForm] = useState<any>({
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
    contactPersonNumber: "",
    relationship: "",
    clientSource: "",
    mobile: "",
    whatsapp: "",
    language: "",
    email: "",
    tradeConfirmation: "",
    billingName: "",
    gst: "",
    billingAddress: "",
    bankHolder: "",
    bankName: "",
    accNumber: "",
    ifsc: "",
    micr: "",
  });

  const [familyAccounts, setFamilyAccounts] = useState<string[]>([]);
  const [whatsappList, setWhatsappList] = useState<string[]>([]);

  // -----------------------------
  // HANDLERS
  // -----------------------------
  const update = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const addFamilyAccount = () => {
    setFamilyAccounts([...familyAccounts, ""]);
  };

  const updateFamily = (index: number, value: string) => {
    const list = [...familyAccounts];
    list[index] = value;
    setFamilyAccounts(list);
  };

  const addWhatsapp = () => {
    setWhatsappList([...whatsappList, ""]);
  };

  const updateWhatsapp = (index: number, value: string) => {
    const list = [...whatsappList];
    list[index] = value;
    setWhatsappList(list);
  };

  // Auto Age Calculation
  const calculateAge = (dob: string) => {
    update("dob", dob);
    if (!dob) return update("age", "");

    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();

    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    update("age", age);
  };

  // Checkbox Functions
  const copyCommToPerm = () => update("permAddress", form.commAddress);
  const copyPermToBilling = () => update("billingAddress", form.permAddress);
  const copyMobileToWhatsapp = () => update("whatsapp", form.mobile);

  // PREVIEW
  const openPreview = () => setPreviewOpen(true);
  const closePreview = () => setPreviewOpen(false);

  // SUBMIT
  const submit = () => {
    setPreviewOpen(false);
    setSuccessOpen(true);
    setTimeout(() => setSuccessOpen(false), 2000);
  };

  // -----------------------------
  // RENDER UI
  // -----------------------------
  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-8 my-8">
      {/* Photo */}
      <PhotoPicker photo={photo} setPhoto={setPhoto} />

      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Onboarding Process
      </h1>

      {/* --------------------- PERSONAL DETAILS --------------------- */}
      <Section title="Personal Details">
        <div className="grid grid-cols-3 gap-4">
          <Field
            label="Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />

          <Field
            label="Location"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          />

          <Field
            label="Gender"
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
          />

          <Field
            label="DOB"
            type="date"
            value={form.dob}
            onChange={(e) => calculateAge(e.target.value)}
          />

          <Field label="Age" value={form.age} readOnly />

          <Field
            label="Occupation"
            value={form.occupation}
            onChange={(e) => update("occupation", e.target.value)}
          />

          <Field
            label="Income"
            value={form.income}
            onChange={(e) => update("income", e.target.value)}
          />

          <Field
            label="Company"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
          />

          <Field
            label="Designation"
            value={form.designation}
            onChange={(e) => update("designation", e.target.value)}
          />

          <Field
            label="PAN Number"
            value={form.pan}
            onChange={(e) => update("pan", e.target.value)}
          />

          <Field
            label="Aadhaar Number"
            value={form.aadhaar}
            onChange={(e) => update("aadhaar", e.target.value)}
          />

          <Field
            label="Contact Person Name"
            value={form.contactPersonName}
            onChange={(e) => update("contactPersonName", e.target.value)}
          />

          <Field
            label="Contact Person Number"
            value={form.contactPersonNumber}
            onChange={(e) => update("contactPersonNumber", e.target.value)}
          />

          <Field
            label="Relationship"
            value={form.relationship}
            onChange={(e) => update("relationship", e.target.value)}
          />

          <Field
            label="Client Source"
            value={form.clientSource}
            onChange={(e) => update("clientSource", e.target.value)}
          />

          {/* Text Areas */}
          <TextAreaField
            label="Communication Address"
            value={form.commAddress}
            onChange={(e) => update("commAddress", e.target.value)}
          />

          <div className="col-span-3">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-xs text-gray-600 font-medium">
                Permanent Address
              </label>
              <button
                onClick={copyCommToPerm}
                className="text-xs bg-gray-100 px-2 py-1 rounded"
              >
                Same as Communication
              </button>
            </div>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-24"
              value={form.permAddress}
              onChange={(e) => update("permAddress", e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Family A/C */}
        <div className="mt-4">
          <button
            onClick={addFamilyAccount}
            className="px-3 py-1 text-xs bg-indigo-600 text-white rounded"
          >
            + Add Family A/C
          </button>

          {familyAccounts.map((acc, index) => (
            <div key={index} className="mt-2">
              <Field
                label={`Family A/C ${index + 1}`}
                value={acc}
                onChange={(e) => updateFamily(index, e.target.value)}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* --------------------- DEMAT --------------------- */}
      <Section title="Demat Account">
        <div className="grid grid-cols-3 gap-4">
          <Field
            label="DP ID"
            onChange={(e) => update("dp", e.target.value)}
          />
          <Field
            label="Client Code"
            onChange={(e) => update("clientCode", e.target.value)}
          />
          <Field label="Scheme Name" />
          <Field label="Broker Name" />
          <Field label="Nominee Name" />
          <Field label="Nominee Relationship" />
          <Field label="Nominee Contact" />
          <Field label="Nominee Email" />
          <Field label="Nominee Aadhaar" />
          <Field label="Nominee PAN" />
          <Field label="A/C Type" />
          <Field type="date" label="A/C Opening Date" />
        </div>
      </Section>

      {/* --------------------- CONTACT --------------------- */}
      <Section title="Contact">
        <div className="grid grid-cols-3 gap-4">
          <Field
            label="Mobile Number"
            value={form.mobile}
            onChange={(e) => update("mobile", e.target.value)}
          />

          <div>
            <div className="flex items-center gap-2">
              <Field
                label="WhatsApp Number"
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
              />
              <button
                onClick={copyMobileToWhatsapp}
                className="text-xs bg-gray-100 px-2 py-1 rounded"
              >
                Same
              </button>
            </div>
          </div>

          <Field
            label="Language"
            value={form.language}
            onChange={(e) => update("language", e.target.value)}
          />

          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />

          <Field
            label="Trade Confirmation Number"
            value={form.tradeConfirmation}
            onChange={(e) => update("tradeConfirmation", e.target.value)}
          />
        </div>

        {/* Add More WhatsApp */}
        <button
          onClick={addWhatsapp}
          className="mt-3 px-3 py-1 text-xs bg-indigo-600 text-white rounded"
        >
          + Add WhatsApp Number
        </button>

        {whatsappList.map((wa, index) => (
          <div key={index} className="mt-2">
            <Field
              label={`WhatsApp ${index + 1}`}
              value={wa}
              onChange={(e) => updateWhatsapp(index, e.target.value)}
            />
          </div>
        ))}
      </Section>

      {/* --------------------- BILLING --------------------- */}
      <Section title="Billing Details">
        <div className="grid grid-cols-3 gap-4">
          <Field
            label="Billing Name"
            value={form.billingName}
            onChange={(e) => update("billingName", e.target.value)}
          />
          <Field
            label="GST Number"
            value={form.gst}
            onChange={(e) => update("gst", e.target.value)}
          />

          <div className="col-span-3">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-xs text-gray-600 font-medium">
                Billing Address
              </label>
              <button
                onClick={copyPermToBilling}
                className="text-xs bg-gray-100 px-2 py-1 rounded"
              >
                Same as Permanent
              </button>
            </div>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-24"
              value={form.billingAddress}
              onChange={(e) => update("billingAddress", e.target.value)}
            ></textarea>
          </div>
        </div>
      </Section>

      {/* --------------------- BANK DETAILS --------------------- */}
      <Section title="Bank Details">
        <div className="grid grid-cols-3 gap-4">
          <Field
            label="Account Holder Name"
            value={form.bankHolder}
            onChange={(e) => update("bankHolder", e.target.value)}
          />

          <Field
            label="Bank Name"
            value={form.bankName}
            onChange={(e) => update("bankName", e.target.value)}
          />

          <Field
            label="Account Number"
            value={form.accNumber}
            onChange={(e) => update("accNumber", e.target.value)}
          />

          <Field
            label="IFSC Code"
            value={form.ifsc}
            onChange={(e) => update("ifsc", e.target.value)}
          />

          <Field
            label="MICR Number"
            value={form.micr}
            onChange={(e) => update("micr", e.target.value)}
          />
        </div>
      </Section>

      {/* SAVE BUTTON */}
      <div className="flex justify-end mt-6">
        <button
          onClick={openPreview}
          className="px-6 py-2 bg-indigo-600 text-white rounded shadow"
        >
          Save
        </button>
      </div>

      {/* MODALS */}
      <PreviewModal
        open={previewOpen}
        onClose={closePreview}
        photo={photo}
        details={form}
        submit={submit}
      />

      <SuccessPopup open={successOpen} />
    </div>
  );
}
