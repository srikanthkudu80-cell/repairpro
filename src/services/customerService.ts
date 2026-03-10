import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  increment,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  jobCount: number;
  lastJobAt: Timestamp | null;
}

function customersRef(userId: string) {
  return collection(db, 'users', userId, 'customers');
}

/** Upsert a customer record keyed by phone number (used as doc ID). */
export async function upsertCustomer(
  userId: string,
  name: string,
  phone: string,
  address: string
): Promise<void> {
  // Sanitize phone to use as a safe Firestore document ID
  const customerId = phone.replace(/\D/g, '');
  const ref = doc(db, 'users', userId, 'customers', customerId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await setDoc(
      ref,
      {
        name,
        address,
        jobCount: increment(1),
        lastJobAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    await setDoc(ref, {
      name,
      phone,
      address,
      jobCount: 1,
      lastJobAt: serverTimestamp(),
    });
  }
}

export async function getCustomers(userId: string): Promise<Customer[]> {
  const q = query(customersRef(userId), orderBy('lastJobAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Customer));
}

export async function getCustomer(
  userId: string,
  customerId: string
): Promise<Customer | null> {
  const snap = await getDoc(doc(db, 'users', userId, 'customers', customerId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Customer;
}
