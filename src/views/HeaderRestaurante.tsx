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

      {/* Direita: Nome do Restaurante, Notificações e Dropdown */}
      <View style={styles.actionsContainer}>

        {/* Sino de Notificações */}
        <TouchableOpacity style={styles.iconButton} onPress={() => alert('Sem novas notificações!')}>
          <Ionicons name="notifications-outline" size={24} color="#005F02" />
          <View style={styles.badge} />
        </TouchableOpacity>

        {/* Nome + Dropdown de Perfil/Logout */}
        <View style={{ position: 'relative', zIndex: 999 }}>
          <TouchableOpacity style={styles.userDropdown} onPress={() => ctrl.setMenuAberto(!ctrl.menuAberto)}>
            <Ionicons name="person-circle-outline" size={28} color="#005F02" />
            <Text style={styles.nomeRestauranteText} numberOfLines={1}>
              Olá, {ctrl.nomeRestaurante}
            </Text>
            <Ionicons name="chevron-down-outline" size={16} color="#333" />
          </TouchableOpacity>

          {ctrl.menuAberto && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity style={styles.dropdownItem} onPress={ctrl.handlePerfilClick}>
                <Ionicons name="person-outline" size={18} color="#005F02" />
                <Text style={[styles.dropdownText, { color: '#333' }]}>Perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={ctrl.handleLogout}>
                <Ionicons name="log-out-outline" size={18} color="#E53935" />
                <Text style={styles.dropdownText}>Sair</Text>
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
  },
  userDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
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