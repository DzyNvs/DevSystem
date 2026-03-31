import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useHeaderRestauranteController } from '../controllers/useHeaderRestauranteController';

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
          <Ionicons name="notifications-outline" size={24} color="#005F02" />
          <View style={styles.badge} />
        </TouchableOpacity>

        {/* Botão de Perfil */}
        <TouchableOpacity style={styles.iconButton} onPress={ctrl.handlePerfilClick}>
          <Ionicons name="person-circle-outline" size={28} color="#005F02" />
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
    paddingHorizontal: 70, 
    height: 80, 
    backgroundColor: '#F2E3BB', 
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)', 
    zIndex: 10, 
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 110,
    height: 55, 
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, 
  },
  nomeRestauranteText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333', 
    marginRight: 8,
    maxWidth: 150, 
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
    borderColor: '#F2E3BB', 
  }
});