import { useState } from 'react';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCarrinhoStore } from './useCarrinhoStore';
import { PedidoModel } from '../models/PedidoModel';
import { auth } from '../config/firebase';

export const usePagamentoController = () => {
  // 👉 Buscando do Zustand do jeito mais seguro para evitar undefined
  const itens = useCarrinhoStore((state) => state.itens) || [];
  const idRestauranteAtual = useCarrinhoStore((state) => state.idRestauranteAtual);
  const limparCarrinho = useCarrinhoStore((state) => state.limparCarrinho);
  
  const [carregando, setCarregando] = useState(false);

  const MP_ACCESS_TOKEN = "APP_USR-8693224672518424-032321-beab53776818d54b1f19d0426dcbe234-3287488807"; 

  const subtotal = itens.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
  const taxaEntrega = 5.00; 
  const totalFinal = subtotal + taxaEntrega;

  const gerarPagamentoMercadoPago = async () => {
    try {
      const mpItems = itens.map(item => ({
        title: item.nome,
        description: item.descricao || 'Produto FitWay',
        quantity: item.qtd,
        currency_id: 'BRL',
        unit_price: Number(item.preco)
      }));

      if (taxaEntrega > 0) {
        mpItems.push({
          title: "Taxa de Entrega",
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(taxaEntrega)
        });
      }

      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: mpItems,
          back_urls: {
            success: "https://seusite.com/sucesso", 
            failure: "https://seusite.com/falha",
            pending: "https://seusite.com/pendente"
          },
          auto_return: "approved",
        })
      });

      const data = await response.json();
      return data.sandbox_init_point || data.init_point; 

    } catch (error) {
      console.error("Erro na API do Mercado Pago:", error);
      throw new Error("Falha ao gerar link de pagamento.");
    }
  };

  const finalizarPedido = async () => {
    if (itens.length === 0) return alert("Seu carrinho está vazio!");
    
    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não logado");

      // 1. Gera o link no Mercado Pago
      const linkPagamento = await gerarPagamentoMercadoPago();

      // 2. Salva o Pedido no Firebase
      const dadosPedido = {
        id_restaurante: idRestauranteAtual,
        id_consumidor: user.uid, // Usa o UID real de quem está logado
        itens: itens,
        subtotal,
        taxa_entrega: taxaEntrega,
        total_final: totalFinal,
        link_pagamento: linkPagamento
      };

      await PedidoModel.criarPedido(dadosPedido);

      // 3. Limpa o carrinho
      limparCarrinho();

      // 4. Abre o navegador com o checkout do Mercado Pago
      if (linkPagamento) {
        await WebBrowser.openBrowserAsync(linkPagamento);
      }

      alert("Pedido gerado com sucesso!");
      router.replace('/home-consumidor-screen');

    } catch (error) {
      alert("Ocorreu um erro ao processar seu pedido.");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  return { subtotal, taxaEntrega, totalFinal, finalizarPedido, carregando };
};