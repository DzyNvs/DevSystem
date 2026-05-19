import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { AvaliacaoModel } from "../models/AvaliacaoModel";
import { PedidoModel } from "../models/PedidoModel";
import { RestauranteModel } from "../models/RestauranteModel";
import { useCarrinhoStore } from "./useCarrinhoStore";

export const usePagamentoController = () => {
  const itens = useCarrinhoStore((state) => state.itens) || [];
  const idRestauranteAtual = useCarrinhoStore((state) => state.restauranteId);
  const limparCarrinho = useCarrinhoStore((state) => state.limparCarrinho);

  const [carregando, setCarregando] = useState(false);
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
  const [tipoPagamento, setTipoPagamento] = useState("online");
  const [formaPagamentoEntrega, setFormaPagamentoEntrega] = useState(null);
  const [opcoesRestaurante, setOpcoesRestaurante] = useState({});

  // 👉 Criamos um estado para a taxa de entrega iniciar em 0
  const [taxaEntrega, setTaxaEntrega] = useState(0);

  // FitCoins
  const [fitCoins, setFitCoins] = useState(0);
  const [usarFitCoins, setUsarFitCoins] = useState(false);

  const MP_ACCESS_TOKEN =
    "APP_USR-8693224672518424-032321-beab53776818d54b1f19d0426dcbe234-3287488807";

  const subtotal = itens.reduce((acc, item) => acc + item.preco * item.qtd, 0);

  const percentualDesconto = AvaliacaoModel.calcularDesconto(fitCoins);
  const valorDesconto =
    usarFitCoins && percentualDesconto > 0
      ? parseFloat(((subtotal * percentualDesconto) / 100).toFixed(2))
      : 0;

  // 👉 O totalFinal agora reage dinamicamente ao valor da taxaEntrega vindo do banco
  const totalFinal = subtotal + taxaEntrega - valorDesconto;

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      AvaliacaoModel.buscarFitCoins(user.uid).then(setFitCoins);
    }

    if (idRestauranteAtual) {
      RestauranteModel.buscarPorId(idRestauranteAtual)
        .then((dados) => {
          if (dados?.pagamentos) setOpcoesRestaurante(dados.pagamentos);

          // 👉 Pega a taxa de entrega real do banco. Se não tiver, continua 0 (Grátis)
          if (
            dados?.taxa_entrega !== undefined &&
            dados?.taxa_entrega !== null
          ) {
            setTaxaEntrega(Number(dados.taxa_entrega));
          }
        })
        .finally(() => setCarregandoOpcoes(false));
    } else {
      setCarregandoOpcoes(false);
    }
  }, [idRestauranteAtual]);

  const gerarPagamentoMercadoPago = async () => {
    try {
      const mpItems = itens.map((item) => ({
        title: item.nome,
        description: item.descricao || "Produto FitWay",
        quantity: item.qtd,
        currency_id: "BRL",
        unit_price: Number(item.preco),
      }));

      // 👉 A lógica do Mercado Pago continua igual, pois agora taxaEntrega é dinâmica
      if (taxaEntrega > 0) {
        mpItems.push({
          title: "Taxa de Entrega",
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(taxaEntrega),
        });
      }

      if (valorDesconto > 0) {
        mpItems.push({
          title: `Desconto FitCoins (${percentualDesconto}%)`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: -Number(valorDesconto),
        });
      }

      const response = await fetch(
        "https://api.mercadopago.com/checkout/preferences",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: mpItems,
            back_urls: {
              success: "https://seusite.com/sucesso",
              failure: "https://seusite.com/falha",
              pending: "https://seusite.com/pendente",
            },
            auto_return: "approved",
          }),
        },
      );

      const data = await response.json();
      return data.sandbox_init_point || data.init_point;
    } catch (error) {
      console.error("Erro na API do Mercado Pago:", error);
      throw new Error("Falha ao gerar link de pagamento.");
    }
  };

  const finalizarPedido = async () => {
    if (itens.length === 0) return alert("Seu carrinho está vazio!");
    if (tipoPagamento === "entrega" && !formaPagamentoEntrega) {
      return alert("Por favor, selecione como você vai pagar na entrega!");
    }

    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não logado");

      let linkPagamento = "";
      if (tipoPagamento === "online") {
        linkPagamento = await gerarPagamentoMercadoPago();
      }

      if (usarFitCoins && valorDesconto > 0) {
        await AvaliacaoModel.usarDesconto(user.uid);
      }

      const codigoEntrega = Math.floor(1000 + Math.random() * 9000).toString();

      const dadosPedido = {
        id_restaurante: idRestauranteAtual,
        id_consumidor: user.uid,
        id_motorista: null,
        status: "pendente",
        codigo_entrega: codigoEntrega,
        itens,
        subtotal,
        taxa_entrega: taxaEntrega, // 👉 Vai pro banco certinho agora
        desconto_fitcoins: valorDesconto,
        total_final: totalFinal, // 👉 Vai pro banco já calculado
        link_pagamento: linkPagamento,
        tipo_pagamento: tipoPagamento,
        forma_pagamento:
          tipoPagamento === "online" ? "mercado_pago" : formaPagamentoEntrega,
        criado_em: new Date().toISOString(),
      };

      const idPedidoGerado = await PedidoModel.criarPedido(dadosPedido);
      limparCarrinho();

      if (tipoPagamento === "online" && linkPagamento) {
        await WebBrowser.openBrowserAsync(linkPagamento);
      }

      alert("Pedido gerado com sucesso! Redirecionando para acompanhamento...");
      router.replace({
        pathname: "acompanhamento",
        params: { idPedido: idPedidoGerado },
      });
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
    valorDesconto,
    totalFinal,
    finalizarPedido,
    carregando,
    carregandoOpcoes,
    tipoPagamento,
    setTipoPagamento,
    formaPagamentoEntrega,
    setFormaPagamentoEntrega,
    opcoesRestaurante,
    fitCoins,
    percentualDesconto,
    usarFitCoins,
    setUsarFitCoins,
  };
};
