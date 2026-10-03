import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import {
  TrackedBid,
  CompanyProfile,
  UploadedDocument,
  KeyPersonnel,
  PastExperience,
  AuditReport,
  TechnicalOfferItem,
} from '../types/tender';

// Firestore does not accept undefined values. Strip undefined fields before writing.
function sanitize<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = sanitize(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// 1. Tracked Bids
export async function saveTrackedBidToFirebase(userId: string, bid: TrackedBid): Promise<void> {
  const path = `users/${userId}/trackedBids/${bid.id}`;
  try {
    const payload = sanitize({
      ...bid,
      ownerId: userId,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'users', userId, 'trackedBids', bid.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTrackedBidFromFirebase(userId: string, bidId: string): Promise<void> {
  const path = `users/${userId}/trackedBids/${bidId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'trackedBids', bidId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 2. Company Profile
export async function saveCompanyProfileToFirebase(userId: string, profile: CompanyProfile): Promise<void> {
  const path = `users/${userId}/companyProfile/default`;
  try {
    const payload = sanitize({
      ...profile,
      ownerId: userId,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'users', userId, 'companyProfile', 'default'), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 3. Uploaded Documents
export async function saveDocumentToFirebase(userId: string, item: UploadedDocument): Promise<void> {
  const path = `users/${userId}/documents/${item.id}`;
  try {
    const payload = sanitize({
      ...item,
      ownerId: userId,
    });
    await setDoc(doc(db, 'users', userId, 'documents', item.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteDocumentFromFirebase(userId: string, docId: string): Promise<void> {
  const path = `users/${userId}/documents/${docId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'documents', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 4. Key Personnel
export async function savePersonnelToFirebase(userId: string, person: KeyPersonnel): Promise<void> {
  const path = `users/${userId}/personnel/${person.id}`;
  try {
    const payload = sanitize({
      ...person,
      ownerId: userId,
    });
    await setDoc(doc(db, 'users', userId, 'personnel', person.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePersonnelFromFirebase(userId: string, personId: string): Promise<void> {
  const path = `users/${userId}/personnel/${personId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'personnel', personId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 5. Past Experiences
export async function saveExperienceToFirebase(userId: string, exp: PastExperience): Promise<void> {
  const path = `users/${userId}/experiences/${exp.id}`;
  try {
    const payload = sanitize({
      ...exp,
      ownerId: userId,
    });
    await setDoc(doc(db, 'users', userId, 'experiences', exp.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExperienceFromFirebase(userId: string, expId: string): Promise<void> {
  const path = `users/${userId}/experiences/${expId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'experiences', expId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 6. Audit Reports
export async function saveAuditReportToFirebase(userId: string, audit: AuditReport): Promise<void> {
  const path = `users/${userId}/auditReports/${audit.id}`;
  try {
    const payload = sanitize({
      ...audit,
      ownerId: userId,
    });
    await setDoc(doc(db, 'users', userId, 'auditReports', audit.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAuditReportFromFirebase(userId: string, auditId: string): Promise<void> {
  const path = `users/${userId}/auditReports/${auditId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'auditReports', auditId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 7. Technical Offer Items
export async function saveTechnicalOfferToFirebase(userId: string, item: TechnicalOfferItem): Promise<void> {
  const path = `users/${userId}/technicalOffers/${item.id}`;
  try {
    const payload = sanitize({
      ...item,
      ownerId: userId,
    });
    await setDoc(doc(db, 'users', userId, 'technicalOffers', item.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTechnicalOfferFromFirebase(userId: string, offerId: string): Promise<void> {
  const path = `users/${userId}/technicalOffers/${offerId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'technicalOffers', offerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Bulk Sync: Adds all application records into Firebase Firestore in batches
export async function syncAllRecordsToFirebase(
  userId: string,
  records: {
    trackedBids: TrackedBid[];
    company: CompanyProfile;
    documents: UploadedDocument[];
    personnel: KeyPersonnel[];
    experiences: PastExperience[];
    auditReports: AuditReport[];
    technicalOffers: TechnicalOfferItem[];
  }
): Promise<{ count: number }> {
  let count = 0;
  const batch = writeBatch(db);

  // 1. Company Profile
  const companyRef = doc(db, 'users', userId, 'companyProfile', 'default');
  batch.set(companyRef, sanitize({ ...records.company, ownerId: userId, updatedAt: new Date().toISOString() }));
  count++;

  // 2. Tracked Bids
  for (const bid of records.trackedBids) {
    const ref = doc(db, 'users', userId, 'trackedBids', bid.id);
    batch.set(ref, sanitize({ ...bid, ownerId: userId, updatedAt: new Date().toISOString() }));
    count++;
  }

  // 3. Documents
  for (const docItem of records.documents) {
    const ref = doc(db, 'users', userId, 'documents', docItem.id);
    batch.set(ref, sanitize({ ...docItem, ownerId: userId }));
    count++;
  }

  // 4. Personnel
  for (const person of records.personnel) {
    const ref = doc(db, 'users', userId, 'personnel', person.id);
    batch.set(ref, sanitize({ ...person, ownerId: userId }));
    count++;
  }

  // 5. Experiences
  for (const exp of records.experiences) {
    const ref = doc(db, 'users', userId, 'experiences', exp.id);
    batch.set(ref, sanitize({ ...exp, ownerId: userId }));
    count++;
  }

  // 6. Audit Reports
  for (const audit of records.auditReports) {
    const ref = doc(db, 'users', userId, 'auditReports', audit.id);
    batch.set(ref, sanitize({ ...audit, ownerId: userId }));
    count++;
  }

  // 7. Technical Offers
  for (const item of records.technicalOffers) {
    const ref = doc(db, 'users', userId, 'technicalOffers', item.id);
    batch.set(ref, sanitize({ ...item, ownerId: userId }));
    count++;
  }

  try {
    await batch.commit();
    return { count };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId} (batch sync)`);
    return { count: 0 };
  }
}

// Subscriptions
export interface RealtimeSubscribers {
  onBids?: (bids: TrackedBid[]) => void;
  onCompany?: (company: CompanyProfile) => void;
  onDocuments?: (docs: UploadedDocument[]) => void;
  onPersonnel?: (personnel: KeyPersonnel[]) => void;
  onExperiences?: (experiences: PastExperience[]) => void;
  onAuditReports?: (audits: AuditReport[]) => void;
  onTechnicalOffers?: (offers: TechnicalOfferItem[]) => void;
}

export function subscribeToUserRecords(userId: string, callbacks: RealtimeSubscribers): () => void {
  const unsubscribers: Unsubscribe[] = [];

  // Tracked Bids
  if (callbacks.onBids) {
    const path = `users/${userId}/trackedBids`;
    const unsub = onSnapshot(
      collection(db, 'users', userId, 'trackedBids'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as TrackedBid);
        callbacks.onBids!(items);
      },
      (error) => handleFirestoreError(error, OperationType.GET, path)
    );
    unsubscribers.push(unsub);
  }

  // Company Profile
  if (callbacks.onCompany) {
    const path = `users/${userId}/companyProfile/default`;
    const unsub = onSnapshot(
      doc(db, 'users', userId, 'companyProfile', 'default'),
      (snapshot) => {
        if (snapshot.exists()) {
          callbacks.onCompany!(snapshot.data() as CompanyProfile);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, path)
    );
    unsubscribers.push(unsub);
  }

  // Documents
  if (callbacks.onDocuments) {
    const path = `users/${userId}/documents`;
    const unsub = onSnapshot(
      collection(db, 'users', userId, 'documents'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as UploadedDocument);
        callbacks.onDocuments!(items);
      },
      (error) => handleFirestoreError(error, OperationType.GET, path)
    );
    unsubscribers.push(unsub);
  }

  // Personnel
  if (callbacks.onPersonnel) {
    const path = `users/${userId}/personnel`;
    const unsub = onSnapshot(
      collection(db, 'users', userId, 'personnel'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as KeyPersonnel);
        callbacks.onPersonnel!(items);
      },
      (error) => handleFirestoreError(error, OperationType.GET, path)
    );
    unsubscribers.push(unsub);
  }

  // Experiences
  if (callbacks.onExperiences) {
    const path = `users/${userId}/experiences`;
    const unsub = onSnapshot(
      collection(db, 'users', userId, 'experiences'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as PastExperience);
        callbacks.onExperiences!(items);
      },
      (error) => handleFirestoreError(error, OperationType.GET, path)
    );
    unsubscribers.push(unsub);
  }

  // Audit Reports
  if (callbacks.onAuditReports) {
    const path = `users/${userId}/auditReports`;
    const unsub = onSnapshot(
      collection(db, 'users', userId, 'auditReports'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as AuditReport);
        callbacks.onAuditReports!(items);
      },
      (error) => handleFirestoreError(error, OperationType.GET, path)
    );
    unsubscribers.push(unsub);
  }

  // Technical Offers
  if (callbacks.onTechnicalOffers) {
    const path = `users/${userId}/technicalOffers`;
    const unsub = onSnapshot(
      collection(db, 'users', userId, 'technicalOffers'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as TechnicalOfferItem);
        callbacks.onTechnicalOffers!(items);
      },
      (error) => handleFirestoreError(error, OperationType.GET, path)
    );
    unsubscribers.push(unsub);
  }

  return () => {
    unsubscribers.forEach((u) => u());
  };
}
