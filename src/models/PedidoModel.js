import { addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export const PedidoModel = {
  // --------------------------------------------------------
  // FUNÇÕES DO RESTAURANTE E CONSUMIDOR
  // --------------------------------------------------------
  
  async buscarPedidosDoRestaurante(idDoRestaurante) {
    try {
      const q = query(
        collection(db, 'pedidos'),
        where('id_restaurante', '==', idDoRestaurante)
      );

      const snapshot = await getDocs(q);
      const pedidos = [];

      snapshot.forEach((docSnap) => {
        pedidos.push({
          id: docSnap.id, 
          ...docSnap.data()
        });
      });

      return pedidos;
    } catch (error) {
      console.error("Erro ao buscar pedidos no Model:", error);
      throw error;
    }
  },

  async criarPedido(dadosPedido) {
    try {
      const docRef = await addDoc(collection(db, 'pedidos'), {
        id_restaurante: dadosPedido.id_restaurante,
        id_consumidor: dadosPedido.id_consumidor,
        itens: dadosPedido.itens,
        subtotal: dadosPedido.subtotal,
        taxa_entrega: dadosPedido.taxa_entrega,
        total_final: dadosPedido.total_final,
        
        status: dadosPedido.status || 'pendente', 
        codigo_entrega: dadosPedido.codigo_entrega || null,
        id_motorista: dadosPedido.id_motorista || null,
        
        link_pagamento: dadosPedido.link_pagamento || '',
        tipo_pagamento: dadosPedido.tipo_pagamento || 'online',
        forma_pagamento: dadosPedido.forma_pagamento || 'mercado_pago',
        
        data_criacao: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      throw error;
    }
  },

  async buscarPedidosDoConsumidor(idConsumidor) {
    try {
      const q = query(
        collection(db, 'pedidos'),
        where('id_consumidor', '==', idConsumidor)
      );

      const snapshot = await getDocs(q);
      const pedidos = [];

      snapshot.forEach((docSnap) => {
        pedidos.push({
          id: docSnap.id, 
          ...docSnap.data()
        });
      });

      // Ordenar do pedido mais recente para o mais antigo
      return pedidos.sort((a, b) => {
        const dataA = a.data_criacao?.toDate() || 0;
        const dataB = b.data_criacao?.toDate() || 0;
        return dataB - dataA;
      });
    } catch (error) {
      console.error("Erro ao buscar pedidos do consumidor:", error);
      throw error;
    }
  },

  // NOVA FUNÇÃO: Escuta os pedidos do consumidor em tempo real
  escutarPedidosDoConsumidor(idConsumidor, callback) {
    const q = query(
      collection(db, 'pedidos'),
      where('id_consumidor', '==', idConsumidor)
    );

    // O onSnapshot fica aberto escutando as alterações do Firebase e avisa o controller na hora
    return onSnapshot(q, (snapshot) => {
      const pedidos = [];
      
      snapshot.forEach((docSnap) => {
        pedidos.push({
          id: docSnap.id, 
          ...docSnap.data()
        });
      });

      // Mantém ordenado sempre do pedido mais recente para o mais antigo
      pedidos.sort((a, b) => {
        const dataA = a.data_criacao?.toDate() || 0;
        const dataB = b.data_criacao?.toDate() || 0;
        return dataB - dataA;
      });

      // Retorna a lista atualizada para o Controller
      callback(pedidos);
    }, (error) => {
      console.error("Erro ao escutar pedidos em tempo real:", error);
    });
  },

  async atualizarStatusPedido(idPedido, novoStatus) {
    try {
      const pedidoRef = doc(db, 'pedidos', idPedido);
      await updateDoc(pedidoRef, { status: novoStatus });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      throw error;
    }
  },

  // --------------------------------------------------------
  // NOVAS FUNÇÕES DO MOTOBOY (ENTREGADOR)
  // --------------------------------------------------------

  // Busca pedidos que o restaurante já despachou e não tem entregador
  async buscarPedidosDisponiveisParaEntrega() {
    try {
      const q = query(
        collection(db, 'pedidos'),
        where('status', '==', 'saiu_entrega'),
        where('id_motorista', '==', null)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao buscar disponíveis:", error);
      throw error;
    }
  },

  // Busca o histórico de um motoboy específico para calcular os ganhos
  async buscarHistoricoMotorista(idMotorista) {
    try {
      const q = query(
        collection(db, 'pedidos'),
        where('id_motorista', '==', idMotorista)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao buscar histórico do motorista:", error);
      throw error;
    }
  },

  // Vincula o motoboy ao pedido (Quando ele clica em "Aceitar Corrida")
  async aceitarCorrida(idPedido, idMotorista) {
    try {
      const pedidoRef = doc(db, 'pedidos', idPedido);
      await updateDoc(pedidoRef, { 
        id_motorista: idMotorista,
        status_entrega: 'coletando' // Indica que o motoboy está a caminho do restaurante
      });
    } catch (error) {
      console.error("Erro ao aceitar corrida:", error);
      throw error;
    }
  }
};