import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/utils/colors';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function SplashScreen({ navigation }: Props) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Small delay so splash is visible
      const timer = setTimeout(() => {
        navigation.replace(user ? 'Main' : 'Auth');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>🔧</Text>
      </View>
      <Text style={styles.appName}>RepairPro</Text>
      <Text style={styles.tagline}>Your jobs. Organized.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 44,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '400',
  },
});
