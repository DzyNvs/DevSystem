import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export function PratoCard({ prato, onPress }) {
  if (!prato.disponivel) return null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.infoColumn}>
          <Text style={styles.nomePrato}>{prato.nome}</Text>
          <Text style={styles.descricaoPrato} numberOfLines={2}>
            {prato.descricao || 'Sem descrição.'}
          </Text>
          <View style={styles.footerRow}>
            <Text style={styles.preco}>R$ {prato.preco.toFixed(2).replace('.', ',')}</Text>
            {prato.calorias > 0 && (
              <View style={styles.caloriasBadge}>
                <Text style={styles.caloriasText}>{prato.calorias} cal</Text>
              </View>
            )}
          </View>
        </View>
        {prato.foto ? (
          <Image source={{ uri: prato.foto }} style={styles.fotoPrato} />
        ) : (
          <View style={styles.fotoPlaceholder} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 8, marginVertical: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, width: '100%' },
  cardContent: { flexDirection: 'row', padding: 16, justifyContent: 'space-between', alignItems: 'center' },
  infoColumn: { flex: 1, paddingRight: 16 },
  nomePrato: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  descricaoPrato: { fontSize: 14, color: '#666', marginBottom: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  preco: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32' },
  caloriasBadge: { backgroundColor: '#93BD57', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  caloriasText: { fontSize: 12, color: '#FFF', fontWeight: 'bold' },
  fotoPrato: { width: 80, height: 80, borderRadius: 8 },
  fotoPlaceholder: { width: 80, height: 80, backgroundColor: '#EFEFEF', borderRadius: 8, borderWidth: 1, borderColor: '#CCC', borderStyle: 'dashed' }
});