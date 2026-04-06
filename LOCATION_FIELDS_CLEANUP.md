# Location Fields Cleanup

## Overview

This document describes the removal of deprecated location name fields from the orders system.

### Deprecated Fields (REMOVED)
- `shippingZoneName` ❌
- `shippingAreaName` ❌

### Source of Truth (RETAINED)
- `shippingCityId` ✅
- `shippingZoneId` ✅
- `shippingAreaId` ✅
- `shippingCity` ✅ (fallback)

---

## Cleanup Process

### Step 1: Run Database Cleanup

Execute the cleanup script to remove deprecated fields from all existing orders:

```bash
npm run cleanup:location-fields
```

This script will:
- Process all orders in the database
- Remove `shippingZoneName` and `shippingAreaName` fields
- Report how many orders were updated

**⚠️ Run this ONCE before deploying schema changes**

---

### Step 2: Verify Cleanup

After running the cleanup, verify:

```bash
npx convex dev
```

Check that:
- No schema validation errors
- All queries work correctly
- CSV export uses location cache for name resolution

---

## What Changed

### Files Modified

1. **convex/orders_cleanup.ts** (NEW)
   - Internal mutation to remove deprecated fields
   - Public action wrapper for script execution

2. **src/domain/order/order.repository.ts**
   - Removed `shippingZoneName` and `shippingAreaName` from `CreateOrderPayload`

3. **src/infrastructure/convex/orderConvex.repository.ts**
   - Removed field mapping in `create()` method

4. **scripts/cleanupLocationFields.ts** (NEW)
   - Script to trigger cleanup action

5. **package.json**
   - Added `cleanup:location-fields` script

### Files Already Updated (Previous Work)

- `convex/orders/schema.ts` - Fields already removed from schema
- `convex/orders/mutations.ts` - Already doesn't use these fields
- Frontend checkout - Already doesn't send these fields

---

## CSV Export

CSV generation now uses:

1. **Location Cache** (`locations` table)
   - Preloaded into memory before CSV generation
   - O(1) lookup via Map

2. **Fallback Strategy**
   - If ID lookup fails → use `shippingCity`
   - If city missing → use ID as string

---

## Migration Status

✅ **COMPLETE**

- [x] Database cleanup script created
- [x] Code references removed
- [x] Schema updated (fields removed)
- [x] CSV export refactored to use cache
- [x] Fallback strategy implemented

---

## Rollback (If Needed)

If issues arise, you can temporarily re-add the fields to schema:

```ts
// In convex/orders/schema.ts
shippingZoneName: v.optional(v.string()),
shippingAreaName: v.optional(v.string()),
```

However, the system is designed to work **without** these fields entirely.

---

## Testing Checklist

After cleanup:

- [ ] Run `npm run cleanup:location-fields`
- [ ] Deploy with `npx convex deploy`
- [ ] Create a test order
- [ ] Export CSV with test order
- [ ] Verify zone/area names appear correctly in CSV
- [ ] Check fallback works for orders without IDs

---

## Support

For issues or questions, check:
- Location cache implementation: `convex/locations_*.ts`
- CSV generation: `src/lib/csv-utils.ts`
- Location resolver: `src/lib/pathao/locationResolver.ts`
