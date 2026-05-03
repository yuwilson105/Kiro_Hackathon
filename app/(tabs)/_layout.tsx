import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Home, Calendar, BookOpen, MapPin, MessageCircle } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';

import { HapticTab } from '@/components/haptic-tab';
import { colors } from '@/lib/theme';
import { useCompanionAlertStore } from '@/lib/companion-alerts-store';

type TabIconProps = {
  color: string;
  focused: boolean;
};

const DANGER_COLOR = (colors as { danger?: string }).danger ?? '#EF4444';

function CompanionTabIcon({ color, focused }: TabIconProps) {
  const alert = useCompanionAlertStore((s) => s.alert);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (alert) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.45, { duration: 600 }),
          withTiming(1, { duration: 600 }),
        ),
        3,
        false,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = 1;
    }
    return () => {
      cancelAnimation(pulse);
    };
  }, [alert, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <View style={{ width: 22, height: 22 }}>
      <Animated.View style={animatedStyle}>
        <MessageCircle size={22} color={color} strokeWidth={focused ? 2 : 1.75} />
      </Animated.View>
      {alert ? (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: DANGER_COLOR,
          }}
        />
      ) : null}
    </View>
  );
}

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
      <Tabs.Screen
        name="companion"
        options={{
          title: 'Companion',
          tabBarAccessibilityLabel: 'Your companion',
          tabBarIcon: CompanionTabIcon,
        }}
      />
    </Tabs>
  );
}
