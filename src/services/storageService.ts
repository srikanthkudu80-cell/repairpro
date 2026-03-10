import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/config/firebase';
import * as FileSystem from 'expo-file-system';

/**
 * Upload a local image URI to Firebase Storage under
 * users/{userId}/jobs/{jobId}/{filename}
 * Returns the public download URL.
 */
export async function uploadJobPhoto(
  userId: string,
  jobId: string,
  localUri: string
): Promise<string> {
  const filename = `${Date.now()}.jpg`;
  const storagePath = `users/${userId}/jobs/${jobId}/${filename}`;
  const storageRef = ref(storage, storagePath);

  // Read local file as blob
  const fileInfo = await FileSystem.getInfoAsync(localUri);
  if (!fileInfo.exists) throw new Error('File not found: ' + localUri);

  const response = await fetch(localUri);
  const blob = await response.blob();

  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

/**
 * Delete a photo by its full storage URL.
 */
export async function deleteJobPhoto(downloadUrl: string): Promise<void> {
  const storageRef = ref(storage, downloadUrl);
  await deleteObject(storageRef);
}
