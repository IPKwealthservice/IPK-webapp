import InputField from "../components/InputField";
import TextAreaField from "../components/TextAreaField";

interface Props {
  form: any;
  update: (field: string, val: any) => void;
}

export default function BillingDetails({ form, update }: Props) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-indigo-700 mb-3">
        Billing Details
      </h2>

      <div className="grid grid-cols-2 gap-6">
        <InputField label="Name" value={form.billingName} onChange={(v) => update("billingName", v)} />
        <InputField label="GST No." value={form.gstNo} onChange={(v) => update("gstNo", v)} />
      </div>

      <div className="mt-6">
        <TextAreaField
          label="Billing Address"
          value={form.billingAddress}
          onChange={(v) => update("billingAddress", v)}
        />
      </div>
    </section>
  );
}
