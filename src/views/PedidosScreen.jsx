import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePedidosController } from '../controllers/usePedidosController';
import { HeaderRestaurante } from './HeaderRestaurante';

export function PedidosScreen() {
  const ctrl = usePedidosController();
  const router = useRouter();

  // 👉 Estado para controlar qual aba está ativa (Padrão: Aguardando)
  const [abaAtiva, setAbaAtiva] = useState('pendente');

  // 👉 Definição das abas
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

  // 👉 Filtragem dos pedidos de acordo com a aba selecionada
  const pedidosFiltrados = ctrl.pedidos.filter(pedido => {
    if (abaAtiva === 'todos') return true;
    return pedido.status === abaAtiva;
  });

  const renderPedido = ({ item }) => {
    const statusFormatado = formatarStatus(item.status);

    return (
      <View style={styles.cardPedido}>
        <View style={styles.cardHeader}>
          <Text style={styles.idPedido}>Pedido #{item.id?.substring(0, 6).toUpperCase()}</Text>
          <View style={[styles.badgeStatus, { backgroundColor: statusFormatado.fundo }]}>
            <Text style={[styles.textoStatus, { color: statusFormatado.cor }]}>{statusFormatado.texto}</Text>
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

        {/* 👉 BOTÕES DE AÇÃO DINÂMICOS BASEADOS NO STATUS */}
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

          {item.status === 'saiu_entrega' && (
            <TouchableOpacity style={[styles.btnAcao, styles.btnConcluir]} onPress={() => ctrl.alterarStatus(item.id, 'entregue')}>
              <Text style={styles.txtBtnBranco}>Marcar como Entregue</Text>
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

        {/* 👉 ABAS NAVEGÁVEIS */}
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
            ListEmptyComponent={
              <Text style={styles.textoVazio}>Nenhum pedido nesta aba.</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { flex: 1, paddingTop: 15 },
  
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 20 },
  botaoVoltar: { marginRight: 15, padding: 4 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  
  // Estilos das Abas
  abasContainer: { borderBottomWidth: 1, borderBottomColor: '#DDD', paddingBottom: 10, paddingHorizontal: 20, marginBottom: 15 },
  abaBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#EEE', marginRight: 10 },
  abaAtiva: { backgroundColor: '#2E7D32' },
  abaTexto: { fontSize: 14, fontWeight: 'bold', color: '#666' },
  abaTextoAtivo: { color: '#FFF' },

  lista: { paddingBottom: 40, paddingHorizontal: 20 },
  
  cardPedido: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
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

  // Estilos dos Botões de Ação
  acoesContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, gap: 10 },
  btnAcao: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, flex: 1, alignItems: 'center' },
  btnRecusar: { backgroundColor: '#D32F2F' },
  btnAceitar: { backgroundColor: '#2E7D32' },
  btnPadrao: { backgroundColor: '#1565C0' },
  btnConcluir: { backgroundColor: '#43A047' },
  txtBtnBranco: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});