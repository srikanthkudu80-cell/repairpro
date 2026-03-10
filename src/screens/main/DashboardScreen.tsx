import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { getJobs, getTodaysJobs, Job } from '@/services/jobService';
import JobCard from '@/components/JobCard';
import { Colors } from '@/utils/colors';
import { JobStatus } from '@/utils/constants';

interface StatusStat {
  label: string;
  count: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function DashboardScreen({ navigation }: any) {
  const { user, profile } = useAuth();
  const [todaysJobs, setTodaysJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Record<JobStatus, number>>({
    new: 0,
    in_progress: 0,
    awaiting_parts: 0,
    done: 0,
    invoiced: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    if (!user) return;
    const [all, today] = await Promise.all([
      getJobs(user.uid),
      getTodaysJobs(user.uid),
    ]);
    setTodaysJobs(today);

    const counts: Record<JobStatus, number> = {
      new: 0, in_progress: 0, awaiting_parts: 0, done: 0, invoiced: 0,
    };
    all.forEach((j) => {
      if (j.status in counts) counts[j.status]++;
    });
    setStats(counts);
  }

  useEffect(() => {
    loadData();
  }, [user]);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const statCards: StatusStat[] = [
    { label: 'New', count: stats.new, color: Colors.primary, icon: 'add-circle-outline' },
    { label: 'In Progress', count: stats.in_progress, color: '#7C3AED', icon: 'construct-outline' },
    { label: 'Awaiting Parts', count: stats.awaiting_parts, color: Colors.warning, icon: 'time-outline' },
    { label: 'Done', count: stats.done, color: Colors.success, icon: 'checkmark-circle-outline' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <View>
          <Text style={styles.hello}>
            Hello, {profile?.displayName?.split(' ')[0] ?? 'Tech'} 👋
          </Text>
          <Text style={styles.biz}>{profile?.businessName}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddJob')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stat Cards */}
      <Text style={styles.sectionTitle}>Job Overview</Text>
      <View style={styles.statsGrid}>
        {statCards.map((s) => (
          <View key={s.label} style={[styles.statCard, { borderLeftColor: s.color }]}>
            <Ionicons name={s.icon} size={22} color={s.color} />
            <Text style={[styles.statCount, { color: s.color }]}>{s.count}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Today's Jobs */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Jobs</Text>
        <TouchableOpacity onPress={() => navigation.navigate('JobList')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {todaysJobs.length === 0 ? (
        <View style={styles.emptyToday}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No jobs scheduled for today</Text>
          <TouchableOpacity
            style={styles.addFirstBtn}
            onPress={() => navigation.navigate('AddJob')}
          >
            <Text style={styles.addFirstBtnText}>+ Add a Job</Text>
          </TouchableOpacity>
        </View>
      ) : (
        todaysJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  hello: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  biz: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    width: '47.5%',
    borderLeftWidth: 4,
    alignItems: 'flex-start',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statCount: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyToday: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  addFirstBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
