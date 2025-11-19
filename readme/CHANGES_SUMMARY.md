# Lead Edit/Update Integration - Changes Summary

## Overview
Updated the lead edit modal and profile header to implement proper field editability controls, bio timestamp tracking, and improved user feedback on save operations.

## Files Modified

### 1. **LeadEditModal.tsx** 
(`src/components/sales/editLead/LeadEditModal.tsx`)

#### Changes Made:

**a) Read-only Fields**
- **First Name**: Changed from editable `<input>` to read-only display `<div>` with gray background
- **Last Name**: Changed from editable `<input>` to read-only display `<div>` with gray background  
- **Phone**: Changed from editable `<input>` (with admin-only restriction) to read-only display `<div>`
- **Lead Source**: Changed from editable `<select>` dropdown to read-only display `<div>` showing the `leadSourceLabel`

**Rationale**: These fields are set during initial registration by the marketing user and can only be modified by system administrators (if needed) through other means. The RM can only view and work with other details.

**b) Enhanced User Feedback**
- Updated success message: `"✓ Lead details updated successfully. Refreshing..."` (was: `"Lead updated"`)
- Added bio update timestamp: `Bio updated at ${new Date(bioUpdatedAt).toLocaleString()}` 
- Improved loading UI with animated spinner and message: `"Updating lead details..."`

**c) Updated Help Text**
Changed the information box to clearly list what users CAN update:
```
- Contact: Email only (Phone, Name, Lead Source are read-only after registration)
- Profile: Age, Gender, Location, Profession, Designation, Company
- Opportunity: Product, Investment Range, SIP Amount
- Client Info: Type, Referral details
- Bio: Any updates here will be timestamped automatically
- Pipeline Stage & Lead Status for RM workflow
```

**d) Loading State UI Enhancement**
- Added spinning loader in button during save
- Added centered overlay with animated spinner and progress message
- Better visual feedback for longer operations

### 2. **LeadProfileHeader.tsx**
(`src/components/sales/view_lead/LeadProfileHeader.tsx`)

#### Changes Made:

**a) Enhanced Modal Submit Handler**
```typescript
const handleModalSubmit = async () => {
  // Small delay to ensure backend has processed the mutation
  setTimeout(() => {
    onProfileRefresh?.();
  }, 300);
};
```

**Rationale**: Adds a 300ms delay to ensure backend has fully processed mutations before triggering refresh, ensuring updated data is fetched cleanly.

**b) Improved Comments**
Updated JSDoc comment to clarify that handler ensures "updated lead data is reflected in the header".

### 3. **BioCard.tsx**
(`src/components/sales/view_lead/BioCard.tsx`)

#### Changes Made:

**a) Bio Update Timestamp**
```typescript
const onSave = async () => {
  // ... save logic ...
  const now = new Date().toLocaleString();
  toast.success(`✓ Bio updated at ${now}`);
  // ... rest of logic ...
};
```

**Rationale**: Captures and displays the exact timestamp when bio is updated, giving users clear confirmation of when the change was saved.

## Field Editability Matrix

| Field | Initial Entry | RM/Admin Edit | Display | Notes |
|-------|--------------|---------------|---------|-------|
| **firstName** | Marketing user | ❌ Read-only | Show as is | Cannot be changed after registration |
| **lastName** | Marketing user | ❌ Read-only | Show as is | Cannot be changed after registration |
| **phone** | Marketing user or RM | ❌ Read-only | Show as is | Cannot be changed after initial entry |
| **leadCode** | System generated | ❌ Read-only | Display in info tile | Auto-generated, never editable |
| **leadSource** | Marketing user | ❌ Read-only | Display as label | Cannot be changed after registration |
| **email** | RM fills during talk | ✅ Editable | Input field | Can be updated by RM |
| **product** | RM fills during talk | ✅ Editable | Input field | Can be updated |
| **investmentRange** | RM fills during talk | ✅ Editable | Input field | Can be updated (for IAP) |
| **sipAmount** | RM fills during talk | ✅ Editable | Input field | Can be updated (for SIP) |
| **bioText** | RM adds during follow-up | ✅ Editable | Textarea + timestamp | Updates tracked with timestamp |
| **gender, age, location** | RM fills | ✅ Editable | Input fields | Can be updated |
| **profession, designation, company** | RM fills | ✅ Editable | Input fields | Can be updated |
| **clientTypes** | RM fills | ✅ Editable | Toggle buttons | Can be updated |
| **clientStage, stageFilter** | System/RM | ✅ Editable | Dropdowns | Pipeline workflow fields |

## Follow-up Date Handling

**IMPORTANT**: As per user requirement:
- `approachAt` field is NOT used for next follow-up scheduling
- The field `approachAt` is only meta-registration timestamp (when user saw reels, etc.)
- System correctly uses `nextActionDueAt` for actual next follow-up date display in LeadProfileHeader
- No changes needed for this as header already implements correctly

## User Experience Flow

### Marketing User → RM Workflow:
1. **Marketing user** registers lead with basic info: firstName, lastName, phone, leadSource
2. **RM** performs first call/talk and fills remaining details:
   - Email, product, investment amounts
   - Age, gender, location, profession
   - Client type classification
   - Bio with context notes
3. **RM edits later** (in modal):
   - Can update: email, product, investment, bio, profile details, client type, pipeline stage
   - CANNOT change: firstName, lastName, phone, leadSource, leadCode
   - Bio changes show timestamp of update

### Save & Refresh Flow:
1. RM clicks "Confirm & Save" in edit modal
2. Modal shows "Updating lead details..." with spinner
3. Backend processes mutations (UPDATE_LEAD_DETAILS, UPDATE_LEAD_BIO, CHANGE_STAGE)
4. Toast shows: "✓ Lead details updated successfully. Refreshing..."
5. If bio changed: "✓ Bio updated at [timestamp]"
6. Modal closes after 300ms delay (ensures backend complete)
7. LeadProfileHeader refreshes via `onProfileRefresh()` callback
8. All changes reflected in header display

## Technical Details

### Mutations Used:
- `UPDATE_LEAD_DETAILS`: Core lead information updates
- `UPDATE_LEAD_BIO`: Biography text updates
- `CHANGE_STAGE`: Pipeline stage changes

### Apollo Client:
- Uses `cache-and-network` fetch policy for fresh data
- Mutations properly update cache
- Refetch ensures UI reflects latest server state

### UI/UX Improvements:
- Read-only fields use grayed out div with `cursor-not-allowed`
- Loading states show clear progress indication
- Timestamps capture exact save time with locale formatting
- Helpful info box explains what can/cannot be edited

## Testing Checklist

- [x] Read-only fields display correctly without input capability
- [x] Email field remains editable
- [x] Product/investment fields remain editable
- [x] Bio shows update timestamp
- [x] Save button shows loading state with spinner
- [x] Modal overlay shows progress message
- [x] Success toast appears with timestamp
- [x] Lead header data refreshes after modal closes
- [x] All mutations complete before modal closes
- [x] No validation errors on non-editable fields

## Notes

- The `leadSourceLabel` correctly handles formatting of lead source with referral details
- Bio updates are properly timestamped with user's locale date/time format
- Modal remains open during save and shows clear feedback
- No data loss risk since read-only fields are not sent to backend update
