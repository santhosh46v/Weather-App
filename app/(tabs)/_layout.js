import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#8B9DC3',
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 107, 107, 0.1)',
          elevation: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          height: 80,
          paddingBottom: 20,
          paddingTop: 6,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 0.3,
          marginTop: 10,
          textTransform: 'uppercase',
          fontFamily: 'System',
        },
        
        tabBarItemStyle: {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 20,
          marginHorizontal: 4,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarActiveBackgroundColor: 'rgba(255, 107, 107, 0.08)',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={focused ? 26 : 22}
              color={color}
              style={{
                opacity: focused ? 1 : 0.8,
                transform: [{ scale: focused ? 1.05 : 1 }],
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="forecast"
        options={{
          title: 'Forecast',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'partly-sunny' : 'partly-sunny-outline'}
              size={focused ? 26 : 22}
              color={color}
              style={{
                opacity: focused ? 1 : 0.8,
                transform: [{ scale: focused ? 1.05 : 1 }],
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
