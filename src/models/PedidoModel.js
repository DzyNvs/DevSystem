import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const PedidoModel = {
  // 👉 1. Função para BUSCAR os pedidos do restaurante que está logado
  async buscarPedidosDoRestaurante(idDoRestaurante) {
    try {
      // Busca na coleção 'pedidos' ONDE o campo 'id_restaurante' for igual ao ID passado
      const q = query(
        collection(db, 'pedidos'),
        where('id_restaurante', '==', idDoRestaurante)
      );

      const snapshot = await getDocs(q);
      const pedidos = [];

      snapshot.forEach((docSnap) => {
        pedidos.push({
          id: docSnap.id, // Esse é o ID aleatório do próprio documento do Firebase
          ...docSnap.data()
        });
      });

      return pedidos;
    } catch (error) {
      console.error("Erro ao buscar pedidos no Model:", error);
      throw error;
    }
  },

  // 👉 2. Função DE TESTE: Para você simular a criação de um pedido (já que a tela do consumidor não está pronta)
  async criarPedidoSimulado(idRestaurante) {
    try {
      // Gera um ID de pedido único
      const idPedido = `ped_${Math.floor(100000 + Math.random() * 900000)}`;
      const idConsumidorFalso = `cons_${Math.floor(100000 + Math.random() * 900000)}`;

      await setDoc(doc(db, 'pedidos', idPedido), {
        id_pedido: idPedido,             // Vínculo 1: O ID do próprio pedido
        id_restaurante: idRestaurante,   // Vínculo 2: De qual restaurante é
        id_consumidor: idConsumidorFalso,// Vínculo 3: Quem comprou (vamos usar um falso por enquanto)
        status: 'novo',
        metodo_pagamento: 'pix',
        entregador_codigo: '1234',
        subtotal: 50.00,
        total_final: 55.00,
        data_criacao: new Date(),
        itens: ["1x Hamburguer (R$ 30.00)", "1x Refri (R$ 10.00)", "1x Batata (R$ 10.00)"]
      });

      return idPedido;
    } catch (error) {
      console.error("Erro ao criar pedido simulado:", error);
      throw error;
    }
  }
};