import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ProdutoModel } from '../models/ProdutoModel';
import { RestauranteModel } from '../models/RestauranteModel';
import { useCarrinhoStore } from './useCarrinhoStore';

export const useRestauranteDetalhesController = () => {
  const { id: idRestaurante } = useLocalSearchParams();

  const [restaurante, setRestaurante] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [carregandoRestaurante, setCarregandoRestaurante] = useState(true);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  
  const [pratoSelecionado, setPratoSelecionado] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);

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
      const dadosRestaurante = await RestauranteModel.buscarPorId(idRestaurante);
      if (dadosRestaurante) {
        setRestaurante({
          ...dadosRestaurante,
          avaliacao: dadosRestaurante.avaliacao || 5.0,
          tempoEntrega: dadosRestaurante.tempo_entrega || '30-40',
          taxaEntrega: dadosRestaurante.taxa_entrega || 5.00,
          banner: dadosRestaurante.imagens?.capaUrl || dadosRestaurante.banner || 'https://images.unsplash.com/photo-1490818387583-1b5ba45227d8?q=80&w=1200',
          logo: dadosRestaurante.imagens?.logoUrl || null,
        });
      }

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