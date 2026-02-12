import InputField from "./InputField";
import TextAreaField from "./TextAreaField";
import DropdownField from "./DropdownField";
import FamilyAccounts from "./FamilyAccounts";

const RELATIONSHIP_OPTIONS = [
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
];

const CLIENT_SOURCE_OPTIONS = [
  "REFERENCE",
  "ONLINE",
  "YES CON",
  "START-UP",
  "JUBILAN",
  "SPOTLIGHT-YES",
  "OTHERS",
];

interface Props {
  form: any;
  update: (field: string, val: any) => void;
  familyAccounts: string[];
  setFamilyAccounts: (data: string[]) => void;
}

export default function PersonalDetails({
  form,
  update,
  familyAccounts,
  setFamilyAccounts,
}: Props) {
  const calculateAge = (dob: string) => {
    update("dob", dob);
    if (!dob) return update("age", "");

    const d = new Date(dob);
    const t = new Date();
    let age = t.getFullYear() - d.getFullYear();
    if (t < new Date(t.getFullYear(), d.getMonth(), d.getDate())) age--;
    update("age", age.toString());
  };

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-indigo-700 mb-3">
        Personal Details
      </h2>

      <div className="grid grid-cols-2 gap-6">
        <InputField label="Name" value={form.name} onChange={(v) => update("name", v)} />
        <InputField label="Location" value={form.location} onChange={(v) => update("location", v)} />

        <DropdownField
          label="Gender"
          value={form.gender}
          options={["Male", "Female"]}
          onChange={(v: any) => update("gender", v)}
        />

        <InputField type="date" label="DOB" value={form.dob} onChange={calculateAge} />
        <InputField label="Age" value={form.age} readOnly onChange={() => { }} />

        <InputField label="Occupation" value={form.occupation} onChange={(v) => update("occupation", v)} />

        <DropdownField
          label="Income"
          value={form.income}
          onChange={(v) => update("income", v)}
          options={["1-2 LPA", "2-3 LPA", "3-5 LPA", "5-10 LPA", "10+ LPA"]}
        />

        <InputField label="Company" value={form.company} onChange={(v) => update("company", v)} />
        <InputField label="Designation" value={form.designation} onChange={(v) => update("designation", v)} />

        <InputField label="PAN No." value={form.pan} onChange={(v) => update("pan", v)} />
        <InputField label="Aadhar Number" value={form.aadhaar} onChange={(v) => update("aadhaar", v)} />

        <InputField label="Contact Person Name" value={form.contactPersonName} onChange={(v) => update("contactPersonName", v)} />
        <InputField label="Contact Person No." value={form.contactPersonNo} onChange={(v) => update("contactPersonNo", v)} />

        <DropdownField
          label="Relationship"
          value={form.relationship}
          otherValue={form.relationshipOther}
          onChange={(v) => update("relationship", v)}
          onOtherChange={(v) => update("relationshipOther", v)}
          options={RELATIONSHIP_OPTIONS}
        />

        <DropdownField
          label="Client Source"
          value={form.clientSource}
          otherValue={form.clientSourceOther}
          onChange={(v) => update("clientSource", v)}
          onOtherChange={(v) => update("clientSourceOther", v)}
          options={CLIENT_SOURCE_OPTIONS}
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <TextAreaField label="Communication Address" value={form.commAddress} onChange={(v) => update("commAddress", v)} />

        <div>
          <TextAreaField
            label="Permanent Address"
            value={form.permAddress}
            onChange={(v) => update("permAddress", v)}
          />

          <label className="text-sm flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              onChange={(e) => update("permAddress", e.target.checked ? form.commAddress : "")}
            />
            Same as Communication Address
          </label>
        </div>
      </div>

      <div className="mt-6">
        <FamilyAccounts accounts={familyAccounts} setAccounts={setFamilyAccounts} />
      </div>
    </section>
  );
}
