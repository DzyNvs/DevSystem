import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePagamentoController } from '../controllers/usePagamentoController';
import { HeaderConsumidor } from './HeaderConsumidor';

export function PagamentoScreen() {
  const ctrl = usePagamentoController();

  // Função para formatar os nomes das chaves do Firebase para a tela
  const formatarNomePagamento = (chave) => {
    const nomes = {
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      dinheiro: 'Dinheiro',
      pix: 'PIX',
      vale_alimentacao: 'Vale Alimentação',
      vale_refeicao: 'Vale Refeição'
    };
    return nomes[chave] || chave;
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderConsumidor />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backText}>Voltar para sacola</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Finalizar Pedido</Text>

        <View style={styles.cardResumo}>
          <Text style={styles.cardTitulo}>Resumo de Valores</Text>
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Subtotal</Text>
            <Text style={styles.resumoValor}>R$ {ctrl.subtotal.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Taxa de Entrega</Text>
            <Text style={styles.resumoValor}>R$ {ctrl.taxaEntrega.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.divisor} />
          <View style={styles.resumoRow}>
            <Text style={styles.resumoTotalLabel}>Total a Pagar</Text>
            <Text style={styles.resumoTotalValor}>R$ {ctrl.totalFinal.toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>

        {/* 👉 SEÇÃO DE ESCOLHA DE PAGAMENTO */}
        <Text style={styles.cardTitulo}>Como você quer pagar?</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, ctrl.tipoPagamento === 'online' && styles.tabActive]}
            onPress={() => ctrl.setTipoPagamento('online')}
          >
            <Ionicons name="phone-portrait-outline" size={20} color={ctrl.tipoPagamento === 'online' ? '#FFF' : '#555'} />
            <Text style={[styles.tabText, ctrl.tipoPagamento === 'online' && styles.tabTextActive]}>Pelo App</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, ctrl.tipoPagamento === 'entrega' && styles.tabActive]}
            onPress={() => ctrl.setTipoPagamento('entrega')}
          >
            <Ionicons name="home-outline" size={20} color={ctrl.tipoPagamento === 'entrega' ? '#FFF' : '#555'} />
            <Text style={[styles.tabText, ctrl.tipoPagamento === 'entrega' && styles.tabTextActive]}>Na Entrega</Text>
          </TouchableOpacity>
        </View>

        {/* 👉 OPÇÕES DE PAGAMENTO NA ENTREGA (Varrendo o Firebase) */}
        {ctrl.tipoPagamento === 'entrega' && (
          <View style={styles.entregaContainer}>
            {ctrl.carregandoOpcoes ? (
               <ActivityIndicator size="small" color="#2E7D32" />
            ) : Object.keys(ctrl.opcoesRestaurante).length === 0 ? (
               <Text style={styles.textAviso}>Restaurante não definiu opções de pagamento.</Text>
            ) : (
              Object.entries(ctrl.opcoesRestaurante).map(([chave, disponivel]) => {
                if (!disponivel) return null; // Pula os que estão false
                
                const selecionado = ctrl.formaPagamentoEntrega === chave;
                
                return (
                  <TouchableOpacity 
                    key={chave} 
                    style={[styles.btnFormaPagamento, selecionado && styles.btnFormaPagamentoAtivo]}
                    onPress={() => ctrl.setFormaPagamentoEntrega(chave)}
                  >
                    <Ionicons 
                      name={selecionado ? "radio-button-on" : "radio-button-off"} 
                      size={20} 
                      color={selecionado ? "#2E7D32" : "#999"} 
                    />
                    <Text style={[styles.textoFormaPagamento, selecionado && styles.textoFormaPagamentoAtivo]}>
                      {formatarNomePagamento(chave)}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* 👉 BOTÃO FINAL (Muda a cor dependendo da escolha) */}
        {ctrl.carregando ? (
          <ActivityIndicator size="large" color={ctrl.tipoPagamento === 'online' ? "#009EE3" : "#2E7D32"} style={{ marginTop: 40 }} />
        ) : (
          <TouchableOpacity 
            style={[
              styles.btnFinalizar, 
              { backgroundColor: ctrl.tipoPagamento === 'online' ? '#009EE3' : '#2E7D32' }
            ]} 
            onPress={ctrl.finalizarPedido}
          >
            <Ionicons 
              name={ctrl.tipoPagamento === 'online' ? "card" : "checkmark-circle"} 
              size={24} color="#FFF" style={{ marginRight: 10 }} 
            />
            <Text style={styles.btnFinalizarText}>
              {ctrl.tipoPagamento === 'online' ? 'Pagar com Mercado Pago' : 'Finalizar Pedido'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FAF9F2' },
  content: { flex: 1, padding: 30, maxWidth: 600, width: '100%', alignSelf: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { fontSize: 16, color: '#333', marginLeft: 8 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32', marginBottom: 20 },
  
  cardResumo: { backgroundColor: '#FFF', padding: 24, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 30 },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 16 },
  resumoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  resumoLabel: { fontSize: 16, color: '#555' },
  resumoValor: { fontSize: 16, color: '#333' },
  divisor: { height: 1, backgroundColor: '#EEE', marginVertical: 16 },
  resumoTotalLabel: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  resumoTotalValor: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32' },

  // Estilos das abas (Pelo App / Na Entrega)
  tabContainer: { flexDirection: 'row', backgroundColor: '#E0E0E0', borderRadius: 8, padding: 4, marginBottom: 20 },
  tab: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 6, gap: 8 },
  tabActive: { backgroundColor: '#2E7D32', elevation: 2 },
  tabText: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  tabTextActive: { color: '#FFF' },

  // Estilos da lista de pagamentos na entrega
  entregaContainer: { marginBottom: 20, backgroundColor: '#FFF', padding: 16, borderRadius: 12, elevation: 1 },
  textAviso: { color: '#777', textAlign: 'center', fontStyle: 'italic' },
  btnFormaPagamento: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', gap: 10 },
  btnFormaPagamentoAtivo: { backgroundColor: '#F1F8E9', borderRadius: 8, paddingHorizontal: 8 },
  textoFormaPagamento: { fontSize: 16, color: '#555' },
  textoFormaPagamentoAtivo: { color: '#2E7D32', fontWeight: 'bold' },

  btnFinalizar: { flexDirection: 'row', height: 56, borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 2, marginBottom: 40 },
  btnFinalizarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});