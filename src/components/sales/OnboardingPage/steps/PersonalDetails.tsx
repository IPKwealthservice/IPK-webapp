import React from "react";
import InputField from "../components/InputField";
import TextAreaField from "../components/TextAreaField";
import DropdownField from "../components/DropdownField";
import FamilyAccounts from "../components/FamilyAccounts";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

interface Props {
  form: any;
  update: (field: string, value: any) => void;
  handleDobChange: (value: any) => void;
  calculateAge: (dob: string) => void;
  familyAccounts: string[];
  addFamily: () => void;
  updateFamily: (index: number, value: string) => void;
  removeFamily: (index: number) => void;
  copyCommToPermanent: () => void;
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

const clientSourceOptions = [
  "REFERENCE",
  "ONLINE",
  "YES CON",
  "START-UP",
  "JUBILAN",
  "SPOTLIGHT-YES",
  "OTHERS",
];

export default function PersonalDetails({
  form,
  update,
  handleDobChange,
  calculateAge,
  familyAccounts,
  addFamily,
  updateFamily,
  removeFamily,
  copyCommToPermanent,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Name" value={form.name} onChange={(v: any) => update("name", v)} />
        <InputField label="Location" value={form.location} onChange={(v: any) => update("location", v)} />

        <DropdownField
          label="Gender"
          value={form.gender}
          options={["Male", "Female"]}
          onChange={(v: any) => update("gender", v)}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date of Birth"
            value={form.dob ? dayjs(form.dob) : null}
            onChange={handleDobChange}
            format="DD/MM/YYYY"
            disableFuture
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                sx: {
                  // ✅ MATCH HEIGHT
                  "& .MuiPickersOutlinedInput-root": {
                    height: "42px",
                    padding: "0",
                    borderRadius: "0.375rem", // rounded-md
                    backgroundColor: "#ffffff",
                  },

                  // ✅ MATCH BORDER COLOR
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e5e7eb", // tailwind gray-300
                  },

                  // ✅ HOVER
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d1d5db",
                  },

                  // ✅ FOCUS
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6366f1", // indigo
                    borderWidth: "1px",
                  },

                  // ✅ TEXT ALIGNMENT
                  "& input": {
                    padding: "8px 12px",
                    fontSize: "14px",
                  },
                },
              },
            }}
          />
        </LocalizationProvider>

        <InputField label="Age" value={form.age} readOnly />

        <InputField label="Occupation" value={form.occupation} onChange={(v: any) => update("occupation", v)} />
        <InputField label="Income (1–2 LPA)" value={form.income} onChange={(v: any) => update("income", v)} />
        <InputField label="Company" value={form.company} onChange={(v: any) => update("company", v)} />
        <InputField label="Designation" value={form.designation} onChange={(v: any) => update("designation", v)} />

        <InputField label="PAN No" value={form.pan} onChange={(v: any) => update("pan", v)} />
        <InputField label="Aadhar Number" value={form.aadhaar} onChange={(v: any) => update("aadhaar", v)} />

        <InputField
          label="Contact Person Name"
          value={form.contactPersonName}
          onChange={(v: any) => update("contactPersonName", v)}
        />

        <InputField
          label="Contact Person No"
          value={form.contactPersonNo}
          onChange={(v: any) => update("contactPersonNo", v)}
        />

        <DropdownField
          label="Relationship"
          value={form.relationship}
          options={relationshipOptions}
          onChange={(v: any) => update("relationship", v)}
        />

        {form.relationship === "Others" && (
          <InputField
            label="Specify Relationship"
            value={form.relationshipOther}
            onChange={(v: any) => update("relationshipOther", v)}
          />
        )}

        <DropdownField
          label="Client Source"
          value={form.clientSource}
          options={clientSourceOptions}
          onChange={(v: any) => update("clientSource", v)}
        />

        {form.clientSource === "OTHERS" && (
          <InputField
            label="Specify Client Source"
            value={form.clientSourceOther}
            onChange={(v: any) => update("clientSourceOther", v)}
          />
        )}
      </div>

      {/* ================= ADDRESS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextAreaField
          label="Communication Address"
          value={form.commAddress}
          onChange={(v: any) => update("commAddress", v)}
        />

        <div className="flex flex-col">
          <TextAreaField
            label="Permanent Address"
            value={form.permAddress}
            onChange={(v: any) => update("permAddress", v)}
          />

          <label className="flex items-center gap-2 mt-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="accent-blue-600"
              onChange={copyCommToPermanent}
            />
            Same as communication address
          </label>
        </div>
      </div>

      {/* ✅ SEPARATOR */}
      <div className="border-t my-8" />

      {/* ================= FAMILY ACCOUNTS (FULL WIDTH) ================= */}
      <div className="w-full space-y-3">
        <h3 className="text-sm font-medium text-gray-800">
          Family Accounts
        </h3>

        <FamilyAccounts
          accounts={familyAccounts}
          add={addFamily}
          update={updateFamily}
          remove={removeFamily}
        />
      </div>
    </div>
  );
}
