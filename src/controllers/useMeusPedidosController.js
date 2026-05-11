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
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const lista = await PedidoModel.buscarPedidosDoConsumidor(user.uid);
        setPedidos(lista);
        const moedas = await AvaliacaoModel.buscarFitCoins(user.uid);
        setFitCoins(moedas);
      }
    } catch (error) {
      console.error('Erro ao carregar os pedidos:', error);
      alert('Não foi possível carregar seu histórico de pedidos.');
    } finally {
      setCarregando(false);
    }
  };

  const enviarAvaliacao = async (idPedido, nota, comentario) => {
    const user = auth.currentUser;
    if (!user) return;

    setAvaliandoId(idPedido);
    try {
      await AvaliacaoModel.avaliarPedido(idPedido, user.uid, nota, comentario);

      // Pega o id_restaurante do pedido para recalcular a média
      const pedido = pedidos.find(p => p.id === idPedido);
      if (pedido?.id_restaurante) {
        await AvaliacaoModel.recalcularMediaRestaurante(pedido.id_restaurante);
      }

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

  const descontoDisponivel = AvaliacaoModel.calcularDesconto(fitCoins);

  return {
    pedidos,
    carregando,
    carregarPedidos,
    fitCoins,
    descontoDisponivel,
    avaliandoId,
    enviarAvaliacao,
    toastVisivel,
  };
};