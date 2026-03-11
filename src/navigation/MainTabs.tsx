import React from 'react';
import { View, Text, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen from '@/screens/main/DashboardScreen';
import JobListScreen from '@/screens/main/JobListScreen';
import AddJobScreen from '@/screens/main/AddJobScreen';
import JobDetailScreen from '@/screens/main/JobDetailScreen';
import CustomerListScreen from '@/screens/main/CustomerListScreen';
import CustomerDetailScreen from '@/screens/main/CustomerDetailScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';
import { Colors } from '@/utils/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for the Jobs tab (includes Detail and AddJob)
function JobsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', color: '#fff' },
      }}
    >
      <Stack.Screen
        name="JobList"
        component={JobListScreen}
        options={{ title: 'My Jobs' }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: 'Job Details' }}
      />
      <Stack.Screen
        name="AddJob"
        component={AddJobScreen}
        options={{ title: 'New Job' }}
      />
    </Stack.Navigator>
  );
}

// Stack for the Customers tab
function CustomersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', color: '#fff' },
      }}
    >
      <Stack.Screen
        name="CustomerList"
        component={CustomerListScreen}
        options={{ title: 'Customers' }}
      />
      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{ title: 'Customer' }}
      />
    </Stack.Navigator>
  );
}

// Stack for the Dashboard tab (needs to navigate to AddJob / JobDetail)
function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', color: '#fff' },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                source={require('../../assets/images/icon.png')}
                style={{ width: 28, height: 28, borderRadius: 7 }}
              />
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 0.2 }}>
                RepairPro
              </Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="AddJob"
        component={AddJobScreen}
        options={{ title: 'New Job' }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: 'Job Details' }}
      />
      <Stack.Screen
        name="JobList"
        component={JobListScreen}
        options={{ title: 'My Jobs' }}
      />
    </Stack.Navigator>
  );
}

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.55)',
        tabBarStyle: {
          backgroundColor: Colors.primary,
          borderTopColor: Colors.primaryDark,
          paddingTop: 4,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          height: 56 + (insets.bottom > 0 ? insets.bottom : 6),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Jobs') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Customers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardStack} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Jobs" component={JobsStack} />
      <Tab.Screen name="Customers" component={CustomersStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
