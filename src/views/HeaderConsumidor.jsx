import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useHeaderConsumidorController } from '../controllers/useHeaderConsumidorController';
// ⚠️ Importando a gaveta nova (Ajuste o caminho se precisar)
import { CarrinhoDrawer } from './CarrinhoDrawer';

const logo = require('../../assets/images/logo.png');

export function HeaderConsumidor() {
  const ctrl = useHeaderConsumidorController();
  const router = useRouter();

  // Note o uso do fragmento <> no início do return para agrupar o Header e a Gaveta
  return (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.leftSection}>
          <Image source={logo} style={styles.logoImg} resizeMode="contain" />
          
          <View style={styles.navLinks}>
            <TouchableOpacity><Text style={[styles.navText, styles.navTextActive]}>Início</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.navText}>Restaurantes</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.navText}>Drops</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.navText}>Sobre nós</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.rightSection}>
          
          {/* Botão de endereço */}
          <TouchableOpacity 
            style={styles.addressInfo} 
            onPress={() => router.push('/escolher-endereco')}
          >
            <Ionicons name="location-outline" size={24} color="#93BD57" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.addressLabel}>Entregar em</Text>
              <Text style={styles.addressText} numberOfLines={1}>Escolher endereço</Text>
            </View>
          </TouchableOpacity>

          {/* Informações do Usuário com Dropdown */}
          <View style={{ position: 'relative', zIndex: 999 }}>
            <TouchableOpacity style={styles.userInfo} onPress={() => ctrl.setMenuAberto(!ctrl.menuAberto)}>
              <Ionicons name="person-outline" size={20} color="#005F02" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.welcomeText}>Boas vindas!</Text>
                <Text style={styles.loginText} numberOfLines={1}>{ctrl.nomeUsuario}</Text>
              </View>
              <Ionicons name="chevron-down-outline" size={16} color="#333" style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            {ctrl.menuAberto && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity style={styles.dropdownItem} onPress={ctrl.handleLogout}>
                  <Ionicons name="log-out-outline" size={18} color="#E53935" />
                  <Text style={styles.dropdownText}>Sair</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Carrinho */}
          <TouchableOpacity style={styles.cartInfo} onPress={ctrl.irParaCarrinho}>
            <Ionicons name="bag-handle-outline" size={24} color="#005F02" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.cartValue}>
                R$ {ctrl.valorTotal.toFixed(2).replace('.', ',')}
              </Text>
              <Text style={styles.cartItems}>
                {ctrl.totalItens} {ctrl.totalItens === 1 ? 'item' : 'itens'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* A Gaveta renderizada aqui. Ela é invisível até ser acionada */}
      <CarrinhoDrawer />
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 70,
    height: 80,
    backgroundColor: '#F2E3BB',
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  logoImg: { width: 110, height: 55 },
  navLinks: { flexDirection: 'row', marginLeft: 45, gap: 45 },
  navText: { fontFamily: 'Nunito', fontSize: 16, color: '#2A2D34', fontWeight: '500' },
  navTextActive: { color: '#005F02', fontWeight: 'bold' },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 25 }, 
  addressInfo: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderColor: '#EFEFEF' 
  },
  addressLabel: { fontFamily: 'Nunito', fontSize: 12, color: '#777' },
  addressText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: 'bold', color: '#93BD57', maxWidth: 140 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  welcomeText: { fontFamily: 'Nunito', fontSize: 12, color: '#777' },
  loginText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: 'bold', color: '#333', maxWidth: 120 },
  cartInfo: { flexDirection: 'row', alignItems: 'center' },
  cartValue: { fontFamily: 'Nunito', fontSize: 14, fontWeight: 'bold', color: '#333' },
  cartItems: { fontFamily: 'Nunito', fontSize: 12, color: '#777' },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
    minWidth: 140,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: '#E53935',
    marginLeft: 8,
    fontWeight: '600',
  },
});