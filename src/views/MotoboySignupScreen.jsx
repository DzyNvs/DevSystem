import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useMotoboySignupController } from '../controllers/useMotoboySignupController';
import { Ionicons } from '@expo/vector-icons';

export function MotoboySignupScreen() {
  const { cadastrarMotoboy, loading } = useMotoboySignupController();
  const [form, setForm] = useState({ nome: '', email: '', cpf: '', placa: '', senha: '' });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Seja um parceiro FitWay 🏍️</Text>
        <Text style={styles.subtitulo}>Preencha seus dados para começar a entregar saúde.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput style={styles.input} placeholder="Ex: João Silva" onChangeText={(t) => setForm({...form, nome: t})} />

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} placeholder="joao@email.com" keyboardType="email-address" onChangeText={(t) => setForm({...form, email: t})} />

        <Text style={styles.label}>CPF</Text>
        <TextInput style={styles.input} placeholder="000.000.000-00" keyboardType="numeric" onChangeText={(t) => setForm({...form, cpf: t})} />

        <Text style={styles.label}>Placa do Veículo (Moto/Carro)</Text>
        <TextInput style={styles.input} placeholder="ABC-1234" autoCapitalize="characters" onChangeText={(t) => setForm({...form, placa: t})} />

        <Text style={styles.label}>Crie uma Senha</Text>
        <TextInput style={styles.input} placeholder="******" secureTextEntry onChangeText={(t) => setForm({...form, senha: t})} />

        <TouchableOpacity 
          style={styles.btnCadastrar} 
          onPress={() => cadastrarMotoboy(form)}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnTexto}>FINALIZAR CADASTRO</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { padding: 30, backgroundColor: '#2E7D32' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  subtitulo: { fontSize: 14, color: '#E8F5E9', marginTop: 10 },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 5, marginTop: 15 },
  input: { borderBottomWidth: 1, borderBottomColor: '#CCC', paddingVertical: 8, fontSize: 16 },
  btnCadastrar: { backgroundColor: '#2E7D32', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 40 },
  btnTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});