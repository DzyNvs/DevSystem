import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Desliga o cabeçalho padrão para o nosso layout do Figma brilhar
        tabBarStyle: { display: 'none' }, // Esconde a barra de botões lá de baixo
      }}>
      
      {/* O 'href: null' garante que, mesmo sendo uma Tab, não crie botão pra ela */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="cadastro" options={{ href: null }} />
      <Tabs.Screen name="home-consumidor" options={{ href: null }} />
      <Tabs.Screen name="home-restaurante" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      
    </Tabs>
  );
}