import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/icon-button';
import { colors } from '@/lib/theme';

export default function DemoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <View className="px-4 pt-2 pb-4 flex-row items-center gap-3">
        <IconButton
          icon={<ChevronLeft size={22} color={colors.text} strokeWidth={1.75} />}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          size={36}
        />
        <Text className="font-medium text-xl text-text">Video demo</Text>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <Text className="font-medium text-2xl text-text text-center">
          Demo screen
        </Text>
        <Text className="font-sans text-sm text-text-muted text-center mt-3 leading-5">
          Customize this for the hackathon walkthrough.
        </Text>
      </View>
    </View>
  );
}
