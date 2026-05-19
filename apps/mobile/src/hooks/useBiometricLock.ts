import { useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'

export function useBiometricLock(enabled: boolean) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const appState = useRef(AppState.currentState)

  async function authenticate() {
    const hardware = await LocalAuthentication.hasHardwareAsync()
    const enrolled = await LocalAuthentication.isEnrolledAsync()

    if (!hardware || !enrolled) {
      setIsUnlocked(true)
      return
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock WellPath',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    })

    setIsUnlocked(result.success)
  }

  useEffect(() => {
    if (!enabled) {
      setIsUnlocked(true)
      return
    }

    authenticate()

    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/background|inactive/) && next === 'active') {
        authenticate()
      }
      appState.current = next
    })

    return () => sub.remove()
  }, [enabled])

  return { isUnlocked }
}
