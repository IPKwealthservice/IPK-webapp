import React from "react";
import InputField from "./InputField";
import DropdownField from "./DropdownField";

interface Props {
    form: any;
    update: (field: string, value: any) => void;
}

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
    "Others",
];

const ACCOUNT_TYPE_OPTIONS = [
    "Resident India",
    "NRI",
    "HUF",
    "PUT CTD",
    "Minor",
    "Joint",
    "Others",
];

export default function DematDetails({ form, update }: Props) {
    return (
        <section className="mt-10">
            <h2 className="text-lg font-semibold text-indigo-700 mb-3">
                Demat Details
            </h2>

            <div className="grid grid-cols-2 gap-6">
                {/* BASIC DEMAT DETAILS */}
                <InputField
                    label="DP ID"
                    value={form.dpId}
                    onChange={(v) => update("dpId", v)}
                />

                <InputField
                    label="Client Code"
                    value={form.clientCode}
                    onChange={(v) => update("clientCode", v)}
                />

                <InputField
                    label="Scheme Name"
                    value={form.schemeName}
                    onChange={(v) => update("schemeName", v)}
                />

                <DropdownField
                    label="Broker Name"
                    value={form.brokerName}
                    options={["Motilal Oswal", "Aditya Birla"]}
                    onChange={(v) => update("brokerName", v)}
                />

                {/* NOMINEE DETAILS */}
                <InputField
                    label="Nominee Name"
                    value={form.nomineeName}
                    onChange={(v) => update("nomineeName", v)}
                />

                <DropdownField
                    label="Nominee Relationship"
                    value={form.nomineeRelationship}
                    otherValue={form.nomineeRelationshipOther}
                    options={RELATIONSHIP_OPTIONS}
                    onChange={(v) => update("nomineeRelationship", v)}
                    onOtherChange={(v) => update("nomineeRelationshipOther", v)}
                />

                <InputField
                    label="Nominee Contact"
                    value={form.nomineeContact}
                    onChange={(v) => update("nomineeContact", v)}
                />

                <InputField
                    label="Nominee Email"
                    type="email"
                    value={form.nomineeEmail}
                    onChange={(v) => update("nomineeEmail", v)}
                />

                <InputField
                    label="Nominee Aadhaar No."
                    value={form.nomineeAadhar}
                    onChange={(v) => update("nomineeAadhar", v)}
                />

                <InputField
                    label="Nominee PAN No."
                    value={form.nomineePan}
                    onChange={(v) => update("nomineePan", v)}
                />

                {/* ACCOUNT TYPE */}
                <DropdownField
                    label="A/C Type"
                    value={form.accountType}
                    otherValue={form.accountTypeOther}
                    options={ACCOUNT_TYPE_OPTIONS}
                    onChange={(v) => update("accountType", v)}
                    onOtherChange={(v) => update("accountTypeOther", v)}
                />

                {/* OPENING DATE */}
                <InputField
                    type="date"
                    label="A/C Opening Date"
                    value={form.accountOpeningDate}
                    onChange={(v) => update("accountOpeningDate", v)}
                />
            </div>
        </section>
    );
}
