import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Image, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCardapioController } from '../controllers/useCardapioController';
import { HeaderRestaurante } from './HeaderRestaurante';

export function CardapioScreen() {
  const ctrl = useCardapioController();
  const router = useRouter();

  const renderPrato = ({ item }) => {
    const disponivel = item.disponivel !== false;

    return (
      <View style={[styles.cardPrato, !disponivel && styles.cardIndisponivel]}>
        {/* Foto */}
        {item.foto ? (
          <Image source={{ uri: item.foto }} style={styles.fotoPrato} />
        ) : (
          <View style={[styles.fotoPrato, styles.fotoPlaceholder]}>
            <Ionicons name="fast-food-outline" size={22} color="#CCC" />
          </View>
        )}

        {/* Info */}
        <View style={styles.infoPrato}>
          <Text style={styles.nomePrato} numberOfLines={1}>{item.nome}</Text>
          {item.categoria ? <Text style={styles.tagPrato}>{item.categoria}</Text> : null}
          <Text style={styles.precoPrato}>R$ {item.preco.toFixed(2).replace('.', ',')}</Text>
        </View>

        {/* Ações */}
        <View style={styles.acoesPrato}>
          {/* Switch disponibilidade */}
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: disponivel ? '#4CAF50' : '#E53935' }]}>
              {disponivel ? 'Disponível' : 'Indisponível'}
            </Text>
            <Switch
              value={disponivel}
              onValueChange={() => ctrl.toggleDisponibilidade(item.id, disponivel)}
              trackColor={{ false: '#FFCDD2', true: '#C8E6C9' }}
              thumbColor={disponivel ? '#4CAF50' : '#E53935'}
            />
          </View>

          <View style={styles.botoesAcao}>
            <TouchableOpacity style={styles.btnAcao} onPress={() => ctrl.editarProduto(item.id)}>
              <Ionicons name="pencil" size={18} color="#1565C0" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnAcao} onPress={() => ctrl.deletarProduto(item.id)}>
              <Ionicons name="trash" size={18} color="#D32F2F" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderRestaurante />

      <View style={styles.content}>

        {/* Voltar */}
        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.push('/home-restaurante-screen')}>
          <Ionicons name="arrow-back" size={20} color="#333" />
          <Text style={styles.btnVoltarTexto}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Meu Cardápio</Text>

        {/* Barra de busca */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar prato pelo nome..."
            value={ctrl.busca}
            onChangeText={ctrl.setBusca}
            placeholderTextColor="#AAA"
          />
          {ctrl.busca.length > 0 && (
            <TouchableOpacity onPress={() => ctrl.setBusca('')}>
              <Ionicons name="close-circle" size={20} color="#CCC" />
            </TouchableOpacity>
          )}
        </View>

        {ctrl.carregando ? (
          <ActivityIndicator size="large" color="#93BD57" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={ctrl.produtosFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={renderPrato}
            contentContainerStyle={styles.lista}
            ListEmptyComponent={
              <Text style={styles.textoVazio}>
                {ctrl.busca ? 'Nenhum prato encontrado.' : 'Você ainda não cadastrou nenhum prato.'}
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F4F6F8' },
  content: { flex: 1, padding: 24 },

  btnVoltar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  btnVoltarTexto: { fontSize: 14, color: '#333', marginLeft: 6, fontWeight: '500' },

  titulo: { fontSize: 26, fontWeight: 'bold', color: '#93BD57', marginBottom: 16 },

  // Busca
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },

  lista: { paddingBottom: 40 },

  // Card do prato
  cardPrato: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  cardIndisponivel: {
    opacity: 0.55,
    borderColor: '#FFCDD2',
  },

  // Foto
  fotoPrato: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
  },
  fotoPlaceholder: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },

  infoPrato: { flex: 1 },
  nomePrato: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  tagPrato: {
    fontSize: 11,
    color: '#93BD57',
    fontWeight: '600',
    marginTop: 2,
  },
  precoPrato: { fontSize: 15, fontWeight: 'bold', color: '#93BD57', marginTop: 2 },

  acoesPrato: { alignItems: 'flex-end', gap: 6 },
  switchContainer: { alignItems: 'center' },
  switchLabel: { fontSize: 10, fontWeight: '600', marginBottom: 2 },

  botoesAcao: { flexDirection: 'row', gap: 8 },
  btnAcao: {
    padding: 7,
    backgroundColor: '#F4F6F8',
    borderRadius: 8,
  },

  textoVazio: { textAlign: 'center', marginTop: 50, color: '#666', fontSize: 16 },
});