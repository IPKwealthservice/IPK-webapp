import React from "react";
import InputField from "../components/InputField";
import DropdownField from "../components/DropdownField";

interface Props {
  form: any;
  update: (field: string, value: any) => void;
}

const relationOptions = [
  "Spouse","Son","Daughter","Father","Mother","Brother","Sister",
  "Grand Son","Grand-Daughter","Grand Father","Grand Mother","Others"
];

const acTypeOptions = [
  "Resident India","NRI","HUF","PUT CTD","Minor","Joint","Others"
];

export default function DematAccount({ form, update }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <InputField label="DP ID" value={form.dpId} onChange={(v: any) => update("dpId", v)} />
      <InputField label="Client Code" value={form.clientCode} onChange={(v: any) => update("clientCode", v)} />
      <InputField label="Scheme Name" value={form.schemeName} onChange={(v: any) => update("schemeName", v)} />
      <InputField label="Broker Name" value={form.brokerName} onChange={(v: any) => update("brokerName", v)} />

      <InputField label="Nominee Name" value={form.nomineeName} onChange={(v: any) => update("nomineeName", v)} />

      <DropdownField
        label="Relationship"
        value={form.nomineeRelationship}
        options={relationOptions}
        onChange={(v: any) => update("nomineeRelationship", v)}
      />

      {form.nomineeRelationship === "Others" && (
        <InputField
          label="Specify Other Nominee Relationship"
          value={form.nomineeRelationshipOther}
          onChange={(v: any) => update("nomineeRelationshipOther", v)}
        />
      )}

      <InputField label="Nominee Contact" value={form.nomineeContact} onChange={(v: any) => update("nomineeContact", v)} />
      <InputField label="Nominee Email" value={form.nomineeEmail} onChange={(v: any) => update("nomineeEmail", v)} />
      <InputField label="Nominee Aadhaar No" value={form.nomineeAadhar} onChange={(v: any) => update("nomineeAadhar", v)} />
      <InputField label="Nominee PAN No" value={form.nomineePan} onChange={(v: any) => update("nomineePan", v)} />

      <DropdownField
        label="A/C Type"
        value={form.acType}
        options={acTypeOptions}
        onChange={(v: any) => update("acType", v)}
      />

      {form.acType === "Others" && (
        <InputField
          label="Specify Other A/C Type"
          value={form.acTypeOther}
          onChange={(v: any) => update("acTypeOther", v)}
        />
      )}

      <InputField
        type="date"
        label="A/C Opening Date"
        value={form.acOpeningDate}
        onChange={(v: any) => update("acOpeningDate", v)}
      />
    </div>
  );
}
