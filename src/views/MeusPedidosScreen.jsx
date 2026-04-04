import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 👉 Importamos o router aqui
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // 👉 Adicionamos TouchableOpacity
import { useMeusPedidosController } from '../controllers/useMeusPedidosController';
import { HeaderConsumidor } from './HeaderConsumidor';

export function MeusPedidosScreen() {
  const ctrl = useMeusPedidosController();
  const router = useRouter(); // 👉 Inicializamos o router

  const formatarData = (timestamp) => {
    if (!timestamp) return '';
    const data = timestamp.toDate();
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const traduzirStatus = (status) => {
    const mapa = {
      pendente: 'Aguardando',
      preparando: 'Preparando',
      saiu_entrega: 'Saiu para Entrega',
      entregue: 'Entregue',
      cancelado: 'Cancelado'
    };
    return mapa[status] || status;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.data}>{formatarData(item.data_criacao)}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{traduzirStatus(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.divisor} />
      
      <Text style={styles.itensResumo} numberOfLines={2}>
        {item.itens.map(i => `${i.qtd}x ${i.nome}`).join(', ')}
      </Text>
      
      <View style={styles.cardFooter}>
        <Text style={styles.totalLabel}>Total pago:</Text>
        <Text style={styles.totalValor}>R$ {item.total_final?.toFixed(2).replace('.', ',')}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderConsumidor />
      
      <View style={styles.content}>
        
        {/* 👉 NOVO CABEÇALHO COM BOTÃO DE VOLTAR */}
        <View style={styles.headerTitleContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={26} color="#333" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Meus Pedidos</Text>
        </View>

        {ctrl.carregando ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={ctrl.pedidos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.vazioContainer}>
                <Ionicons name="receipt-outline" size={64} color="#CCC" />
                <Text style={styles.vazioText}>Você ainda não fez nenhum pedido.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F2' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  
  // 👉 Estilos adicionados para o botão de voltar
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  botaoVoltar: { marginRight: 15, padding: 4 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32' },
  
  lista: { paddingBottom: 100 }, 
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  data: { fontSize: 14, color: '#777', fontWeight: 'bold' },
  badge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' },
  divisor: { height: 1, backgroundColor: '#EEE', marginBottom: 12 },
  itensResumo: { fontSize: 15, color: '#333', marginBottom: 16, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#555' },
  totalValor: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  vazioContainer: { alignItems: 'center', marginTop: 60 },
  vazioText: { fontSize: 16, color: '#999', marginTop: 16 }
});