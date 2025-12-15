import React, { useState } from "react";
import InputField from "../components/InputField";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  form: any;
  update: (field: string, value: any) => void;
}

export default function ContactDetails({ form, update }: Props) {
  // Local WhatsApp numbers state
  const [whatsappList, setWhatsappList] = useState<string[]>([""]);

  // Add new WhatsApp field
  const addWhatsapp = () => {
    setWhatsappList((prev) => [...prev, ""]);
  };

  // Update WhatsApp number
  const updateWhatsapp = (index: number, value: string) => {
    const updated = [...whatsappList];
    updated[index] = value;
    setWhatsappList(updated);
  };

  // Remove WhatsApp number
  const removeWhatsapp = (index: number) => {
    setWhatsappList((prev) => prev.filter((_, i) => i !== index));
  };

  // Copy Mobile → WhatsApp
  const copyWA = () => {
    if (!form.mobile) return;
    const updated = [...whatsappList];
    updated[0] = form.mobile;
    setWhatsappList(updated);
  };

  return (
    <div className="space-y-6">
      {/* ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Mobile Number"
          value={form.mobile}
          onChange={(v: any) => update("mobile", v)}
        />

        <InputField
          label="Language"
          value={form.language}
          onChange={(v: any) => update("language", v)}
        />
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Email"
          value={form.email}
          onChange={(v: any) => update("email", v)}
        />

        <InputField
          label="Trade Confirmation Number"
          value={form.tradeConfirm}
          onChange={(v: any) => update("tradeConfirm", v)}
        />
      </div>

      {/* ROW 3 – WHATSAPP */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            WhatsApp Number
          </label>

          <button
            type="button"
            onClick={addWhatsapp}
            className="flex items-center gap-1 text-indigo-600 text-sm font-medium hover:underline"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        {/* Primary WhatsApp */}
        <InputField
          value={whatsappList[0]}
          onChange={(v: any) => updateWhatsapp(0, v)}
        />

        {/* Same as Mobile */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sameAsMobile"
            onChange={copyWA}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="sameAsMobile" className="text-sm text-gray-600">
            Same as Mobile Number
          </label>
        </div>

        {/* Extra WhatsApp Numbers */}
        {whatsappList.slice(1).map((num, index) => (
          <div key={index + 1} className="flex items-center gap-3">
            <div className="flex-1">
              <InputField
                value={num}
                onChange={(v: any) =>
                  updateWhatsapp(index + 1, v)
                }
              />
            </div>

            <button
              type="button"
              onClick={() => removeWhatsapp(index + 1)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
