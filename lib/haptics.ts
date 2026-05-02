import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

export const tap = () => {
  if (isMobile) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export const select = () => {
  if (isMobile) Haptics.selectionAsync();
};

export const success = () => {
  if (isMobile) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const warn = () => {
  if (isMobile) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};
