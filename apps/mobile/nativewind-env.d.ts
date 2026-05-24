// NativeWind v4 type augmentation.
// Adds className prop to React Native core components so TypeScript accepts
// Tailwind class strings. Mirrors react-native-css-interop/types.d.ts.
import 'react-native'

declare module 'react-native' {
  interface ViewProps {
    className?: string
  }
  interface TextProps {
    className?: string
  }
  interface ImageProps {
    className?: string
  }
  interface TextInputProps {
    className?: string
  }
  interface TouchableOpacityProps {
    className?: string
  }
  interface PressableProps {
    className?: string
  }
  interface ScrollViewProps {
    className?: string
    contentContainerClassName?: string
  }
  interface SafeAreaViewProps {
    className?: string
  }
}
