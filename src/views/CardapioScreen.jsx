import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCardapioController } from '../controllers/useCardapioController';
import { HeaderRestaurante } from './HeaderRestaurante';

export function CardapioScreen() {
  const ctrl = useCardapioController();
  const router = useRouter();

  const renderPrato = ({ item }) => (
    <View style={styles.cardPrato}>
      <View style={styles.infoPrato}>
        <Text style={styles.nomePrato}>{item.nome}</Text>
        <Text style={styles.categoriaPrato}>{item.categoria}</Text>
        <Text style={styles.precoPrato}>R$ {item.preco.toFixed(2).replace('.', ',')}</Text>
      </View>

      <View style={styles.acoesPrato}>
        <TouchableOpacity style={styles.btnAcao} onPress={() => ctrl.editarProduto(item.id)}>
          <Ionicons name="pencil" size={20} color="#1565C0" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.btnAcao} onPress={() => ctrl.deletarProduto(item.id)}>
          <Ionicons name="trash" size={20} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <HeaderRestaurante />

      <View style={styles.content}>
        
        {/* Botão Voltar */}
        <TouchableOpacity 
          style={styles.btnVoltar} 
          onPress={() => router.push('/home-restaurante-screen')}
        >
          <Ionicons name="arrow-back" size={20} color="#005F02" />
          <Text style={styles.btnVoltarTexto}>Voltar para Home</Text>
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text style={styles.titulo}>Meu Cardápio</Text>
          <TouchableOpacity style={styles.btnNovo} onPress={ctrl.irParaNovoPrato}>
            <Text style={styles.btnNovoText}>+ Novo Prato</Text>
          </TouchableOpacity>
        </View>

        {ctrl.carregando ? (
          <ActivityIndicator size="large" color="#005F02" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={ctrl.produtos}
            keyExtractor={(item) => item.id}
            renderItem={renderPrato}
            contentContainerStyle={styles.lista}
            ListEmptyComponent={
              <Text style={styles.textoVazio}>Você ainda não cadastrou nenhum prato.</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F7F6F2' },
  content: { flex: 1, padding: 24 },
  
  // Estilos do Botão Voltar 
  btnVoltar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15, 
    alignSelf: 'flex-start',
  },
  btnVoltarTexto: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: '#005F02',
    marginLeft: 5,
    fontWeight: '500',
  },

  headerTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  
  titulo: { 
    fontFamily: 'Nunito',
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#005F02' 
  },
  
  btnNovo: { 
    backgroundColor: '#005F02', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 8 
  },
  btnNovoText: { 
    fontFamily: 'Nunito',
    color: '#FFF', 
    fontWeight: 'bold' 
  },
  
  lista: { paddingBottom: 40 },
  
  cardPrato: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1, 
    borderColor: '#EAEAEA'
  },
  
  infoPrato: { flex: 1 },
  nomePrato: { 
    fontFamily: 'Nunito',
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  categoriaPrato: { 
    fontFamily: 'Nunito',
    fontSize: 12, 
    color: '#666', 
    marginBottom: 4 
  },
  
  // Preço com o verde escuro
  precoPrato: { 
    fontFamily: 'Nunito',
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#005F02' 
  },
  
  acoesPrato: { flexDirection: 'row', gap: 12 },
  btnAcao: { 
    padding: 8, 
    backgroundColor: '#F7F6F2', 
    borderRadius: 8 
  },
  textoVazio: { 
    fontFamily: 'Nunito',
    textAlign: 'center', 
    marginTop: 50, 
    color: '#666', 
    fontSize: 16 
  }
});