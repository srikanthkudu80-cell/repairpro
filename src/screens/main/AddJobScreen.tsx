import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { createJob, getJobs } from '@/services/jobService';
import { upsertCustomer } from '@/services/customerService';
import { scheduleJobReminder } from '@/services/notificationService';
import { Colors } from '@/utils/colors';
import { APPLIANCE_TYPES } from '@/utils/constants';

export default function AddJobScreen({ navigation }: any) {
  const { user, profile } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [appliance, setAppliance] = useState('');
  const [issue, setIssue] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!customerName.trim() || !appliance || !issue.trim()) {
      Alert.alert('Required Fields', 'Please fill in Customer Name, Appliance, and Issue.');
      return;
    }
    if (!user) return;

    // Free plan: max 10 active (non-invoiced) jobs
    if (profile?.plan === 'free') {
      const existing = await getJobs(user.uid);
      const active = existing.filter((j) => j.status !== 'invoiced');
      if (active.length >= 10) {
        Alert.alert(
          'Free Plan Limit Reached',
          'You have 10 active jobs (the Free limit). Mark some as Invoiced or upgrade to Pro for unlimited jobs.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setLoading(true);
    try {
      const jobId = await createJob(user.uid, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        address: address.trim(),
        appliance,
        issue: issue.trim(),
        status: 'new',
        notes: [],
        photoUrls: [],
        chargeAmount: 0,
        scheduledDate: Timestamp.fromDate(scheduledDate),
      });

      // Upsert customer record
      if (customerPhone.trim()) {
        await upsertCustomer(
          user.uid,
          customerName.trim(),
          customerPhone.trim(),
          address.trim()
        );
      }

      // Schedule reminder 1 hour before job
      const reminderTime = new Date(scheduledDate.getTime() - 60 * 60 * 1000);
      if (reminderTime > new Date()) {
        await scheduleJobReminder(
          jobId,
          'Upcoming Job',
          `Job for ${customerName.trim()} starts in 1 hour.`,
          reminderTime
        );
      }

      navigation.navigate('JobDetail', { jobId });
    } catch (e) {
      Alert.alert('Error', 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Section title="Customer Info">
        <Field label="Customer Name *">
          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Jane Doe"
            placeholderTextColor={Colors.textSecondary}
            autoCapitalize="words"
          />
        </Field>
        <Field label="Phone Number">
          <TextInput
            style={styles.input}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            placeholder="(555) 123-4567"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="phone-pad"
          />
        </Field>
        <Field label="Address">
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="123 Main St, City"
            placeholderTextColor={Colors.textSecondary}
            autoCapitalize="words"
          />
        </Field>
      </Section>

      <Section title="Appliance & Issue">
        <Field label="Appliance Type *">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {APPLIANCE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, appliance === type && styles.chipActive]}
                onPress={() => setAppliance(type)}
              >
                <Text style={[styles.chipText, appliance === type && styles.chipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Field>

        <Field label="Issue Description *">
          <TextInput
            style={[styles.input, styles.textarea]}
            value={issue}
            onChangeText={setIssue}
            placeholder="Describe the problem the customer is experiencing..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Field>
      </Section>

      <Section title="Schedule">
        <Field label="Scheduled Date & Time">
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => {
              setPickerMode('date');
              setShowDatePicker(true);
            }}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
            <Text style={styles.dateText}>
              {scheduledDate.toLocaleDateString()} at{' '}
              {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={scheduledDate}
              mode={Platform.OS === 'ios' ? 'datetime' : pickerMode}
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={pickerMode === 'date' ? new Date() : undefined}
              onChange={(event, date) => {
                if (Platform.OS === 'android') {
                  setShowDatePicker(false);
                  if (event.type === 'dismissed') return;
                  if (date) {
                    setScheduledDate(date);
                    if (pickerMode === 'date') {
                      // After picking date, immediately show time picker
                      setPickerMode('time');
                      setShowDatePicker(true);
                    }
                  }
                } else {
                  // iOS: inline picker, always keep open
                  if (date) setScheduledDate(date);
                }
              }}
            />
          )}
        </Field>
      </Section>

      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Ionicons name="checkmark-circle" size={20} color="#fff" />
        <Text style={styles.submitText}>
          {loading ? 'Creating Job...' : 'Create Job'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  field: { marginBottom: 12 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  textarea: {
    minHeight: 90,
    paddingTop: 10,
  },
  chipScroll: { flexDirection: 'row' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    backgroundColor: Colors.background,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
