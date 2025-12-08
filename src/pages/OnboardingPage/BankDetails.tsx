import InputField from "../components/InputField";

interface Props {
  form: any;
  update: (field: string, val: any) => void;
}

export default function BankDetails({ form, update }: Props) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-indigo-700 mb-3">
        Bank Details
      </h2>

      <div className="grid grid-cols-2 gap-6">
        <InputField label="Holder Name" value={form.holderName} onChange={(v) => update("holderName", v)} />
        <InputField label="Bank Name" value={form.bankName} onChange={(v) => update("bankName", v)} />

        <InputField label="Account Number" value={form.accNumber} onChange={(v) => update("accNumber", v)} />
        <InputField label="IFSC" value={form.ifsc} onChange={(v) => update("ifsc", v)} />

        <InputField label="MICR No." value={form.micr} onChange={(v) => update("micr", v)} />
      </div>
    </section>
  );
}
