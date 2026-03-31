import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useCarrinhoStore } from './useCarrinhoStore';
import { RestauranteModel } from '../models/RestauranteModel';

export const useCarrinhoController = () => {
  // Puxa tudo que precisamos do Zustand
  const { itens, idRestauranteAtual, adicionarItem, removerItem, limparCarrinho } = useCarrinhoStore();
  
  const [restaurante, setRestaurante] = useState(null);
  const [carregando, setCarregando] = useState(false);

  // Toda vez que o id do restaurante mudar (ou seja, quando o carrinho for criado), busca a taxa de entrega
  useEffect(() => {
    if (idRestauranteAtual) {
      carregarRestaurante();
    } else {
      setRestaurante(null);
    }
  }, [idRestauranteAtual]);

  const carregarRestaurante = async () => {
    setCarregando(true);
    try {
      const dados = await RestauranteModel.buscarPorId(idRestauranteAtual);
      if (dados) {
        setRestaurante({
          nome: dados.nome_fantasia || dados.razao_social || 'Restaurante',
          taxaEntrega: dados.taxa_entrega || 5.00 // Padrão R$ 5,00 se o restaurante não tiver cadastrado
        });
      }
    } catch (error) {
      console.error("Erro ao carregar restaurante pro carrinho:", error);
    } finally {
      setCarregando(false);
    }
  };

  // Cálculos financeiros
  const subtotal = itens.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
  const taxaEntrega = restaurante?.taxaEntrega || 0;
  const totalFinal = subtotal + taxaEntrega;

  const irParaPagamento = () => {
    if (itens.length === 0) {
      alert("Sua sacola está vazia!");
      return;
    }
    // A rota que vamos criar no próximo passo!
    router.push('/consumidor/pagamento'); 
  };

  return {
    itens,
    restaurante,
    carregando,
    subtotal,
    taxaEntrega,
    totalFinal,
    adicionarItem, // Usado para o botão "+"
    removerItem,   // Usado para o botão "-"
    limparCarrinho,
    irParaPagamento
  };
};