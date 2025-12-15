import { useEffect, useState } from "react";
import Section from "../components/Section";
import InputField from "../components/InputField";
import DropdownField from "../components/DropdownField";
import TextAreaField from "../components/TextAreaField";
import FamilyAccounts from "../components/FamilyAccounts";
import HeaderSteps from "../components/HeaderSteps";

export default function ClientProfile() {
  /* ---------------- STATE ---------------- */
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [commAddress, setCommAddress] = useState("");
  const [permAddress, setPermAddress] = useState("");
  const [sameAddress, setSameAddress] = useState(false);

  /* ---------------- AGE CALCULATION ---------------- */
  useEffect(() => {
    if (!dob) {
      setAge("");
      return;
    }
    const birthDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    setAge(String(calculatedAge));
  }, [dob]);

  /* ---------------- ADDRESS COPY ---------------- */
  useEffect(() => {
    if (sameAddress) {
      setPermAddress(commAddress);
    }
  }, [sameAddress, commAddress]);

  return (
    <div className="max-w-5xl mx-auto p-8">

      {/* Step Header */}
      <HeaderSteps current={1} />

      <h2 className="text-xl font-semibold mb-4 mt-6">Client Profile</h2>

      <Section title="Personal Information">
        {/* BASIC DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Name" />
          <InputField label="Location" />

          <DropdownField
            label="Gender"
            options={["Male", "Female", "Other"]}
          />

          <InputField
            type="date"
            label="DOB"
            value={dob}
            onChange={(e: any) => setDob(e.target.value)}
          />

          <InputField
            label="Age"
            value={age}
            readOnly
          />

          <InputField label="Occupation" />

          <DropdownField
            label="Income Range"
            options={[
              "1–2 LPA",
              "2–3 LPA",
              "3–4 LPA",
              "4–5 LPA",
              "5–6 LPA",
              "6–7 LPA",
              "7–8 LPA",
              "8–9 LPA",
              "9–10 LPA",
              "10+ LPA",
            ]}
          />

          <InputField label="Company" />
          <InputField label="Designation" />
          <InputField label="PAN No." />
          <InputField label="Aadhaar Number" />
          <InputField label="Contact Person Name" />
          <InputField label="Contact Person No." />

          <DropdownField
            label="Relationship"
            options={[
              "Spouse",
              "Son",
              "Daughter",
              "Father",
              "Mother",
              "Brother",
              "Sister",
              "Others",
            ]}
          />

          <DropdownField
            label="Client Source"
            options={[
              "Reference",
              "Online",
              "YES Con",
              "Start-up",
              "Jubilan",
              "Spotlight-YES",
              "Others",
            ]}
          />
        </div>

        {/* ADDRESS */}
        <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-6">
          <TextAreaField
            label="Communication Address"
            value={commAddress}
            onChange={(e: any) => setCommAddress(e.target.value)}
          />

          <div>
            <TextAreaField
              label="Permanent Address"
              value={permAddress}
              onChange={(e: any) => setPermAddress(e.target.value)}
              readOnly={sameAddress}
            />

            <label className="flex items-center gap-2 mt-2 text-sm">
              <input
                type="checkbox"
                checked={sameAddress}
                onChange={(e) => setSameAddress(e.target.checked)}
              />
              Same as Communication Address
            </label>
          </div>
        </div>

        {/* FAMILY ACCOUNTS */}
        <div className="my-6">
          <FamilyAccounts
            accounts={[]}
            add={() => {}}
            update={() => {}}
            remove={() => {}}
          />
        </div>
      </Section>

      {/* FOOTER */}
      <div className="flex justify-end mt-6">
        <a
          href="/sales/onboarding/authentication"
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Next
        </a>
      </div>
    </div>
  );
}
