import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Notifications are not supported on web
const isWeb = Platform.OS === 'web';

// Configure how notifications appear when the app is foregrounded (native only)
if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (isWeb) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'RepairPro',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
    });
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    const tokenData = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch {
    return null;
  }
}

/**
 * Schedule a local notification for a job reminder.
 * @param jobId     - used as the notification identifier so it can be cancelled
 * @param title     - notification title
 * @param body      - notification body
 * @param fireAt    - Date when the notification should fire
 */
export async function scheduleJobReminder(
  jobId: string,
  title: string,
  body: string,
  fireAt: Date
): Promise<void> {
  if (isWeb) return;
  await cancelJobReminder(jobId);
  await Notifications.scheduleNotificationAsync({
    identifier: `job_${jobId}`,
    content: { title, body, sound: true },
    trigger: { date: fireAt },
  });
}

export async function cancelJobReminder(jobId: string): Promise<void> {
  if (isWeb) return;
  await Notifications.cancelScheduledNotificationAsync(`job_${jobId}`);
}

/**
 * Schedule a daily morning digest notification at 8:00 AM.
 */
export async function scheduleDailyDigest(): Promise<void> {
  if (isWeb) return;
  await Notifications.cancelScheduledNotificationAsync('daily_digest');
  await Notifications.scheduleNotificationAsync({
    identifier: 'daily_digest',
    content: {
      title: "Good morning! 🔧",
      body: "Check your RepairPro jobs scheduled for today.",
      sound: true,
    },
    trigger: {
      hour: 8,
      minute: 0,
      repeats: true,
    },
  });
}

/**
 * Send an immediate test notification to verify push notifications are working.
 */
export async function sendTestNotification(): Promise<void> {
  if (isWeb) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔧 RepairPro',
      body: "Notifications are working! You'll receive job reminders and daily morning updates.",
      sound: true,
    },
    trigger: { seconds: 1 },
  });
}
