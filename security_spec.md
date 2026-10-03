# Security Specification: TenderPulse Firestore Database

## 1. Data Invariants

1. **User Identity Boundary**: Every user document and subcollection record (`trackedBids`, `companyProfile`, `documents`, `personnel`, `experiences`, `auditReports`, `technicalOffers`) MUST be rooted under `/users/{userId}/...` where `{userId} == request.auth.uid`. Cross-user reads, writes, and list queries are strictly denied.
2. **Path Parameter Integrity**: Document IDs and path variables must adhere to `isValidId(id)` (`^[a-zA-Z0-9_-]+$`, max length 128 characters) to prevent Denial of Wallet and ID poisoning attacks.
3. **Public Catalog Access**: The `/tenders/{tenderId}` collection is publicly readable for discovering tenders, but can only be modified by verified administrators (`isAdmin()` or bootstrapped admin).
4. **String and Array Boundary Limits**: All string inputs are bounded by rigorous length checks (`.size() <= MAX`), preventing document bloating or memory exhaustion.
5. **Ownership Immutability**: On update of any user-scoped document, the `ownerId` must equal `request.auth.uid` and remain strictly identical to `existing().ownerId`.
6. **No Unauthenticated Mutations**: All write operations require `request.auth != null` with a valid, authenticated user identity.
7. **Default-Deny Catch-All**: The root rule matches `/{document=**}` and denies all reads and writes unless an explicit rule allows it.

---

## 2. The "Dirty Dozen" Payloads

The following 12 attack vectors are designed to attempt breaking Identity, Integrity, and State:

1. **Dirty 1 - Identity Spoofing (Unauthenticated Write)**:
   Attempting to write `/users/target-user/trackedBids/bid-1` with `request.auth = null`.
   - Expected: `PERMISSION_DENIED`
2. **Dirty 2 - Cross-User Impersonation**:
   User `attacker-123` attempts to create or update `/users/victim-456/trackedBids/bid-1`.
   - Expected: `PERMISSION_DENIED` (auth.uid !== userId)
3. **Dirty 3 - Path ID Poisoning**:
   Attempting to create a bid with a 2000-character malicious path ID `/users/{userId}/trackedBids/` containing SQL/shell characters.
   - Expected: `PERMISSION_DENIED` (`isValidId` fails)
4. **Dirty 4 - Denial of Wallet (Gigantic Notes Payload)**:
   Attempting to update `notes` with a 2MB string.
   - Expected: `PERMISSION_DENIED` (`notes.size() <= 5000` violated)
5. **Dirty 5 - Illegal Status State Injection**:
   Attempting to set `stage: 'malicious_stage_bypass'` not in the allowed `TenderStage` enum.
   - Expected: `PERMISSION_DENIED` (Enum validation fails)
6. **Dirty 6 - Company Profile PII Exfiltration**:
   User A attempts to read User B's `/users/{userB}/companyProfile/default`.
   - Expected: `PERMISSION_DENIED` (Strict owner gate on subcollection)
7. **Dirty 7 - Public Catalog Defacement**:
   Unauthenticated or regular user attempts to delete or overwrite `/tenders/eth-tender-001`.
   - Expected: `PERMISSION_DENIED` (Only admin can write to catalog)
8. **Dirty 8 - Ownership Tampering on Update**:
   Authenticated user attempts to update a tracked bid and change `ownerId: 'different-user'`.
   - Expected: `PERMISSION_DENIED` (Immutable ownerId check fails)
9. **Dirty 9 - Negative Financial Values**:
   Attempting to write negative `ourBidAmountETB: -500000`.
   - Expected: `PERMISSION_DENIED` (Value boundary check fails)
10. **Dirty 10 - Shadow Field Injection**:
    Attempting to insert a shadow field `isSuperAdmin: true` into a bid document.
    - Expected: `PERMISSION_DENIED` (`hasOnly` keys check fails)
11. **Dirty 11 - Document License Tampering**:
    Attempting to save an invalid category string into `/users/{userId}/documents/doc-1`.
    - Expected: `PERMISSION_DENIED` (Enum check fails)
12. **Dirty 12 - Unrestricted Blanket List Query**:
    Attempting a collectionGroup query across all users' `/trackedBids` without user filtering.
    - Expected: `PERMISSION_DENIED` (Root collectionGroup is denied by default)

---

## 3. Test Runner Specification (`firestore.rules.test.ts`)

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules Hardening', () => {
  let testEnv: any;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'supple-medley-183d0',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  test('Dirty 1: Unauthenticated write fails', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthedDb.doc('users/user1/trackedBids/bid1').set({ title: 'Test' }));
  });

  test('Dirty 2: Cross-user write fails', async () => {
    const attackerDb = testEnv.authenticatedContext('attacker').firestore();
    await assertFails(attackerDb.doc('users/victim/trackedBids/bid1').set({ title: 'Hacked', ownerId: 'victim' }));
  });

  test('Dirty 3: Oversized string in notes fails', async () => {
    const userDb = testEnv.authenticatedContext('user1').firestore();
    await assertFails(userDb.doc('users/user1/trackedBids/bid1').set({
      id: 'bid1',
      ownerId: 'user1',
      title: 'Valid Title',
      organization: 'Gov Org',
      stage: 'lead',
      notes: 'A'.repeat(6000), // Exceeds 5000 max length
    }));
  });

  test('Dirty 7: Regular user cannot deface public tender catalog', async () => {
    const userDb = testEnv.authenticatedContext('user1').firestore();
    await assertFails(userDb.doc('tenders/tender123').delete());
  });

  test('User can read and write their own tracked bids', async () => {
    const userDb = testEnv.authenticatedContext('user1').firestore();
    await assertSucceeds(userDb.doc('users/user1/trackedBids/bid1').set({
      id: 'bid1',
      ownerId: 'user1',
      title: 'Valid Title',
      organization: 'Commercial Bank of Ethiopia',
      stage: 'lead',
      notes: 'Initial evaluation',
    }));
  });
});
```
