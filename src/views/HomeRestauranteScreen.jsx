import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useHomeRestauranteController } from '../controllers/useHomeRestauranteController';
import { HeaderRestaurante } from './HeaderRestaurante';

export function HomeRestauranteScreen() {
  const ctrl = useHomeRestauranteController();
  const [lojaAberta, setLojaAberta] = useState(true);

  return (
    <View style={styles.mainContainer}>
      <HeaderRestaurante />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        
        <View style={styles.statusContainer}>
          <View>
            <Text style={styles.statusTitulo}>Status da Loja</Text>
            <Text style={[styles.statusTexto, { color: lojaAberta ? '#2e7d32' : '#D32F2F' }]}>
              {lojaAberta ? '🟢 Aberta para pedidos' : '🔴 Fechada no momento'}
            </Text>
          </View>
          <Switch 
            value={lojaAberta} 
            onValueChange={setLojaAberta} 
            trackColor={{ false: '#FFCDCD', true: '#A5D6A7' }}
            thumbColor={lojaAberta ? '#4CAF50' : '#D32F2F'}
          />
        </View>

        <Text style={styles.sectionTitle}>Resumo de hoje</Text>
        <View style={styles.metricasRow}>
          
          <View style={styles.metricaCard}>
            <MaterialCommunityIcons name="ticket-confirmation-outline" size={24} color="#555" />
            <Text style={styles.metricaValor}>
              {ctrl.carregandoResumo ? '...' : ctrl.resumo?.totalPedidos || 0}
            </Text>
            <Text style={styles.metricaLabel}>Pedidos</Text>
          </View>
          
          <View style={styles.metricaCard}>
            <MaterialCommunityIcons name="currency-brl" size={24} color="#555" />
            <Text style={styles.metricaValor}>
              {ctrl.carregandoResumo ? '...' : (ctrl.resumo?.totalVendas || 0).toFixed(2).replace('.', ',')}
            </Text>
            <Text style={styles.metricaLabel}>Vendas</Text>
          </View>

          <View style={styles.metricaCard}>
            <Ionicons name="star-outline" size={24} color="#F5A623" />
            <Text style={styles.metricaValor}>-</Text>
            <Text style={styles.metricaLabel}>Avaliação</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Gestão da Loja</Text>
        <View style={styles.gridContainer}>
          
          <TouchableOpacity style={styles.gridCard} onPress={ctrl.irParaPedidos}>
            <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="receipt-outline" size={28} color="#2e7d32" />
            </View>
            <Text style={styles.gridTitle}>Pedidos</Text>
            <Text style={styles.gridDesc}>Acompanhe o fluxo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={ctrl.irParaCardapio}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
              <MaterialCommunityIcons name="format-list-bulleted" size={28} color="#E65100" />
            </View>
            <Text style={styles.gridTitle}>Meu Cardápio</Text>
            <Text style={styles.gridDesc}>Ver e editar pratos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={ctrl.irParaNovoPrato}>
            <View style={[styles.iconBox, { backgroundColor: '#F3E5F5' }]}>
              <MaterialCommunityIcons name="food-apple-outline" size={28} color="#8E24AA" />
            </View>
            <Text style={styles.gridTitle}>Novo Prato</Text>
            <Text style={styles.gridDesc}>Adicionar ao menu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={ctrl.irParaCadastroRestaurante}>
            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="storefront-outline" size={28} color="#1565C0" />
            </View>
            <Text style={styles.gridTitle}>Perfil da Loja</Text>
            <Text style={styles.gridDesc}>Horários e endereço</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={ctrl.handleLogoff}>
            <View style={[styles.iconBox, { backgroundColor: '#FFEFEF' }]}>
              <Ionicons name="log-out-outline" size={28} color="#D32F2F" />
            </View>
            <Text style={styles.gridTitle}>Sair</Text>
            <Text style={styles.gridDesc}>Encerrar sessão</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flex: 1,
  },
  content: { 
    padding: 20,
    paddingBottom: 40,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusTitulo: { fontSize: 14, color: '#666', marginBottom: 4 },
  statusTexto: { fontSize: 16, fontWeight: 'bold' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginLeft: 4,
  },
  metricasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 10,
  },
  metricaCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  metricaValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  metricaLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    marginBottom: 10,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  gridDesc: {
    fontSize: 12,
    color: '#777',
  }
});