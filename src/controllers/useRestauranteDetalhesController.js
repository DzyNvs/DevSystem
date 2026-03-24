import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { RestauranteModel } from '../models/RestauranteModel';
import { ProdutoModel } from '../models/ProdutoModel';
import { useCarrinhoStore } from './useCarrinhoStore';

export const useRestauranteDetalhesController = () => {
  // Pega o ID que veio lá da Home do Consumidor
  const { id: idRestaurante } = useLocalSearchParams();

  const [restaurante, setRestaurante] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [carregandoRestaurante, setCarregandoRestaurante] = useState(true);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  
  const [pratoSelecionado, setPratoSelecionado] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);

  // Puxa a função de adicionar ao carrinho da nossa "memória global"
  const adicionarItemAoCarrinho = useCarrinhoStore((state) => state.adicionarItem);

  useEffect(() => {
    if (idRestaurante) {
      carregarDados();
    }
  }, [idRestaurante]);

  const carregarDados = async () => {
    setCarregandoRestaurante(true);
    setCarregandoProdutos(true);
    
    try {
      // 1. Busca Detalhes do Restaurante
      const dadosRestaurante = await RestauranteModel.buscarPorId(idRestaurante);
      if (dadosRestaurante) {
        setRestaurante({
          ...dadosRestaurante,
          // Valores padrão caso o restaurante não tenha configurado no banco
          avaliacao: dadosRestaurante.avaliacao || 5.0,
          tempoEntrega: dadosRestaurante.tempo_entrega || '30-40',
          taxaEntrega: dadosRestaurante.taxa_entrega || 5.00,
          banner: dadosRestaurante.banner || 'https://images.unsplash.com/photo-1490818387583-1b5ba45227d8?q=80&w=1200'
        });
      }

      // 2. Busca Produtos desse Restaurante
      const listaProdutos = await ProdutoModel.buscarPorRestaurante(idRestaurante);
      setProdutos(listaProdutos);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar dados do restaurante.");
    } finally {
      setCarregandoRestaurante(false);
      setCarregandoProdutos(false);
    }
  };

  const abrirPratoModal = (prato) => {
    setPratoSelecionado(prato);
    setModalVisivel(true);
  };

  const fecharPratoModal = () => {
    setPratoSelecionado(null);
    setModalVisivel(false);
  };

  const handleAdicionarItem = (prato) => {
    // Adiciona o prato no Zustand usando o ID do restaurante atual
    adicionarItemAoCarrinho(prato, idRestaurante); 
    fecharPratoModal(); 
  };

  return {
    restaurante,
    produtos,
    carregandoRestaurante,
    carregandoProdutos,
    pratoSelecionado,
    modalVisivel,
    abrirPratoModal,
    fecharPratoModal,
    handleAdicionarItem,
  };
};