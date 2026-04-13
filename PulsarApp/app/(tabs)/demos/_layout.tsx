import { Stack } from 'expo-router';

export default function DemosLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Demos' }} />
      <Stack.Screen name="slider-demo" options={{ headerShown: true, title: 'Slider Demo' }} />
      <Stack.Screen name="buttons-demo" options={{ headerShown: true, title: 'Buttons Demo' }} />
      <Stack.Screen name="countdown-timer-demo" options={{ headerShown: true, title: 'Countdown Timer' }} />
      <Stack.Screen name="balloon-demo" options={{ headerShown: true, title: 'Balloon Demo' }} />
      <Stack.Screen name="dot-loader-demo" options={{ headerShown: true, title: 'Dot Loader' }} />
      <Stack.Screen name="notification-haptics-demo" options={{ headerShown: true, title: 'Notification Haptics' }} />
      <Stack.Screen name="sensor-haptics-demo" options={{ headerShown: true, title: 'Accelerometer Haptics' }} />
    </Stack>
  );
}
