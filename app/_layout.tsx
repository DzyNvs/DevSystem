import { Stack } from 'expo-router';

export default function Layout() {
  // O Stack vazio permite que o Expo encontre o app/(tabs)/index.tsx automaticamente
  return <Stack screenOptions={{ headerShown: false }} />;
}