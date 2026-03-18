import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { usePedidosController } from '../controllers/usePedidosController';
import { HeaderRestaurante } from './HeaderRestaurante';

export function PedidosScreen() {
  const ctrl = usePedidosController();

  
  const formatarStatus = (status) => {
    switch (status) {
      case 'saiu_entrega': return { texto: 'Saiu para Entrega', cor: '#E65100', fundo: '#FFF3E0' };
      case 'entregue': return { texto: 'Concluído', cor: '#2E7D32', fundo: '#E8F5E9' };
      default: return { texto: 'Novo Pedido', cor: '#1565C0', fundo: '#E3F2FD' };
    }
  };

  const renderPedido = ({ item }) => {
    const statusFormatado = formatarStatus(item.status);

    return (
      <View style={styles.cardPedido}>
        <View style={styles.cardHeader}>
          <Text style={styles.idPedido}>Pedido #{item.id.substring(0, 6).toUpperCase()}</Text>
          <View style={[styles.badgeStatus, { backgroundColor: statusFormatado.fundo }]}>
            <Text style={[styles.textoStatus, { color: statusFormatado.cor }]}>{statusFormatado.texto}</Text>
          </View>
        </View>

        {/* Mostrando alguns dados do seu banco */}
        <Text style={styles.textoDetalhe}>Pagamento: <Text style={styles.textoBold}>{item.metodo_pagamento.toUpperCase()}</Text></Text>
        <Text style={styles.textoDetalhe}>Entregador Cód: <Text style={styles.textoBold}>{item.entregador_codigo}</Text></Text>
        
        <View style={styles.divisor} />

        <View style={styles.cardFooter}>
          <Text style={styles.textoDetalhe}>Subtotal: R$ {item.subtotal.toFixed(2)}</Text>
          <Text style={styles.textoTotal}>Total: R$ {item.total_final.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderRestaurante />

      <View style={styles.content}>
        <Text style={styles.titulo}>Gestão de Pedidos</Text>

        {ctrl.carregando ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={ctrl.pedidos}
            keyExtractor={(item) => item.id}
            renderItem={renderPedido}
            contentContainerStyle={styles.lista}
            ListEmptyComponent={
              <Text style={styles.textoVazio}>Nenhum pedido encontrado para esta loja.</Text>
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
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  lista: { paddingBottom: 40 },
  
  cardPedido: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  idPedido: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  badgeStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  textoStatus: { fontSize: 12, fontWeight: 'bold' },
  
  textoDetalhe: { fontSize: 14, color: '#555', marginBottom: 4 },
  textoBold: { fontWeight: 'bold', color: '#333' },
  
  divisor: { height: 1, backgroundColor: '#EEE', marginVertical: 12 },
  
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textoTotal: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
  textoVazio: { textAlign: 'center', marginTop: 50, color: '#777', fontSize: 16 }
});