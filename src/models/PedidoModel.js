// 👉 Adicionamos doc e updateDoc aqui na importação
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';


export const PedidoModel = {
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
        status: 'pendente', 
        link_pagamento: dadosPedido.link_pagamento || '',
        
        // Salvando a forma de pagamento que o cliente escolheu
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

  // 👉 NOVA FUNÇÃO AQUI: Atualiza o status do pedido direto no banco
  async atualizarStatusPedido(idPedido, novoStatus) {
    try {
      const pedidoRef = doc(db, 'pedidos', idPedido);
      await updateDoc(pedidoRef, { status: novoStatus });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      throw error;
    }
  }
};