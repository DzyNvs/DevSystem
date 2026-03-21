import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderRestauranteController } from '../controllers/useHeaderRestauranteController';

// Puxando a logo igual você fez na tela de cadastro/login
const logo = require('../../assets/images/logo.png');

export function HeaderRestaurante() {
  const ctrl = useHeaderRestauranteController();

  return (
    <View style={styles.container}>
      
      {/* Esquerda: Logo FitWay */}
      <View style={styles.leftContainer}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Direita: Nome do Restaurante logado, Notificações e Perfil */}
      <View style={styles.actionsContainer}>
        
        <Text style={styles.nomeRestauranteText} numberOfLines={1}>
          Olá, {ctrl.nomeRestaurante}
        </Text>

        {/* Sino de Notificações com a "bolinha" vermelha de aviso */}
        <TouchableOpacity style={styles.iconButton} onPress={() => alert('Sem novas notificações!')}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <View style={styles.badge} />
        </TouchableOpacity>

        {/* Botão de Perfil */}
        <TouchableOpacity style={styles.iconButton} onPress={ctrl.handlePerfilClick}>
          <Ionicons name="person-circle-outline" size={28} color="#333" />
        </TouchableOpacity>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 40, 
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    zIndex: 10, 
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    height: 35,
    width: 110,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, 
  },
  nomeRestauranteText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32', // Cor verde para dar destaque ao nome
    marginRight: 8,
    maxWidth: 150, // Evita que nomes gigantes quebrem o layout
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E53935', 
    borderWidth: 2,
    borderColor: '#FFF',
  }
});