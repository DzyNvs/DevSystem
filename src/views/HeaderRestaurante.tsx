import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useHeaderRestauranteController } from '../controllers/useHeaderRestauranteController';

export function HeaderRestaurante() {
  const ctrl = useHeaderRestauranteController();

  return (
    <View style={styles.container}>
      
      {/* Esquerda: Seletor de Loja (Estilo iFood) */}
      <TouchableOpacity style={styles.lojaSelector} onPress={ctrl.handleEscolherServico}>
        
        {/* Ícone quadrado com a inicial da loja */}
        <View style={styles.logoIcon}>
          <Text style={styles.logoLetter}>
            {ctrl.servicoAtivo?.nome ? ctrl.servicoAtivo.nome.charAt(0) : 'F'}
          </Text>
        </View>

        <View style={styles.lojaTextContainer}>
          <Text style={styles.lojaAtivaText} numberOfLines={1}>
            {ctrl.servicoAtivo?.nome || 'Minha Loja'}
          </Text>
          <View style={styles.lojaSubTextContainer}>
            <Text style={styles.lojaSubText}>FitWay Parceiros</Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color="#777" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Direita: Notificações e Perfil */}
      <View style={styles.actionsContainer}>
        
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
    backgroundColor: '#FFFFFF', // Fundo branco super clean
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 40, // Dá espaço para a barra de status no celular
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 3, // Sombra suave para o Android
    shadowColor: '#000', // Sombra para o iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    zIndex: 10, // Garante que a sombra fique por cima do resto da tela
  },
  lojaSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Ocupa o espaço disponível para empurrar os ícones para a direita
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8, // Quadrado com cantos arredondados (clássico do iFood)
    backgroundColor: '#E8F5E9', // Fundo verdinho claro
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoLetter: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  lojaTextContainer: {
    justifyContent: 'center',
    flex: 1,
    paddingRight: 10,
  },
  lojaAtivaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  lojaSubTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lojaSubText: {
    fontSize: 12,
    color: '#777',
    marginRight: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // Espaçamento entre o sino e o perfil
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
    backgroundColor: '#E53935', // Vermelho alerta
    borderWidth: 2,
    borderColor: '#FFF',
  }
});