import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useCadastroPratoController } from '../controllers/useCadastroPratoController';
import { HeaderRestaurante } from './HeaderRestaurante';

export function CadastroPratoScreen() {
  const ctrl = useCadastroPratoController();

  return (
    <View style={styles.mainContainer}>
      <HeaderRestaurante />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.titulo}>Novo Prato</Text>
        <Text style={styles.subtitulo}>Cadastre um item no seu cardápio</Text>

        {/* Botão de Foto adicionado de volta! */}
        <TouchableOpacity style={styles.imagemContainer} onPress={ctrl.escolherImagem}>
          {ctrl.imagemUri ? (
            <Image source={{ uri: ctrl.imagemUri }} style={styles.imagemPreview} />
          ) : (
            <View style={styles.imagemPlaceholder}>
              <Text style={styles.imagemTexto}>+ Adicionar Foto do Prato</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.label}>Nome do Prato *</Text>
          <TextInput style={styles.input} value={ctrl.nome} onChangeText={ctrl.setNome} placeholder="Ex: Strogonoff de Frango" />

          <Text style={styles.label}>Descrição</Text>
          <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={ctrl.descricao} onChangeText={ctrl.setDescricao} placeholder="Ingredientes e detalhes..." multiline />

          {/* Preço e Calorias lado a lado */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Preço (R$) *</Text>
              <TextInput style={styles.input} value={ctrl.preco} onChangeText={ctrl.setPreco} placeholder="25,90" keyboardType="numeric" />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Calorias</Text>
              <TextInput style={styles.input} value={ctrl.calorias} onChangeText={ctrl.setCalorias} placeholder="Ex: 350" keyboardType="numeric" />
            </View>
          </View>

          <Text style={styles.label}>Categoria</Text>
          <TextInput style={styles.input} value={ctrl.categoria} onChangeText={ctrl.setCategoria} placeholder="Ex: Prato Principal" />
        </View>

        {/* Botão com Loading */}
        <TouchableOpacity 
          style={[styles.btnSalvar, ctrl.salvando && { backgroundColor: '#A5D6A7' }]} 
          onPress={ctrl.salvarPrato}
          disabled={ctrl.salvando}
        >
          {ctrl.salvando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnSalvarText}>Salvar Prato</Text>
          )}
        </TouchableOpacity>
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
  
  imagemContainer: { width: '100%', height: 200, backgroundColor: '#E0DBC8', borderRadius: 12, overflow: 'hidden', marginBottom: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CCC', borderStyle: 'dashed' },
  imagemPreview: { width: '100%', height: '100%' },
  imagemPlaceholder: { alignItems: 'center' },
  imagemTexto: { color: '#2e7d32', fontWeight: 'bold', fontSize: 16 },

  form: { width: '100%', marginBottom: 30 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16 },
  
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },

  btnSalvar: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 8, alignItems: 'center' },
  btnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 }
});