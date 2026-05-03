import { View } from 'react-native';

type Props = {
  width: number;
  height: number;
  originX: number;
  originY: number;
  color?: string;
  particleCount?: number;
  duration?: number;
  trigger?: number;
};

export function BubbleBurst({ width, height }: Props) {
  return <View style={{ width, height }} pointerEvents="none" />;
}
