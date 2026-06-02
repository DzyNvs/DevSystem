import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../src/config/firebase';
import { useMotoboyController } from '../../src/controllers/useMotoboyController';

export default function MotoboyDashboardScreen() {
  const router = useRouter();
  const { perfil, pedidosDisponiveis, estatisticas, carregando, aceitarPedido, atualizar } = useMotoboyController();

  const handleSair = () => {
    Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);
          router.replace('/');
        },
      },
    ]);
  };

  const handleAceitar = async (idPedido) => {
    const sucesso = await aceitarPedido(idPedido);
    if (sucesso) {
      // Manda o motoboy pra tela da corrida ativa com o ID do pedido
      router.push({ pathname: '/motoboy/pedido-ativo', params: { id: idPedido } });
    }
  };

  // Se estiver carregando, mostra o spinner no meio da tela
  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F7F7' }}>
        <ActivityIndicator size="large" color="#93BD57" />
        <Text style={{ marginTop: 10, color: '#666' }}>Carregando seus dados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.boasVindas}>Olá, {perfil?.nome || 'Entregador'}</Text>
          <Text style={styles.statusOnline}>● Online (ID: {perfil?.id_motoboy || 'N/A'})</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => atualizar()} style={styles.btnRefresh}>
            <Ionicons name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSair} style={styles.btnSair}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ESTATÍSTICAS REAIS (PUXADAS DO BANCO) */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Ganhos</Text>
          <Text style={styles.statValue}>R$ {estatisticas.totalGanhos.toFixed(2).replace('.', ',')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Entregas Hoje</Text>
          <Text style={styles.statValue}>{estatisticas.totalEntregas}</Text>
        </View>
      </View>

      {/* LISTA DE PEDIDOS DISPONÍVEIS */}
      <Text style={styles.sectionTitle}>Pedidos Prontos para Coleta</Text>
      
      <FlatList
        data={pedidosDisponiveis}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bicycle-outline" size={50} color="#CCC" />
            <Text style={styles.emptyText}>Buscando novos pedidos na sua região...</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardPedido}>
            <View style={styles.pedidoHeader}>
              <Text style={styles.restauranteNome}>Pedido #{item.id.substring(0, 6).toUpperCase()}</Text>
              <Text style={styles.valorFrete}>R$ {item.taxa_entrega?.toFixed(2).replace('.', ',') || '0,00'}</Text>
            </View>
            
            <Text style={styles.clienteInfo}>Valor da Carga: R$ {item.total_final?.toFixed(2).replace('.', ',') || '0,00'}</Text>
            <Text style={styles.enderecoText}>
              <Ionicons name="wallet-outline" size={14} /> Pagamento: {item.forma_pagamento?.toUpperCase() || 'NÃO INFORMADO'}
            </Text>
            
            <TouchableOpacity style={styles.btnAceitar} onPress={() => handleAceitar(item.id)}>
              <Text style={styles.btnAceitarText}>Aceitar e Coletar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F7F7' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#EAEAEA' 
  },
  boasVindas: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  statusOnline: { 
    fontSize: 14, 
    color: '#93BD57', 
    marginTop: 4, 
    fontWeight: '600' 
  },
  btnRefresh: {
    backgroundColor: '#93BD57',
    padding: 8,
    borderRadius: 50,
  },
  btnSair: {
    backgroundColor: '#E57373',
    padding: 8,
    borderRadius: 50,
  },
  statsContainer: { 
    flexDirection: 'row', 
    padding: 20, 
    justifyContent: 'space-between' 
  },
  statBox: { 
    backgroundColor: '#FFF', 
    flex: 1, 
    marginHorizontal: 5, 
    padding: 20, 
    borderRadius: 12, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2 
  },
  statLabel: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 5 
  },
  statValue: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#93BD57' 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    marginLeft: 20, 
    marginBottom: 10, 
    marginTop: 10 
  },
  cardPedido: { 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 15, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  pedidoHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 10 
  },
  restauranteNome: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  valorFrete: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#93BD57' 
  },
  clienteInfo: { 
    fontSize: 14, 
    color: '#555', 
    marginBottom: 5 
  },
  enderecoText: { 
    fontSize: 14, 
    color: '#777', 
    marginBottom: 15 
  },
  btnAceitar: { 
    backgroundColor: '#93BD57', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  btnAceitarText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#999', 
    marginTop: 10,
    fontSize: 16
  }
});