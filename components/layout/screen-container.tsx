import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = ScrollViewProps & {
  scroll?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  surface?: boolean;
  className?: string;
  contentClassName?: string;
};

export function ScreenContainer({
  scroll = true,
  edges = ['top', 'bottom'],
  surface = false,
  className = '',
  contentClassName = '',
  children,
  ...rest
}: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  const bg = surface ? 'bg-surface' : 'bg-bg';

  if (!scroll) {
    return (
      <View style={padding} className={`flex-1 ${bg} ${className}`}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      {...rest}
      style={[{ flex: 1 }]}
      contentContainerStyle={[padding]}
      className={`${bg} ${className}`}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className={contentClassName}>{children}</View>
    </ScrollView>
  );
}
