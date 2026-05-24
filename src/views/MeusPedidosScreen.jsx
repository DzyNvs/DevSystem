import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMeusPedidosController } from '../controllers/useMeusPedidosController';

function Estrelas({ nota, onSelect, desabilitado }) {
  return (
    <View style={estilosEstrelas.row}>
      {[1, 2, 3, 4, 5].map((estrela) => (
        <TouchableOpacity
          key={estrela}
          onPress={() => !desabilitado && onSelect(estrela)}
          disabled={desabilitado}
          style={estilosEstrelas.estrela}
        >
          <Ionicons
            name={estrela <= nota ? 'star' : 'star-outline'}
            size={28}
            color={estrela <= nota ? '#FFC107' : '#CCC'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const estilosEstrelas = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, marginTop: 8 },
  estrela: { padding: 4 },
});

export function MeusPedidosScreen() {
  const ctrl = useMeusPedidosController();
  const router = useRouter();

  const [abaAtiva, setAbaAtiva] = useState('andamento');
  const [notaSelecionada, setNotaSelecionada] = useState({});   // { [idPedido]: nota }
  const [comentarios, setComentarios] = useState({});           // { [idPedido]: texto }

  const formatarData = (timestamp) => {
    if (!timestamp) return '';
    const data = timestamp.toDate();
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarStatus = (status) => {
    switch (status) {
      case 'pendente':     return { texto: 'Aguardando',        cor: '#E65100', fundo: '#FFF3E0' };
      case 'confirmado':   return { texto: 'Confirmado',        cor: '#1565C0', fundo: '#E3F2FD' };
      case 'preparando':   return { texto: 'Preparando',        cor: '#6A1B9A', fundo: '#F3E5F5' };
      case 'saiu_entrega': return { texto: 'Saiu para Entrega', cor: '#0277BD', fundo: '#E1F5FE' };
      case 'entregue':     return { texto: 'Entregue',          cor: '#2E7D32', fundo: '#E8F5E9' };
      case 'recusado':
      case 'cancelado':    return { texto: 'Cancelado',         cor: '#C62828', fundo: '#FFEBEE' };
      default:             return { texto: status,              cor: '#777',    fundo: '#EEE'    };
    }
  };

  const pedidosExibidos = ctrl.pedidos.filter(pedido => {
    if (abaAtiva === 'andamento') {
      return ['pendente', 'confirmado', 'preparando', 'saiu_entrega'].includes(pedido.status);
    } else {
      return ['entregue', 'recusado', 'cancelado'].includes(pedido.status);
    }
  });

  const handleConfirmarAvaliacao = (idPedido) => {
    const nota = notaSelecionada[idPedido];
    if (!nota) {
      alert('Selecione uma nota antes de confirmar!');
      return;
    }
    const comentario = comentarios[idPedido] || '';
    ctrl.enviarAvaliacao(idPedido, nota, comentario);
  };

  const renderItem = ({ item }) => {
    const statusFormatado = formatarStatus(item.status);
    const jaAvaliado = item.avaliado;
    const estaAvaliando = ctrl.avaliandoId === item.id;
    const notaAtual = notaSelecionada[item.id] || 0;
    const comentarioAtual = comentarios[item.id] || '';

    // SOLUÇÃO: Verificando se é Web ou Celular para disparar o aviso
    const handleCancelar = () => {
      if (Platform.OS === 'web') {
        const confirmou = window.confirm("Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.");
        if (confirmou) {
          ctrl.cancelarPedido(item.id);
        }
      } else {
        Alert.alert(
          "Cancelar Pedido",
          "Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.",
          [
            { text: "Não, manter", style: "cancel" },
            { 
              text: "Sim, Cancelar", 
              onPress: () => ctrl.cancelarPedido(item.id),
              style: "destructive"
            }
          ]
        );
      }
    };

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (abaAtiva === 'andamento') {
              router.push({ pathname: '/acompanhamento', params: { idPedido: item.id } });
            }
          }}
        >
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
        </TouchableOpacity>

        {item.status === 'pendente' && (
          <TouchableOpacity style={styles.btnCancelar} onPress={handleCancelar}>
            <Ionicons name="close-circle-outline" size={20} color="#C62828" />
            <Text style={styles.btnCancelarTexto}>Cancelar Pedido</Text>
          </TouchableOpacity>
        )}

        {item.status === 'entregue' && (
          <>
            <View style={styles.divisor} />

            {jaAvaliado ? (
              <View>
                <View style={styles.avaliadoContainer}>
                  <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                  <Text style={styles.avaliadoTexto}>Avaliado — você ganhou </Text>
                  <Ionicons name="logo-bitcoin" size={16} color="#FFC107" />
                  <Text style={styles.fitCoinsTextoAmarelo}> 30 FitCoins</Text>
                </View>
                {item.comentario_avaliacao ? (
                  <Text style={styles.comentarioSalvo}>"{item.comentario_avaliacao}"</Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.avaliacaoContainer}>
                <Text style={styles.avaliacaoTitulo}>Como foi o seu pedido?</Text>

                <Estrelas
                  nota={notaAtual}
                  onSelect={(nota) => setNotaSelecionada(prev => ({ ...prev, [item.id]: nota }))}
                  desabilitado={estaAvaliando}
                />

                {notaAtual > 0 && (
                  <TextInput
                    style={styles.inputComentario}
                    placeholder="Deixe um comentário (opcional)..."
                    placeholderTextColor="#AAA"
                    value={comentarioAtual}
                    onChangeText={(texto) => setComentarios(prev => ({ ...prev, [item.id]: texto }))}
                    multiline
                    numberOfLines={3}
                    maxLength={300}
                    editable={!estaAvaliando}
                  />
                )}

                {notaAtual > 0 && (
                  <TouchableOpacity
                    style={styles.btnAvaliar}
                    onPress={() => handleConfirmarAvaliacao(item.id)}
                    disabled={estaAvaliando}
                  >
                    {estaAvaliando ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="logo-bitcoin" size={16} color="#FFF" />
                        <Text style={styles.btnAvaliarTexto}>Confirmar e ganhar 30 FitCoins</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>

        <View style={styles.headerTitleContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Meus Pedidos</Text>
        </View>

        <View style={styles.fitCoinsBanner}>
          <View style={styles.fitCoinsEsquerda}>
            <Ionicons name="logo-bitcoin" size={28} color="#FFC107" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.fitCoinsSaldo}>{ctrl.fitCoins} FitCoins</Text>
              <Text style={styles.fitCoinsSubtitulo}>
                {ctrl.descontoDisponivel > 0
                  ? `🎉 Você tem ${ctrl.descontoDisponivel}% de desconto disponível!`
                  : `Faltam ${100 - (ctrl.fitCoins % 100)} moedas para 15% de desconto`}
              </Text>
            </View>
          </View>
          <View style={styles.progressoFundo}>
            <View style={[styles.progressoBarra, { width: `${Math.min(ctrl.fitCoins % 100, 100)}%` }]} />
          </View>
        </View>

        <View style={styles.abasContainer}>
          <TouchableOpacity
            style={[styles.abaBtn, abaAtiva === 'andamento' && styles.abaBtnAtiva]}
            onPress={() => setAbaAtiva('andamento')}
          >
            <Text style={[styles.abaTexto, abaAtiva === 'andamento' && styles.abaTextoAtiva]}>Em andamento</Text>
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
            ListEmptyComponent={
              <View style={styles.vazioContainer}>
                <Ionicons name="receipt-outline" size={60} color="#CCC" />
                <Text style={styles.vazioText}>Nenhum pedido encontrado nesta aba.</Text>
              </View>
            }
          />
        )}
      </View>

      {ctrl.toastVisivel && (
        <View style={styles.toast}>
          <Ionicons name="logo-bitcoin" size={20} color="#FFC107" />
          <Text style={styles.toastTexto}>+30 FitCoins adicionados! 🎉</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F2' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  botaoVoltar: { marginRight: 15, padding: 4 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32' },

  fitCoinsBanner: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  fitCoinsEsquerda: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  fitCoinsSaldo: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  fitCoinsSubtitulo: { fontSize: 13, color: '#555', marginTop: 2 },
  progressoFundo: { height: 8, backgroundColor: '#EEE', borderRadius: 4, overflow: 'hidden' },
  progressoBarra: { height: '100%', backgroundColor: '#FFC107', borderRadius: 4 },

  abasContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#E8F5E9', borderRadius: 8, padding: 4 },
  abaBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  abaBtnAtiva: { backgroundColor: '#2E7D32', elevation: 3 },
  abaTexto: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32' },
  abaTextoAtiva: { color: '#FFF' },

  lista: { paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  data: { fontSize: 14, color: '#777', fontWeight: 'bold' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  divisor: { height: 1, backgroundColor: '#EEE', marginBottom: 12, marginTop: 4 },
  itensResumo: { fontSize: 15, color: '#333', marginBottom: 16, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#555' },
  totalValor: { fontSize: 18, fontWeight: 'bold', color: '#111' },

  btnCancelar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF9A9A',
  },
  btnCancelarTexto: {
    color: '#C62828',
    fontWeight: 'bold',
    fontSize: 14,
  },

  avaliacaoContainer: { marginTop: 8 },
  avaliacaoTitulo: { fontSize: 15, fontWeight: 'bold', color: '#333' },

  inputComentario: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
    minHeight: 80,
  },

  btnAvaliar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: '#2E7D32', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  btnAvaliarTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  avaliadoContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  avaliadoTexto: { fontSize: 14, color: '#555' },
  fitCoinsTextoAmarelo: { fontSize: 14, fontWeight: 'bold', color: '#FFC107' },
  comentarioSalvo: { marginTop: 6, fontSize: 13, color: '#777', fontStyle: 'italic' },

  toast: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: '#1B5E20', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, elevation: 6 },
  toastTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  vazioContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  vazioText: { fontSize: 16, color: '#999', marginTop: 16, textAlign: 'center' },
});