import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../src/config/firebase'; // 👉 Ajuste o caminho do seu banco
import { API_URL } from '../../src/config/api.js'; // 👉 Ajuste o caminho da sua API

export default function PedidoAtivoMotoboyScreen() {
  const { id } = useLocalSearchParams(); // Pega o ID do pedido passado pela Home
  const router = useRouter();
  
  const [pedido, setPedido] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [processando, setProcessando] = useState(false);

  // 👉 Escuta o Firebase em TEMPO REAL para acompanhar mudanças no pedido
  useEffect(() => {
    if (!id) return;

    const docRef = doc(db, 'pedidos', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPedido({ id: docSnap.id, ...docSnap.data() });
      } else {
        Alert.alert("Erro", "Pedido não encontrado.");
        router.back();
      }
      setCarregando(false);
    });

    return () => unsubscribe();
  }, [id]);

  const avisarQueChegou = async () => {
    try {
      const docRef = doc(db, 'pedidos', id);
      await updateDoc(docRef, { status: 'saiu_entrega' });
      Alert.alert("Aviso", "O cliente foi notificado que você está a caminho!");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível atualizar o status.");
    }
  };

  const confirmarEntrega = async () => {
    if (codigoDigitado.trim() !== pedido.codigo_entrega) {
      return Alert.alert("Código Inválido", "O código informado não bate com o do cliente. Tente novamente.");
    }

    setProcessando(true);
    try {
      // 1. Atualiza o status no Firebase para Entregue
      const docRef = doc(db, 'pedidos', id);
      await updateDoc(docRef, { status: 'entregue' });

      // 2. Dispara a requisição para o servidor enviar a Nota Fiscal por e-mail agora!
      try {
        await fetch(`${API_URL}/enviar-nota-fiscal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // O ideal é que o e-mail do cliente já esteja salvo no objeto pedido
            email: pedido.email_consumidor || 'cliente@email.com', 
            itens: pedido.itens,
            subtotal: pedido.subtotal,
            taxaEntrega: pedido.taxa_entrega,
            totalFinal: pedido.total_final,
            idPedido: pedido.id
          })
        });
        console.log("Nota fiscal enviada com sucesso ao cliente.");
      } catch (errEmail) {
        console.error("Erro ao solicitar envio de e-mail da nota:", errEmail);
      }

      Alert.alert("Sucesso!", "Entrega finalizada com sucesso. Bom trabalho!");
      router.replace('/motoboy/home'); // Volta pra home do motoboy

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Ocorreu um erro ao finalizar a entrega.");
    } finally {
      setProcessando(false);
    }
  };

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#93BD57" />
        <Text style={{ marginTop: 10 }}>Carregando dados da entrega...</Text>
      </View>
    );
  }

  if (!pedido) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entrega em Andamento</Text>
      </View>

      <View style={styles.content}>
        {/* INFO DO PEDIDO */}
        <View style={styles.card}>
          <Text style={styles.label}>ID do Pedido</Text>
          <Text style={styles.valor}>#{pedido.id.substring(0, 8).toUpperCase()}</Text>

          <View style={styles.divisor} />

          <Text style={styles.label}>Valor a ser cobrado / Forma de Pagamento</Text>
          <Text style={styles.valor}>
            R$ {pedido.total_final?.toFixed(2).replace('.', ',')} 
            <Text style={{ color: '#2E7D32' }}> • {pedido.forma_pagamento?.toUpperCase()}</Text>
          </Text>
        </View>

        {/* BOTÃO PARA AVISAR QUE ESTÁ A CAMINHO */}
        {pedido.status === 'preparando' && (
          <TouchableOpacity style={styles.btnAviso} onPress={avisarQueChegou}>
            <Ionicons name="bicycle-outline" size={24} color="#FFF" />
            <Text style={styles.btnAvisoTexto}>Avisar que saiu para entrega</Text>
          </TouchableOpacity>
        )}

        {/* ÁREA DE VALIDAÇÃO DO CÓDIGO */}
        <View style={styles.codigoCard}>
          <Ionicons name="shield-checkmark-outline" size={40} color="#93BD57" />
          <Text style={styles.codigoTitulo}>Finalizar Entrega</Text>
          <Text style={styles.codigoSubtitulo}>
            Peça ao cliente o código de 4 dígitos que aparece no aplicativo dele para confirmar a entrega.
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

          <TouchableOpacity 
            style={[
              styles.btnConfirmar, 
              (codigoDigitado.length < 4 || processando) && styles.btnDesativado
            ]}
            disabled={codigoDigitado.length < 4 || processando}
            onPress={confirmarEntrega}
          >
            {processando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnConfirmarTexto}>Validar e Concluir</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { backgroundColor: '#333', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center' },
  btnVoltar: { padding: 5, marginRight: 15 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  
  content: { padding: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, elevation: 2, marginBottom: 20 },
  label: { fontSize: 14, color: '#777', marginBottom: 5 },
  valor: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  divisor: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },

  btnAviso: { backgroundColor: '#1565C0', flexDirection: 'row', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  btnAvisoTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },

  codigoCard: { backgroundColor: '#FFF', padding: 25, borderRadius: 12, alignItems: 'center', elevation: 3, borderWidth: 1, borderColor: '#E0E0E0' },
  codigoTitulo: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 10 },
  codigoSubtitulo: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10, marginBottom: 20, lineHeight: 20 },
  
  inputCodigo: { backgroundColor: '#F0F0F0', width: '100%', textAlign: 'center', fontSize: 32, letterSpacing: 10, paddingVertical: 15, borderRadius: 8, fontWeight: 'bold', color: '#111', marginBottom: 20 },
  
  btnConfirmar: { backgroundColor: '#93BD57', width: '100%', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  btnDesativado: { backgroundColor: '#CCC' },
  btnConfirmarTexto: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});