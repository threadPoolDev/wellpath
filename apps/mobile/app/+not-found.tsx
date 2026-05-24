import { Link, Stack } from 'expo-router'
import { Text, View } from 'react-native'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-900 px-6">
        <Text className="text-stone-800 dark:text-stone-100 text-xl font-semibold">
          Screen not found
        </Text>
        <Link href="/" className="mt-4">
          <Text className="text-sm text-stone-500 dark:text-stone-400">Go home</Text>
        </Link>
      </View>
    </>
  )
}
