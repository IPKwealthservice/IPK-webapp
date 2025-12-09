import React from "react";
import InputField from "../components/InputField";
import WhatsappList from "../components/WhatsappList";

interface Props {
  form: any;
  update: (field: string, value: any) => void;
  whatsappList: string[];
  addWhatsapp: () => void;
  updateWhatsapp: (index: number, v: string) => void;
  removeWhatsapp: (index: number) => void;
  copyWA: () => void;
}

export default function ContactDetails({
  form,
  update,
  whatsappList,
  addWhatsapp,
  updateWhatsapp,
  removeWhatsapp,
  copyWA,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <InputField label="Mobile Number" value={form.mobile} onChange={(v) => update("mobile", v)} />
        <InputField label="Language" value={form.language} onChange={(v) => update("language", v)} />
        <InputField label="Email" value={form.email} onChange={(v) => update("email", v)} />
        <InputField label="Trade Confirmation Number" value={form.tradeConfirm} onChange={(v) => update("tradeConfirm", v)} />
      </div>

      <WhatsappList
        list={whatsappList}
        add={addWhatsapp}
        update={updateWhatsapp}
        remove={removeWhatsapp}
        copyFromMobile={copyWA}
      />
    </div>
  );
}
