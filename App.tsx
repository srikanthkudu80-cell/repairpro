import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/context/AuthContext';
import AppNavigator from '@/navigation/AppNavigator';
import {
  registerForPushNotifications,
  scheduleDailyDigest,
} from '@/services/notificationService';

export default function App() {
  useEffect(() => {
    // Register for push notifications on app launch
    registerForPushNotifications().then((token) => {
      if (token) {
        // In production: save token to Firestore for server-side FCM sends
        console.log('Expo Push Token:', token);
      }
    }).catch((e) => console.warn('Push notification setup failed:', e));

    // Schedule the daily 8 AM digest notification
    scheduleDailyDigest();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
