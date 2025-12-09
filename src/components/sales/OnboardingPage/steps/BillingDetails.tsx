import React from "react";
import InputField from "../components/InputField";
import TextAreaField from "../components/TextAreaField";

interface Props {
  form: any;
  update: (field: string, value: any) => void;
}

export default function BillingDetails({ form, update }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <InputField label="Name" value={form.billingName} onChange={(v) => update("billingName", v)} />
        <InputField label="GST No" value={form.gst} onChange={(v) => update("gst", v)} />
      </div>

      <TextAreaField
        label="Billing Address"
        value={form.billingAddress}
        onChange={(v) => update("billingAddress", v)}
      />
    </div>
  );
}
