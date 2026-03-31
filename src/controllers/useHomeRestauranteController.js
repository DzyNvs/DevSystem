import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { LoginModel } from '../models/LoginModel';
import { PedidoModel } from '../models/PedidoModel';

export const useHomeRestauranteController = () => {
  const [resumo, setResumo] = useState({ totalPedidos: 0, totalVendas: 0 });
  const [carregandoResumo, setCarregandoResumo] = useState(true);

  useEffect(() => {
    carregarResumoDiario();
  }, []);

  const carregarResumoDiario = async () => {
    try {
      setCarregandoResumo(true);
      const idRestauranteAtual = 'rest_01'; 
      const pedidos = await PedidoModel.buscarPedidosDoRestaurante(idRestauranteAtual);

      const qtdPedidos = pedidos.length;
      const valorTotal = pedidos.reduce((acumulador, pedido) => {
        return acumulador + (pedido.total_final || 0);
      }, 0);

      setResumo({
        totalPedidos: qtdPedidos,
        totalVendas: valorTotal
      });

    } catch (error) {
      console.error("Erro ao carregar resumo na home:", error);
    } finally {
      setCarregandoResumo(false);
    }
  };

  const handleLogoff = async () => {
    try {
      await LoginModel.sair();
      router.replace('/'); 
    } catch (error) {
      alert("Erro ao tentar sair da conta.");
    }
  };

  const irParaCadastroRestaurante = () => router.push('/restaurante/perfil'); 
  const irParaPedidos = () => router.push('/restaurante/pedidos');
  const irParaNovoPrato = () => router.push('/restaurante/pratos');
  const irParaCardapio = () => router.push('/restaurante/cardapio');

  return { 
    handleLogoff, 
    irParaCadastroRestaurante, 
    irParaPedidos,
    irParaNovoPrato,
    irParaCardapio,
    resumo, 
    carregandoResumo 
  };
};