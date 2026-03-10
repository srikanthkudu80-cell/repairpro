import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '@/services/jobService';
import { Colors, StatusColors } from '@/utils/colors';
import { STATUS_LABELS, JobStatus } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';

interface JobCardProps {
  job: Job;
  onPress: () => void;
}

export default function JobCard({ job, onPress }: JobCardProps) {
  const statusColor = StatusColors[job.status] ?? StatusColors.new;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.header}>
        <View style={styles.customerRow}>
          <Ionicons name="person-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.customerName} numberOfLines={1}>
            {job.customerName}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.badgeText, { color: statusColor.text }]}>
            {STATUS_LABELS[job.status as JobStatus]}
          </Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="construct-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.detailText} numberOfLines={1}>
          {job.appliance}
        </Text>
      </View>

      <Text style={styles.issue} numberOfLines={2}>
        {job.issue}
      </Text>

      <View style={styles.footer}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.footerText}>{formatDate(job.scheduledDate)}</Text>
        </View>
        {job.chargeAmount > 0 && (
          <Text style={styles.amount}>${job.chargeAmount.toFixed(2)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  issue: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 2,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.success,
  },
});
