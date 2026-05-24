import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ScrollViewProps } from 'react-native'

interface SafeScrollViewProps extends ScrollViewProps {
  children: React.ReactNode
}

export function SafeScrollView({ children, contentContainerClassName, style, ...props }: SafeScrollViewProps) {
  const insets = useSafeAreaInsets()

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName={contentContainerClassName}
      contentContainerStyle={[
        { paddingTop: insets.top, paddingBottom: insets.bottom + 16 },
      ]}
      style={[{ flex: 1 }, style]}
      {...props}
    >
      {children}
    </ScrollView>
  )
}
