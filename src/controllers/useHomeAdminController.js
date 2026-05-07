import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { AdminModel } from "../models/AdminModel";

export const useHomeAdminController = () => {
  const [carregando, setCarregando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);

  // Dados dos relatórios
  const [restaurantes, setRestaurantes] = useState([]);
  const [consumidores, setConsumidores] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [entregadores, setEntregadores] = useState([]);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [rests, cons, peds, motos, prods] = await Promise.all([
        AdminModel.buscarTodosRestaurantes(),
        AdminModel.buscarTodosConsumidores(),
        AdminModel.buscarTodosPedidos(),
        AdminModel.buscarTodosEntregadores(),
        AdminModel.buscarTodosProdutos(),
      ]);

      setRestaurantes(rests);
      setConsumidores(cons);
      setPedidos(peds);
      setEntregadores(motos);
      setProdutos(prods);
    } catch (error) {
      console.error("Erro ao carregar dados admin:", error);
      alert("Erro ao carregar dados do painel.");
    } finally {
      setCarregando(false);
    }
  };

  // --- Métricas calculadas ---
  const totalRestaurantes = restaurantes.length;
  const totalConsumidores = consumidores.length;
  const totalPedidos = pedidos.length;
  const totalEntregadores = entregadores.length;
  const totalProdutos = produtos.length;

  // Restaurantes com onboarding concluído vs pendente
  const restAtivos = restaurantes.filter((r) => r.onboardingConcluido).length;
  const restPendentes = totalRestaurantes - restAtivos;

  // Pedidos por status
  const pedidosPorStatus = pedidos.reduce((acc, p) => {
    const status = p.status || "desconhecido";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Faturamento total (soma dos totais dos pedidos concluídos/entregues)
  const faturamentoTotal = pedidos
    .filter((p) => p.status === "entregue" || p.status === "concluido")
    .reduce((acc, p) => acc + (p.total || 0), 0);

  // Top 5 restaurantes por número de pedidos
  const pedidosPorRestaurante = pedidos.reduce((acc, p) => {
    const idRest = p.id_restaurante || "desconhecido";
    acc[idRest] = (acc[idRest] || 0) + 1;
    return acc;
  }, {});

  const topRestaurantes = Object.entries(pedidosPorRestaurante)
    .map(([id, total]) => {
      const rest = restaurantes.find((r) => (r.id_restaurante || r.id) === id);
      return {
        id,
        nome: rest?.nome_fantasia || rest?.razao_social || "Desconhecido",
        totalPedidos: total,
      };
    })
    .sort((a, b) => b.totalPedidos - a.totalPedidos)
    .slice(0, 5);

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuAberto(false);
      router.replace("/");
    } catch (error) {
      alert("Erro ao sair.");
    }
  };

  const toggleMenu = () => setMenuAberto(!menuAberto);

  return {
    carregando,
    carregarDados,
    menuAberto,
    toggleMenu,
    handleLogout,
    // Métricas
    totalRestaurantes,
    totalConsumidores,
    totalPedidos,
    totalEntregadores,
    totalProdutos,
    restAtivos,
    restPendentes,
    pedidosPorStatus,
    faturamentoTotal,
    topRestaurantes,
    // Listas completas (pra tabelas futuras)
    restaurantes,
    consumidores,
    pedidos,
    entregadores,
    produtos,
  };
};
