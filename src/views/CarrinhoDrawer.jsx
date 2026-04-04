import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ⚠️ Ajuste o caminho se o seu useCarrinhoStore estiver em outra pasta
import { useCarrinhoStore } from '../controllers/useCarrinhoStore';

export function CarrinhoDrawer() {
  const router = useRouter();
  
  const { 
    drawerAberto, 
    fecharDrawer, 
    itens, 
    removerItem, 
    adicionarItem, 
    restauranteId, 
    limparCarrinho 
  } = useCarrinhoStore();

  // O React recalcula isso automaticamente sempre que a quantidade de itens muda
  const valorTotal = itens.reduce((acc, item) => acc + (item.preco * item.qtd), 0);

  const irParaPagamento = () => {
    fecharDrawer();
    router.push('/consumidor/pagamento'); 
  };

  return (
    <Modal visible={drawerAberto} transparent animationType="fade">
      <View style={styles.overlay}>
        
        {/* Fundo escuro clicável */}
        <TouchableOpacity style={styles.backdrop} onPress={fecharDrawer} activeOpacity={1} />
        
        <View style={styles.drawer}>
          <View style={styles.header}>
            <Text style={styles.title}>Seu Pedido</Text>
            
            <View style={styles.headerAcoes}>
              {/* Botão de limpar o carrinho (só aparece se tiver itens) */}
              {itens.length > 0 && (
                <TouchableOpacity onPress={limparCarrinho}>
                  <Text style={styles.btnLimpar}>Limpar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={fecharDrawer}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.lista}>
            {itens.length === 0 ? (
              <View style={styles.carrinhoVazio}>
                <Ionicons name="bag-handle-outline" size={48} color="#CCC" />
                <Text style={styles.carrinhoVazioText}>Seu carrinho está vazio.</Text>
              </View>
            ) : (
              itens.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  
                  {/* Foto do produto puxando do Firebase, com um placeholder caso falhe */}
                  <Image 
                    source={{ uri: item.foto || 'https://via.placeholder.com/60' }} 
                    style={styles.itemFoto}
                  />

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemNome} numberOfLines={2}>{item.nome}</Text>
                    <Text style={styles.itemPrecoUnit}>
                      R$ {Number(item.preco).toFixed(2).replace('.', ',')} / un
                    </Text>
                  </View>

                  <View style={styles.itemRight}>
                    {/* Controles de Quantidade (+ e -) */}
                    <View style={styles.controleQtd}>
                      <TouchableOpacity 
                        style={styles.btnQtd} 
                        onPress={() => removerItem(item.id)}
                      >
                        {/* Se a qtd for 1, mostra lixeirinha. Se for maior, mostra um "menos" */}
                        <Ionicons 
                          name={item.qtd === 1 ? "trash-outline" : "remove"} 
                          size={16} 
                          color={item.qtd === 1 ? "#E53935" : "#666"} 
                        />
                      </TouchableOpacity>
                      
                      <Text style={styles.txtQtd}>{item.qtd}</Text>
                      
                      <TouchableOpacity 
                        style={styles.btnQtd} 
                        onPress={() => adicionarItem(item, restauranteId)}
                      >
                        <Ionicons name="add" size={16} color="#93BD57" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.itemPrecoTotal}>
                      R$ {(item.preco * item.qtd).toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                R$ {valorTotal.toFixed(2).replace('.', ',')}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.btnFinalizar, itens.length === 0 && styles.btnFinalizarInativo]} 
              onPress={irParaPagamento}
              disabled={itens.length === 0}
            >
              <Text style={styles.btnFinalizarText}>Ir para Pagamento</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#EFEFEF',
  },
  title: { fontFamily: 'Nunito', fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerAcoes: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  btnLimpar: { fontFamily: 'Nunito', fontSize: 14, color: '#E53935', fontWeight: '600' },
  lista: { flex: 1, padding: 20 },
  carrinhoVazio: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  carrinhoVazioText: { fontFamily: 'Nunito', fontSize: 16, color: '#999', marginTop: 10 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    gap: 12,
  },
  itemFoto: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  itemInfo: { flex: 1 },
  itemNome: { fontFamily: 'Nunito', fontSize: 15, color: '#333', fontWeight: '600', marginBottom: 4 },
  itemPrecoUnit: { fontFamily: 'Nunito', fontSize: 12, color: '#777' },
  itemRight: { alignItems: 'flex-end', gap: 8 },
  controleQtd: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  btnQtd: { padding: 4 },
  txtQtd: { fontFamily: 'Nunito', fontSize: 14, fontWeight: 'bold', color: '#333', marginHorizontal: 8, minWidth: 16, textAlign: 'center' },
  itemPrecoTotal: { fontFamily: 'Nunito', fontSize: 16, fontWeight: 'bold', color: '#005F02' },
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#EFEFEF', backgroundColor: '#FAFAFA' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontFamily: 'Nunito', fontSize: 18, color: '#666' },
  totalValue: { fontFamily: 'Nunito', fontSize: 24, fontWeight: 'bold', color: '#005F02' },
  btnFinalizar: { backgroundColor: '#93BD57', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnFinalizarInativo: { backgroundColor: '#CCC' },
  btnFinalizarText: { fontFamily: 'Nunito', fontSize: 18, fontWeight: 'bold', color: '#FFF' },

});