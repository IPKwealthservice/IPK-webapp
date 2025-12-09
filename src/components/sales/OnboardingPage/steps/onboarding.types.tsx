export interface PersonalDetailsForm {
  name: string;
  commAddress: string;
  permAddress: string;
  location: string;
  gender: string;
  dob: string;
  age: string;
  occupation: string;
  income: string;
  company: string;
  designation: string;
  pan: string;
  aadhaar: string;
  contactPersonName: string;
  contactPersonNo: string;
  relationship: string;
  relationshipOther?: string;
  clientSource: string;
  clientSourceOther?: string;
  familyAccounts: string[];
}

export interface DematDetailsForm {
  dpId: string;
  clientCode: string;
  schemeName: string;
  brokerName: string;
  nomineeName: string;
  nomineeRelationship: string;
  nomineeRelationshipOther?: string;
  nomineeContact: string;
  nomineeEmail: string;
  nomineeAadhar: string;
  nomineePan: string;
  accountType: string;
  accountTypeOther?: string;
  openingDate: string;
}

export interface ContactDetailsForm {
  mobile: string;
  whatsappNumbers: string[];
  language: string;
  email: string;
  tradeNumber: string;
}

export interface BillingDetailsForm {
  name: string;
  gst: string;
  address: string;
}

export interface BankDetailsForm {
  holderName: string;
  bankName: string;
  accNumber: string;
  ifsc: string;
  micr: string;
}
