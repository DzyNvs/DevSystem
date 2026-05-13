import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router'; // IMPORTADO usePathname
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useHeaderConsumidorController } from '../controllers/useHeaderConsumidorController';
import { CarrinhoDrawer } from './CarrinhoDrawer';

const logo = require('../../assets/images/logo.png');

export function HeaderConsumidor() {
  const ctrl = useHeaderConsumidorController();
  const router = useRouter();
  const pathname = usePathname(); // PEGA A ROTA ATUAL

  return (
    <>
      {/* 👉 TOAST FLUTUANTE DE ATUALIZAÇÃO DE PEDIDO */}
      {ctrl.alerta.mostrar && (
        <View style={styles.toastContainer}>
          <View style={styles.toastContent}>
            <Ionicons name="restaurant" size={28} color="#FFF" />
            <View style={styles.toastTextContainer}>
              <Text style={styles.toastTitle}>{ctrl.alerta.titulo}</Text>
              <Text style={styles.toastDesc}>{ctrl.alerta.mensagem}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.toastButton} onPress={ctrl.irParaMeusPedidos}>
            <Text style={styles.toastButtonText}>Acompanhar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={ctrl.fecharAlerta} style={{marginLeft: 10, padding: 4}}>
            <Ionicons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.headerContainer}>
        <View style={styles.leftSection}>
          <Image source={logo} style={styles.logoImg} resizeMode="contain" />
          
          <View style={styles.navLinks}>
            {/* Início fica verde se estiver na Home */}
            <TouchableOpacity onPress={() => router.push('/home-consumidor-screen')}>
              <Text style={[
                styles.navText, 
                pathname === '/home-consumidor-screen' && styles.navTextActive
              ]}>
                Início
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity><Text style={styles.navText}>Restaurantes</Text></TouchableOpacity>
            
            {/* Sobre nós fica verde se o pathname for /sobre-nos */}
            <TouchableOpacity onPress={() => router.push('/sobre-nos')}>
              <Text style={[
                styles.navText, 
                pathname === '/sobre-nos' && styles.navTextActive
              ]}>
                Sobre nós
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.addressInfo} onPress={() => router.push('/escolher-endereco')}>
            <Ionicons name="location-outline" size={24} color="#93BD57" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.addressLabel}>Entregar em</Text>
              <Text style={styles.addressText} numberOfLines={1}>Escolher endereço</Text>
            </View>
          </TouchableOpacity>

          <View style={{ position: 'relative', zIndex: 999 }}>
            <TouchableOpacity style={styles.userInfo} onPress={() => ctrl.setMenuAberto(!ctrl.menuAberto)}>
              <View style={{ position: 'relative' }}>
                <Ionicons name="person-outline" size={20} color="#005F02" />
                {ctrl.temNotificacao && <View style={styles.badgePequena} />}
              </View>

              <View style={{ marginLeft: 8 }}>
                <Text style={styles.welcomeText}>Boas vindas!</Text>
                <Text style={styles.loginText} numberOfLines={1}>{ctrl.nomeUsuario}</Text>
              </View>
              <Ionicons name="chevron-down-outline" size={16} color="#333" style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            {ctrl.menuAberto && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity style={styles.dropdownItem} onPress={ctrl.irParaMeusPedidos}>
                  <View style={{ position: 'relative' }}>
                    <Ionicons name="receipt-outline" size={18} color="#005F02" />
                    {ctrl.temNotificacao && <View style={styles.badgeDropdown} />}
                  </View>
                  <Text style={[styles.dropdownText, { color: '#005F02' }]}>Meus Pedidos</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dropdownItem} onPress={ctrl.handleLogout}>
                  <Ionicons name="log-out-outline" size={18} color="#E53935" />
                  <Text style={styles.dropdownText}>Sair</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
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

      <CarrinhoDrawer />
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 70, height: 80, backgroundColor: '#F2E3BB', borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.05)', zIndex: 10 },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  logoImg: { width: 110, height: 55 },
  navLinks: { flexDirection: 'row', marginLeft: 45, gap: 45 },
  navText: { fontFamily: 'Nunito', fontSize: 16, color: '#2A2D34', fontWeight: '500' },
  navTextActive: { color: '#005F02', fontWeight: 'bold' }, // ESTILO VERDE APLICADO AQUI
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 25 }, 
  addressInfo: { flexDirection: 'row', alignItems: 'center', paddingRight: 20, borderRightWidth: 1, borderColor: '#EFEFEF' },
  addressLabel: { fontFamily: 'Nunito', fontSize: 12, color: '#777' },
  addressText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: 'bold', color: '#93BD57', maxWidth: 140 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  welcomeText: { fontFamily: 'Nunito', fontSize: 12, color: '#777' },
  loginText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: 'bold', color: '#333', maxWidth: 120 },
  cartInfo: { flexDirection: 'row', alignItems: 'center' },
  cartValue: { fontFamily: 'Nunito', fontSize: 14, fontWeight: 'bold', color: '#333' },
  cartItems: { fontFamily: 'Nunito', fontSize: 12, color: '#777' },
  dropdownMenu: { position: 'absolute', top: '100%', right: 0, backgroundColor: '#FFF', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 5, zIndex: 999, minWidth: 160 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  dropdownText: { fontFamily: 'Nunito', fontSize: 14, color: '#E53935', marginLeft: 10, fontWeight: '600' },
  badgePequena: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E53935', borderWidth: 1, borderColor: '#F2E3BB' },
  badgeDropdown: { position: 'absolute', top: -2, right: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E53935' },
  toastContainer: { position: 'absolute', top: 90, right: 70, backgroundColor: '#005F02', borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', zIndex: 9999, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, minWidth: 320 },
  toastContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  toastTextContainer: { marginLeft: 12 },
  toastTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  toastDesc: { color: '#E8F5E9', fontSize: 13, marginTop: 2, maxWidth: 220 },
  toastButton: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginLeft: 10 },
  toastButtonText: { color: '#005F02', fontWeight: 'bold', fontSize: 13 }
});
