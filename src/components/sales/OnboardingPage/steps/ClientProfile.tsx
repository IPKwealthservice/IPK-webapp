import OnboardingHeader from "../OnboardingHeader";
import Section from "../components/Section";
import InputField from "../components/InputField";
import DropdownField from "../components/DropdownField";
import TextAreaField from "../components/TextAreaField";
import FamilyAccounts from "../components/FamilyAccounts";
import HeaderSteps from "../steps/HeaderSteps";

export default function ClientProfile() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <OnboardingHeader current={1} />

      <h2 className="text-xl font-semibold mb-4">Client Profile</h2>

      <Section title="Personal Information">
        <div className="grid grid-cols-2 gap-6">
          <InputField label="Name" />
          <InputField label="Location" />
          <InputField label="Gender" />
          <InputField type="date" label="DOB" />
          <InputField label="Age" readOnly />
          <InputField label="Occupation" />

          <DropdownField
            label="Income Range"
            options={[
              "1–2 LPA",
              "2–5 LPA",
              "5–10 LPA",
              "10+ LPA",
            ]}
          />

          <InputField label="Company" />
          <InputField label="Designation" />

          <InputField label="PAN Number" />
          <InputField label="Aadhar Number" />
        </div>

        <div className="grid grid-cols-2 mt-6 gap-6">
          <TextAreaField label="Communication Address" />
          <TextAreaField label="Permanent Address" />
        </div>

        <div className="my-6">
          <FamilyAccounts accounts={[]} add={() => {}} update={() => {}} remove={() => {}} />
        </div>
      </Section>

      <div className="flex justify-end mt-6">
        <a
          href="/sales/onboarding/authentication"
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Next
        </a>
      </div>
    </div>
  );
}
