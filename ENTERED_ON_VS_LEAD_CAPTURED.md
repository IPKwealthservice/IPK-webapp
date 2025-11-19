# Entered On vs Lead Captured On - Correct Implementation

## Requirement Clarified

Two separate date fields in lead header:
1. **Entered on** = `createdAt` (when system created the record)
2. **Lead captured on** = `approachAt` (when marketing user saw/registered on meta/reel)

## Solution Implemented

### File: `src/components/sales/view_lead/LeadProfileHeader.tsx`

#### Change 1: Separate Field Calculations (Line 201-204)

**Before:**
```typescript
const enteredOnRaw = lead.approachAt ?? lead.createdAt ?? null;
const agingSourceRaw = lead.updatedAt?.trim() ? lead.updatedAt : enteredOnRaw;
```

**After:**
```typescript
// Entered on = createdAt (system record creation)
const enteredOnRaw = lead.createdAt ?? null;
// Lead captured on = approachAt (when marketing user saw/registered)
const leadCapturedOnRaw = lead.approachAt ?? null;
const agingSourceRaw = lead.updatedAt?.trim() ? lead.updatedAt : enteredOnRaw;
```

#### Change 2: Display Both Fields in Header (Lines 615-628)

**Before:**
```jsx
<div className="mt-3 flex flex-col items-end gap-2 lg:items-end">
  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3.5 py-1.5 text-sm font-semibold text-amber-800 dark:bg-amber-400/20 dark:text-amber-200">
    <Clock3 className="h-4 w-4" />
    <span className="text-xs uppercase">Aging</span>
    <span>{agingDisplay}</span>
  </div>
  <div className="text-right text-xs text-gray-500 dark:text-white/60">
    <div className="uppercase tracking-wide">Entered on</div>
    <div className="text-sm font-semibold text-gray-900 dark:text-white">
      {enteredOnRaw ? formatDateDisplay(enteredOnRaw) : "Not set"}
    </div>
  </div>
</div>
```

**After:**
```jsx
<div className="mt-3 flex flex-col items-end gap-3 lg:items-end">
  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3.5 py-1.5 text-sm font-semibold text-amber-800 dark:bg-amber-400/20 dark:text-amber-200">
    <Clock3 className="h-4 w-4" />
    <span className="text-xs uppercase">Aging</span>
    <span>{agingDisplay}</span>
  </div>
  <div className="text-right text-xs text-gray-500 dark:text-white/60">
    <div className="uppercase tracking-wide">Entered on</div>
    <div className="text-sm font-semibold text-gray-900 dark:text-white">
      {enteredOnRaw ? formatDateDisplay(enteredOnRaw) : "Not set"}
    </div>
  </div>
  {leadCapturedOnRaw && (
    <div className="text-right text-xs text-gray-500 dark:text-white/60">
      <div className="uppercase tracking-wide">Lead captured on</div>
      <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
        {formatDateDisplay(leadCapturedOnRaw)}
      </div>
    </div>
  )}
</div>
```

---

## Field Definitions - Clear & Distinct

| Field | Source | Set By | When | Purpose | Display |
|-------|--------|--------|------|---------|---------|
| **Entered on** | `createdAt` | System | Record creation | When lead record was created in system | Always shown |
| **Lead captured on** | `approachAt` | Marketing user | Bulk registration | When user saw/registered lead on meta/reel | Optional (shown if available) |

---

## Visual Representation

### Lead Header Display

```
┌─ Lead Info ────────────────────────┐
│ Name: Kishore Ganesh              │
│ Code: IPK25110011                 │
│                                    │
│ Status: ASSIGNED                  │
│ Aging: 29 days                    │
│                                    │
│ Entered on: 19 Nov 2025           │ ← createdAt
│ Lead captured on: 21 Nov 2025     │ ← approachAt (if exists)
└────────────────────────────────────┘
```

---

## Real-World Scenarios

### Scenario 1: Bulk Registered Lead (with approachAt)

```
Marketing user bulk imports on: 2025-11-21 (saw reel)
System creates record on: 2025-11-19

Lead Header shows:
- Entered on: 19 Nov 2025 (createdAt - system creation)
- Lead captured on: 21 Nov 2025 (approachAt - when seen/registered)
```

**Interpretation:**
- Lead was **captured/seen** on Nov 21 (meta registration)
- Lead **entered into system** on Nov 19 (record created)

### Scenario 2: Manual Entry (without approachAt)

```
RM creates lead manually on: 2025-11-19

Lead Header shows:
- Entered on: 19 Nov 2025 (createdAt)
- Lead captured on: (not shown - no approachAt)
```

**Interpretation:**
- No bulk/meta capture data
- Lead only exists as system record from Nov 19

---

## When Each Field Appears

### "Entered on" - ALWAYS
- Shows system record creation date
- Uses `createdAt` value
- Never null (system always creates this)
- Display: "Entered on: [date]"

### "Lead captured on" - OPTIONAL
- Shows only if `approachAt` exists
- Uses `approachAt` value
- Hidden if null/missing
- Display: "Lead captured on: [date]"
- Color: Emerald (indicates marketing/meta data)

---

## Data Flow

```
Marketing User Bulk Registration:
├─ approachAt set: 2025-11-21T06:50:00Z
└─ createdAt set: (system auto-timestamp)
        ↓
System creates record:
├─ Entered on calculated from: createdAt
└─ Lead captured on calculated from: approachAt
        ↓
Header displays:
├─ "Entered on: 19 Nov 2025" (from createdAt)
└─ "Lead captured on: 21 Nov 2025" (from approachAt)
        ↓
User sees clear distinction:
├─ When it entered system
└─ When it was actually captured/seen
```

---

## Styling

Both fields use:
- Small text: `text-xs text-gray-500 dark:text-white/60`
- Label: Uppercase tracking, gray color
- Date value: Larger, bold font

"Lead captured on" extra styling:
- Text color: `text-emerald-700 dark:text-emerald-300` (indicates marketing data)
- Conditional render: Only shows if `leadCapturedOnRaw` exists

---

## Implementation Status

✅ **Complete:**
- Two separate fields calculated correctly
- Both displayed in header with proper styling
- "Lead captured on" only shows if data exists
- Colors and formatting distinct
- Dark mode supported
- No breaking changes
- Backward compatible

---

## Testing

### Test 1: Lead with Both Dates
```
1. Load lead with approachAt and createdAt
2. Check header
3. Should show:
   - "Entered on: [createdAt date]" ✅
   - "Lead captured on: [approachAt date]" ✅
```

### Test 2: Lead Without approachAt
```
1. Load lead without approachAt
2. Check header
3. Should show:
   - "Entered on: [createdAt date]" ✅
   - "Lead captured on: (not visible)" ✅
```

### Test 3: Dark Mode
```
1. Toggle dark mode
2. Check both dates display correctly
3. "Lead captured on" should be emerald in dark mode ✅
```

---

## Summary

**No more confusion:**
- ✅ **Entered on** = When it entered the SYSTEM (createdAt)
- ✅ **Lead captured on** = When it was CAPTURED by marketing user (approachAt)
- ✅ Two distinct fields with clear purposes
- ✅ Proper formatting and colors
- ✅ Optional display of capture date when available

---

**Status:** ✅ Implemented
**Files Changed:** 1 (LeadProfileHeader.tsx)
**Lines Modified:** 2 locations
**Breaking Changes:** None
**Backward Compatible:** Yes ✅
