import { useState } from 'react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useAuthStore } from '../../../store/authStore'
import { MoreSheet } from './MoreSheet'
import { TAB_ICONS, TAB_LABELS, TAB_BAR_HEIGHT } from '../constants/shell.constants'

// Maps Expo Router file names to display labels
const ROUTE_LABELS: Record<string, string> = {
  index:    TAB_LABELS.TODAY,
  routine:  TAB_LABELS.ROUTINE,
  groups:   TAB_LABELS.GROUPS,
  history:  TAB_LABELS.HISTORY,
  settings: TAB_LABELS.SETTINGS,
}

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const user = useAuthStore((s) => s.user)
  const isMarried = user?.profile?.personal?.relationshipStatus === 'married'
  const [moreSheetVisible, setMoreSheetVisible] = useState(false)

  // Routes that should never appear in the tab bar
  const HIDDEN_ROUTES = new Set(['relationships'])
  const visibleRoutes = state.routes.filter((route) => !HIDDEN_ROUTES.has(route.name))

  return (
    <>
      <View
        className="bg-white border-t border-stone-100"
        style={{
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 4,
          ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: -2 }, shadowRadius: 8 } }),
          elevation: 8,
        }}
      >
        <View className="flex-row flex-1">
          {visibleRoutes.map((route) => {
            const focused = state.index === state.routes.indexOf(route)
            const routeName = route.name

            // Last tab: married → "More" (sheet), standard → "Settings" (navigate)
            const isLastTab = route === visibleRoutes[visibleRoutes.length - 1]
            const showAsMore = isLastTab && isMarried

            const label = showAsMore ? TAB_LABELS.MORE : (ROUTE_LABELS[routeName] ?? routeName)
            const iconKey = showAsMore ? 'more' : routeName
            const icon = TAB_ICONS[iconKey]?.default ?? '•'
            const activeColor = focused ? '#57534e' : '#a8a29e'   // stone-600 / stone-400

            function onPress() {
              if (showAsMore) {
                setMoreSheetVisible(true)
                return
              }
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params)
              }
            }

            return (
              <TouchableOpacity
                key={route.key}
                className="flex-1 items-center justify-center"
                onPress={onPress}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityState={{ selected: focused && !showAsMore }}
              >
                <Text style={{ fontSize: 20, color: activeColor }}>{icon}</Text>
                <Text
                  style={{ fontSize: 10, color: activeColor, marginTop: 2, fontWeight: focused && !showAsMore ? '600' : '400' }}
                  numberOfLines={1}
                >
                  {label}
                </Text>
                {/* Active indicator — sage green dot */}
                {focused && !showAsMore && (
                  <View className="w-1 h-1 rounded-full bg-stone-600 mt-1" />
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <MoreSheet
        visible={moreSheetVisible}
        onClose={() => setMoreSheetVisible(false)}
      />
    </>
  )
}
