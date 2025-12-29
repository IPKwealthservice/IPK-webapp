import React from "react";
import InputField from "../components/InputField";
import TextAreaField from "../components/TextAreaField";
import DropdownField from "../components/DropdownField";
import FamilyAccounts from "../components/FamilyAccounts";

interface Props {
  form: any;
  update: (field: string, value: any) => void;
  calculateAge: (dob: string) => void;
  familyAccounts: string[];
  addFamily: () => void;
  updateFamily: (index: number, value: string) => void;
  removeFamily: (index: number) => void;
  copyCommToPermanent: () => void;
}

const relationshipOptions = [
  "Spouse",
  "Son",
  "Daughter",
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Grand Son",
  "Grand-Daughter",
  "Grand Father",
  "Grand Mother",
  "Others",
];

const clientSourceOptions = [
  "Reference",
  "Online",
  "YES Con",
  "Start-up",
  "Jubilan",
  "Spotlight-YES",
  "Others",
];

export default function PersonalDetails({
  form,
  update,
  calculateAge,
  familyAccounts,
  addFamily,
  updateFamily,
  removeFamily,
  copyCommToPermanent,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Name" value={form.name} onChange={(v: any) => update("name", v)} />
        <InputField label="Location" value={form.location} onChange={(v: any) => update("location", v)} />

        <InputField label="Gender" value={form.gender} onChange={(v: any) => update("gender", v)} />

        <InputField type="date" label="DOB" value={form.dob} onChange={calculateAge} />
        <InputField label="Age" value={form.age} readOnly />

        <InputField label="Occupation" value={form.occupation} onChange={(v: any) => update("occupation", v)} />
        <InputField label="Income (1–2 LPA)" value={form.income} onChange={(v: any) => update("income", v)} />
        <InputField label="Company" value={form.company} onChange={(v: any) => update("company", v)} />
        <InputField label="Designation" value={form.designation} onChange={(v: any) => update("designation", v)} />

        <InputField label="PAN No" value={form.pan} onChange={(v: any) => update("pan", v)} />
        <InputField label="Aadhar Number" value={form.aadhaar} onChange={(v: any) => update("aadhaar", v)} />

        <InputField
          label="Contact Person Name"
          value={form.contactPersonName}
          onChange={(v: any) => update("contactPersonName", v)}
        />

        <InputField
          label="Contact Person No"
          value={form.contactPersonNo}
          onChange={(v: any) => update("contactPersonNo", v)}
        />

        <DropdownField
          label="Relationship"
          value={form.relationship}
          options={relationshipOptions}
          onChange={(v: any) => update("relationship", v)}
        />

        {form.relationship === "Others" && (
          <InputField
            label="Specify Relationship"
            value={form.relationshipOther}
            onChange={(v: any) => update("relationshipOther", v)}
          />
        )}

        <DropdownField
          label="Client Source"
          value={form.clientSource}
          options={clientSourceOptions}
          onChange={(v: any) => update("clientSource", v)}
        />

        {form.clientSource === "Others" && (
          <InputField
            label="Specify Client Source"
            value={form.clientSourceOther}
            onChange={(v: any) => update("clientSourceOther", v)}
          />
        )}
      </div>

      {/* ================= ADDRESS ================= */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <TextAreaField
    label="Communication Address"
    value={form.commAddress}
    onChange={(v: any) => update("commAddress", v)}
  />

  <div className="flex flex-col">
    <TextAreaField
      label="Permanent Address"
      value={form.permAddress}
      onChange={(v: any) => update("permAddress", v)}
    />

    <label className="flex items-center gap-2 mt-2 text-sm text-gray-700">
      <input
        type="checkbox"
        className="accent-blue-600"
        onChange={copyCommToPermanent}
      />
      Same as communication address
    </label>
  </div>
</div>

{/* ✅ SEPARATOR */}
<div className="border-t my-8" />

{/* ================= FAMILY ACCOUNTS (FULL WIDTH) ================= */}
<div className="w-full space-y-3">
  <h3 className="text-sm font-medium text-gray-800">
    Family Accounts
  </h3>

  <FamilyAccounts
    accounts={familyAccounts}
    add={addFamily}
    update={updateFamily}
    remove={removeFamily}
  />
</div>
</div>
  );
}
