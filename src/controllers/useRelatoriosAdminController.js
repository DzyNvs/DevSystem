import { useEffect, useState } from "react";
import { RelatorioModel } from "../models/RelatorioModel";

export const useRelatoriosAdminController = () => {
  const [restaurantes, setRestaurantes] = useState([]);
  const [filtroRestaurante, setFiltroRestaurante] = useState("todos");
  const [txtDataInicial, setTxtDataInicial] = useState(
    formatarData(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  );
  const [txtDataFinal, setTxtDataFinal] = useState(formatarData(new Date()));
  const [dadosVendas, setDadosVendas] = useState([]);
  const [dadosCancelamento, setDadosCancelamento] = useState([]);
  const [dadosProduto, setDadosProduto] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [ordenacao, setOrdenacao] = useState({ campo: "", direcao: "asc" });

  useEffect(() => {
    carregarRestaurantes();
  }, []);

  function formatarData(date) {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  function parsarData(texto) {
    const partes = texto.split("/");
    if (partes.length === 3) {
      const d = parseInt(partes[0], 10);
      const m = parseInt(partes[1], 10) - 1;
      const y = parseInt(partes[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m, d);
    }
    return null;
  }

  // Helper: acha o nome do restaurante pelo id_restaurante (ex: "rest_618143")
  function nomeDoRestaurante(idRest) {
    const rest = restaurantes.find((r) => r.id_restaurante === idRest);
    return rest
      ? rest.nome_fantasia || rest.razao_social || "Sem nome"
      : idRest;
  }

  function especialidadeDoRestaurante(idRest) {
    const rest = restaurantes.find((r) => r.id_restaurante === idRest);
    return rest?.especialidade || "Não informada";
  }

  const carregarRestaurantes = async () => {
    try {
      const lista = await RelatorioModel.buscarTodosRestaurantes();
      setRestaurantes(lista);
    } catch (e) {
      console.error("Erro ao carregar restaurantes:", e);
    }
  };

  const gerarRelatorio = async () => {
    const dataInicial = parsarData(txtDataInicial);
    const dataFinal = parsarData(txtDataFinal);
    if (!dataInicial || !dataFinal) {
      alert("Datas inválidas. Use o formato DD/MM/AAAA.");
      return;
    }

    setCarregando(true);
    try {
      const fim = new Date(dataFinal);
      fim.setHours(23, 59, 59, 999);

      // Busca pedidos filtrados pelo id_restaurante customizado (ex: "rest_618143")
      const pedidos = await RelatorioModel.buscarPedidosFiltrados({
        idRestaurante: filtroRestaurante,
        dataInicial,
        dataFinal: fim,
      });

      // ========== RELATÓRIO 1: VENDAS ==========
      const finalizados = pedidos.filter((p) => p.status === "entregue");
      const agrupadoVendas = {};
      finalizados.forEach((p) => {
        const id = p.id_restaurante;
        if (!agrupadoVendas[id]) agrupadoVendas[id] = { qtd: 0, fat: 0 };
        agrupadoVendas[id].qtd += 1;
        agrupadoVendas[id].fat += p.total_final || 0;
      });

      const vendas = Object.entries(agrupadoVendas).map(([id, info]) => ({
        nomeRestaurante: nomeDoRestaurante(id),
        qtdPedidos: info.qtd,
        faturamento: info.fat,
        ticketMedio: info.qtd > 0 ? info.fat / info.qtd : 0,
      }));
      setDadosVendas(vendas);

      // ========== RELATÓRIO 2: CANCELAMENTO ==========
      const relevantes = pedidos.filter(
        (p) => p.status === "entregue" || p.status === "recusado",
      );
      const agrupadoCancel = {};
      relevantes.forEach((p) => {
        const id = p.id_restaurante;
        if (!agrupadoCancel[id])
          agrupadoCancel[id] = { total: 0, recusados: 0 };
        agrupadoCancel[id].total += 1;
        if (p.status === "recusado") agrupadoCancel[id].recusados += 1;
      });

      const cancelamento = Object.entries(agrupadoCancel).map(([id, info]) => ({
        nomeRestaurante: nomeDoRestaurante(id),
        totalPedidos: info.total,
        recusados: info.recusados,
        percentualCancelamento:
          info.total > 0 ? (info.recusados / info.total) * 100 : 0,
      }));
      setDadosCancelamento(cancelamento);

      // ========== RELATÓRIO 3: PRODUTOS ==========
      const restsParaBuscar =
        filtroRestaurante === "todos"
          ? restaurantes
          : restaurantes.filter((r) => r.id_restaurante === filtroRestaurante);

      const todosProdutos =
        await RelatorioModel.buscarTodosProdutos(restsParaBuscar);

      const contagemProd = {};
      finalizados.forEach((pedido) => {
        if (!pedido.itens) return;
        pedido.itens.forEach((item) => {
          const chave = `${pedido.id_restaurante}_${item.nome || item.id}`;
          if (!contagemProd[chave]) {
            contagemProd[chave] = {
              idRest: pedido.id_restaurante,
              nome: item.nome || "Sem nome",
              qtd: 0,
              valor: 0,
            };
          }
          const quantidade = item.qtd || item.quantidade || 1;
          contagemProd[chave].qtd += quantidade;
          contagemProd[chave].valor += (item.preco || 0) * quantidade;
        });
      });

      const produtos = Object.values(contagemProd).map((info) => {
        const prodCad = todosProdutos.find(
          (p) => p.idRestaurante === info.idRest && p.nome === info.nome,
        );
        return {
          nomeRestaurante:
            prodCad?.nomeRestaurante || nomeDoRestaurante(info.idRest),
          especialidade:
            prodCad?.especialidadeRestaurante ||
            especialidadeDoRestaurante(info.idRest),
          produtoNome: info.nome,
          categoriaProduto: prodCad?.categoria || info.nome, // usa categoria do item se existir
          qtdVendida: info.qtd,
          valorTotal: info.valor,
        };
      });
      setDadosProduto(produtos);
    } catch (e) {
      console.error("Erro ao gerar relatórios:", e);
      alert("Erro ao gerar relatórios. Verifique o console.");
    } finally {
      setCarregando(false);
    }
  };

  const ordenar = (aba, campo) => {
    const novaDirecao =
      ordenacao.campo === campo && ordenacao.direcao === "asc" ? "desc" : "asc";
    setOrdenacao({ campo, direcao: novaDirecao });

    const sortFn = (a, b) => {
      if (typeof a[campo] === "string") {
        return novaDirecao === "asc"
          ? a[campo].localeCompare(b[campo])
          : b[campo].localeCompare(a[campo]);
      }
      return novaDirecao === "asc" ? a[campo] - b[campo] : b[campo] - a[campo];
    };

    if (aba === "vendas") setDadosVendas((prev) => [...prev].sort(sortFn));
    if (aba === "cancelamento")
      setDadosCancelamento((prev) => [...prev].sort(sortFn));
    if (aba === "produto") setDadosProduto((prev) => [...prev].sort(sortFn));
  };

  return {
    restaurantes,
    filtroRestaurante,
    setFiltroRestaurante,
    txtDataInicial,
    setTxtDataInicial,
    txtDataFinal,
    setTxtDataFinal,
    dadosVendas,
    dadosCancelamento,
    dadosProduto,
    carregando,
    ordenacao,
    gerarRelatorio,
    ordenar,
  };
};
