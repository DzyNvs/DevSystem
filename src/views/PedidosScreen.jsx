import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../config/api.js';
import { usePedidosController } from '../controllers/usePedidosController';
import { HeaderRestaurante } from './HeaderRestaurante';

const { width } = Dimensions.get('window');
const gap = 16;
const paddingHorizontal = 20;
const cardWidth = (width - (paddingHorizontal * 2) - (gap * 4)) / 5;

export function PedidosScreen() {
  const ctrl = usePedidosController();
  const router = useRouter();

  const [abaAtiva, setAbaAtiva] = useState('pendente');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [processando, setProcessando] = useState(false);

  const abas = [
    { id: 'pendente', nome: 'Aguardando' },
    { id: 'confirmado', nome: 'Confirmado' },
    { id: 'preparando', nome: 'Em Preparo' },
    { id: 'saiu_entrega', nome: 'Em envio' },
    { id: 'entregue', nome: 'Finalizado' },
    { id: 'recusado', nome: 'Recusados' },
    { id: 'todos', nome: 'Todos os pedidos' },
  ];

  const formatarStatus = (status) => {
    switch (status) {
      case 'pendente': return { texto: 'Aguardando', cor: '#E65100', fundo: '#FFF3E0' };
      case 'confirmado': return { texto: 'Confirmado', cor: '#1565C0', fundo: '#E3F2FD' };
      case 'preparando': return { texto: 'Em Preparo', cor: '#E65100', fundo: '#FFF3E0' };
      case 'saiu_entrega': return { texto: 'Em Envio', cor: '#E65100', fundo: '#FFF3E0' };
      case 'entregue': return { texto: 'Finalizado', cor: '#2E7D32', fundo: '#E8F5E9' };
      case 'recusado': return { texto: 'Recusado', cor: '#C62828', fundo: '#FFEBEE' };
      default: return { texto: status, cor: '#777', fundo: '#EEE' };
    }
  };

  const pedidosFiltrados = ctrl.pedidos.filter(pedido => {
    if (abaAtiva === 'todos') return true;
    return pedido.status === abaAtiva;
  });

  const abrirModalFinalizar = (pedido) => {
    setPedidoSelecionado(pedido);
    setCodigoDigitado('');
    setModalVisivel(true);
  };

  const confirmarFinalizacao = async () => {
    // 1. Validação do código com aviso de erro
    if (codigoDigitado.trim() !== pedidoSelecionado.codigo_entrega) {
      return Alert.alert(
        "Código Inválido", 
        "O código digitado não confere com o código de segurança do cliente. Solicite o código correto ao entregador/cliente."
      );
    }

    setProcessando(true);
    try {
      // 2. Só muda para 'entregue' se o código acima for válido
      await ctrl.alterarStatus(pedidoSelecionado.id, 'entregue');

      try {
        await fetch(`${API_URL}/enviar-nota-fiscal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: pedidoSelecionado.email_consumidor || 'cliente@email.com',
            itens: pedidoSelecionado.itens,
            subtotal: pedidoSelecionado.subtotal,
            taxaEntrega: pedidoSelecionado.taxa_entrega,
            totalFinal: pedidoSelecionado.total_final,
            idPedido: pedidoSelecionado.id
          })
        });
      } catch (errEmail) {
        console.error("Erro ao enviar nota fiscal:", errEmail);
      }

      setModalVisivel(false);
      Alert.alert("Sucesso", "Pedido validado e finalizado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao tentar finalizar o pedido no servidor.");
    } finally {
      setProcessando(false);
    }
  };

  const renderPedido = ({ item }) => {
    const statusFormatado = formatarStatus(item.status);

    return (
      <View style={styles.cardPedido}>
        <View style={styles.cardHeader}>
          <Text style={styles.idPedido}>Pedido #{item.id?.substring(0, 6).toUpperCase()}</Text>
          <View style={styles.headerAcoes}>
            <View style={[styles.badgeStatus, { backgroundColor: statusFormatado.fundo }]}>
              <Text style={[styles.textoStatus, { color: statusFormatado.cor }]}>{statusFormatado.texto}</Text>
            </View>
            {item.status !== 'entregue' && item.status !== 'recusado' && (
              <TouchableOpacity style={styles.btnTresPontos} onPress={() => abrirModalFinalizar(item)}>
                <Ionicons name="ellipsis-vertical" size={20} color="#555" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.textoDetalhe}>
          Pagamento: <Text style={styles.textoBold}>{item.forma_pagamento?.toUpperCase() || 'NÃO INFORMADO'}</Text>
        </Text>
        <Text style={styles.textoDetalhe}>
          Entregador Cód: <Text style={styles.textoBold}>{item.entregador_codigo || 'Aguardando'}</Text>
        </Text>

        <View style={styles.comandaContainer}>
          <Text style={styles.comandaTitulo}>COMANDA DE ITENS</Text>
          <View style={styles.comandaDivisor} />
          {item.itens?.map((produto, index) => (
            <View key={index} style={styles.comandaItem}>
              <Text style={styles.comandaItemQtd}>{produto.qtd}x</Text>
              <Text style={styles.comandaItemNome}>{produto.nome}</Text>
              <Text style={styles.comandaItemPreco}>
                R$ {(produto.preco * produto.qtd).toFixed(2).replace('.', ',')}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.textoDetalhe}>Total: </Text>
          <Text style={styles.textoTotal}>R$ {item.total_final?.toFixed(2).replace('.', ',')}</Text>
        </View>

        <View style={styles.acoesContainer}>
          {item.status === 'pendente' && (
            <>
              <TouchableOpacity style={[styles.btnAcao, styles.btnRecusar]} onPress={() => ctrl.alterarStatus(item.id, 'recusado')}>
                <Text style={styles.txtBtnBranco}>Recusar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnAcao, styles.btnPadrao]} onPress={() => ctrl.alterarStatus(item.id, 'confirmado')}>
                <Text style={styles.txtBtnBranco}>Aceitar</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'confirmado' && (
            <TouchableOpacity style={[styles.btnAcao, styles.btnPadrao]} onPress={() => ctrl.alterarStatus(item.id, 'preparando')}>
              <Text style={styles.txtBtnBranco}>Mandar para Preparo</Text>
            </TouchableOpacity>
          )}

          {item.status === 'preparando' && (
            <TouchableOpacity style={[styles.btnAcao, styles.btnPadrao]} onPress={() => ctrl.alterarStatus(item.id, 'saiu_entrega')}>
              <Text style={styles.txtBtnBranco}>Despachar</Text>
            </TouchableOpacity>
          )}

          {/* 👉 MODIFICAÇÃO AQUI: Agora ele abre o modal em vez de finalizar direto */}
          {item.status === 'saiu_entrega' && (
            <TouchableOpacity 
              style={[styles.btnAcao, styles.btnPadrao]} 
              onPress={() => abrirModalFinalizar(item)}
            >
              <Text style={styles.txtBtnBranco}>Finalizar Pedido</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderRestaurante />
      <View style={styles.content}>
        <View style={styles.headerTitleContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={26} color="#333" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Gestão de Pedidos</Text>
        </View>

        <View style={styles.abasContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {abas.map((aba) => (
              <TouchableOpacity
                key={aba.id}
                style={[styles.abaBtn, abaAtiva === aba.id && styles.abaAtiva]}
                onPress={() => setAbaAtiva(aba.id)}
              >
                <Text style={[styles.abaTexto, abaAtiva === aba.id && styles.abaTextoAtivo]}>{aba.nome}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {ctrl.carregando ? (
          <ActivityIndicator size="large" color="#93BD57" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={pedidosFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={renderPedido}
            numColumns={5}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.lista}
            ListEmptyComponent={<Text style={styles.textoVazio}>Nenhum pedido nesta aba.</Text>}
          />
        )}
      </View>

      <Modal visible={modalVisivel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="shield-checkmark" size={40} color="#2E7D32" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitulo}>Finalizar Pedido</Text>
            <Text style={styles.modalSub}>
              Insira o código de 4 dígitos informado pelo cliente para concluir a entrega.
            </Text>

            <TextInput
              style={styles.inputCodigo}
              placeholder="0000"
              keyboardType="numeric"
              maxLength={4}
              value={codigoDigitado}
              onChangeText={setCodigoDigitado}
              editable={!processando}
            />

            <View style={styles.modalBotoes}>
              {/* Opção de voltar/cancelar */}
              <TouchableOpacity 
                style={styles.btnModalCancel} 
                onPress={() => setModalVisivel(false)}
                disabled={processando}
              >
                <Text style={styles.txtBtnModalColor}>Voltar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.btnModalConfirm, codigoDigitado.length < 4 && { backgroundColor: '#A5D6A7' }]} 
                onPress={confirmarFinalizacao}
                disabled={codigoDigitado.length < 4 || processando}
              >
                {processando ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.txtBtnModal}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1, paddingTop: 15 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 20 },
  botaoVoltar: { marginRight: 15, padding: 4 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  abasContainer: { borderBottomWidth: 1, borderBottomColor: '#EAEAEA', paddingBottom: 10, paddingHorizontal: 20, marginBottom: 15 },
  abaBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
  abaAtiva: { backgroundColor: '#93BD57', borderColor: '#93BD57' },
  abaTexto: { fontSize: 14, fontWeight: 'bold', color: '#666' },
  abaTextoAtivo: { color: '#FFF' },
  lista: { paddingBottom: 40, paddingHorizontal: 20 },
  columnWrapper: { justifyContent: 'flex-start', gap: gap },
  cardPedido: { width: cardWidth, backgroundColor: '#FFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA', marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerAcoes: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnTresPontos: { padding: 4 },
  idPedido: { fontSize: 13, fontWeight: 'bold', color: '#111' },
  badgeStatus: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  textoStatus: { fontSize: 9, fontWeight: 'bold' },
  textoDetalhe: { fontSize: 12, color: '#555', marginBottom: 2 },
  textoBold: { fontWeight: 'bold', color: '#333' },
  comandaContainer: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 8, marginVertical: 10, minHeight: 90 },
  comandaTitulo: { fontSize: 10, fontWeight: 'bold', color: '#777', textAlign: 'center', letterSpacing: 1 },
  comandaDivisor: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 6 },
  comandaItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  comandaItemQtd: { fontSize: 12, fontWeight: 'bold', color: '#333', width: 22 },
  comandaItemNome: { flex: 1, fontSize: 12, color: '#444', paddingRight: 5 },
  comandaItemPreco: { fontSize: 12, fontWeight: '500', color: '#333' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EAEAEA' },
  textoTotal: { fontSize: 15, fontWeight: 'bold', color: '#2e7d32' },
  textoVazio: { textAlign: 'center', marginTop: 50, color: '#777', fontSize: 16 },
  acoesContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 6 },
  btnAcao: { paddingVertical: 8, paddingHorizontal: 4, borderRadius: 8, flex: 1, alignItems: 'center' },
  btnRecusar: { backgroundColor: '#D32F2F' }, 
  btnPadrao: { backgroundColor: '#93BD57' },
  txtBtnBranco: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 350, backgroundColor: '#FFF', padding: 24, borderRadius: 16, alignItems: 'center', elevation: 5 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  modalSub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  inputCodigo: { width: '100%', backgroundColor: '#F5F5F5', borderRadius: 8, padding: 15, fontSize: 28, fontWeight: 'bold', textAlign: 'center', letterSpacing: 8, marginBottom: 20, color: '#111' },
  modalBotoes: { flexDirection: 'row', width: '100%', gap: 12 },
  btnModalCancel: { flex: 1, paddingVertical: 14, backgroundColor: '#E0E0E0', borderRadius: 8, alignItems: 'center' },
  btnModalConfirm: { flex: 1, paddingVertical: 14, backgroundColor: '#2E7D32', borderRadius: 8, alignItems: 'center' },
  txtBtnModal: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  txtBtnModalColor: { color: '#333', fontSize: 16, fontWeight: 'bold' }
});