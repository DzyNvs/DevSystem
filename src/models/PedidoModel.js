import { addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
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
        pedidos.push({ id: docSnap.id, ...docSnap.data() });
      });
      return pedidos;
    } catch (error) {
      console.error("Erro ao buscar pedidos no Model:", error);
      throw error;
    }
  },

  // 👉 ATUALIZADO: Recebe, trata e armazena os novos campos requeridos
  async criarPedido(dadosPedido) {
    try {
      const docRef = await addDoc(collection(db, 'pedidos'), {
        id_restaurante: dadosPedido.id_restaurante,
        id_consumidor: dadosPedido.id_consumidor,
        nome_cliente: dadosPedido.nome_cliente || 'Cliente', // Novo mapeamento
        endereco_entrega: dadosPedido.endereco_entrega || null, // Novo mapeamento estruturado
        itens: dadosPedido.itens, // Contém { id, nome, preco, qtd, adicionais: [...] }
        subtotal: dadosPedido.subtotal,
        taxa_entrega: dadosPedido.taxa_entrega,
        desconto_fitcoins: dadosPedido.desconto_fitcoins || 0,
        total_final: dadosPedido.total_final,
        
        status: dadosPedido.status || 'pendente', 
        codigo_entrega: dadosPedido.codigo_entrega || null,
        id_motorista: dadosPedido.id_motorista || null,
        
        link_pagamento: dadosPedido.link_pagamento || '',
        tipo_pagamento: dadosPedido.tipo_pagamento || 'online',
        forma_pagamento: dadosPedido.forma_pagamento || 'mercado_pago',
        
        observacao: dadosPedido.observacao || '', // Novo Campo adicionado
        troco: dadosPedido.troco || 0,             // Novo Campo adicionado
        valor_entregue_dinheiro: dadosPedido.valor_entregue_dinheiro || 0,
        
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
        pedidos.push({ id: docSnap.id, ...docSnap.data() });
      });
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

  escutarPedidosDoConsumidor(idConsumidor, callback) {
    const q = query(
      collection(db, 'pedidos'),
      where('id_consumidor', '==', idConsumidor)
    );
    return onSnapshot(q, (snapshot) => {
      const pedidos = [];
      snapshot.forEach((docSnap) => {
        pedidos.push({ id: docSnap.id, ...docSnap.data() });
      });
      pedidos.sort((a, b) => {
        const dataA = a.data_criacao?.toDate() || 0;
        const dataB = b.data_criacao?.toDate() || 0;
        return dataB - dataA;
      });
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

  async aceitarCorrida(idPedido, idMotorista) {
    try {
      const pedidoRef = doc(db, 'pedidos', idPedido);
      await updateDoc(pedidoRef, { 
        id_motorista: idMotorista,
        status_entrega: 'coletando'
      });
    } catch (error) {
      console.error("Erro ao aceitar corrida:", error);
      throw error;
    }
  }
};