import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../config/firebase'; // Ajuste o caminho do seu db

export function AcompanhamentoScreen() {
  const { idPedido } = useLocalSearchParams();
  const [pedido, setPedido] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // 👉 Escuta o Firebase em TEMPO REAL
  useEffect(() => {
    if (!idPedido) return;

    const docRef = doc(db, 'pedidos', idPedido);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPedido(docSnap.data());
      }
      setCarregando(false);
    });

    return () => unsubscribe(); // Para de escutar ao sair da tela
  }, [idPedido]);

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8CC63F" />
        <Text>Buscando detalhes do pedido...</Text>
      </View>
    );
  }

  if (!pedido) return <Text style={styles.center}>Pedido não encontrado.</Text>;

  // Função para definir a cor e ícone do pipeline
  const getStatusInfo = (statusAtual) => {
    switch (statusAtual) {
      case 'pendente': return { texto: 'Aguardando Restaurante', cor: '#F29C11', icon: 'time-outline' };
      case 'confirmado': // 👉 Adicione esta linha!
      case 'preparando': return { texto: 'Preparando seu pedido', cor: '#3498DB', icon: 'restaurant-outline' };
      case 'saiu_entrega': return { texto: 'Saiu para Entrega', cor: '#9B59B6', icon: 'bicycle-outline' };
      case 'entregue': return { texto: 'Pedido Entregue', cor: '#2E7D32', icon: 'checkmark-circle-outline' };
      default: return { texto: `Status: ${statusAtual}`, cor: '#999', icon: 'ellipsis-horizontal-outline' };
    }
  };

  const statusInfo = getStatusInfo(pedido.status);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/home-consumidor-screen')}>
        <Ionicons name="arrow-back" size={24} color="#333" />
        <Text>Voltar para o início</Text>
    </TouchableOpacity>

      <Text style={styles.titulo}>Acompanhe seu Pedido</Text>
      <Text style={styles.subtitulo}>Pedido #{idPedido.substring(0, 8)}</Text>

      {/* PIPELINE DE STATUS */}
      <View style={[styles.statusCard, { borderColor: statusInfo.cor }]}>
        <Ionicons name={statusInfo.icon} size={40} color={statusInfo.cor} />
        <Text style={[styles.statusTexto, { color: statusInfo.cor }]}>{statusInfo.texto}</Text>
      </View>

      {/* CÓDIGO DE ENTREGA */}
      <View style={styles.codigoContainer}>
        <Text style={styles.codigoLabel}>Código de Entrega</Text>
        <Text style={styles.avisoTexto}>
          Forneça este código ao entregador para receber seu pedido.
        </Text>
        
        <View style={styles.codigoBox}>
          {/* 👇 Evita que a caixa fique vazia se o código não tiver carregado */}
          <Text style={styles.codigoNumero}>
            {pedido.codigo_entrega ? pedido.codigo_entrega : '----'}
          </Text>
        </View>
      </View>

      {/* INFORMAÇÕES DO MOTORISTA (Se já tiver sido associado) */}
      {pedido.id_motorista ? (
        <View style={styles.motoristaCard}>
          <Ionicons name="person-circle-outline" size={40} color="#555" />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>Seu entregador está a caminho!</Text>
            <Text style={{ color: '#777' }}>ID: {pedido.id_motorista.substring(0, 6)}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.aguardandoMotorista}>Aguardando entregador parceiro...</Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F2', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitulo: { fontSize: 14, color: '#777', marginBottom: 30 },
  
  statusCard: { padding: 30, borderWidth: 2, borderRadius: 12, alignItems: 'center', backgroundColor: '#FFF', marginBottom: 30 },
  statusTexto: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },

  codigoContainer: { alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 12, elevation: 2 },
  codigoLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  avisoTexto: { fontSize: 12, color: '#666', textAlign: 'center', marginVertical: 10 },
  codigoBox: { backgroundColor: '#F0F0F0', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 8, marginTop: 10 },
  codigoNumero: { fontSize: 32, fontWeight: 'bold', letterSpacing: 8, color: '#111' },

  motoristaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 15, borderRadius: 8, marginTop: 20 },
  aguardandoMotorista: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' }
});