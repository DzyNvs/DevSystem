import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRedefinirSenhaController } from '../src/controllers/useRedefinirSenhaController';

export default function RedefinirSenha() {
  const { emailDaRecuperacao } = useLocalSearchParams(); 
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const { handleAtualizarSenha, loading, erro } = useRedefinirSenhaController();

  const onSalvar = () => {
    handleAtualizarSenha(emailDaRecuperacao, novaSenha, confirmarSenha);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Nova Senha</Text>
      <Text style={styles.subtitle}>
        Digite sua nova senha para a conta {emailDaRecuperacao}
      </Text>

      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Nova senha"
        value={novaSenha}
        onChangeText={setNovaSenha}
      />

      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Confirme a nova senha"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={onSalvar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar Senha</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#82c140', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 15, backgroundColor: '#f9f9f9' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 15, fontSize: 14 },
  button: { backgroundColor: '#82c140', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#a5d674' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});