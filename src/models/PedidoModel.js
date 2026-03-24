import { collection, query, where, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';
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

  // 👉 AQUI ESTÁ A FUNÇÃO QUE ELE NÃO ESTAVA ACHANDO
  async criarPedido(dadosPedido) {
    try {
      const docRef = await addDoc(collection(db, 'pedidos'), {
        id_restaurante: dadosPedido.id_restaurante,
        id_consumidor: dadosPedido.id_consumidor,
        itens: dadosPedido.itens,
        subtotal: dadosPedido.subtotal,
        taxa_entrega: dadosPedido.taxa_entrega,
        total_final: dadosPedido.total_final,
        status: 'pendente', // pendente, preparando, saiu_entrega, entregue
        link_pagamento: dadosPedido.link_pagamento || '',
        data_criacao: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      throw error;
    }
  }
};