import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCarrinhoController } from '../controllers/useCarrinhoController';

export function CarrinhoScreen() {
  const ctrl = useCarrinhoController();

  return (
    <View style={styles.mainContainer}>
      {/* Header simples para tela de carrinho */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minha Sacola</Text>
        <TouchableOpacity onPress={ctrl.limparCarrinho}>
          <Text style={styles.limparText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {ctrl.itens.length === 0 ? (
        <View style={styles.vazioContainer}>
          <Ionicons name="bag-remove-outline" size={80} color="#CCC" />
          <Text style={styles.textoVazio}>Sua sacola está vazia</Text>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => router.replace('/home-consumidor-screen')}>
            <Text style={styles.btnVoltarText}>Ver restaurantes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
            
            <View style={styles.restauranteHeader}>
              <Text style={styles.restauranteNome}>
                {ctrl.carregando ? 'Carregando loja...' : ctrl.restaurante?.nome}
              </Text>
            </View>

            {/* Lista de Itens no Carrinho */}
            <View style={styles.listaItens}>
              {ctrl.itens.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  {item.foto ? (
                    <Image source={{ uri: item.foto }} style={styles.itemFoto} />
                  ) : (
                    <View style={styles.itemFotoPlaceholder} />
                  )}
                  
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemNome} numberOfLines={1}>{item.nome}</Text>
                    <Text style={styles.itemPreco}>R$ {(item.preco * item.qtd).toFixed(2).replace('.', ',')}</Text>
                  </View>
                  
                  {/* Controles de Quantidade */}
                  <View style={styles.qtdContainer}>
                    <TouchableOpacity style={styles.qtdBtn} onPress={() => ctrl.removerItem(item.id)}>
                      <Ionicons name={item.qtd === 1 ? "trash-outline" : "remove"} size={18} color="#E53935" />
                    </TouchableOpacity>
                    <Text style={styles.qtdText}>{item.qtd}</Text>
                    <TouchableOpacity style={styles.qtdBtn} onPress={() => ctrl.adicionarItem(item, ctrl.restaurante?.id)}>
                      <Ionicons name="add" size={18} color="#2E7D32" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Resumo Financeiro */}
            <View style={styles.resumoContainer}>
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>Subtotal</Text>
                <Text style={styles.resumoValor}>R$ {ctrl.subtotal.toFixed(2).replace('.', ',')}</Text>
              </View>
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>Taxa de entrega</Text>
                {ctrl.carregando ? (
                  <ActivityIndicator size="small" color="#93BD57" />
                ) : (
                  <Text style={styles.resumoValor}>R$ {ctrl.taxaEntrega.toFixed(2).replace('.', ',')}</Text>
                )}
              </View>
              <View style={styles.divisor} />
              <View style={styles.resumoRow}>
                <Text style={styles.resumoTotalLabel}>Total</Text>
                <Text style={styles.resumoTotalValor}>R$ {ctrl.totalFinal.toFixed(2).replace('.', ',')}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Botão Fixo de Continuar */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnContinuar} onPress={ctrl.irParaPagamento}>
              <Text style={styles.btnContinuarText}>Escolher forma de pagamento</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FAF9F2' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EEE' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  limparText: { fontSize: 14, color: '#E53935', fontWeight: 'bold' },
  
  vazioContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  textoVazio: { fontSize: 18, color: '#777', marginTop: 16, marginBottom: 24, fontWeight: 'bold' },
  btnVoltar: { backgroundColor: '#93BD57', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  btnVoltarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  scrollContainer: { flex: 1 },
  content: { padding: 20, maxWidth: 800, alignSelf: 'center', width: '100%' },
  
  restauranteHeader: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#EEE' },
  restauranteNome: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32' },
  
  listaItens: { marginBottom: 24 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  itemFoto: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  itemFotoPlaceholder: { width: 60, height: 60, borderRadius: 8, marginRight: 12, backgroundColor: '#EFEFEF', borderWidth: 1, borderColor: '#CCC', borderStyle: 'dashed' },
  itemInfo: { flex: 1 },
  itemNome: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  itemPreco: { fontSize: 14, color: '#666' },
  
  qtdContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 4 },
  qtdBtn: { padding: 8 },
  qtdText: { fontSize: 16, fontWeight: 'bold', width: 24, textAlign: 'center' },

  resumoContainer: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  resumoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  resumoLabel: { fontSize: 16, color: '#555' },
  resumoValor: { fontSize: 16, color: '#333' },
  divisor: { height: 1, backgroundColor: '#EEE', marginVertical: 12 },
  resumoTotalLabel: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  resumoTotalValor: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32' },

  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
  btnContinuar: { backgroundColor: '#4CAF50', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: 800, alignSelf: 'center' },
  btnContinuarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});