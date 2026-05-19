import { Redirect } from 'expo-router'

// Auth guard and deep-link redirect added in PR #M2.
// For scaffold: always send to login screen.
export default function Index() {
  return <Redirect href="/(auth)/login" />
}
