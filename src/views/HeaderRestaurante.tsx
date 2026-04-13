import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useHeaderRestauranteController } from '../controllers/useHeaderRestauranteController';

const logo = require('../../assets/images/logo.png');

export function HeaderRestaurante() {
  const ctrl = useHeaderRestauranteController();

  return (
    <View style={styles.container}>
      
      {/* 👉 NOSSO ALERTA TOAST FLUTUANTE GLOBAL */}
      {ctrl.mostrarAlertaPedido && (
        <View style={styles.toastContainer}>
          <View style={styles.toastContent}>
            <Ionicons name="notifications-circle" size={32} color="#FFF" />
            <View style={styles.toastTextContainer}>
              <Text style={styles.toastTitle}>Novo Pedido Chegou!</Text>
              <Text style={styles.toastDesc}>Clique para visualizar e aceitar.</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.toastButton} onPress={ctrl.irParaPedidos}>
            <Text style={styles.toastButtonText}>Ver Pedido</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={ctrl.fecharAlerta} style={{marginLeft: 10, padding: 4}}>
            <Ionicons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Esquerda: Logo FitWay */}
      <View style={styles.leftContainer}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Direita: Nome do Restaurante, Notificações e Dropdown */}
      <View style={styles.actionsContainer}>

        {/* Sino de Notificações + Dropdown */}
        <View style={{ position: 'relative', zIndex: 999 }}>
          <TouchableOpacity style={styles.iconButton} onPress={ctrl.toggleNotificacoes}>
            <Ionicons name="notifications-outline" size={26} color="#005F02" />
            
            {/* 👉 A bolinha com o número de pedidos */}
            {ctrl.pedidosPendentes > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{ctrl.pedidosPendentes}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 👉 MENU DROPDOWN DE NOTIFICAÇÕES */}
          {ctrl.notificacoesAbertas && (
            <View style={styles.dropdownMenuNotificacoes}>
              <Text style={styles.dropdownTitulo}>Suas Notificações</Text>
              <View style={styles.dropdownDivisor} />
              
              {ctrl.pedidosPendentes > 0 ? (
                <TouchableOpacity style={styles.notificacaoItem} onPress={ctrl.irParaPedidos}>
                  <View style={styles.notificacaoIconeFundo}>
                    <Ionicons name="receipt-outline" size={20} color="#E65100" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.notificacaoTextoPrincipal}>Pedidos Pendentes</Text>
                    <Text style={styles.notificacaoTextoSecundario}>Você tem {ctrl.pedidosPendentes} pedido(s) aguardando aceite.</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
                </TouchableOpacity>
              ) : (
                <View style={styles.notificacaoItemVazio}>
                  <Text style={styles.notificacaoVaziaTexto}>Tudo limpo por aqui.</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Nome + Dropdown de Perfil/Logout */}
        <View style={{ position: 'relative', zIndex: 998 }}>
          <TouchableOpacity style={styles.userDropdown} onPress={ctrl.toggleMenuPerfil}>
            <Ionicons name="person-circle-outline" size={30} color="#005F02" />
            <Text style={styles.nomeRestauranteText} numberOfLines={1}>
              Olá, {ctrl.nomeRestaurante}
            </Text>
            <Ionicons name="chevron-down-outline" size={16} color="#333" />
          </TouchableOpacity>

          {ctrl.menuAberto && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity style={styles.dropdownItem} onPress={ctrl.handlePerfilClick}>
                <Ionicons name="person-outline" size={18} color="#005F02" />
                <Text style={[styles.dropdownText, { color: '#333' }]}>Perfil da Loja</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={ctrl.handleLogout}>
                <Ionicons name="log-out-outline" size={18} color="#E53935" />
                <Text style={styles.dropdownText}>Sair do sistema</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 70, 
    height: 80, 
    backgroundColor: '#F2E3BB', 
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)', 
    zIndex: 10, 
  },
  leftContainer: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 110, height: 55 },
  actionsContainer: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  
  nomeRestauranteText: { fontFamily: 'Nunito', fontSize: 15, fontWeight: 'bold', color: '#333', maxWidth: 150 },
  
  iconButton: { position: 'relative', padding: 4 },
  
  badge: {
    position: 'absolute', top: 0, right: 0, backgroundColor: '#E53935', minWidth: 18, height: 18,
    borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#F2E3BB', paddingHorizontal: 2
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  
  userDropdown: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  
  // 👉 Estilos do Dropdown de Perfil
  dropdownMenu: {
    position: 'absolute', top: '120%', right: 0, backgroundColor: '#FFF', borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 5, zIndex: 999, minWidth: 160,
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  dropdownText: { fontFamily: 'Nunito', fontSize: 14, color: '#E53935', marginLeft: 10, fontWeight: '600' },

  // 👉 Estilos do Dropdown de Notificações
  dropdownMenuNotificacoes: {
    position: 'absolute', top: '120%', right: -60, backgroundColor: '#FFF', borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 5, zIndex: 999, width: 280,
  },
  dropdownTitulo: { fontSize: 14, fontWeight: 'bold', color: '#333', paddingHorizontal: 15, marginBottom: 5 },
  dropdownDivisor: { height: 1, backgroundColor: '#EEE', width: '100%', marginBottom: 5 },
  notificacaoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, backgroundColor: '#FFF9F5' },
  notificacaoIconeFundo: { backgroundColor: '#FFE0B2', padding: 8, borderRadius: 20 },
  notificacaoTextoPrincipal: { fontSize: 14, fontWeight: 'bold', color: '#E65100' },
  notificacaoTextoSecundario: { fontSize: 12, color: '#777', marginTop: 2 },
  notificacaoItemVazio: { paddingVertical: 20, alignItems: 'center' },
  notificacaoVaziaTexto: { fontSize: 13, color: '#999' },

  // 👉 Estilos do Toast Flutuante Global
  toastContainer: {
    position: 'absolute', top: 90, right: 70, backgroundColor: '#E65100', borderRadius: 8,
    padding: 16, flexDirection: 'row', alignItems: 'center', zIndex: 9999, elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, minWidth: 320,
  },
  toastContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  toastTextContainer: { marginLeft: 10 },
  toastTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  toastDesc: { color: '#FFF', fontSize: 13, marginTop: 2 },
  toastButton: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginLeft: 10 },
  toastButtonText: { color: '#E65100', fontWeight: 'bold', fontSize: 14 },
});