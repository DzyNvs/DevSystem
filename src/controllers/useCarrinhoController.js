import { router } from "expo-router";
import { useEffect, useState } from "react";
import { RestauranteModel } from "../models/RestauranteModel";
import { useCarrinhoStore } from "./useCarrinhoStore";

export const useCarrinhoController = () => {
  // Puxa tudo que precisamos do Zustand
  const {
    itens,
    restauranteId,
    adicionarItem,
    removerItem,
    limparCarrinho,
  } = useCarrinhoStore();

  const [restaurante, setRestaurante] = useState(null);
  const [carregando, setCarregando] = useState(false);

  // Toda vez que o id do restaurante mudar, busca os dados da loja
  useEffect(() => {
    if (restauranteId) {
      carregarRestaurante();
    } else {
      setRestaurante(null);
    }
  }, [restauranteId]);

  const carregarRestaurante = async () => {
    setCarregando(true);
    try {
      const dados = await RestauranteModel.buscarPorId(restauranteId);
      if (dados) {
        setRestaurante({
          id: restauranteId,
          nome: dados.nome_fantasia || dados.razao_social || "Restaurante",
          taxaEntrega: dados.taxa_entrega || 5.0, 
          pedidoMinimo: Number(dados.pedido_minimo || 0),
        });
      }
    } catch (error) {
      console.error("Erro ao carregar restaurante pro carrinho:", error);
    } finally {
      setCarregando(false);
    }
  };

  // 👉 ATUALIZADO: Cálculo financeiro somando o prato + os adicionais
  const subtotal = itens.reduce((acc, item) => {
    const valorAdicionais = item.adicionais?.reduce((sum, a) => sum + Number(a.preco || 0), 0) || 0;
    const valorUnitarioFinal = Number(item.preco) + valorAdicionais;
    return acc + (valorUnitarioFinal * item.qtd);
  }, 0);

  // Cálculo do total de calorias da sacola
  const totalCalorias = itens.reduce(
    (acc, item) => acc + (Number(item.calorias) || 0) * item.qtd,
    0,
  );

  const taxaEntrega = restaurante?.taxaEntrega || 0;
  const totalFinal = subtotal + taxaEntrega;

  const irParaPagamento = () => {
    if (itens.length === 0) {
      alert("Sua sacola está vazia!");
      return;
    }
    router.push("/consumidor/pagamento");
  };

  return {
    itens,
    restaurante,
    carregando,
    subtotal,
    totalCalorias, 
    taxaEntrega,
    totalFinal,
    adicionarItem,
    removerItem,
    limparCarrinho,
    irParaPagamento,
  };
};