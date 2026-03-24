import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderConsumidorController } from '../controllers/useHeaderConsumidorController';

// Puxando a logo oficial do projeto
const logo = require('../../assets/images/logo.png');

export function HeaderConsumidor() {
  const ctrl = useHeaderConsumidorController();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        {/* Usando a logo real */}
        <Image source={logo} style={styles.logoImg} resizeMode="contain" />
        
        <View style={styles.navLinks}>
          <TouchableOpacity><Text style={[styles.navText, styles.navTextActive]}>Início</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navText}>Restaurantes</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navText}>Drops</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navText}>Sobre nós</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.rightSection}>
        {/* Transformei em TouchableOpacity para no futuro você poder clicar e ir pro perfil */}
        <TouchableOpacity style={styles.userInfo}>
          <Ionicons name="person-outline" size={20} color="#333" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.welcomeText}>Boas vindas!</Text>
            {/* O nome do usuário entra aqui */}
            <Text style={styles.loginText} numberOfLines={1}>{ctrl.nomeUsuario}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cartInfo} onPress={ctrl.irParaCarrinho}>
          <Ionicons name="bag-handle-outline" size={24} color="#333" />
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
    paddingHorizontal: 40,
    paddingVertical: 15,
    backgroundColor: '#FAF9F2',
    borderBottomWidth: 1,
    borderColor: '#EFEFEF',
  },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  logoImg: { height: 35, width: 100, marginRight: 40 },
  navLinks: { flexDirection: 'row', gap: 24 },
  navText: { fontSize: 14, color: '#555' },
  navTextActive: { color: '#2E7D32', fontWeight: 'bold' },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  welcomeText: { fontSize: 12, color: '#777' },
  loginText: { fontSize: 14, fontWeight: 'bold', color: '#333', maxWidth: 120 },
  cartInfo: { flexDirection: 'row', alignItems: 'center' },
  cartValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  cartItems: { fontSize: 12, color: '#777' },
});