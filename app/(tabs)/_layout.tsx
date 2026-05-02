import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Home, Calendar, BookOpen, MapPin } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { colors } from '@/lib/theme';

type TabIconProps = {
  color: string;
  focused: boolean;
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Onest_500Medium',
          marginTop: 1,
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.borderSubtle,
          backgroundColor: 'rgba(255,255,255,0.85)',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={70}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: 'Home',
          tabBarIcon: ({ color, focused }: TabIconProps) => (
            <Home size={22} color={color} strokeWidth={focused ? 2 : 1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'My Plan',
          tabBarAccessibilityLabel: 'My Plan',
          tabBarIcon: ({ color, focused }: TabIconProps) => (
            <Calendar size={22} color={color} strokeWidth={focused ? 2 : 1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="catchup"
        options={{
          title: 'Catch Up',
          tabBarAccessibilityLabel: 'Catch Up',
          tabBarIcon: ({ color, focused }: TabIconProps) => (
            <BookOpen size={22} color={color} strokeWidth={focused ? 2 : 1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Find Help',
          tabBarAccessibilityLabel: 'Find Help',
          tabBarIcon: ({ color, focused }: TabIconProps) => (
            <MapPin size={22} color={color} strokeWidth={focused ? 2 : 1.75} />
          ),
        }}
      />
    </Tabs>
  );
}
