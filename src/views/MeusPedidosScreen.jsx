import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react'; // 👉 Importamos o useState para as abas
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMeusPedidosController } from '../controllers/useMeusPedidosController';
import { HeaderConsumidor } from './HeaderConsumidor';

export function MeusPedidosScreen() {
  const ctrl = useMeusPedidosController();
  const router = useRouter();

  // 👉 Estado para controlar a aba selecionada (padrão: em andamento)
  const [abaAtiva, setAbaAtiva] = useState('andamento');

  const formatarData = (timestamp) => {
    if (!timestamp) return '';
    const data = timestamp.toDate();
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // 👉 Deixei a etiqueta de status colorida igual a do restaurante!
  const formatarStatus = (status) => {
    switch (status) {
      case 'pendente': return { texto: 'Aguardando', cor: '#E65100', fundo: '#FFF3E0' };
      case 'confirmado': return { texto: 'Confirmado', cor: '#1565C0', fundo: '#E3F2FD' };
      case 'preparando': return { texto: 'Preparando', cor: '#6A1B9A', fundo: '#F3E5F5' };
      case 'saiu_entrega': return { texto: 'Saiu para Entrega', cor: '#0277BD', fundo: '#E1F5FE' };
      case 'entregue': return { texto: 'Entregue', cor: '#2E7D32', fundo: '#E8F5E9' };
      case 'recusado':
      case 'cancelado': return { texto: 'Cancelado', cor: '#C62828', fundo: '#FFEBEE' };
      default: return { texto: status, cor: '#777', fundo: '#EEE' };
    }
  };

  // 👉 Lógica de filtragem baseada na aba
  const pedidosExibidos = ctrl.pedidos.filter(pedido => {
    if (abaAtiva === 'andamento') {
      // Aparece na primeira aba se NÃO estiver finalizado ou cancelado
      return ['pendente', 'confirmado', 'preparando', 'saiu_entrega'].includes(pedido.status);
    } else {
      // Aparece na aba de Histórico se já acabou
      return ['entregue', 'recusado', 'cancelado'].includes(pedido.status);
    }
  });

  const renderItem = ({ item }) => {
    const statusFormatado = formatarStatus(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.data}>{formatarData(item.data_criacao)}</Text>
          <View style={[styles.badge, { backgroundColor: statusFormatado.fundo }]}>
            <Text style={[styles.badgeText, { color: statusFormatado.cor }]}>{statusFormatado.texto}</Text>
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
  };

  return (
    <View style={styles.container}>
      <HeaderConsumidor />
      
      <View style={styles.content}>
        
        <View style={styles.headerTitleContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={26} color="#333" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Meus Pedidos</Text>
        </View>

        {/* 👉 NAVEGAÇÃO POR ABAS */}
        <View style={styles.abasContainer}>
          <TouchableOpacity 
            style={[styles.abaBtn, abaAtiva === 'andamento' && styles.abaBtnAtiva]} 
            onPress={() => setAbaAtiva('andamento')}
          >
            <Text style={[styles.abaTexto, abaAtiva === 'andamento' && styles.abaTextoAtiva]}>Em Andamento</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.abaBtn, abaAtiva === 'historico' && styles.abaBtnAtiva]} 
            onPress={() => setAbaAtiva('historico')}
          >
            <Text style={[styles.abaTexto, abaAtiva === 'historico' && styles.abaTextoAtiva]}>Histórico</Text>
          </TouchableOpacity>
        </View>

        {ctrl.carregando ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={pedidosExibidos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.vazioContainer}>
                <Ionicons name="receipt-outline" size={64} color="#CCC" />
                <Text style={styles.vazioText}>
                  {abaAtiva === 'andamento' 
                    ? 'Você não tem nenhum pedido em andamento.' 
                    : 'Seu histórico de pedidos está vazio.'}
                </Text>
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
  
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  botaoVoltar: { marginRight: 15, padding: 4 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32' },

  // 👉 Estilos das Abas
  abasContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#E8F5E9', borderRadius: 8, padding: 4 },
  abaBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  abaBtnAtiva: { backgroundColor: '#2E7D32', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  abaTexto: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32' },
  abaTextoAtiva: { color: '#FFF' },
  
  lista: { paddingBottom: 100 }, 
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  data: { fontSize: 14, color: '#777', fontWeight: 'bold' },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  
  divisor: { height: 1, backgroundColor: '#EEE', marginBottom: 12 },
  itensResumo: { fontSize: 15, color: '#333', marginBottom: 16, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#555' },
  totalValor: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  
  vazioContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  vazioText: { fontSize: 16, color: '#999', marginTop: 16, textAlign: 'center' }
});