import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { AvaliacaoModel } from '../models/AvaliacaoModel';
import { PedidoModel } from '../models/PedidoModel';

export const useMeusPedidosController = () => {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [fitCoins, setFitCoins] = useState(0);
  const [avaliandoId, setAvaliandoId] = useState(null);
  const [toastVisivel, setToastVisivel] = useState(false);

  useEffect(() => {
    let unsubscribe = null; // Guardará a função de desligar o ouvinte do Firebase

    const iniciar = async () => {
      setCarregando(true);
      try {
        const user = auth.currentUser;
        if (user) {
          // Busca as FitCoins (isso não precisa de tempo real)
          const moedas = await AvaliacaoModel.buscarFitCoins(user.uid);
          setFitCoins(moedas);

          // Inicia o ouvinte em TEMPO REAL para a lista de pedidos
          unsubscribe = PedidoModel.escutarPedidosDoConsumidor(user.uid, (listaAtualizada) => {
            setPedidos(listaAtualizada);
            setCarregando(false);
          });
        }
      } catch (error) {
        console.error('Erro ao iniciar tela de pedidos:', error);
        alert('Não foi possível carregar seu histórico de pedidos.');
        setCarregando(false);
      }
    };

    iniciar();

    // Quando o usuário sai da tela, desligamos o ouvinte para economizar memória e leituras no banco
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const enviarAvaliacao = async (idPedido, nota, comentario) => {
    const user = auth.currentUser;
    if (!user) return;

    setAvaliandoId(idPedido);
    try {
      await AvaliacaoModel.avaliarPedido(idPedido, user.uid, nota, comentario);

      const pedido = pedidos.find(p => p.id === idPedido);
      if (pedido?.id_restaurante) {
        await AvaliacaoModel.recalcularMediaRestaurante(pedido.id_restaurante);
      }

      // Atualização otimista da tela
      setPedidos(prev =>
        prev.map(p => p.id === idPedido
          ? { ...p, avaliado: true, avaliacao: nota, comentario_avaliacao: comentario }
          : p
        )
      );

      setFitCoins(prev => prev + 30);
      setToastVisivel(true);
      setTimeout(() => setToastVisivel(false), 3000);
    } catch (error) {
      console.error('Erro ao avaliar pedido:', error);
      alert('Não foi possível enviar a avaliação. Tente novamente.');
    } finally {
      setAvaliandoId(null);
    }
  };

  const cancelarPedido = async (idPedido) => {
    // Trava de segurança extra: Verifica se na memória ele já não mudou de status
    const pedido = pedidos.find(p => p.id === idPedido);
    if (pedido && pedido.status !== 'pendente') {
      alert("Opa! O restaurante acabou de processar este pedido e ele não pode mais ser cancelado.");
      return;
    }

    try {
      await PedidoModel.atualizarStatusPedido(idPedido, 'cancelado');
      // O Firebase vai atualizar o banco e o `onSnapshot` vai atualizar a tela sozinho em milissegundos!
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error);
      alert("Não foi possível cancelar o pedido. Tente novamente.");
    }
  };

  const descontoDisponivel = AvaliacaoModel.calcularDesconto(fitCoins);

  return {
    pedidos,
    carregando,
    fitCoins,
    descontoDisponivel,
    avaliandoId,
    enviarAvaliacao,
    cancelarPedido,
    toastVisivel,
  };
};