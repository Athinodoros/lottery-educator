import Tabs from 'expo-router/tabs';
import { HomeIcon, GamepadIcon, BarChart3Icon, HeartIcon, SettingsIcon } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          headerTitle: 'Lottery Educator',
          tabBarIcon: ({ color }) => <HomeIcon color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'Play',
          tabBarLabel: 'Play',
          headerTitle: 'Play Lottery',
          tabBarIcon: ({ color }) => <GamepadIcon color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Statistics',
          tabBarLabel: 'Statistics',
          headerTitle: 'Game Statistics',
          tabBarIcon: ({ color }) => <BarChart3Icon color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="motivation"
        options={{
          title: 'Learn',
          tabBarLabel: 'Learn',
          headerTitle: 'Educational Resources',
          tabBarIcon: ({ color }) => <HeartIcon color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarLabel: 'Admin',
          headerTitle: 'Admin Dashboard',
          tabBarIcon: ({ color }) => <SettingsIcon color={color} size={24} />
        }}
      />
    </Tabs>
  );
}
