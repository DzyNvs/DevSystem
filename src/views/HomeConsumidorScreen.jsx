import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ImageBackground, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HeaderConsumidor } from './HeaderConsumidor';
import { RestauranteCard } from './RestauranteCard';
import { useHomeController } from '../controllers/useHomeController';

export function HomeConsumidorScreen() {
  const ctrl = useHomeController();
  const [busca, setBusca] = useState('');

  // Mantemos as categorias visuais, mas agora elas filtram o banco!
  const categorias = [
    { id: '1', nome: 'Marmitas', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300' },
    { id: '2', nome: 'Bowls', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300' },
    { id: '3', nome: 'Saladas', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4497?q=80&w=300' },
    { id: '4', nome: 'Wraps', img: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=300' }, 
    { id: '5', nome: 'Poke', img: 'https://images.unsplash.com/photo-1548025983-487627407d57?q=80&w=300' },
    { id: '6', nome: 'Vegano', img: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=300' },
  ];

  return (
    <View style={styles.mainContainer}>
      <HeaderConsumidor />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* BANNER HERO */}
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200' }} 
          style={styles.heroBanner}
          imageStyle={{ opacity: 0.8 }}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Se manter na dieta nunca foi tão prático</Text>
            <Text style={styles.heroSubtitle}>Peça dos melhores restaurantes fit perto de você</Text>
            
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#777" style={{ marginLeft: 10 }} />
              <TextInput 
                style={styles.searchInput} 
                value={busca} 
                onChangeText={setBusca} 
                placeholder="Busque por item ou loja" 
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.searchButton}>
                <Text style={styles.searchButtonText}>Buscar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* CONTAINER CENTRALIZADO PARA CONTEÚDO */}
        <View style={styles.contentWrapper}>
          
          {/* CATEGORIAS */}
          <Text style={styles.sectionTitle}>Busque por categoria</Text>
          <FlatList
            data={categorias}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriasList}
            renderItem={({ item }) => {
              // Verifica se essa é a categoria selecionada para mudar o visual
              const isSelecionada = ctrl.categoriaSelecionada === item.nome;

              return (
                <TouchableOpacity 
                  style={[styles.categoriaCard, isSelecionada && styles.categoriaCardAtiva]}
                  onPress={() => ctrl.filtrarPorCategoria(item.nome)}
                >
                  <ImageBackground source={{ uri: item.img }} style={styles.categoriaImg} imageStyle={{ borderRadius: 8 }}>
                    <View style={[styles.categoriaOverlay, isSelecionada && styles.categoriaOverlayAtiva]}>
                      <Text style={[styles.categoriaText, isSelecionada && styles.categoriaTextAtiva]}>
                        {item.nome.toUpperCase()} 
                      </Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              );
            }}
          />

          {/* RESTAURANTES */}
          <Text style={styles.sectionTitle}>
            {ctrl.categoriaSelecionada ? `Especialidade: ${ctrl.categoriaSelecionada.toUpperCase()}` : 'Restaurantes em destaque'}
          </Text>
          
          {ctrl.carregando ? (
            <ActivityIndicator size="large" color="#8BC34A" style={{ marginTop: 40 }} />
          ) : ctrl.restaurantes.length === 0 ? (
            <Text style={styles.textoVazio}>Nenhum restaurante encontrado nessa categoria. 😕</Text>
          ) : (
            <View style={styles.gridContainer}>
              {ctrl.restaurantes.map((restaurante) => (
                <RestauranteCard 
                  key={restaurante.id} 
                  restaurante={restaurante} 
                  onPress={() => ctrl.abrirRestaurante(restaurante.id)} 
                />
              ))}
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FAF9F2' },
  scrollContainer: { flex: 1 },
  
  heroBanner: { width: '100%', height: 350, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' },
  heroOverlay: { alignItems: 'center', width: '100%', paddingHorizontal: 20 },
  heroTitle: { fontSize: 36, fontWeight: 'bold', color: '#FFF', textAlign: 'center', fontStyle: 'italic', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },
  heroSubtitle: { fontSize: 18, color: '#FFF', marginTop: 10, marginBottom: 30, textAlign: 'center', fontStyle: 'italic', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, width: '100%', maxWidth: 600, height: 50, paddingRight: 5 },
  searchInput: { flex: 1, paddingHorizontal: 15, fontSize: 16, outlineStyle: 'none' },
  searchButton: { backgroundColor: '#8BC34A', paddingHorizontal: 25, height: 40, justifyContent: 'center', borderRadius: 6 },
  searchButtonText: { color: '#FFF', fontWeight: 'bold' },

  contentWrapper: { maxWidth: 1200, width: '100%', alignSelf: 'center', padding: 40 },
  
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', fontStyle: 'italic', textAlign: 'center', marginVertical: 30 },
  
  categoriasList: { paddingBottom: 10, gap: 16 },
  categoriaCard: { width: 150, height: 150, borderRadius: 8 },
  categoriaCardAtiva: { transform: [{ scale: 0.95 }] }, // Dá um efeito de afundado no card clicado
  categoriaImg: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  categoriaOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', padding: 10, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  categoriaOverlayAtiva: { backgroundColor: 'rgba(139, 195, 74, 0.8)' }, // Fica verdinho quando clicado
  categoriaText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  categoriaTextAtiva: { color: '#FFF' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: '2%', justifyContent: 'flex-start' },
  textoVazio: { textAlign: 'center', color: '#777', fontSize: 16, marginTop: 20 },
});