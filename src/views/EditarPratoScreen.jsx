import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useEditarPratoController } from '../controllers/useEditarPratoController';
import { HeaderRestaurante } from './HeaderRestaurante';

export function EditarPratoScreen() {
  const ctrl = useEditarPratoController();

  return (
    <View style={styles.mainContainer}>
      <HeaderRestaurante />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.titulo}>Editar Prato</Text>
        <Text style={styles.subtitulo}>Atualize as informações do seu cardápio</Text>

        {ctrl.carregando ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />
        ) : (
          <>
            <View style={styles.form}>
              <Text style={styles.label}>Nome do Prato *</Text>
              <TextInput style={styles.input} value={ctrl.nome} onChangeText={ctrl.setNome} />

              <Text style={styles.label}>Descrição</Text>
              <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={ctrl.descricao} onChangeText={ctrl.setDescricao} multiline />

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Preço (R$) *</Text>
                  <TextInput style={styles.input} value={ctrl.preco} onChangeText={ctrl.setPreco} keyboardType="numeric" />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Calorias</Text>
                  <TextInput style={styles.input} value={ctrl.calorias} onChangeText={ctrl.setCalorias} keyboardType="numeric" />
                </View>
              </View>

              <Text style={styles.label}>Categoria</Text>
              <TextInput style={styles.input} value={ctrl.categoria} onChangeText={ctrl.setCategoria} />
            </View>

            <TouchableOpacity 
              style={[styles.btnSalvar, ctrl.salvando && { backgroundColor: '#A5D6A7' }]} 
              onPress={ctrl.atualizarPrato}
              disabled={ctrl.salvando}
            >
              {ctrl.salvando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnSalvarText}>Atualizar Prato</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F9FBE7' },
  container: { flex: 1 },
  content: { padding: 24 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#1B4332' },
  subtitulo: { fontSize: 16, color: '#555', marginBottom: 20 },
  form: { width: '100%', marginBottom: 30 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16 },
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  btnSalvar: { backgroundColor: '#1565C0', padding: 16, borderRadius: 8, alignItems: 'center' },
  btnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 }
});