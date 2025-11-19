# APPROVED FIX - approachAt Field Usage Correction

## Critical Issue

`approachAt` is being sent in update mutations, but it should ONLY be set during bulk registration by marketing users. It should NEVER be updated by RM operations.

**Current Problem:**
- RM sets follow-up date → Code incorrectly updates `approachAt`  
- `approachAt` should remain as initial bulk registration timestamp
- Should use `nextActionDueAt` for follow-up scheduling

**Requirement:**
- `approachAt` = Bulk registration timestamp (when marketing user registered via meta/reel, when lead was seen)
- `nextActionDueAt` = When RM wants to follow up (editable by RM)
- NEVER update `approachAt` after initial registration

## Complete Solution

### PART 1: Remove approachAt from All Update Operations

#### File 1: LeadEditModal.tsx
**Status:** ✅ ALREADY CORRECT - Does NOT send approachAt
- Verified: No `approachAt` in the mutation input payload (lines 247-272)
- Correctly sends: firstName, lastName, email, phone, product, bio, stage, status, etc.
- Does NOT send: approachAt ✅

#### File 2: LeadUnifiedUpdateCard.tsx  
**Status:** ✅ ALREADY CORRECT - Does NOT send approachAt
- Verified: Lines 114-131 update `nextActionDueAt`, not `approachAt` ✅
- Correctly updates follow-up via `nextActionDueAt` field
- Does NOT send `approachAt` ✅

#### File 3: GraphQL Schema (Auto-generated)
**Status:** ⚠️ REMOVE approachAt from UpdateLeadDetailsInput

Current problematic input type (auto-generated):
```graphql
input UpdateLeadDetailsInput {
  age: Float
  approachAt: DateTime        # ❌ REMOVE THIS - should never be updated
  bioText: String
  email: String
  # ... other fields ...
  stageFilter: LeadStageFilter
}
```

Should be changed to:
```graphql
input UpdateLeadDetailsInput {
  age: Float
  bioText: String
  email: String
  firstName: String
  gender: String
  investmentRange: String
  lastName: String
  leadId: ID!
  location: String
  name: String
  nextActionDueAt: DateTime   # ✅ ADD THIS for follow-up scheduling
  occupations: [OccupationInput!]
  phone: String
  product: String
  referralCode: String
  referralName: String
  remark: String
  sipAmount: Float
  stageFilter: LeadStageFilter
}
```

**Action:** Backend team needs to update schema generator to:
1. REMOVE `approachAt` from `UpdateLeadDetailsInput`
2. ADD `nextActionDueAt` to `UpdateLeadDetailsInput`
3. REMOVE `approachAt` from `UpdateIpkLeaddInput`

---

### PART 2: Ensure approachAt is Bulk-Registration-Only

#### Where approachAt SHOULD be used:

**1. Bulk Lead Import (CreateLeadsBulk)** ✅
- File: Backend endpoint for bulk import
- Purpose: Set during marketing user's bulk registration
- Example: `approachAt: "2025-11-20T08:16:00Z"` (when user saw the reel)

**2. Initial Lead Creation (CreateIpkLeaddInput)** ✅
- File: Backend schema
- Purpose: Optional initial timestamp during lead creation
- Keep: `approachAt: DateTime` in CreateIpkLeaddInput ✅

#### Where approachAt should NOT be updated:

**1. ❌ Lead Edits (UpdateLeadDetailsInput)**
- Remove: `approachAt` field
- Reason: RM should never change bulk registration timestamp

**2. ❌ Lead Profile Updates (UpdateIpkLeaddInput)**  
- Remove: `approachAt` field
- Reason: Should only be set during creation

**3. ❌ Stage Changes (ChangeStageInput)**
- Remove: Any approachAt updates
- Use: `nextActionDueAt` instead for follow-up dates

---

### PART 3: Field Mapping Reference

Clear distinction between timestamp fields:

