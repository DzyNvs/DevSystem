import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { PedidoModel } from '../models/PedidoModel';

export const usePedidosController = () => {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [idRestauranteLogado, setIdRestauranteLogado] = useState(null);

  useEffect(() => {
    identificarRestauranteECarregar();
  }, []);

  const identificarRestauranteECarregar = async () => {
    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Você não está logado!");
        setCarregando(false);
        return;
      }

      const docRef = doc(db, 'restaurantes', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().id_restaurante) {
        const meuIdRestaurante = docSnap.data().id_restaurante;
        setIdRestauranteLogado(meuIdRestaurante);
        
        const lista = await PedidoModel.buscarPedidosDoRestaurante(meuIdRestaurante);
        // Ordena para os mais recentes ficarem no topo
        lista.sort((a, b) => (b.data_criacao?.toDate() || 0) - (a.data_criacao?.toDate() || 0));
        setPedidos(lista);
      } else {
        alert("ID do Restaurante não encontrado no banco.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao identificar o restaurante.");
    } finally {
      setCarregando(false);
    }
  };

  // 👉 NOVA FUNÇÃO: Altera o status e atualiza a lista local
  const alterarStatus = async (idPedido, novoStatus) => {
    try {
      await PedidoModel.atualizarStatusPedido(idPedido, novoStatus);
      
      // Atualiza o pedido na tela na mesma hora, sem recarregar o banco
      setPedidos(pedidos.map(p => 
        p.id === idPedido ? { ...p, status: novoStatus } : p
      ));
    } catch (error) {
      alert("Ocorreu um erro ao mudar o status.");
    }
  };

  const gerarPedidoTeste = async () => {
    if (!idRestauranteLogado) return;
    setCarregando(true);
    try {
      await PedidoModel.criarPedidoSimulado(idRestauranteLogado);
      alert("Pedido teste criado! Recarregando lista...");
      await identificarRestauranteECarregar(); 
    } catch (error) {
      alert("Erro ao criar pedido de teste.");
      setCarregando(false);
    }
  };

  return {
    pedidos,
    carregando,
    carregarPedidos: identificarRestauranteECarregar,
    gerarPedidoTeste,
    alterarStatus // 👉 Não esqueça de exportar a função aqui
  };
};