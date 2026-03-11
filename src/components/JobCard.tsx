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

const STATUS_ACCENT: Record<string, string> = {
  new: Colors.primary,
  in_progress: '#7C3AED',
  awaiting_parts: '#D97706',
  done: '#16A34A',
  invoiced: '#64748B',
};

const APPLIANCE_ICONS: Record<string, any> = {
  'Washing Machine': 'water-outline',
  'Dryer': 'flame-outline',
  'Refrigerator': 'snow-outline',
  'Freezer': 'snow-outline',
  'Dishwasher': 'water-outline',
  'Oven / Stove': 'flame-outline',
  'Microwave': 'radio-outline',
  'Air Conditioner': 'thermometer-outline',
  'Furnace / Heater': 'flame-outline',
  'Water Heater': 'water-outline',
  'Garbage Disposal': 'trash-outline',
};

export default function JobCard({ job, onPress }: JobCardProps) {
  const statusColor = StatusColors[job.status] ?? StatusColors.new;
  const accentColor = STATUS_ACCENT[job.status] ?? Colors.primary;
  const applianceIcon = APPLIANCE_ICONS[job.appliance] ?? 'construct-outline';
  const initials = job.customerName.trim().charAt(0).toUpperCase();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.74}>
      {/* Colored left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.content}>
        {/* Header: avatar + name/appliance + status badge */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: accentColor + '18' }]}>
            <Text style={[styles.avatarText, { color: accentColor }]}>{initials}</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.customerName} numberOfLines={1}>{job.customerName}</Text>
            <View style={styles.applianceRow}>
              <Ionicons name={applianceIcon} size={12} color={Colors.textSecondary} />
              <Text style={styles.applianceText} numberOfLines={1}>{job.appliance}</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
            <View style={[styles.badgeDot, { backgroundColor: accentColor }]} />
            <Text style={[styles.badgeText, { color: statusColor.text }]}>
              {STATUS_LABELS[job.status as JobStatus]}
            </Text>
          </View>
        </View>

        {/* Issue description */}
        <Text style={styles.issue} numberOfLines={2}>{job.issue}</Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.footerText}>{formatDate(job.scheduledDate)}</Text>
          </View>
          {job.chargeAmount > 0 ? (
            <Text style={styles.amount}>${job.chargeAmount.toFixed(2)}</Text>
          ) : (
            <Text style={styles.noPrice}>No estimate</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  applianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applianceText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  issue: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  noPrice: {
    fontSize: 12,
    color: '#CBD5E1',
    fontStyle: 'italic',
  },
});
