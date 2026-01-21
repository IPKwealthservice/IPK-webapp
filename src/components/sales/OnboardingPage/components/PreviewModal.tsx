import React from "react";

interface Props {
  open: boolean;
  data: Record<string, unknown>;
  onClose: () => void;
  onSubmit: () => void;
}

export default function PreviewModal({ open, data, onClose, onSubmit }: Props) {
  if (!open) return null;

  const Row = ({ label, value }: { label: string; value: unknown }) => ( 
    <div className="flex justify-between border-b py-1">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="text-gray-900">
        {value !== undefined && value !== null && value !== ""
  ? String(value)
  : "-"}
      </span>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-3 text-indigo-700">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 shadow-xl overflow-y-auto max-h-[90vh]">
        <h1 className="text-2xl font-semibold text-indigo-700 mb-4 text-center">
          Preview Details
        </h1>

        {/* PERSONAL DETAILS */}
        <Section title="Client Profile">
          <Row label="Name" value={data.name} />
          <Row label="Communication Address" value={data.commAddress} />
          <Row
            label="Permanent Address"
            value={data.permAddress ?? data.permanentAddress ?? data.perm_address}
          />
          <Row label="Location" value={data.location} />
          <Row label="Gender" value={data.gender} />
          <Row label="DOB" value={data.dob} />
          <Row label="Age" value={data.age} />
          <Row label="Occupation" value={data.occupation} />
          <Row label="Income Range" value={data.income} />
          <Row label="Company" value={data.company} />
          <Row label="Designation" value={data.designation} />
          <Row label="PAN No" value={data.pan} />
          <Row label="Aadhar No" value={data.aadhaar} />
          <Row label="Contact Person Name" value={data.contactPersonName} />
          <Row label="Contact Person No" value={data.contactPersonNo} />
          <Row label="Relationship" value={data.relationship} />
          <Row label="Client Source" value={data.clientSource} />
        </Section>

        {/* DEMAT ACCOUNT */}
        <Section title="Demat Account">
          <Row label="DP ID" value={data.dpId} />
          <Row label="Client Code" value={data.clientCode} />
          <Row label="Scheme Name" value={data.schemeName} />
          <Row label="Broker Name" value={data.brokerName} />
          <Row label="Nominee Name" value={data.nomineeName} />
          <Row
            label="Nominee Relationship"
            value={data.nomineeRelation ?? data.nomineeRelationship ?? data.nominee_relation}
          />
          <Row label="Nominee Contact" value={data.nomineeContact} />
          <Row label="Nominee Email" value={data.nomineeEmail} />
          <Row label="Nominee Aadhar" value={data.nomineeAadhar} />
          <Row label="Nominee PAN" value={data.nomineePan} />
          <Row
            label="A/C Type"
            value={data.accountType ?? data.acType ?? data.account_type}
          />
          <Row
            label="A/C Opening Date"
            value={data.accountOpeningDate ?? data.acOpeningDate ?? data.account_opening_date}
          />
        </Section>

        {/* CONTACT */}
        <Section title="Contact Details">
          <Row label="Mobile No" value={data.mobile} />
          <Row label="WhatsApp" value={data.whatsapp} />
          <Row label="Language" value={data.language} />
          <Row label="Email" value={data.email} />
          <Row
            label="Trade Confirmation No"
            value={data.tradeNumber ?? data.tradeConfirmationNo ?? data.trade_confirmation_no}
          />
        </Section>

        {/* BILLING */}
        <Section title="Billing Details">
          <Row label="Billing Name" value={data.billName} />
          <Row label="GST No" value={data.gst} />
          <Row label="Billing Address" value={data.billingAddress} />
        </Section>

        {/* BANK */}
        <Section title="Bank Details">
          <Row label="Holder Name" value={data.holderName} />
          <Row label="Bank Name" value={data.bankName} />
          <Row label="Account Number" value={data.accNumber} />
          <Row label="IFSC" value={data.ifsc} />
          <Row label="MICR No" value={data.micr} />
        </Section>

        {/* BUTTONS */}
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
          <button
            onClick={onSubmit}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
