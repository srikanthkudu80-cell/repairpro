import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import {
  getJob,
  updateJobStatus,
  addJobNote,
  addJobPhoto,
  deleteJob,
  Job,
} from '@/services/jobService';
import { uploadJobPhoto } from '@/services/storageService';
import { cancelJobReminder } from '@/services/notificationService';
import StatusBadge from '@/components/StatusBadge';
import PhotoPicker from '@/components/PhotoPicker';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Colors } from '@/utils/colors';
import { STATUS_ORDER, STATUS_LABELS, JobStatus } from '@/utils/constants';
import { formatDate, formatTime, formatPhone } from '@/utils/formatters';

export default function JobDetailScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const { user, profile } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);

  async function loadJob() {
    if (!user) return;
    const data = await getJob(user.uid, jobId);
    setJob(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadJob();
    }, [user, jobId])
  );

  async function changeStatus(newStatus: JobStatus) {
    if (!user || !job) return;
    await updateJobStatus(user.uid, job.id, newStatus);
    setJob((prev) => prev ? { ...prev, status: newStatus } : prev);
  }

  async function submitNote() {
    if (!user || !job || !note.trim()) return;
    await addJobNote(user.uid, job.id, job.notes, note.trim());
    setJob((prev) =>
      prev ? { ...prev, notes: [...prev.notes, note.trim()] } : prev
    );
    setNote('');
  }

  async function handlePhotoAdd(localUri: string) {
    if (!user || !job) return;
    // Pro feature: photo uploads
    if (profile?.plan === 'free') {
      Alert.alert(
        'Pro Feature',
        'Photo uploads are available on the Pro plan. Toggle to Pro in your Profile to unlock.',
        [{ text: 'OK' }]
      );
      return;
    }
    setUploading(true);
    try {
      const url = await uploadJobPhoto(user.uid, job.id, localUri);
      await addJobPhoto(user.uid, job.id, job.photoUrls, url);
      setJob((prev) =>
        prev ? { ...prev, photoUrls: [...prev.photoUrls, url] } : prev
      );
    } catch (e) {
      Alert.alert('Upload Failed', 'Could not upload the photo. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handlePhotoRemove(index: number) {
    // For MVP, photos are not deleted from Storage on removal (to keep code simple)
    // A v2 improvement would call deleteJobPhoto() here
    Alert.alert('Remove photo?', 'This will remove the photo from this job.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          if (!job) return;
          const updated = job.photoUrls.filter((_, i) => i !== index);
          setJob((prev) => prev ? { ...prev, photoUrls: updated } : prev);
          // Note: also update Firestore in production
        },
      },
    ]);
  }

  async function handleDelete() {
    Alert.alert('Delete Job', 'Are you sure you want to permanently delete this job?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!user || !job) return;
          await deleteJob(user.uid, job.id);
          await cancelJobReminder(job.id);
          navigation.goBack();
        },
      },
    ]);
  }

  function callCustomer() {
    if (!job?.customerPhone) return;
    Linking.openURL(`tel:${job.customerPhone}`);
  }

  if (!job) {
    return <LoadingOverlay message="Loading job..." />;
  }

  const currentIndex = STATUS_ORDER.indexOf(job.status as JobStatus);

  return (
    <View style={styles.flex}>
      {uploading && <LoadingOverlay message="Uploading photo..." />}
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.custInfo}>
              <Text style={styles.customerName}>{job.customerName}</Text>
              {job.customerPhone ? (
                <TouchableOpacity style={styles.phoneRow} onPress={callCustomer}>
                  <Ionicons name="call-outline" size={14} color={Colors.primary} />
                  <Text style={styles.phone}>{formatPhone(job.customerPhone)}</Text>
                </TouchableOpacity>
              ) : null}
              {job.address ? (
                <View style={styles.addrRow}>
                  <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.addr}>{job.address}</Text>
                </View>
              ) : null}
            </View>
            <StatusBadge status={job.status as JobStatus} />
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="construct-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoText}>{job.appliance}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoText}>
              {formatDate(job.scheduledDate)} {formatTime(job.scheduledDate)}
            </Text>
          </View>

          <Text style={styles.issueLabel}>Issue</Text>
          <Text style={styles.issue}>{job.issue}</Text>
        </View>

        {/* Status Pipeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.pipeline}>
            {STATUS_ORDER.map((s, i) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.pipeBtn,
                  i <= currentIndex && styles.pipeBtnDone,
                  s === job.status && styles.pipeBtnActive,
                ]}
                onPress={() => changeStatus(s)}
              >
                <Text
                  style={[
                    styles.pipeBtnText,
                    (i <= currentIndex || s === job.status) && styles.pipeBtnTextActive,
                  ]}
                  numberOfLines={2}
                >
                  {STATUS_LABELS[s]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {job.notes.map((n, i) => (
            <View key={i} style={styles.noteItem}>
              <Ionicons name="document-text-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.noteText}>{n}</Text>
            </View>
          ))}
          <View style={styles.noteInputRow}>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              placeholderTextColor={Colors.textSecondary}
              multiline
            />
            <TouchableOpacity
              style={styles.noteSubmit}
              onPress={submitNote}
              disabled={!note.trim()}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Photos */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <PhotoPicker
            photos={job.photoUrls}
            onAdd={handlePhotoAdd}
            onRemove={handlePhotoRemove}
          />
          {job.photoUrls.length === 0 && (
            <Text style={styles.noPhotos}>No photos yet. Tap the camera to add one.</Text>
          )}
        </View>

        {/* Danger Zone */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
          <Text style={styles.deleteBtnText}>Delete Job</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  custInfo: { flex: 1, marginRight: 10 },
  customerName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addr: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  issueLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 4,
  },
  issue: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  pipeline: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  pipeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  pipeBtnDone: {
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primaryLight,
  },
  pipeBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  pipeBtnText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  pipeBtnTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 8,
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  noteInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    alignItems: 'flex-end',
  },
  noteInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    maxHeight: 100,
  },
  noteSubmit: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotos: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  deleteBtnText: {
    fontSize: 15,
    color: Colors.error,
    fontWeight: '600',
  },
});
