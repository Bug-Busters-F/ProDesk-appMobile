import { Stack } from 'expo-router';

export default function ClientStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="newTicket" />
      <Stack.Screen name="ticket/[id]" />
    </Stack>
  );
}