import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCardapioController } from '../controllers/useCardapioController';
import { HeaderRestaurante } from './HeaderRestaurante';

export function CardapioScreen() {
  const ctrl = useCardapioController();

  const renderPrato = ({ item }) => (
    <View style={styles.cardPrato}>
      <View style={styles.infoPrato}>
        <Text style={styles.nomePrato}>{item.nome}</Text>
        <Text style={styles.categoriaPrato}>{item.categoria}</Text>
        <Text style={styles.precoPrato}>R$ {item.preco.toFixed(2).replace('.', ',')}</Text>
      </View>

      <View style={styles.acoesPrato}>
        <TouchableOpacity style={styles.btnAcao} onPress={() => ctrl.editarProduto(item.id)}>
          <Ionicons name="pencil" size={20} color="#1565C0" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.btnAcao} onPress={() => ctrl.deletarProduto(item.id)}>
          <Ionicons name="trash" size={20} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <HeaderRestaurante />

      <View style={styles.content}>
        <View style={styles.headerTitle}>
          <Text style={styles.titulo}>Meu Cardápio</Text>
          <TouchableOpacity style={styles.btnNovo} onPress={ctrl.irParaNovoPrato}>
            <Text style={styles.btnNovoText}>+ Novo Prato</Text>
          </TouchableOpacity>
        </View>

        {ctrl.carregando ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={ctrl.produtos}
            keyExtractor={(item) => item.id}
            renderItem={renderPrato}
            contentContainerStyle={styles.lista}
            ListEmptyComponent={
              <Text style={styles.textoVazio}>Você ainda não cadastrou nenhum prato.</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { flex: 1, padding: 20 },
  headerTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  btnNovo: { backgroundColor: '#4CAF50', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  btnNovoText: { color: '#FFF', fontWeight: 'bold' },
  lista: { paddingBottom: 40 },
  
  cardPrato: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoPrato: { flex: 1 },
  nomePrato: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  categoriaPrato: { fontSize: 12, color: '#777', marginBottom: 4 },
  precoPrato: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32' },
  
  acoesPrato: { flexDirection: 'row', gap: 12 },
  btnAcao: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 8 },
  textoVazio: { textAlign: 'center', marginTop: 50, color: '#777', fontSize: 16 }
});