import { Stack } from 'expo-router';

export default function AgentStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ticket/[id]" />
    </Stack>
  );
}