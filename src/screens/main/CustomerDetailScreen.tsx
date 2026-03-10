import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { getCustomer, Customer } from '@/services/customerService';
import { getJobs, Job } from '@/services/jobService';
import JobCard from '@/components/JobCard';
import { Colors } from '@/utils/colors';
import { getInitials, formatPhone } from '@/utils/formatters';

export default function CustomerDetailScreen({ route, navigation }: any) {
  const { customerId } = route.params;
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getCustomer(user.uid, customerId),
      getJobs(user.uid),
    ]).then(([cust, allJobs]) => {
      setCustomer(cust);
      // Filter jobs for this customer by matching phone
      if (cust) {
        const phone = cust.phone.replace(/\D/g, '');
        setJobs(allJobs.filter((j) => j.customerPhone.replace(/\D/g, '') === phone));
      }
    });
  }, [user, customerId]);

  if (!customer) return null;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={jobs}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          {/* Profile Header */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(customer.name)}</Text>
            </View>
            <Text style={styles.name}>{customer.name}</Text>
            {customer.phone ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${customer.phone}`)}
                style={styles.phoneRow}
              >
                <Ionicons name="call-outline" size={16} color={Colors.primary} />
                <Text style={styles.phone}>{formatPhone(customer.phone)}</Text>
              </TouchableOpacity>
            ) : null}
            {customer.address ? (
              <View style={styles.addrRow}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.addr}>{customer.address}</Text>
              </View>
            ) : null}
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{customer.jobCount}</Text>
                <Text style={styles.statLabel}>Total Jobs</Text>
              </View>
            </View>
          </View>

          <Text style={styles.historyTitle}>Job History</Text>
        </View>
      }
      renderItem={({ item }) => (
        <JobCard
          job={item}
          onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
        />
      )}
      ListEmptyComponent={
        <Text style={styles.noJobs}>No job history found for this customer.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 32 },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phone: {
    fontSize: 16,
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
  statRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 24,
  },
  stat: { alignItems: 'center' },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  noJobs: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 24,
  },
});
