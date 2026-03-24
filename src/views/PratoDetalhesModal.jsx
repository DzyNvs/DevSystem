import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function PratoDetalhesModal({ visible, onClose, prato, onAddToCart }) {
  if (!prato) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.scrollContainer}>
            {prato.foto ? (
              <Image source={{ uri: prato.foto }} style={styles.fotoModal} />
            ) : (
              <View style={styles.fotoPlaceholderModal} />
            )}
            
            <View style={styles.detailsContainer}>
              <View style={styles.headerRowModal}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nomePratoModal}>{prato.nome}</Text>
                  <Text style={styles.categoriaPratoModal}>
                    {prato.categoria ? prato.categoria.toUpperCase() : 'FIT'}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close-circle" size={32} color="#AAA" />
                </TouchableOpacity>
              </View>

              <Text style={styles.labelModal}>Descrição</Text>
              <Text style={styles.descricaoPratoModal}>{prato.descricao || 'Sem descrição.'}</Text>
              
              <View style={styles.separatorModal} />
              
              <View style={styles.dataRowModal}>
                <View style={styles.dataColModal}>
                  <Text style={styles.labelModal}>Calorias</Text>
                  <View style={styles.caloriasBadgeLargeModal}>
                    <Text style={styles.caloriasTextLargeModal}>
                      {prato.calorias > 0 ? `${prato.calorias} cal` : 'FIT'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.dataColModal}>
                  <Text style={styles.labelModal}>Preço unitário</Text>
                  <Text style={styles.precoModal}>R$ {prato.preco.toFixed(2).replace('.', ',')}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.footerModal}>
            <TouchableOpacity style={styles.btnAddToCartModal} onPress={() => onAddToCart(prato)}>
              <Text style={styles.btnAddToCartTextModal}>
                {`Adicionar R$ ${prato.preco.toFixed(2).replace('.', ',')}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FAF9F2', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '90%', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 20, alignSelf: 'center', width: '100%', maxWidth: 800 },
  scrollContainer: { flex: 1 },
  fotoModal: { width: '100%', height: 300 },
  fotoPlaceholderModal: { width: '100%', height: 300, backgroundColor: '#EFEFEF', borderBottomWidth: 1, borderBottomColor: '#CCC', borderStyle: 'dashed' },
  detailsContainer: { padding: 24 },
  headerRowModal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  nomePratoModal: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  categoriaPratoModal: { fontSize: 14, color: '#2E7D32', fontWeight: '600', fontStyle: 'italic' },
  closeButton: { marginLeft: 16 },
  labelModal: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4, marginTop: 16 },
  descricaoPratoModal: { fontSize: 16, color: '#555', lineHeight: 24 },
  separatorModal: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
  dataRowModal: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  dataColModal: { flex: 1 },
  caloriasBadgeLargeModal: { backgroundColor: '#93BD57', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start' },
  caloriasTextLargeModal: { fontSize: 16, color: '#FFF', fontWeight: 'bold' },
  precoModal: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32' },
  footerModal: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
  btnAddToCartModal: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnAddToCartTextModal: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});