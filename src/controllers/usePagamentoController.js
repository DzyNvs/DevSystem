import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
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
  
  // 👉 Novos estados adicionados
  const [observacao, setObservacao] = useState("");
  const [requerTroco, setRequerTroco] = useState(false);
  const [valorEntregue, setValorEntregue] = useState("");
  const [dadosCliente, setDadosCliente] = useState({ nome: "Cliente", endereco: null });

  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [fitCoins, setFitCoins] = useState(0);
  const [usarFitCoins, setUsarFitCoins] = useState(false);

  const MP_ACCESS_TOKEN = "APP_USR-8693224672518424-032321-beab53776818d54b1f19d0426dcbe234-3287488807";

  // 👉 CORREÇÃO 1: Subtotal agora computa os preços dos adicionais perfeitamente
  const subtotal = itens.reduce((acc, item) => {
    const totalAdicionais = item.adicionais && Array.isArray(item.adicionais)
      ? item.adicionais.reduce((somaAdd, add) => somaAdd + (Number(add.preco) || 0), 0)
      : 0;
    const precoFinalItem = Number(item.preco) + totalAdicionais;
    return acc + (precoFinalItem * item.qtd);
  }, 0);

  const percentualDesconto = AvaliacaoModel.calcularDesconto(fitCoins);
  const valorDesconto = usarFitCoins && percentualDesconto > 0
    ? parseFloat(((subtotal * percentualDesconto) / 100).toFixed(2))
    : 0;

  const totalFinal = subtotal + taxaEntrega - valorDesconto;

  // 👉 CORREÇÃO 3: Cálculo do troco em tempo real
  const troco = requerTroco && Number(valorEntregue) > totalFinal 
    ? Number(valorEntregue) - totalFinal 
    : 0;

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Buscar FitCoins
        AvaliacaoModel.buscarFitCoins(user.uid).then(setFitCoins);

        // Buscar Nome do Cliente
        const docRef = doc(db, 'consumidores', user.uid);
        const docSnap = await getDoc(docRef);
        let nomeCliente = "Cliente";
        if (docSnap.exists() && docSnap.data().nome) {
          nomeCliente = docSnap.data().nome;
        }

        // Buscar Endereço Padrão (padrao == true)
        const qEndereco = query(
          collection(db, 'enderecos'),
          where('id_consumidor', '==', doc(db, 'consumidores', user.uid)), // Compatível com tipo Reference
          where('padrao', '==', true)
        );
        
        // Fallback caso o id_consumidor no seu banco seja salvo como String pura
        const qEnderecoString = query(
          collection(db, 'enderecos'),
          where('id_consumidor', '==', user.uid),
          where('padrao', '==', true)
        );

        let snapshotEnd = await getDocs(qEndereco);
        if (snapshotEnd.empty) {
          snapshotEnd = await getDocs(qEnderecoString);
        }

        let enderecoPadrao = null;
        if (!snapshotEnd.empty) {
          const docEnd = snapshotEnd.docs[0].data();
          enderecoPadrao = {
            rua: docEnd.rua,
            numero: docEnd.numero,
            bairro: docEnd.bairro,
            cidade: docEnd.cidade,
            cep: docEnd.cep,
            complemento: docEnd.complemento,
            apelido: docEnd.apelido
          };
        }

        setDadosCliente({ nome: nomeCliente, endereco: enderecoPadrao });

      } catch (err) {
        console.error("Erro ao carregar dados do usuário/endereço:", err);
      }
    };

    carregarDadosIniciais();

    if (idRestauranteAtual) {
      RestauranteModel.buscarPorId(idRestauranteAtual)
        .then((dados) => {
          if (dados?.pagamentos) setOpcoesRestaurante(dados.pagamentos);
          if (dados?.taxa_entrega !== undefined && dados?.taxa_entrega !== null) {
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
      // Montamos a descrição completa do pedido para exibir no checkout MP
      const descricaoItens = itens
        .map((item) => `${item.qtd}x ${item.nome}`)
        .join(', ');

      const descricaoCompleta = [
        descricaoItens,
        taxaEntrega > 0 ? `Taxa de entrega: R$ ${taxaEntrega.toFixed(2)}` : 'Entrega grátis',
        valorDesconto > 0 ? `Desconto FitCoins (${percentualDesconto}%): -R$ ${valorDesconto.toFixed(2)}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      // ✅ Um único item com o totalFinal já calculado — evita unit_price negativo
      // que a API do Mercado Pago não aceita e derruba toda a preferência
      const mpItems = [
        {
          title: 'Pedido FitWay',
          description: descricaoCompleta,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(totalFinal.toFixed(2)),
        },
      ];

      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: mpItems,
          back_urls: {
            success: 'https://fitway.app/sucesso',
            failure: 'https://fitway.app/falha',
            pending: 'https://fitway.app/pendente',
          },
          auto_return: 'approved',
        }),
      });

      const data = await response.json();

      if (!data.sandbox_init_point && !data.init_point) {
        console.error('Resposta MP sem link:', JSON.stringify(data));
        throw new Error('Mercado Pago não retornou link de pagamento.');
      }

      return data.sandbox_init_point || data.init_point;
    } catch (error) {
      console.error("Erro na API do Mercado Pago:", error);
      throw new Error("Falha ao gerar link de pagamento.");
    }
  };

  const finalizarPedido = async () => {
    if (itens.length === 0) return alert("Seu carrinho está vazio!");
    if (!dadosCliente.endereco) return alert("Você precisa de um endereço padrão cadastrado para realizar o pedido!");
    if (tipoPagamento === "entrega" && !formaPagamentoEntrega) {
      return alert("Por favor, selecione como você vai pagar na entrega!");
    }
    if (formaPagamentoEntrega === "dinheiro" && requerTroco && Number(valorEntregue) < totalFinal) {
      return alert("O valor entregue em dinheiro deve ser maior que o total do pedido!");
    }

    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não logado");

      let linkPagamento = "";
      if (tipoPagamento === "online") {
        linkPagamento = await gerarPagamentoMercadoPago();
      }

      const codigoEntrega = Math.floor(1000 + Math.random() * 9000).toString();

      const dadosPedido = {
        id_restaurante: idRestauranteAtual,
        id_consumidor: user.uid,
        id_motorista: null,
        // Pedidos online entram como 'aguardando_pagamento' até confirmação do MP
        status: tipoPagamento === 'online' ? 'aguardando_pagamento' : 'pendente',
        codigo_entrega: codigoEntrega,
        itens: itens.map(item => ({
          id: item.id || null,
          nome: item.nome,
          preco: Number(item.preco),
          qtd: item.qtd,
          adicionais: item.adicionais || [] 
        })),
        subtotal,
        taxa_entrega: taxaEntrega,
        desconto_fitcoins: valorDesconto,
        total_final: totalFinal,
        link_pagamento: linkPagamento,
        tipo_pagamento: tipoPagamento,
        forma_pagamento: tipoPagamento === "online" ? "mercado_pago" : formaPagamentoEntrega,
        observacao: observacao.trim(), 
        troco: formaPagamentoEntrega === "dinheiro" && requerTroco ? troco : 0, 
        valor_entregue_dinheiro: formaPagamentoEntrega === "dinheiro" && requerTroco ? Number(valorEntregue) : 0,
        nome_cliente: dadosCliente.nome, 
        endereco_entrega: dadosCliente.endereco, 
        criado_em: new Date().toISOString(),
      };

      const idPedidoGerado = await PedidoModel.criarPedido(dadosPedido);

      if (tipoPagamento === 'online' && linkPagamento) {
        const resultado = await WebBrowser.openBrowserAsync(linkPagamento);

        const urlRetorno = resultado?.url || '';

        // Bloqueia apenas o que é explicitamente uma falha de pagamento
        const pagamentoFalhou =
          urlRetorno.includes('/falha') ||
          urlRetorno.includes('failure') ||
          urlRetorno.includes('status=rejected') ||
          urlRetorno.includes('status=cancelled');

        // Browser fechado pelo botão "X" do sistema sem navegar para nenhuma URL
        const browserFechadoManualmente =
          resultado?.type === 'cancel' && !urlRetorno;

        if (pagamentoFalhou) {
          await PedidoModel.atualizarStatusPedido(idPedidoGerado, 'cancelado');
          throw new Error('PAGAMENTO_RECUSADO');
        }

        if (browserFechadoManualmente) {
          await PedidoModel.atualizarStatusPedido(idPedidoGerado, 'cancelado');
          throw new Error('PAGAMENTO_CANCELADO');
        }

        // Pagamento aprovado, pendente, ou browser retornou sem URL (sandbox normal)
        // → prossegue para confirmar o pedido
        const statusFinal = urlRetorno.includes('pending') || urlRetorno.includes('/pendente')
          ? 'pendente'
          : 'pendente'; // Restaurante confirma após receber
        await PedidoModel.atualizarStatusPedido(idPedidoGerado, statusFinal);
      }

      // ✅ Só debita FitCoins e limpa carrinho após confirmação do pagamento ou se for pagamento na entrega
      if (usarFitCoins && valorDesconto > 0) {
        await AvaliacaoModel.usarDesconto(user.uid);
      }
      limparCarrinho();

      alert('Pedido gerado com sucesso! Redirecionando para acompanhamento...');
      router.replace({ pathname: 'acompanhamento', params: { idPedido: idPedidoGerado } });

    } catch (error) {
      console.error(error);
      if (error.message === 'PAGAMENTO_RECUSADO') {
        alert('Pagamento recusado. Verifique os dados do cartão, saldo disponível ou tente outra forma de pagamento.');
      } else if (error.message === 'PAGAMENTO_CANCELADO') {
        alert('Pagamento não concluído. Seu pedido foi cancelado. Tente novamente quando quiser.');
      } else {
        alert('Ocorreu um erro ao processar seu pedido. Tente novamente.');
      }
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
    observacao,
    setObservacao,
    requerTroco,
    setRequerTroco,
    valorEntregue,
    setValorEntregue,
    troco,
    dadosCliente
  };
};