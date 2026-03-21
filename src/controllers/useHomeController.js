import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { LoginModel } from '../models/LoginModel';
import { RestauranteModel } from '../models/RestauranteModel';

export const useHomeController = () => {
  const [restaurantes, setRestaurantes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  // Carrega todos os restaurantes assim que a tela abre
  useEffect(() => {
    carregarRestaurantes();
  }, []);

  const carregarRestaurantes = async (especialidade = null) => {
    setCarregando(true);
    try {
      let listaDb = [];
      
      if (especialidade) {
        listaDb = await RestauranteModel.buscarPorEspecialidade(especialidade);
      } else {
        listaDb = await RestauranteModel.buscarTodos();
      }

      // Mapeamos os dados do banco para o formato que os Cards precisam
      const formatados = listaDb.map(r => ({
        // Pega o ID que criamos ou o ID do documento
        id: r.id_restaurante || r.id, 
        nome: r.nome_fantasia || r.razao_social || 'Restaurante Parceiro',
        // Se não tiver foto no banco, usa uma genérica
        foto: r.foto || 'https://images.unsplash.com/photo-1490818387583-1b5ba45227d8?q=80&w=400', 
        avaliacao: r.avaliacao || 5.0,
        descricao: r.descricao || r.especialidade || 'O melhor da região para você.',
        tempoEntrega: r.tempo_entrega || '30-40',
        taxaEntrega: r.taxa_entrega || 0,
        pedidoMinimo: r.pedido_minimo || 10,
      }));

      setRestaurantes(formatados);
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar restaurantes.");
    } finally {
      setCarregando(false);
    }
  };

  const filtrarPorCategoria = (nomeCategoria) => {
    // Se clicar na categoria que já está selecionada, ele tira o filtro (mostra tudo)
    if (categoriaSelecionada === nomeCategoria) {
      setCategoriaSelecionada(null);
      carregarRestaurantes(null);
    } else {
      // Se clicar numa nova, ele filtra
      setCategoriaSelecionada(nomeCategoria);
      carregarRestaurantes(nomeCategoria);
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

  const abrirRestaurante = (idRestaurante) => {
    router.push({ pathname: '/consumidor/restaurante-detalhes', params: { id: idRestaurante } });
  };

  return { 
    handleLogoff, 
    abrirRestaurante,
    restaurantes,
    carregando,
    categoriaSelecionada,
    filtrarPorCategoria
  };
};