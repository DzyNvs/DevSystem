import { Stack } from 'expo-router';

export default function Layout() {
  return (
    // O Stack cria uma pilha de telas limpa. O headerShown: false tira o cabeçalho superior.
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}