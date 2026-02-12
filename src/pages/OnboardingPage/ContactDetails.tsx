import InputField from "./InputField";
import WhatsappList from "./WhatsappList";

interface Props {
  form: any;
  update: (field: string, val: any) => void;
  whatsappList: string[];
  setWhatsappList: (data: string[]) => void;
}

export default function ContactDetails({
  form,
  update,
  whatsappList,
  setWhatsappList,
}: Props) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-indigo-700 mb-3">
        Contact Details
      </h2>

      <WhatsappList
        form={form}
        update={update}
        list={whatsappList}
        setList={setWhatsappList}
      />

      <div className="grid grid-cols-2 gap-6 mt-6">
        <InputField label="Language" value={form.language} onChange={(v) => update("language", v)} />
        <InputField type="email" label="Email" value={form.email} onChange={(v) => update("email", v)} />

        <InputField
          label="Trade Confirmation Number"
          value={form.tradeNumber}
          onChange={(v) => update("tradeNumber", v)}
        />
      </div>
    </section>
  );
}
