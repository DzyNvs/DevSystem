import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../config/firebase';
import { useCarrinhoStore } from '../controllers/useCarrinhoStore';
import { useHeaderConsumidorController } from '../controllers/useHeaderConsumidorController';
import { CarrinhoDrawer } from './CarrinhoDrawer';

const logo = require('../../assets/images/logo.png');

const getIcone = (apelido = '') => {
  const a = apelido.toLowerCase();
  if (a.includes('casa') || a.includes('home'))    return 'home-outline';
  if (a.includes('trabalho') || a.includes('job')) return 'briefcase-outline';
  if (a.includes('academia') || a.includes('gym')) return 'barbell-outline';
  if (a.includes('faculdade') || a.includes('esc'))return 'school-outline';
  return 'location-outline';
};

export function HeaderConsumidor() {
  const ctrl   = useHeaderConsumidorController();
  const router = useRouter();

  const enderecoAtivo    = useCarrinhoStore((s) => s.enderecoAtivo);
  const setEnderecoAtivo = useCarrinhoStore((s) => s.setEnderecoAtivo);

  const [endDropOpen, setEndDropOpen] = useState(false);
  const [enderecos, setEnderecos]     = useState([]);
  const dropRef = useRef(null);

  // Busca endereços do usuário logado
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(
      collection(db, 'enderecos'),
      where('id_consumidor', '==', doc(db, 'consumidores', user.uid))
    );
    const unsub = onSnapshot(q, (snap) => {
      setEnderecos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Fecha dropdown ao clicar fora (web)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setEndDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelecionarEndereco = async (end) => {
    setEnderecoAtivo(end);
    setEndDropOpen(false);
    // Atualiza padrão no Firestore
    try {
      for (const e of enderecos) {
        if (e.id !== end.id && e.padrao) {
          await updateDoc(doc(db, 'enderecos', e.id), { padrao: false });
        }
      }
      await updateDoc(doc(db, 'enderecos', end.id), { padrao: true });
    } catch (e) { console.log(e); }
  };

  const textoEndereco = enderecoAtivo
    ? `${enderecoAtivo.apelido} – ${enderecoAtivo.rua}${enderecoAtivo.numero ? ', ' + enderecoAtivo.numero : ''}`
    : 'Escolher endereço';

  return (
    <>
      {/* TOAST FLUTUANTE */}
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
          <TouchableOpacity onPress={ctrl.fecharAlerta} style={{ marginLeft: 10, padding: 4 }}>
            <Ionicons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.headerContainer}>
        {/* ── ESQUERDA ── */}
        <View style={styles.leftSection}>
          <Image source={logo} style={styles.logoImg} resizeMode="contain" />
          <View style={styles.navLinks}>
            {/* Botão Início agora é clicável e redireciona para a Home */}
            <TouchableOpacity onPress={() => router.push('/home-consumidor-screen')}>
              <Text style={[styles.navText, styles.navTextActive]}>Início</Text>
            </TouchableOpacity>
            
            <TouchableOpacity><Text style={styles.navText}>Restaurantes</Text></TouchableOpacity>
            
            {/* Botão Drops foi removido daqui */}
            
            <TouchableOpacity><Text style={styles.navText}>Sobre nós</Text></TouchableOpacity>
          </View>
        </View>

        {/* ── DIREITA ── */}
        <View style={styles.rightSection}>

          {/* ── DROPDOWN DE ENDEREÇO ── */}
          <View style={{ position: 'relative', zIndex: 1000 }} ref={dropRef}>
            <TouchableOpacity
              style={styles.addressInfo}
              onPress={() => setEndDropOpen(v => !v)}
            >
              <Ionicons name="location-outline" size={22} color="#93BD57" />
              <View style={{ marginLeft: 8, maxWidth: 180 }}>
                <Text style={styles.addressLabel}>Entregar em</Text>
                <Text style={styles.addressText} numberOfLines={1}>{textoEndereco}</Text>
              </View>
              <Ionicons
                name={endDropOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={14} color="#93BD57" style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>

            {endDropOpen && (
              <View style={styles.endDrop}>
                <Text style={styles.endDropTitle}>Seus endereços</Text>

                {enderecos.length === 0 && (
                  <Text style={styles.endDropVazio}>Nenhum endereço cadastrado</Text>
                )}

                <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                  {enderecos.map((end) => {
                    const ativo = enderecoAtivo?.id === end.id;
                    return (
                      <TouchableOpacity
                        key={end.id}
                        style={[styles.endDropItem, ativo && styles.endDropItemAtivo]}
                        onPress={() => handleSelecionarEndereco(end)}
                      >
                        <View style={[styles.endDropIcon, ativo && styles.endDropIconAtivo]}>
                          <Ionicons name={getIcone(end.apelido)} size={16}
                            color={ativo ? '#FFF' : '#93BD57'} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.endDropApelido, ativo && { color: '#3B6D11' }]}>
                            {end.apelido}
                          </Text>
                          <Text style={styles.endDropRua} numberOfLines={1}>
                            {end.rua}{end.numero ? `, ${end.numero}` : ''}{end.bairro ? `– ${end.bairro}` : ''}
                          </Text>
                        </View>
                        {ativo && <Ionicons name="checkmark-circle" size={18} color="#93BD57" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Separador */}
                <View style={styles.endDropSep} />

                {/* Ver todos / Adicionar novo */}
                <TouchableOpacity
                  style={styles.endDropAcao}
                  onPress={() => { setEndDropOpen(false); router.push('/selecionar-endereco'); }}
                >
                  <Ionicons name="list-outline" size={16} color="#555" />
                  <Text style={styles.endDropAcaoTexto}>Gerenciar endereços</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.endDropAcao, { marginTop: 2 }]}
                  onPress={() => { setEndDropOpen(false); router.push('/escolher-endereco'); }}
                >
                  <Ionicons name="add-circle-outline" size={16} color="#93BD57" />
                  <Text style={[styles.endDropAcaoTexto, { color: '#93BD57', fontWeight: '700' }]}>
                    Adicionar novo endereço
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ── USUÁRIO COM DROPDOWN ── */}
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

          {/* ── CARRINHO ── */}
          <TouchableOpacity style={styles.cartInfo} onPress={ctrl.irParaCarrinho}>
            <Ionicons name="bag-handle-outline" size={24} color="#005F02" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.cartValue}>R$ {ctrl.valorTotal.toFixed(2).replace('.', ',')}</Text>
              <Text style={styles.cartItems}>{ctrl.totalItens} {ctrl.totalItens === 1 ? 'item' : 'itens'}</Text>
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
  leftSection:  { flexDirection: 'row', alignItems: 'center' },
  logoImg:      { width: 110, height: 55 },
  navLinks:     { flexDirection: 'row', marginLeft: 45, gap: 45 },
  navText:      { fontFamily: 'Nunito', fontSize: 16, color: '#2A2D34', fontWeight: '500' },
  navTextActive:{ color: '#005F02', fontWeight: 'bold' },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 25 },

  // Botão endereço
  addressInfo:  { flexDirection: 'row', alignItems: 'center', paddingRight: 20, borderRightWidth: 1, borderColor: '#EFEFEF' },
  addressLabel: { fontFamily: 'Nunito', fontSize: 12, color: '#777' },
  addressText:  { fontFamily: 'Nunito', fontSize: 14, fontWeight: 'bold', color: '#93BD57' },

  // Dropdown endereço
  endDrop: {
    position: 'absolute', top: '100%', left: 0,
    width: 320, backgroundColor: '#FFF',
    borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    marginTop: 8,
  },
  endDropTitle:   { fontSize: 11, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  endDropVazio:   { fontSize: 13, color: '#BBB', textAlign: 'center', paddingVertical: 10 },
  endDropItem:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 8 },
  endDropItemAtivo: { backgroundColor: '#F0F9E8' },
  endDropIcon:    { width: 34, height: 34, borderRadius: 17, backgroundColor: '#EAF3DE', justifyContent: 'center', alignItems: 'center' },
  endDropIconAtivo: { backgroundColor: '#93BD57' },
  endDropApelido: { fontSize: 14, fontWeight: '700', color: '#2C3E50' },
  endDropRua:     { fontSize: 12, color: '#888', marginTop: 1 },
  endDropSep:     { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
  endDropAcao:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 6 },
  endDropAcaoTexto: { fontSize: 13, fontWeight: '600', color: '#555' },

  // Usuário
  userInfo:     { flexDirection: 'row', alignItems: 'center' },
  welcomeText:  { fontFamily: 'Nunito', fontSize: 12, color: '#777' },
  loginText:    { fontFamily: 'Nunito', fontSize: 14, fontWeight: 'bold', color: '#333', maxWidth: 120 },
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

  // Badges
  badgePequena: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E53935', borderWidth: 1, borderColor: '#F2E3BB' },
  badgeDropdown:{ position: 'absolute', top: -2, right: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E53935' },

  // Carrinho
  cartInfo:  { flexDirection: 'row', alignItems: 'center' },
  cartValue: { fontFamily: 'Nunito', fontSize: 14, fontWeight: 'bold', color: '#333' },
  cartItems: { fontFamily: 'Nunito', fontSize: 12, color: '#777' },

  // Toast
  toastContainer:    { position: 'absolute', top: 90, right: 70, backgroundColor: '#005F02', borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', zIndex: 9999, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, minWidth: 320 },
  toastContent:      { flexDirection: 'row', alignItems: 'center', flex: 1 },
  toastTextContainer:{ marginLeft: 12 },
  toastTitle:        { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  toastDesc:         { color: '#E8F5E9', fontSize: 13, marginTop: 2, maxWidth: 220 },
  toastButton:       { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginLeft: 10 },
  toastButtonText:   { color: '#005F02', fontWeight: 'bold', fontSize: 13 },
});
