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
      <div className="grid grid-cols-2 gap-6">
        <InputField label="Name" value={form.name} onChange={(v) => update("name", v)} />
        <InputField label="Location" value={form.location} onChange={(v) => update("location", v)} />

        <InputField label="Gender" value={form.gender} onChange={(v) => update("gender", v)} />

        <InputField type="date" label="DOB" value={form.dob} onChange={calculateAge} />
        <InputField label="Age" value={form.age} readOnly />

        <InputField label="Occupation" value={form.occupation} onChange={(v) => update("occupation", v)} />
        <InputField label="Income (1–2 LPA)" value={form.income} onChange={(v) => update("income", v)} />
        <InputField label="Company" value={form.company} onChange={(v) => update("company", v)} />
        <InputField label="Designation" value={form.designation} onChange={(v) => update("designation", v)} />

        <InputField label="PAN No" value={form.pan} onChange={(v) => update("pan", v)} />
        <InputField label="Aadhar Number" value={form.aadhaar} onChange={(v) => update("aadhaar", v)} />

        <InputField
          label="Contact Person Name"
          value={form.contactPersonName}
          onChange={(v) => update("contactPersonName", v)}
        />

        <InputField
          label="Contact Person No"
          value={form.contactPersonNo}
          onChange={(v) => update("contactPersonNo", v)}
        />

        <DropdownField
          label="Relationship"
          value={form.relationship}
          options={relationshipOptions}
          onChange={(v) => update("relationship", v)}
        />

        {form.relationship === "Others" && (
          <InputField
            label="Specify Relationship"
            value={form.relationshipOther}
            onChange={(v) => update("relationshipOther", v)}
          />
        )}

        <DropdownField
          label="Client Source"
          value={form.clientSource}
          options={clientSourceOptions}
          onChange={(v) => update("clientSource", v)}
        />

        {form.clientSource === "Others" && (
          <InputField
            label="Specify Client Source"
            value={form.clientSourceOther}
            onChange={(v) => update("clientSourceOther", v)}
          />
        )}
      </div>

      {/* Address Fields */}
      <div className="grid grid-cols-2 gap-6">
        <TextAreaField
          label="Communication Address"
          value={form.commAddress}
          onChange={(v) => update("commAddress", v)}
        />

        <div>
          <TextAreaField
            label="Permanent Address"
            value={form.permAddress}
            onChange={(v) => update("permAddress", v)}
          />

          <div className="flex items-center mt-2 gap-2">
            <input type="checkbox" onChange={copyCommToPermanent} />
            <span className="text-sm text-gray-700">Same as communication address</span>
          </div>
        </div>
      </div>

      {/* Family Accounts */}
      <FamilyAccounts
        accounts={familyAccounts}
        add={addFamily}
        update={updateFamily}
        remove={removeFamily}
      />
    </div>
  );
}
