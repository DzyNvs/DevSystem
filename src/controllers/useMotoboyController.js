import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { PedidoModel } from '../models/PedidoModel';

export const useMotoboyController = () => {
  const [perfil, setPerfil] = useState(null);
  const [pedidosDisponiveis, setPedidosDisponiveis] = useState([]);
  const [estatisticas, setEstatisticas] = useState({ totalGanhos: 0, totalEntregas: 0 });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // 1. Pega perfil do Motoboy
      const docRef = doc(db, 'entregadores', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setPerfil(docSnap.data());

      // 2. Busca pedidos disponíveis no mercado
      const disponiveis = await PedidoModel.buscarPedidosDisponiveisParaEntrega();
      setPedidosDisponiveis(disponiveis);

      // 3. Calcula Estatísticas (Baseado no histórico)
      const historico = await PedidoModel.buscarHistoricoMotorista(user.uid);
      const entregues = historico.filter(p => p.status === 'entregue');
      
      const ganhos = entregues.reduce((acc, p) => acc + (p.taxa_entrega || 0), 0);
      
      setEstatisticas({
        totalGanhos: ganhos,
        totalEntregas: entregues.length
      });

    } catch (error) {
      console.error("Erro ao carregar dados do motoboy:", error);
    } finally {
      setCarregando(false);
    }
  };

  const aceitarPedido = async (idPedido) => {
    try {
      await PedidoModel.aceitarCorrida(idPedido, auth.currentUser.uid);
      // Remove da lista local para não aparecer para ele mesmo
      setPedidosDisponiveis(prev => prev.filter(p => p.id !== idPedido));
      return true;
    } catch (error) {
      alert("Erro ao aceitar pedido.");
      return false;
    }
  };

  return { perfil, pedidosDisponiveis, estatisticas, carregando, aceitarPedido, atualizar: carregarDadosIniciais };
};