import React from "react";
import InputField from "../components/InputField";

interface Props {
  form: any;
  update: (field: string, value: any) => void;
}

export default function BankDetails({ form, update }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Row 1 */}
      <InputField label="Holder Name" value={form.holderName} onChange={(v: any) => update("holderName", v)} />
      <InputField label="Account Number" value={form.accNumber} onChange={(v: any) => update("accNumber", v)} />

      {/* Row 2 */}
      <InputField label="Bank Name" value={form.bankName} onChange={(v: any) => update("bankName", v)} />
      <InputField label="Branch" value={form.branch} onChange={(v: any) => update("branch", v)} />

      {/* Row 3 */}
      <InputField label="IFSC" value={form.ifsc} onChange={(v: any) => update("ifsc", v)} />
      <InputField label="MICR No" value={form.micr} onChange={(v: any) => update("micr", v)} />
    </div>
  );
}
