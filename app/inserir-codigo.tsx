import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Aqui nós importamos o cérebro dessa tela!
import { useInserirCodigoController } from '../src/controllers/useInserirCodigoController';

export default function InserirCodigo() {
  const { emailDaRecuperacao } = useLocalSearchParams(); 
  const [codigo, setCodigo] = useState('');
  
  // Puxando a função de validar do controller
  const { handleValidarCodigo, loading, erro } = useInserirCodigoController();

  const onConfirmar = () => {
    // Agora sim, enviamos para o controller se comunicar com o Node.js!
    handleValidarCodigo(emailDaRecuperacao, codigo);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verifique seu e-mail</Text>
      <Text style={styles.subtitle}>
        Insira o código de 6 dígitos que enviamos para {emailDaRecuperacao}
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
        value={codigo}
        onChangeText={setCodigo}
        placeholder="000000"
        textAlign="center"
      />

      {/* Mostra mensagens de erro caso o código seja inválido */}
      {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={onConfirmar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Confirmar Código</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#82c140', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 24, letterSpacing: 8, marginBottom: 20, backgroundColor: '#f9f9f9' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 15, fontSize: 14 },
  button: { backgroundColor: '#82c140', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#a5d674' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});