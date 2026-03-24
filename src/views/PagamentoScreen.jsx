import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { usePagamentoController } from '../controllers/usePagamentoController';
import { HeaderConsumidor } from './HeaderConsumidor';

export function PagamentoScreen() {
  const ctrl = usePagamentoController();

  return (
    <View style={styles.mainContainer}>
      <HeaderConsumidor />

      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backText}>Voltar para sacola</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Finalizar Pedido</Text>

        <View style={styles.cardResumo}>
          <Text style={styles.cardTitulo}>Resumo de Valores</Text>
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Subtotal</Text>
            <Text style={styles.resumoValor}>R$ {ctrl.subtotal.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Taxa de Entrega</Text>
            <Text style={styles.resumoValor}>R$ {ctrl.taxaEntrega.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.divisor} />
          <View style={styles.resumoRow}>
            <Text style={styles.resumoTotalLabel}>Total a Pagar</Text>
            <Text style={styles.resumoTotalValor}>R$ {ctrl.totalFinal.toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>

        {ctrl.carregando ? (
          <ActivityIndicator size="large" color="#009EE3" style={{ marginTop: 40 }} />
        ) : (
          <TouchableOpacity style={styles.btnMercadoPago} onPress={ctrl.finalizarPedido}>
            <Ionicons name="card" size={24} color="#FFF" style={{ marginRight: 10 }} />
            <Text style={styles.btnMercadoPagoText}>Pagar com Mercado Pago</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FAF9F2' },
  content: { flex: 1, padding: 30, maxWidth: 600, width: '100%', alignSelf: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { fontSize: 16, color: '#333', marginLeft: 8 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32', marginBottom: 30 },
  
  cardResumo: { backgroundColor: '#FFF', padding: 24, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 40 },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 20 },
  resumoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  resumoLabel: { fontSize: 16, color: '#555' },
  resumoValor: { fontSize: 16, color: '#333' },
  divisor: { height: 1, backgroundColor: '#EEE', marginVertical: 16 },
  resumoTotalLabel: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  resumoTotalValor: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32' },

  btnMercadoPago: { flexDirection: 'row', backgroundColor: '#009EE3', height: 56, borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  btnMercadoPagoText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});