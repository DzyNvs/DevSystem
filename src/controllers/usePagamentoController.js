import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { PedidoModel } from '../models/PedidoModel';
import { RestauranteModel } from '../models/RestauranteModel'; 
import { useCarrinhoStore } from './useCarrinhoStore';

import { API_URL } from '../config/api.js';

export const usePagamentoController = () => {
  const itens = useCarrinhoStore((state) => state.itens) || [];
  const idRestauranteAtual = useCarrinhoStore((state) => state.restauranteId); 
  const limparCarrinho = useCarrinhoStore((state) => state.limparCarrinho);
  
  const [carregando, setCarregando] = useState(false);
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
  
  const [tipoPagamento, setTipoPagamento] = useState('online'); // 'online' ou 'entrega'
  const [formaPagamentoEntrega, setFormaPagamentoEntrega] = useState(null);
  const [opcoesRestaurante, setOpcoesRestaurante] = useState({});

  const MP_ACCESS_TOKEN = "APP_USR-8693224672518424-032321-beab53776818d54b1f19d0426dcbe234-3287488807"; 

  const subtotal = itens.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
  const taxaEntrega = 5.00; 
  const totalFinal = subtotal + taxaEntrega;

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
    
    if (tipoPagamento === 'entrega' && !formaPagamentoEntrega) {
      return alert("Por favor, selecione como você vai pagar na entrega!");
    }
    
    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não logado");

      let linkPagamento = '';
      
      if (tipoPagamento === 'online') {
        linkPagamento = await gerarPagamentoMercadoPago();
      }

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

      // 1. Salva o Pedido no Firebase e pega o ID gerado
      const idPedidoGerado = await PedidoModel.criarPedido(dadosPedido);

      // 👉 2. NOVO: Dispara a requisição para o servidor enviar a Nota Fiscal por e-mail
      try {
        await fetch(`${API_URL}/enviar-nota-fiscal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email, 
            itens: itens,
            subtotal: subtotal,
            taxaEntrega: taxaEntrega,
            totalFinal: totalFinal,
            idPedido: idPedidoGerado
          })
        });
        console.log("Comando de envio de nota fiscal disparado com sucesso.");
      } catch (errEmail) {
        console.error("Erro ao solicitar envio de e-mail da nota:", errEmail);
        // O erro no envio de email não impede a conclusão do pedido
      }

      // 3. Limpa o carrinho após sucesso
      limparCarrinho();

      // 4. Abre o navegador SÓ SE for Mercado Pago
      if (tipoPagamento === 'online' && linkPagamento) {
        await WebBrowser.openBrowserAsync(linkPagamento);
      }

      alert("Pedido gerado com sucesso! Verifique seu e-mail para ver a nota fiscal.");
      router.replace('/home-consumidor-screen'); 

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