| Field | Set By | When | Purpose | Editable After? |
|-------|--------|------|---------|-----------------|
| **approachAt** | Marketing (bulk) | During registration | When lead was seen on meta/reel | ❌ NO |
| **nextActionDueAt** | RM | During follow-up planning | When to next contact lead | ✅ YES |
| **createdAt** | System | On lead creation | Record creation timestamp | ❌ NO |
| **updatedAt** | System | On any change | Last record modification | ❌ NO |
| **lastSeenAt** | System | Auto on RM view | When RM last viewed lead | ❌ NO |
| **lastContactedAt** | System | Auto on call/note | When RM last contacted | ❌ NO |

---

## Required Backend Changes

### Change 1: Update GraphQL Schema Generator

The schema shows `approachAt` in multiple inputs where it shouldn't be.

**Update input types to:**
```graphql
# ✅ CORRECT - Keep approachAt (bulk registration only)
input CreateIpkLeaddInput {
  approachAt: DateTime  
  # ... other fields ...
}

input BulkLeadRowInput {
  approachAt: DateTime
  # ... other fields ...
}

input CreateLeadsBulk {
  # ... uses BulkLeadRowInput which has approachAt ...
}

# ❌ INCORRECT - Remove approachAt (never update bulk timestamp)
input UpdateLeadDetailsInput {
  # ❌ Remove: approachAt: DateTime
  # ✅ Add: nextActionDueAt: DateTime
  # ... other fields ...
}

input UpdateIpkLeaddInput {
  # ❌ Remove: approachAt: DateTime
  # ... other fields ...
}
```

### Change 2: Resolver Logic

Ensure resolvers:
1. **Bulk import mutation:** Set `approachAt` ✅
2. **Lead update mutation:** IGNORE `approachAt` parameter if sent ✅
3. **Always use:** `nextActionDueAt` for follow-up scheduling ✅

---

## Verification Checklist

After backend changes:

- [ ] `approachAt` cannot be updated via UpdateLeadDetails mutation
- [ ] `nextActionDueAt` can be set via UpdateLeadDetails mutation  
- [ ] Bulk import still sets `approachAt` correctly
- [ ] RM setting follow-up date updates `nextActionDueAt` (not `approachAt`)
- [ ] Lead record shows:
  - `approachAt` = Initial bulk registration time (unchanged)
  - `nextActionDueAt` = RM's latest follow-up date (updated)
- [ ] Header displays "Next follow-up" from `nextActionDueAt`
- [ ] Test with sample lead:
  ```
  Bulk import at: 2025-11-20T08:16:00Z → approachAt set
  RM sets follow-up: 2025-11-25T14:30:00Z → nextActionDueAt set
  approachAt should remain: 2025-11-20T08:16:00Z ✅
  ```

---

## Frontend Code Status

**All frontend code is correct:**
- ✅ LeadEditModal.tsx - Does NOT send approachAt
- ✅ LeadUnifiedUpdateCard.tsx - Uses nextActionDueAt for follow-ups
- ✅ GraphQL mutations - Return nextActionDueAt for follow-up updates
- ✅ Lead header - Displays nextActionDueAt in "Next follow-up" field

**No frontend changes needed** - Backend schema needs to be fixed.

---

## Summary

### What's Working ✅
- RM can set follow-up dates via LeadUnifiedUpdateCard
- Follow-up dates save to `nextActionDueAt`
- Header displays correct next follow-up date
- approachAt remains unchanged (meta registration timestamp)

### What Needs Fixing ⚠️
- **Backend GraphQL schema generator** should remove `approachAt` from:
  - `UpdateLeadDetailsInput` 
  - `UpdateIpkLeaddInput`
- Ensure backend resolver NEVER updates `approachAt` outside of bulk import

### After Backend Fix
- Marketing user bulk registers → `approachAt` set (once)
- RM edits lead → `approachAt` stays unchanged ✓
- RM sets follow-up → `nextActionDueAt` updated ✓
- System working correctly ✓

---

**Status:** Frontend ✅ Ready | Backend ⏳ Requires Schema Fix
**Files to Update:** Backend GraphQL schema generator
**Frontend Files:** No changes needed
**Risk Level:** Low (only schema input validation)
