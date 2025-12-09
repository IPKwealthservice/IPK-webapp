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
      <InputField label="DP ID" value={form.dpId} onChange={(v) => update("dpId", v)} />
      <InputField label="Client Code" value={form.clientCode} onChange={(v) => update("clientCode", v)} />
      <InputField label="Scheme Name" value={form.schemeName} onChange={(v) => update("schemeName", v)} />
      <InputField label="Broker Name" value={form.brokerName} onChange={(v) => update("brokerName", v)} />

      <InputField label="Nominee Name" value={form.nomineeName} onChange={(v) => update("nomineeName", v)} />

      <DropdownField
        label="Relationship"
        value={form.nomineeRelationship}
        options={relationOptions}
        onChange={(v) => update("nomineeRelationship", v)}
      />

      {form.nomineeRelationship === "Others" && (
        <InputField
          label="Specify Other Nominee Relationship"
          value={form.nomineeRelationshipOther}
          onChange={(v) => update("nomineeRelationshipOther", v)}
        />
      )}

      <InputField label="Nominee Contact" value={form.nomineeContact} onChange={(v) => update("nomineeContact", v)} />
      <InputField label="Nominee Email" value={form.nomineeEmail} onChange={(v) => update("nomineeEmail", v)} />
      <InputField label="Nominee Aadhaar No" value={form.nomineeAadhar} onChange={(v) => update("nomineeAadhar", v)} />
      <InputField label="Nominee PAN No" value={form.nomineePan} onChange={(v) => update("nomineePan", v)} />

      <DropdownField
        label="A/C Type"
        value={form.acType}
        options={acTypeOptions}
        onChange={(v) => update("acType", v)}
      />

      {form.acType === "Others" && (
        <InputField
          label="Specify Other A/C Type"
          value={form.acTypeOther}
          onChange={(v) => update("acTypeOther", v)}
        />
      )}

      <InputField
        type="date"
        label="A/C Opening Date"
        value={form.acOpeningDate}
        onChange={(v) => update("acOpeningDate", v)}
      />
    </div>
  );
}
