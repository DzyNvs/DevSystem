import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert } from 'react-native';
import { usePedidosController } from '../controllers/usePedidosController';
import { HeaderRestaurante } from './HeaderRestaurante';
import { API_URL } from '../config/api.js'; // 👉 Adicionei a API para mandar a nota fiscal daqui também

export function PedidosScreen() {
  const ctrl = usePedidosController();
  const router = useRouter();

  // 👉 Estados das abas
  const [abaAtiva, setAbaAtiva] = useState('pendente');

  // 👉 Estados do Modal de Finalização (Três pontinhos)
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
      case 'preparando': return { texto: 'Em Preparo', cor: '#6A1B9A', fundo: '#F3E5F5' };
      case 'saiu_entrega': return { texto: 'Em Envio', cor: '#0277BD', fundo: '#E1F5FE' };
      case 'entregue': return { texto: 'Finalizado', cor: '#2E7D32', fundo: '#E8F5E9' };
      case 'recusado': return { texto: 'Recusado', cor: '#C62828', fundo: '#FFEBEE' };
      default: return { texto: status, cor: '#777', fundo: '#EEE' };
    }
  };

  const pedidosFiltrados = ctrl.pedidos.filter(pedido => {
    if (abaAtiva === 'todos') return true;
    return pedido.status === abaAtiva;
  });

  // 👉 Lógica para abrir o modal
  const abrirModalFinalizar = (pedido) => {
    setPedidoSelecionado(pedido);
    setCodigoDigitado('');
    setModalVisivel(true);
  };

  // 👉 Lógica para validar o código e finalizar
  const confirmarFinalizacao = async () => {
    if (codigoDigitado.trim() !== pedidoSelecionado.codigo_entrega) {
      return Alert.alert("Código Inválido", "O código não confere com o do cliente.");
    }

    setProcessando(true);
    try {
      // Muda o status usando o controller que você já tem
      await ctrl.alterarStatus(pedidoSelecionado.id, 'entregue');

      // Dispara a nota fiscal por e-mail (igual o motoboy faz)
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
      Alert.alert("Sucesso", "Pedido finalizado pelo restaurante!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível finalizar o pedido.");
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
          
          {/* 👉 Agrupei o status com os três pontinhos */}
          <View style={styles.headerAcoes}>
            <View style={[styles.badgeStatus, { backgroundColor: statusFormatado.fundo }]}>
              <Text style={[styles.textoStatus, { color: statusFormatado.cor }]}>{statusFormatado.texto}</Text>
            </View>
            
            {/* Só mostra os 3 pontinhos se o pedido não estiver finalizado/recusado */}
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
          {item.itens && item.itens.length > 0 ? (
            item.itens.map((produto, index) => (
              <View key={index} style={styles.comandaItem}>
                <Text style={styles.comandaItemQtd}>{produto.qtd}x</Text>
                <Text style={styles.comandaItemNome}>{produto.nome}</Text>
                <Text style={styles.comandaItemPreco}>
                  R$ {(produto.preco * produto.qtd).toFixed(2).replace('.', ',')}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.textoDetalhe}>Nenhum item encontrado.</Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.textoDetalhe}>Total: </Text>
          <Text style={styles.textoTotal}>R$ {item.total_final?.toFixed(2).replace('.', ',')}</Text>
        </View>

        {/* 👉 BOTÕES DE AÇÃO INFERIORES */}
        <View style={styles.acoesContainer}>
          {item.status === 'pendente' && (
            <>
              <TouchableOpacity style={[styles.btnAcao, styles.btnRecusar]} onPress={() => ctrl.alterarStatus(item.id, 'recusado')}>
                <Text style={styles.txtBtnBranco}>Recusar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnAcao, styles.btnAceitar]} onPress={() => ctrl.alterarStatus(item.id, 'confirmado')}>
                <Text style={styles.txtBtnBranco}>Aceitar Pedido</Text>
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
              <Text style={styles.txtBtnBranco}>Despachar / Saiu Entrega</Text>
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
                <Text style={[styles.abaTexto, abaAtiva === aba.id && styles.abaTextoAtivo]}>
                  {aba.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {ctrl.carregando ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={pedidosFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={renderPedido}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.textoVazio}>Nenhum pedido nesta aba.</Text>}
          />
        )}
      </View>

      {/* 👉 MODAL DE FINALIZAÇÃO */}
      <Modal visible={modalVisivel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="shield-checkmark" size={40} color="#2E7D32" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitulo}>Finalizar Pedido</Text>
            <Text style={styles.modalSub}>
              Insira o código de 4 dígitos informado pelo cliente para concluir a entrega/retirada.
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
              <TouchableOpacity 
                style={styles.btnModalCancel} 
                onPress={() => setModalVisivel(false)}
                disabled={processando}
              >
                <Text style={styles.txtBtnModal}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.btnModalConfirm, codigoDigitado.length < 4 && { backgroundColor: '#A5D6A7' }]} 
                onPress={confirmarFinalizacao}
                disabled={codigoDigitado.length < 4 || processando}
              >
                {processando ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.txtBtnModal}>Validar</Text>
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
  mainContainer: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { flex: 1, paddingTop: 15 },
  
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 20 },
  botaoVoltar: { marginRight: 15, padding: 4 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  
  abasContainer: { borderBottomWidth: 1, borderBottomColor: '#DDD', paddingBottom: 10, paddingHorizontal: 20, marginBottom: 15 },
  abaBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#EEE', marginRight: 10 },
  abaAtiva: { backgroundColor: '#2E7D32' },
  abaTexto: { fontSize: 14, fontWeight: 'bold', color: '#666' },
  abaTextoAtivo: { color: '#FFF' },

  lista: { paddingBottom: 40, paddingHorizontal: 20 },
  
  cardPedido: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerAcoes: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnTresPontos: { padding: 4 },
  idPedido: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  badgeStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  textoStatus: { fontSize: 12, fontWeight: 'bold' },
  
  textoDetalhe: { fontSize: 14, color: '#555', marginBottom: 4 },
  textoBold: { fontWeight: 'bold', color: '#333' },
  
  comandaContainer: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#CCC', borderStyle: 'dashed', borderRadius: 8, padding: 12, marginVertical: 12 },
  comandaTitulo: { fontSize: 12, fontWeight: 'bold', color: '#777', textAlign: 'center', letterSpacing: 1 },
  comandaDivisor: { height: 1, backgroundColor: '#DDD', marginVertical: 8 },
  comandaItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  comandaItemQtd: { fontSize: 14, fontWeight: 'bold', color: '#333', width: 30 },
  comandaItemNome: { flex: 1, fontSize: 14, color: '#444', paddingRight: 10 },
  comandaItemPreco: { fontSize: 14, fontWeight: '500', color: '#333' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEE' },
  textoTotal: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
  textoVazio: { textAlign: 'center', marginTop: 50, color: '#777', fontSize: 16 },

  acoesContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, gap: 10 },
  btnAcao: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, flex: 1, alignItems: 'center' },
  btnRecusar: { backgroundColor: '#D32F2F' },
  btnAceitar: { backgroundColor: '#2E7D32' },
  btnPadrao: { backgroundColor: '#1565C0' },
  txtBtnBranco: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  // 👉 Estilos do Modal de Finalização
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 350, backgroundColor: '#FFF', padding: 24, borderRadius: 16, alignItems: 'center', elevation: 5 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  modalSub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  inputCodigo: { width: '100%', backgroundColor: '#F5F5F5', borderRadius: 8, padding: 15, fontSize: 28, fontWeight: 'bold', textAlign: 'center', letterSpacing: 8, marginBottom: 20, color: '#111' },
  modalBotoes: { flexDirection: 'row', width: '100%', gap: 12 },
  btnModalCancel: { flex: 1, paddingVertical: 14, backgroundColor: '#E0E0E0', borderRadius: 8, alignItems: 'center' },
  btnModalConfirm: { flex: 1, paddingVertical: 14, backgroundColor: '#2E7D32', borderRadius: 8, alignItems: 'center' },
  txtBtnModal: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});