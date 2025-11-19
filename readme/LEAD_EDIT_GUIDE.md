# Lead Details Edit Modal - Developer Guide

## Quick Reference

### What Changed?

The lead edit modal now properly enforces field editability rules based on the lead workflow:
- **Read-only after registration**: firstName, lastName, phone, leadSource
- **Always editable**: email, product, investment/SIP, bio, profile details, client type, stage

### Component Location
- **Modal**: `src/components/sales/editLead/LeadEditModal.tsx`
- **Header**: `src/components/sales/view_lead/LeadProfileHeader.tsx` 
- **Bio Card**: `src/components/sales/view_lead/BioCard.tsx`

### Key Features Implemented

#### 1. **Read-only Fields Display**
```tsx
<div className={INPUT + " cursor-not-allowed bg-gray-50 dark:bg-white/[0.03]"}>
  {String(form.firstName ?? "")}
</div>
```
- Used for: firstName, lastName, phone, leadSource
- Visual indicator: Gray background + disabled cursor
- Cannot be edited after lead registration

#### 2. **Bio Update Timestamp**
```tsx
const now = new Date().toLocaleString();
toast.success(`✓ Bio updated at ${now}`);
```
- Captures exact timestamp when bio is saved
- Displays in user's locale date/time format
- Provides clear confirmation of change

#### 3. **Save Operation Flow**
```
User clicks Save
    ↓
Validate form
    ↓
Send UPDATE_LEAD_DETAILS mutation
    ↓
Send UPDATE_LEAD_BIO mutation (if changed)
    ↓
Send CHANGE_STAGE mutation (if stage changed)
    ↓
Show "Updating lead details..." overlay
    ↓
Display success toast with timestamp
    ↓
Wait 300ms (ensure backend complete)
    ↓
Close modal and trigger parent refresh
    ↓
Header component refetches and displays new data
```

### Common Tasks

#### Adding a New Editable Field
1. Add to form state in LeadEditModal
2. Add input element in the grid
3. Ensure it's included in the payload for mutation
4. Add to UPDATE_LEAD_DETAILS mutation schema (backend)

```tsx
<Field label="New Field">
  <input 
    className={INPUT} 
    value={String((form as any).newField ?? "")} 
    onChange={(e) => (handle as any)("newField", e.target.value)} 
    placeholder="Enter value"
  />
</Field>
```

#### Making a Field Read-only
1. Change `<input>` to `<div>` with class `${INPUT} cursor-not-allowed bg-gray-50 dark:bg-white/[0.03]`
2. Display the value as text content
3. Don't include in form payload
4. Update help text section

```tsx
<Field label="Field Name">
  <div className={INPUT + " cursor-not-allowed bg-gray-50 dark:bg-white/[0.03]"}>
    {String((form as any).fieldName ?? "")}
  </div>
</Field>
```

#### Modifying Save Success Message
Edit line ~297 in LeadEditModal.tsx:
```tsx
toast.success("✓ Lead details updated successfully. Refreshing...");
```

### Important Notes

1. **Read-only Fields**: Fields with gray background are intentionally locked. Don't remove the read-only styling unless you've verified with product team.

2. **Timestamp Format**: Bio update timestamp uses user's locale format. Change `toLocaleString()` if different format needed.

3. **Refetch Delay**: The 300ms delay in LeadProfileHeader ensures backend completes processing before frontend fetches. Adjust if experiencing race conditions.

4. **Validation**: Only editable fields are validated. Read-only fields skip validation even if empty.

5. **Mutations**: Three mutations fire on save:
   - UPDATE_LEAD_DETAILS: Main data
   - UPDATE_LEAD_BIO: Biography only
   - CHANGE_STAGE: Pipeline stage only

### Styling Classes

- `INPUT`: Base input styling - "mt-1 w-full rounded-xl border..."
- Read-only suffix: `cursor-not-allowed bg-gray-50 dark:bg-white/[0.03]`
- Button disabled: `disabled:opacity-60`
- Spinner: `h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent`

### Dark Mode Support

All styling changes include dark mode variants:
```tsx
dark:bg-white/[0.03]  // Read-only background (dark)
dark:text-white/60    // Read-only text (dark)
dark:border-white/10  // Borders (dark)
```

### Debugging Tips

1. **Modal won't close**: Check console for errors in mutations. Look for GraphQL validation errors.

2. **Data not reflecting in header**: Verify `onProfileRefresh` is passed and called. Check refetch policy is "cache-and-network".

3. **Spinner stuck**: Check mutation is actually completing. Verify loading state in DevTools.

4. **Timestamp wrong**: Check browser locale settings. May differ from server timezone.

5. **Field appearing editable**: Verify the `<input>` was changed to `<div>` and didn't get reverted.

### Performance Considerations

- Modal uses React.memo internally for field components
- Avoid adding heavy computations in handle functions
- Bio textarea limited to 1000 characters
- Refetch uses cache-first strategy to minimize network calls

### Accessibility

- All fields have proper `<label>` elements
- Read-only fields use `cursor-not-allowed` to indicate disabled state
- Error messages have semantic styling with `text-rose-500`
- Buttons have proper `disabled` states

### Related Queries & Mutations

**Queries:**
- `LEAD_DETAIL_WITH_TIMELINE`: Fetches lead data with events

**Mutations:**
- `UPDATE_LEAD_DETAILS`: Updates contact, profile, opportunity fields
- `UPDATE_LEAD_BIO`: Updates biography text
- `CHANGE_STAGE`: Updates pipeline stage

See `src/components/sales/editLead/update_gql/update_lead.gql.ts` for mutation schema.
