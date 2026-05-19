import { useRef, useEffect } from 'react'
import { TextInput, View } from 'react-native'

interface TextAnswerProps {
  value: string | undefined
  onChange: (value: string) => void
  placeholder?: string
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  keyboardType?: 'default' | 'email-address' | 'numeric'
}

export function TextAnswer({
  value,
  onChange,
  placeholder = 'Type here…',
  autoCapitalize = 'sentences',
  keyboardType = 'default',
}: TextAnswerProps) {
  const ref = useRef<TextInput>(null)

  useEffect(() => {
    const timer = setTimeout(() => ref.current?.focus(), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <View className="mt-2">
      <TextInput
        ref={ref}
        className="bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-lg text-stone-900 min-h-[56px]"
        value={value as string | undefined}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#a8a29e"
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        returnKeyType="done"
        multiline={false}
      />
    </View>
  )
}
