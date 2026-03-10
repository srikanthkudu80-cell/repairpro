import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { getJobs, Job } from '@/services/jobService';
import JobCard from '@/components/JobCard';
import { Colors } from '@/utils/colors';
import { JobStatus, STATUS_LABELS, STATUS_ORDER } from '@/utils/constants';

const ALL_TAB = 'all';

export default function JobListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<JobStatus | typeof ALL_TAB>(ALL_TAB);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  async function loadJobs() {
    if (!user) return;
    const data = await getJobs(user.uid);
    setJobs(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [user])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  }

  const tabs = [ALL_TAB, ...STATUS_ORDER];

  const filtered = jobs.filter((j) => {
    const matchesFilter = filter === ALL_TAB || j.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      j.customerName.toLowerCase().includes(q) ||
      j.appliance.toLowerCase().includes(q) ||
      j.issue.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={16} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search jobs..."
          placeholderTextColor={Colors.textSecondary}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Tabs */}
      <FlatList
        horizontal
        data={tabs}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        renderItem={({ item }) => {
          const active = item === filter;
          return (
            <TouchableOpacity
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setFilter(item as any)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {item === ALL_TAB ? 'All' : STATUS_LABELS[item as JobStatus]}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Job List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔧</Text>
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === ALL_TAB
                ? 'Tap the + button to create your first job.'
                : `No ${STATUS_LABELS[filter as JobStatus]} jobs.`}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddJob')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  tabsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  listContent: {
    padding: 12,
    paddingBottom: 80,
  },
  empty: {
    alignItems: 'center',
    padding: 48,
    gap: 8,
  },
  emptyIcon: { fontSize: 44 },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
});
