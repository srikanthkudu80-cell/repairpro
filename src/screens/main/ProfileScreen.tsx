import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import { Colors } from '@/utils/colors';
import { sendTestNotification, registerForPushNotifications } from '@/services/notificationService';

export default function ProfileScreen() {
  const { profile, logOut, refreshProfile, updatePlan } = useAuth();
  const [businessName, setBusinessName] = useState(profile?.businessName ?? '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [planUpdating, setPlanUpdating] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setNotifGranted(status === 'granted');
    });
  }, []);

  async function handlePlanToggle(toPro: boolean) {
    setPlanUpdating(true);
    try {
      await updatePlan(toPro ? 'pro' : 'free');
    } finally {
      setPlanUpdating(false);
    }
  }

  async function handleEnableNotifications() {
    setNotifLoading(true);
    try {
      const token = await registerForPushNotifications();
      setNotifGranted(!!token);
      if (token) {
        Alert.alert('Notifications Enabled', 'You will receive job reminders and daily morning updates.');
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in your device Settings > Apps > RepairPro.');
      }
    } finally {
      setNotifLoading(false);
    }
  }

  async function handleTestNotification() {
    try {
      await sendTestNotification();
      Alert.alert('Sent!', 'A test notification will appear in about 1 second.');
    } catch {
      Alert.alert('Error', 'Could not send test notification.');
    }
  }

  async function saveBusinessName() {
    if (!profile) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        businessName: businessName.trim(),
      });
      await refreshProfile();
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function confirmLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logOut },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.displayName}>{profile?.displayName}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        <View style={[styles.planBadge, profile?.plan === 'pro' && styles.planBadgePro]}>
          <Text style={[styles.planText, profile?.plan === 'pro' && styles.planTextPro]}>
            {profile?.plan === 'pro' ? '⭐ Pro' : 'Free Plan'}
          </Text>
        </View>
      </View>

      {/* Business Name */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Business Name</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons
              name={editing ? 'close-outline' : 'pencil-outline'}
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.input}
              value={businessName}
              onChangeText={setBusinessName}
              autoCapitalize="words"
              autoFocus
            />
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={saveBusinessName}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.cardValue}>{profile?.businessName}</Text>
        )}
      </View>

      {/* Plan */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Plan</Text>
        <View style={styles.planRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardValue}>
              {profile?.plan === 'pro' ? '⭐  Pro Plan' : 'Free Plan'}
            </Text>
            <Text style={styles.cardSub}>
              {profile?.plan === 'pro'
                ? 'Unlimited jobs · Photo uploads · Customer export'
                : 'Up to 10 active jobs · No photo uploads'}
            </Text>
          </View>
          <Switch
            value={profile?.plan === 'pro'}
            onValueChange={handlePlanToggle}
            disabled={planUpdating}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor="#fff"
          />
        </View>
        <Text style={styles.devNote}>🧪 Dev toggle — connects to payment in production</Text>
      </View>

      {/* Notifications */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notifications</Text>
        <View style={styles.notifStatusRow}>
          <Ionicons
            name={notifGranted ? 'notifications' : 'notifications-off-outline'}
            size={20}
            color={notifGranted ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.cardValue, { marginLeft: 8 }]}>
            {notifGranted ? 'Enabled' : 'Disabled'}
          </Text>
        </View>
        {!notifGranted ? (
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={handleEnableNotifications}
            disabled={notifLoading}
          >
            <Text style={styles.notifBtnText}>
              {notifLoading ? 'Requesting...' : 'Enable Notifications'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.notifBtn, styles.notifBtnSecondary]}
            onPress={handleTestNotification}
          >
            <Text style={[styles.notifBtnText, { color: Colors.primary }]}>
              Send Test Notification
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.cardSub}>
          Daily reminder at 8 AM · Job alert 1 hour before start
        </Text>
      </View>

      {/* App Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <Text style={styles.cardValue}>RepairPro v1.0.0</Text>
        <Text style={styles.cardSub}>Built for independent repair technicians.</Text>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 48 },
  avatarWrapper: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  planBadgePro: {
    backgroundColor: '#FEF3C7',
  },
  planText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  planTextPro: {
    color: '#B45309',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  cardSub: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  editRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  upgradeCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  upgradeBody: {
    fontSize: 13,
    color: Colors.primaryDark,
    lineHeight: 18,
  },
  upgradeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  upgradeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.error,
    marginTop: 8,
  },
  logoutText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  devNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
  },
  notifStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notifBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  notifBtnSecondary: {
    backgroundColor: Colors.primaryLight,
  },
  notifBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
