import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { getJobs, Job } from '@/services/jobService';
import JobCard from '@/components/JobCard';
import { Colors } from '@/utils/colors';
import { JobStatus, STATUS_LABELS, STATUS_ORDER } from '@/utils/constants';

const ALL_TAB = 'all';

const STATUS_DOTS: Record<string, string> = {
  new: Colors.primary,
  in_progress: '#7C3AED',
  awaiting_parts: '#D97706',
  done: '#16A34A',
  invoiced: '#64748B',
};

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

  const inProgressCount = jobs.filter((j) => j.status === 'in_progress').length;

  function getTabCount(tab: string) {
    if (tab === ALL_TAB) return jobs.length;
    return jobs.filter((j) => j.status === tab).length;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Jobs</Text>
          <Text style={styles.headerSubtitle}>
            {jobs.length} total · {inProgressCount} in progress
          </Text>
        </View>
        <TouchableOpacity style={styles.headerAddBtn} onPress={() => navigation.navigate('AddJob')}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar — floats over header bottom edge */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={16} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by customer, appliance or issue..."
          placeholderTextColor={Colors.textSecondary}
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
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
          const count = getTabCount(item);
          const dotColor = item === ALL_TAB ? Colors.primary : STATUS_DOTS[item];
          return (
            <TouchableOpacity
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setFilter(item as any)}
              activeOpacity={0.75}
            >
              {item !== ALL_TAB && (
                <View
                  style={[
                    styles.tabDot,
                    { backgroundColor: active ? 'rgba(255,255,255,0.7)' : dotColor },
                  ]}
                />
              )}
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {item === ALL_TAB ? 'All' : STATUS_LABELS[item as JobStatus]}
              </Text>
              <View style={[styles.tabBadge, active && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, active && styles.tabBadgeTextActive]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Job List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="construct-outline" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? 'Try a different search term.'
                : filter === ALL_TAB
                ? 'Tap the + button to add your first job.'
                : `No "${STATUS_LABELS[filter as JobStatus]}" jobs right now.`}
            </Text>
            {!search && filter === ALL_TAB && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('AddJob')}
              >
                <Ionicons name="add" size={16} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.emptyButtonText}>Add Job</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddJob')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FA' },

  // Header
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 2,
  },
  headerAddBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 8,
  },

  // Search — overlaps header bottom edge
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -18,
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
    color: Colors.textPrimary,
  },

  // Tabs
  tabsContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    gap: 5,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    elevation: 5,
    shadowOpacity: 0.18,
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tabText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: '#fff',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90,
  },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyIconWrap: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 999,
    padding: 22,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // FAB
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
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
