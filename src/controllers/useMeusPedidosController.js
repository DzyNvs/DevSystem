import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { PedidoModel } from '../models/PedidoModel';

export const useMeusPedidosController = () => {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);

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
      }
    } catch (error) {
      console.error("Erro ao carregar os pedidos:", error);
      alert("Não foi possível carregar seu histórico de pedidos.");
    } finally {
      setCarregando(false);
    }
  };

  return { pedidos, carregando, carregarPedidos };
};