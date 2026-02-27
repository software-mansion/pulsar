import { Stack } from 'expo-router';

export default function DemosLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="typing-feedback" options={{ headerShown: true, title: 'Typing feedback' }} />
      <Stack.Screen name="navigation-tick" options={{ headerShown: true, title: 'Navigation tick' }} />
      <Stack.Screen name="payment-success" options={{ headerShown: true, title: 'Payment success' }} />
      <Stack.Screen name="camera-shutter" options={{ headerShown: true, title: 'Camera shutter' }} />
      <Stack.Screen name="workout-interval" options={{ headerShown: true, title: 'Workout interval' }} />
    </Stack>
  );
}
