import { Text, View } from 'react-native';

type Props = {
  eyebrow?: string;
  title?: string;
  trailing?: React.ReactNode;
  className?: string;
};

export function SectionHeader({ eyebrow, title, trailing, className = '' }: Props) {
  return (
    <View className={`flex-row items-end justify-between ${className}`}>
      <View className="flex-1">
        {eyebrow ? (
          <Text className="font-medium text-2xs uppercase tracking-wider text-text-muted">
            {eyebrow}
          </Text>
        ) : null}
        {title ? (
          <Text className="font-medium text-xl text-text mt-1">{title}</Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}
