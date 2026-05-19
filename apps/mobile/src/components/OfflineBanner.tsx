import { View, Text } from 'react-native'
import { useNetworkStatus } from '../hooks/useNetworkStatus'

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus()

  if (isConnected) return null

  return (
    <View className="bg-amber-50 border-b border-amber-200 px-4 py-2 items-center">
      <Text className="text-xs text-amber-700 font-medium">
        You're offline — showing cached data
      </Text>
    </View>
  )
}
