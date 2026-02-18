import React from "react";
import InputField from "../components/InputField";
import DropdownField from "../components/DropdownField";

interface Props {
  form: any;
  update: (field: string, value: any) => void;
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

const accountTypeOptions = [
  "Resident India",
  "NRI",
  "HUF",
  "PUT CTD",
  "Minor",
  "Joint",
  "Others",
];

const schemeOptions = [
  "IAP",
  "SIP",
  "NON IAP",
  "SEMI SIP",
  "MINI IAP",
  "PROBATIONARY PORTFOLIO",
];

export default function DematAccount({ form, update }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* BASIC DEMAT DETAILS */}
      <InputField
        label="DP ID"
        value={form.dpId}
        onChange={(v: any) => update("dpId", v)}
      />

      <InputField
        label="Client Code"
        value={form.clientCode}
        onChange={(v: any) => update("clientCode", v)}
      />

      <DropdownField
        label="Scheme Name"
        value={form.schemeName}
        options={schemeOptions}
        onChange={(v: any) => update("schemeName", v)}
      />

      <DropdownField
        label="Broker Name"
        value={form.brokerName}
        options={["Motilal Oswal", "Aditya Birla"]}
        onChange={(v: any) => update("brokerName", v)}
      />

      {/* NOMINEE DETAILS */}
      <InputField
        label="Nominee Name"
        value={form.nomineeName}
        onChange={(v: any) => update("nomineeName", v)}
      />

      <DropdownField
        label="Nominee Relationship"
        value={form.nomineeRelationship}
        options={relationshipOptions}
        onChange={(v: any) => update("nomineeRelationship", v)}
      />

      {form.nomineeRelationship === "Others" && (
        <InputField
          label="Specify Other Relationship"
          value={form.nomineeRelationshipOther}
          onChange={(v: any) => update("nomineeRelationshipOther", v)}
        />
      )}

      <InputField
        label="Nominee Contact"
        value={form.nomineeContact}
        onChange={(v: any) => update("nomineeContact", v)}
      />

      <InputField
        label="Nominee Email"
        type="email"
        value={form.nomineeEmail}
        onChange={(v: any) => update("nomineeEmail", v)}
      />

      <InputField
        label="Nominee Aadhaar No."
        value={form.nomineeAadhar}
        onChange={(v: any) => update("nomineeAadhar", v)}
      />

      <InputField
        label="Nominee PAN No."
        value={form.nomineePan}
        onChange={(v: any) => update("nomineePan", v)}
      />

      {/* ACCOUNT TYPE */}
      <DropdownField
        label="A/C Type"
        value={form.acType}
        options={accountTypeOptions}
        onChange={(v: any) => update("acType", v)}
      />

      {form.acType === "Others" && (
        <InputField
          label="Specify Other A/C Type"
          value={form.acTypeOther}
          onChange={(v: any) => update("acTypeOther", v)}
        />
      )}

      {/* OPENING DATE */}
      <InputField
        type="date"
        label="A/C Opening Date"
        value={form.acOpeningDate}
        onChange={(v: any) => update("acOpeningDate", v)}
      />
    </div>
  );
}
