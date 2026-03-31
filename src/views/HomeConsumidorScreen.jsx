import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, FlatList, Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useHomeController } from '../controllers/useHomeController';
import { HeaderConsumidor } from './HeaderConsumidor';
import { RestauranteCard } from './RestauranteCard';

// Assets
const logo2 = require('../../assets/images/logo2.png');
const capa4 = require('../../assets/images/capa4.png');
const fbIcon = require('../../assets/images/facebookV.png');
const igIcon = require('../../assets/images/instagramV.png');
const xIcon = require('../../assets/images/xV.png');

// Imagens Categorias
const imgSaladas = require('../../assets/images/saladas.png');
const imgPoke = require('../../assets/images/poke.png');
const imgVegano = require('../../assets/images/vegano.png');

export function HomeConsumidorScreen() {
  const ctrl = useHomeController();

  const categorias = [
    { id: '1', nome: 'Marmitas', img: { uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300' } },
    { id: '2', nome: 'Bowls', img: { uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300' } },
    { id: '3', nome: 'Saladas', img: imgSaladas },
    { id: '4', nome: 'Wraps', img: { uri: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=300' } },
    { id: '5', nome: 'Poke', img: imgPoke },
    { id: '6', nome: 'Vegano', img: imgVegano },
  ];

  return (
    <View style={styles.mainContainer}>
      <HeaderConsumidor />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <ImageBackground source={capa4} style={styles.heroBanner} resizeMode="cover">
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Se manter na dieta nunca foi tão prático</Text>
            <Text style={styles.heroSubtitle}>Peça dos melhores restaurantes fit perto de você</Text>
            
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#777" style={{ marginLeft: 15 }} />
              <TextInput 
                style={styles.searchInput} 
                value={ctrl.busca}
                onChangeText={ctrl.realizarBusca}
                placeholder="Busque por item ou loja" 
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.searchButton}>
                <Text style={styles.searchButtonText}>Buscar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.contentWrapper}>
          <Text style={styles.sectionTitle}>Busque por categoria</Text>
          <FlatList
            data={categorias}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriasList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.categoriaCard} onPress={() => ctrl.filtrarPorCategoria(item.nome)}>
                <ImageBackground source={item.img} style={styles.categoriaImg} imageStyle={{ borderRadius: 8 }}>
                  <View style={styles.categoriaOverlay}>
                    <Text style={styles.categoriaText}>{item.nome.toUpperCase()}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            )}
          />

          <Text style={styles.sectionTitle}>Restaurantes em destaque</Text>
          {ctrl.carregando ? (
            <ActivityIndicator size="large" color="#005F02" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.gridContainer}>
              {ctrl.restaurantesFiltrados.map((res) => (
                <RestauranteCard key={res.id} restaurante={res} onPress={() => ctrl.abrirRestaurante(res.id)} />
              ))}
            </View>
          )}
        </View>

        {/* RODAPÉ */}
        <View style={styles.footerContainer}>
          <View style={styles.footerLine} />
          
          <View style={styles.footerColumnsRow}>
            {/* Coluna da Esquerda (Logo e Bio) */}
            <View style={styles.footerBrandCol}>
              <Image source={logo2} style={styles.logo2Img} resizeMode="contain" />
              <Text style={styles.footerBrandText}>
                O seu delivery de comida saudável. Descubra refeições nutritivas dos melhores restaurantes da sua região.
              </Text>
            </View>

            {/* Coluna Links */}
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Links rápidos</Text>
              <View style={styles.footerLinksList}>
                <TouchableOpacity><Text style={styles.footerLinkItem}>Restaurantes</Text></TouchableOpacity>
                <TouchableOpacity><Text style={styles.footerLinkItem}>Como funciona</Text></TouchableOpacity>
                <TouchableOpacity><Text style={styles.footerLinkItem}>Contatos</Text></TouchableOpacity>
              </View>
            </View>

            {/* Coluna Suporte */}
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Suporte</Text>
              <View style={styles.footerLinksList}>
                <TouchableOpacity><Text style={styles.footerLinkItem}>FAQ</Text></TouchableOpacity>
                <TouchableOpacity><Text style={styles.footerLinkItem}>Envios & frete</Text></TouchableOpacity>
                <TouchableOpacity><Text style={styles.footerLinkItem}>Devolução</Text></TouchableOpacity>
              </View>
            </View>

            {/* Coluna Redes Sociais */}
            <View style={styles.footerColumn}>
              <Text style={styles.socialTitle}>Nossas redes sociais</Text>
              <View style={styles.socialRow}>
                <Image source={fbIcon} style={styles.socialIconFooter} />
                <Image source={igIcon} style={styles.socialIconFooter} />
                <Image source={xIcon} style={styles.socialIconFooter} />
              </View>
            </View>
          </View>

          <View style={styles.copyrightArea}>
            <Text style={styles.copyrightText}>© 2026 FitWay. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFDE1' },
  scrollContainer: { flex: 1 },
  heroBanner: { width: '100%', height: 450, justifyContent: 'center', alignItems: 'center' },
  heroOverlay: { alignItems: 'center', width: '100%', paddingHorizontal: 20, backgroundColor: 'rgba(0,0,0,0.2)', height: '100%', justifyContent: 'center' },
  heroTitle: { fontFamily: 'Nunito', fontSize: 36, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  heroSubtitle: { fontFamily: 'Nunito', fontSize: 18, color: '#FFF', marginTop: 10, marginBottom: 30 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, width: '100%', maxWidth: 600, height: 50 },
  searchInput: { flex: 1, paddingHorizontal: 15, fontSize: 16, fontFamily: 'Nunito' },
  searchButton: { backgroundColor: '#005F02', paddingHorizontal: 25, height: 40, justifyContent: 'center', borderRadius: 6, marginRight: 5 },
  searchButtonText: { color: '#FFF', fontWeight: 'bold', fontFamily: 'Nunito' },
  contentWrapper: { maxWidth: 1200, width: '100%', alignSelf: 'center', padding: 40 },
  sectionTitle: { fontFamily: 'Nunito', fontSize: 22, fontWeight: 'bold', color: '#2E7D32', marginVertical: 30, textAlign: 'center' },
  categoriasList: { gap: 16, paddingHorizontal: 10 },
  categoriaCard: { width: 150, height: 150, marginRight: 15 },
  categoriaImg: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  categoriaOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', padding: 10, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  categoriaText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, fontFamily: 'Nunito' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center' },
  
  // ESTILOS DO RODAPÉ ATUALIZADOS
  footerContainer: { backgroundColor: '#FFFDE1', paddingHorizontal: 70, paddingBottom: 40, marginTop: 50 },
  footerLine: { width: '100%', height: 1, backgroundColor: '#A0A6B6', marginVertical: 45 },
  footerColumnsRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-start',
    alignItems: 'flex-start' 
  },
  footerBrandCol: { width: 300 },
  logo2Img: { 
    height: 100, 
    width: 200, 
    marginBottom: 5, 
    marginLeft: -15 
  },
  footerBrandText: { 
    fontFamily: 'Nunito', 
    fontSize: 18, 
    fontWeight: '500', 
    lineHeight: 26, 
    color: '#000' 
  },
  footerColumn: { 
    marginLeft: 100, 
    marginTop: 40 
  },
  footerTitle: { 
    fontFamily: 'Nunito', 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#000', 
    marginBottom: 20 
  },
  socialTitle: { 
    color: '#000', 
    fontFamily: 'Nunito', 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 20 
  },
  footerLinksList: { 
    gap: 15 
  },
  footerLinkItem: { 
    fontFamily: 'Nunito', 
    fontSize: 16, 
    fontWeight: '400', 
    color: '#000',
    lineHeight: 24 
  },
  socialRow: { flexDirection: 'row', gap: 20 },
  socialIconFooter: { width: 30, height: 30 },
  copyrightArea: { marginTop: 60, alignItems: 'center' },
  copyrightText: { fontFamily: 'Nunito', fontSize: 16, fontWeight: '300', color: '#000' },
});