import { View } from 'react-native';

type Props = {
  particleCount?: number;
  duration?: number;
  width: number;
  height: number;
};

export function ConfettiSkia({ width, height }: Props) {
  return <View style={{ width, height }} pointerEvents="none" />;
}
