import { useState, useEffect } from 'react';
import { PedidoModel } from '../models/PedidoModel';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const usePedidosController = () => {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [idRestauranteLogado, setIdRestauranteLogado] = useState(null);

  useEffect(() => {
    // Primeiro descobre quem tá logado, depois carrega os pedidos
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

      // Vai no banco pegar o id_restaurante (ex: rest_123456) salvo no documento desse usuário
      const docRef = doc(db, 'restaurantes', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().id_restaurante) {
        const meuIdRestaurante = docSnap.data().id_restaurante;
        setIdRestauranteLogado(meuIdRestaurante);
        
        // Agora sim busca os pedidos usando o ID correto!
        const lista = await PedidoModel.buscarPedidosDoRestaurante(meuIdRestaurante);
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

  // Função para você testar a criação de pedidos (pode chamar isso num botão na tela depois se quiser testar)
  const gerarPedidoTeste = async () => {
    if (!idRestauranteLogado) return;
    setCarregando(true);
    try {
      await PedidoModel.criarPedidoSimulado(idRestauranteLogado);
      alert("Pedido teste criado! Recarregando lista...");
      await identificarRestauranteECarregar(); // Recarrega a tela
    } catch (error) {
      alert("Erro ao criar pedido de teste.");
      setCarregando(false);
    }
  };

  return {
    pedidos,
    carregando,
    carregarPedidos: identificarRestauranteECarregar,
    gerarPedidoTeste // Exportando a função de teste
  };
};