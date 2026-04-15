import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { PedidoModel } from '../models/PedidoModel';
import { RestauranteModel } from '../models/RestauranteModel'; // 👉 Importando o model do restaurante
import { useCarrinhoStore } from './useCarrinhoStore';

export const usePagamentoController = () => {
  const itens = useCarrinhoStore((state) => state.itens) || [];
  const idRestauranteAtual = useCarrinhoStore((state) => state.restauranteId); // 👉 Cuidado: no seu store está salvo como restauranteId
  const limparCarrinho = useCarrinhoStore((state) => state.limparCarrinho);
  
  const [carregando, setCarregando] = useState(false);
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
  
  // 👉 Novos estados para gerenciar a escolha do cliente
  const [tipoPagamento, setTipoPagamento] = useState('online'); // 'online' ou 'entrega'
  const [formaPagamentoEntrega, setFormaPagamentoEntrega] = useState(null);
  const [opcoesRestaurante, setOpcoesRestaurante] = useState({});

  const MP_ACCESS_TOKEN = "APP_USR-8693224672518424-032321-beab53776818d54b1f19d0426dcbe234-3287488807"; 

  const subtotal = itens.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
  const taxaEntrega = 5.00; 
  const totalFinal = subtotal + taxaEntrega;

  // 👉 Busca as opções de pagamento liberadas pelo restaurante no Firebase
  useEffect(() => {
    if (idRestauranteAtual) {
      RestauranteModel.buscarPorId(idRestauranteAtual)
        .then(dados => {
          if (dados && dados.pagamentos) {
            setOpcoesRestaurante(dados.pagamentos);
          }
        })
        .finally(() => setCarregandoOpcoes(false));
    } else {
      setCarregandoOpcoes(false);
    }
  }, [idRestauranteAtual]);

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
          back_urls: { success: "https://seusite.com/sucesso", failure: "https://seusite.com/falha", pending: "https://seusite.com/pendente" },
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
    
    // Trava se o cara selecionou pagamento na entrega mas não escolheu a opção
    if (tipoPagamento === 'entrega' && !formaPagamentoEntrega) {
      return alert("Por favor, selecione como você vai pagar na entrega!");
    }
    
    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não logado");

      let linkPagamento = '';
      
      // 👉 Só gera Mercado Pago se o cara escolheu pagar online
      if (tipoPagamento === 'online') {
        linkPagamento = await gerarPagamentoMercadoPago();
      }

      // 2. Salva o Pedido no Firebase
      const dadosPedido = {
        id_restaurante: idRestauranteAtual,
        id_consumidor: user.uid, 
        itens: itens,
        subtotal,
        taxa_entrega: taxaEntrega,
        total_final: totalFinal,
        link_pagamento: linkPagamento,
        tipo_pagamento: tipoPagamento,
        forma_pagamento: tipoPagamento === 'online' ? 'mercado_pago' : formaPagamentoEntrega
      };

      await PedidoModel.criarPedido(dadosPedido);
      limparCarrinho();

      // 4. Abre o navegador SÓ SE for Mercado Pago
      if (tipoPagamento === 'online' && linkPagamento) {
        await WebBrowser.openBrowserAsync(linkPagamento);
      }

      alert("Pedido gerado com sucesso!");
      router.replace('/home-consumidor-screen'); // Ajuste o nome da sua rota inicial aqui

    } catch (error) {
      alert("Ocorreu um erro ao processar seu pedido.");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  return { 
    subtotal, 
    taxaEntrega, 
    totalFinal, 
    finalizarPedido, 
    carregando,
    carregandoOpcoes,
    tipoPagamento,
    setTipoPagamento,
    formaPagamentoEntrega,
    setFormaPagamentoEntrega,
    opcoesRestaurante
  };
};