import { View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  variant?: 'plain' | 'surface' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const variantClass = {
  plain: 'bg-bg border border-border',
  surface: 'bg-surface border border-border-surface',
  outlined: 'bg-bg border border-border-subtle',
};

const paddingClass = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export function Card({ variant = 'plain', padding = 'md', className = '', children, ...rest }: Props) {
  return (
    <View
      className={`rounded-2xl ${variantClass[variant]} ${paddingClass[padding]} ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}
