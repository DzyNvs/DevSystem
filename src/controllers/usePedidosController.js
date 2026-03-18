import { useState, useEffect } from 'react';
import { PedidoModel } from '../models/PedidoModel';

export const usePedidosController = () => {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);


  const idRestauranteAtual = 'rest_01'; 

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    setCarregando(true);
    try {
      const lista = await PedidoModel.buscarPedidosDoRestaurante(idRestauranteAtual);
      setPedidos(lista);
    } catch (error) {
      alert("Erro ao carregar a lista de pedidos.");
    } finally {
      setCarregando(false);
    }
  };

  return {
    pedidos,
    carregando,
    carregarPedidos 
  };
};