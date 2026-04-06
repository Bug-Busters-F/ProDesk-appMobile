import { Stack } from 'expo-router';

export default function AdminStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="registerCompany" />
      <Stack.Screen name="registerUser" />
      <Stack.Screen name="registerGroup" />
    </Stack>
  );
}