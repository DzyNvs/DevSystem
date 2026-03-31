import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ImageBackground, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// 👉 Importando das Views e não da pasta components
import { HeaderConsumidor } from './HeaderConsumidor';
import { PratoCard } from './PratoCard';
import { PratoDetalhesModal } from './PratoDetalhesModal';
import { useRestauranteDetalhesController } from '../controllers/useRestauranteDetalhesController';

export function RestauranteDetalhesScreen() {
  const ctrl = useRestauranteDetalhesController();

  if (ctrl.carregandoRestaurante) {
    return (
      <View style={styles.mainContainer}>
        <HeaderConsumidor />
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />
      </View>
    );
  }

  // Agrupa pratos por categoria
  const produtosPorCategoria = ctrl.produtos.reduce((acc, produto) => {
    if (!produto.disponivel) return acc;
    const categoria = produto.categoria || 'FIT';
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(produto);
    return acc;
  }, {});

  const listaCategorias = Object.entries(produtosPorCategoria);

  return (
    <View style={styles.mainContainer}>
      <HeaderConsumidor />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Banner do Restaurante */}
        <ImageBackground 
          source={{ uri: ctrl.restaurante?.banner }} 
          style={styles.bannerImage}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.bannerOverlay}>
            <View style={styles.restaurantInfoCard}>
              <View style={styles.headerRow}>
                <Text style={styles.nomeRestaurante} numberOfLines={1}>
                  {ctrl.restaurante?.nome_fantasia || ctrl.restaurante?.razao_social || 'Restaurante'}
                </Text>
                <View style={styles.avaliacaoBadge}>
                  <Text style={styles.avaliacaoText}>
                    {ctrl.restaurante?.avaliacao?.toFixed(1).replace('.', ',')}
                  </Text>
                  <Ionicons name="star" size={16} color="#FBC02D" />
                </View>
              </View>
              <Text style={styles.especialidade} numberOfLines={1}>{ctrl.restaurante?.especialidade || 'Alimentação Saudável'}</Text>
              
              <View style={styles.detailsRow}>
                <View style={styles.detailCol}>
                  <Ionicons name="time-outline" size={16} color="#777" />
                  <Text style={styles.detailText}>{ctrl.restaurante?.tempoEntrega} min</Text>
                </View>
                <View style={styles.detailCol}>
                  <Ionicons name="cash-outline" size={16} color="#777" />
                  <Text style={styles.detailText}>Taxa: R$ {ctrl.restaurante?.taxaEntrega.toFixed(2).replace('.', ',')}</Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Cardápio */}
        <View style={styles.listContainer}>
          {ctrl.carregandoProdutos ? (
            <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />
          ) : listaCategorias.length === 0 ? (
            <Text style={styles.textoVazio}>Nenhum prato disponível neste restaurante no momento.</Text>
          ) : (
            listaCategorias.map(([categoria, pratos]) => (
              <View key={categoria} style={styles.sectionCategory}>
                <Text style={styles.sectionTitleCategory}>{categoria.toUpperCase()}</Text>
                <FlatList
                  data={pratos}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <PratoCard prato={item} onPress={() => ctrl.abrirPratoModal(item)} />
                  )}
                  scrollEnabled={false} 
                />
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* Modal invisível até clicar no prato */}
      <PratoDetalhesModal 
        visible={ctrl.modalVisivel}
        onClose={ctrl.fecharPratoModal}
        prato={ctrl.pratoSelecionado}
        onAddToCart={ctrl.handleAdicionarItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FAF9F2' },
  container: { flex: 1 },
  bannerImage: { width: '100%', height: 280, justifyContent: 'flex-end', alignItems: 'center' },
  backButton: { position: 'absolute', top: 20, left: 20, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 24, zIndex: 10 },
  bannerOverlay: { alignItems: 'center', width: '100%', paddingHorizontal: 16 },
  restaurantInfoCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, width: '100%', maxWidth: 800, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, marginBottom: -40, zIndex: 5 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  nomeRestaurante: { fontSize: 24, fontWeight: 'bold', color: '#111', flex: 1, marginRight: 16 },
  avaliacaoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9C4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  avaliacaoText: { fontSize: 14, fontWeight: 'bold', color: '#F9A825' },
  especialidade: { fontSize: 14, color: '#2E7D32', fontStyle: 'italic', marginBottom: 12 },
  detailsRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderColor: '#EEE', paddingTop: 12, gap: 24 },
  detailCol: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 14, color: '#777', fontWeight: '500' },
  
  listContainer: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40, width: '100%', maxWidth: 800, alignSelf: 'center' },
  sectionCategory: { marginBottom: 24 },
  sectionTitleCategory: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', fontStyle: 'italic', marginVertical: 16, marginLeft: 16 },
  textoVazio: { textAlign: 'center', marginTop: 50, color: '#777', fontSize: 16 }
});