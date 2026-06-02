
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useHomeRestauranteController } from '../controllers/useHomeRestauranteController';
import { HeaderRestaurante } from './HeaderRestaurante';

export function HomeRestauranteScreen() {
  const ctrl = useHomeRestauranteController();

  return (
    <View style={styles.mainContainer}>
      <HeaderRestaurante />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        
        <View style={styles.statusContainer}>
          <View>
            <Text style={styles.statusTitulo}>Status da Loja</Text>
            <Text style={[styles.statusTexto, { color: ctrl.lojaAberta ? '#2e7d32' : '#D32F2F' }]}>
              {ctrl.lojaAberta ? '🟢 Aberta para pedidos' : '🔴 Fechada no momento'}
            </Text>
          </View>
          <Switch
            value={ctrl.lojaAberta}
            onValueChange={ctrl.toggleLojaAberta}
            trackColor={{ false: '#FFCDCD', true: '#A5D6A7' }}
            thumbColor={ctrl.lojaAberta ? '#4CAF50' : '#D32F2F'}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Resumo da Loja {ctrl.nomeRestaurante ? `- ${ctrl.nomeRestaurante}` : ''}
        </Text>
        
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
            <Ionicons
              name={ctrl.mediaAvaliacao ? "star" : "star-outline"}
              size={24}
              color="#F5A623"
            />
            <Text style={styles.metricaValor}>
              {ctrl.carregandoResumo
                ? '...'
                : ctrl.mediaAvaliacao
                  ? ctrl.mediaAvaliacao.toFixed(1)
                  : '-'}
            </Text>
            <Text style={styles.metricaLabel}>
              {ctrl.totalAvaliacoes > 0
                ? `${ctrl.totalAvaliacoes} avaliação${ctrl.totalAvaliacoes > 1 ? 'ões' : ''}`
                : 'Avaliação'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Gestão da Loja</Text>
        <View style={styles.gridContainer}>
          
          <TouchableOpacity style={styles.gridCard} onPress={ctrl.irParaPedidos}>
            {/* 👉 BOTÃO COM A BOLINHA VERMELHA DE VOLTA */}
            <View style={[styles.iconBox, { backgroundColor: '#E8F5E9', position: 'relative' }]}>
              <Ionicons name="receipt-outline" size={28} color="#2e7d32" />
              
              {ctrl.pedidosPendentes > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{ctrl.pedidosPendentes}</Text>
                </View>
              )}
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
  mainContainer: { flex: 1, backgroundColor: '#F7F6F2' },
  scrollContainer: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  
  statusContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#EAEAEA' },
  statusTitulo: { fontSize: 14, color: '#666', marginBottom: 4 },
  statusTexto: { fontSize: 16, fontWeight: 'bold' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12, marginLeft: 4 },
  metricasRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, gap: 10 },
  metricaCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA' },
  metricaValor: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 8 },
  metricaLabel: { fontSize: 12, color: '#777', marginTop: 2 },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  gridCard: { width: '48%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, alignItems: 'flex-start', marginBottom: 10, borderWidth: 1, borderColor: '#EAEAEA' },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  gridTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  gridDesc: { fontSize: 12, color: '#777' },

  // 👉 Estilos da bolinha vermelha
  badge: { 
    position: 'absolute', 
    top: -4, 
    right: -4, 
    backgroundColor: '#E53935', 
    minWidth: 20, 
    height: 20, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 2, 
    borderColor: '#FFF', 
    paddingHorizontal: 4 
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' }
});

