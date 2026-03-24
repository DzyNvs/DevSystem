import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CarrinhoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Minha Sacola</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF9F2' },
  texto: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32' }
});