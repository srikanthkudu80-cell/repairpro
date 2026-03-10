import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { JobStatus } from '@/utils/constants';

export interface Job {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  appliance: string;
  issue: string;
  status: JobStatus;
  notes: string[];
  photoUrls: string[];
  chargeAmount: number;
  scheduledDate: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type JobInput = Omit<Job, 'id' | 'createdAt' | 'updatedAt'>;

function jobsRef(userId: string) {
  return collection(db, 'users', userId, 'jobs');
}

function jobRef(userId: string, jobId: string) {
  return doc(db, 'users', userId, 'jobs', jobId);
}

export async function createJob(userId: string, data: JobInput): Promise<string> {
  const ref = await addDoc(jobsRef(userId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getJobs(userId: string): Promise<Job[]> {
  const q = query(jobsRef(userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
}

export async function getJobsByStatus(userId: string, status: JobStatus): Promise<Job[]> {
  const q = query(
    jobsRef(userId),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
}

export async function getJob(userId: string, jobId: string): Promise<Job | null> {
  const snap = await getDoc(jobRef(userId, jobId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Job;
}

export async function updateJob(
  userId: string,
  jobId: string,
  data: Partial<JobInput>
): Promise<void> {
  await updateDoc(jobRef(userId, jobId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function updateJobStatus(
  userId: string,
  jobId: string,
  status: JobStatus
): Promise<void> {
  await updateDoc(jobRef(userId, jobId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function addJobNote(
  userId: string,
  jobId: string,
  currentNotes: string[],
  newNote: string
): Promise<void> {
  await updateDoc(jobRef(userId, jobId), {
    notes: [...currentNotes, newNote],
    updatedAt: serverTimestamp(),
  });
}

export async function addJobPhoto(
  userId: string,
  jobId: string,
  currentPhotos: string[],
  photoUrl: string
): Promise<void> {
  await updateDoc(jobRef(userId, jobId), {
    photoUrls: [...currentPhotos, photoUrl],
    updatedAt: serverTimestamp(),
  });
}

export async function deleteJob(userId: string, jobId: string): Promise<void> {
  await deleteDoc(jobRef(userId, jobId));
}

export async function getTodaysJobs(userId: string): Promise<Job[]> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const q = query(
    jobsRef(userId),
    where('scheduledDate', '>=', Timestamp.fromDate(startOfDay)),
    where('scheduledDate', '<=', Timestamp.fromDate(endOfDay))
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
}
