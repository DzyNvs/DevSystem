import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useHeaderConsumidorController } from '../controllers/useHeaderConsumidorController';

const logo = require('../../assets/images/logo.png');

export function HeaderConsumidor() {
  const ctrl = useHeaderConsumidorController();

  return (
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
        <TouchableOpacity style={styles.userInfo}>
          <Ionicons name="person-outline" size={20} color="#005F02" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.welcomeText}>Boas vindas!</Text>
            <Text style={styles.loginText} numberOfLines={1}>{ctrl.nomeUsuario}</Text>
          </View>
        </TouchableOpacity>
        
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
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 70, // Logo a 70px da borda esquerda
    height: 80,
    backgroundColor: '#F2E3BB', // Amarelo01
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  logoImg: { width: 110, height: 55 },
  navLinks: { flexDirection: 'row', marginLeft: 45, gap: 45 },
  navText: { fontFamily: 'Nunito', fontSize: 16, color: '#2A2D34', fontWeight: '500' },
  navTextActive: { color: '#005F02', fontWeight: 'bold' },
  rightSection: { flexDirection: 'row', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginRight: 45 },
  welcomeText: { fontFamily: 'Nunito', fontSize: 12, color: '#777' },
  loginText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: 'bold', color: '#333' },
  cartInfo: { flexDirection: 'row', alignItems: 'center' },
  cartValue: { fontFamily: 'Nunito', fontSize: 14, fontWeight: 'bold', color: '#333' },
  cartItems: { fontFamily: 'Nunito', fontSize: 12, color: '#777' },
});