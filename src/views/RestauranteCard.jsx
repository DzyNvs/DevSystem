import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function RestauranteCard({ restaurante, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: restaurante.foto }} style={styles.foto} />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#F5A623" />
          <Text style={styles.ratingText}>{restaurante.avaliacao.toFixed(1)}</Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.nome} numberOfLines={1}>{restaurante.nome}</Text>
        <Text style={styles.descricao} numberOfLines={2}>{restaurante.descricao}</Text>
        
        <View style={styles.footerRow}>
          <Text style={styles.detalhes}><Ionicons name="time-outline" size={12} color="#777" /> {restaurante.tempoEntrega} min</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.detalhes}>R$ {restaurante.taxaEntrega === 0 ? 'Grátis' : restaurante.taxaEntrega.toFixed(2)}</Text>
        </View>
        <Text style={styles.minOrder}>Mín. R$ {restaurante.pedidoMinimo.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '23%', // Faz caber 4 por linha num layout desktop
    minWidth: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: { position: 'relative' },
  foto: { width: '100%', height: 140 },
  ratingBadge: {
    position: 'absolute', top: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12,
  },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  infoContainer: { padding: 16 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  descricao: { fontSize: 12, color: '#777', marginBottom: 12, lineHeight: 16, height: 32 },
  footerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  detalhes: { fontSize: 12, color: '#777' },
  dot: { fontSize: 12, color: '#777', marginHorizontal: 6 },
  minOrder: { fontSize: 11, color: '#999' },
});