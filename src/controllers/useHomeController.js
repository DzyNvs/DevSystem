import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { LoginModel } from '../models/LoginModel';
import { ProdutoModel } from '../models/ProdutoModel';
import { RestauranteModel } from '../models/RestauranteModel';

export const useHomeController = () => {
  const [restaurantesBase, setRestaurantesBase] = useState([]);
  const [restaurantesFiltrados, setRestaurantesFiltrados] = useState([]);
  const [produtosBase, setProdutosBase] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async (especialidade = null) => {
    setCarregando(true);
    try {
      let listaRestaurantes = [];
      if (especialidade) {
        listaRestaurantes = await RestauranteModel.buscarPorEspecialidade(especialidade);
      } else {
        listaRestaurantes = await RestauranteModel.buscarTodos();
      }

      const formatados = listaRestaurantes.map(r => ({
        id: r.id_restaurante || r.id, 
        nome: r.nome_fantasia || r.razao_social || 'Restaurante Parceiro',
        foto: r.imagens?.logoUrl || r.foto || 'https://images.unsplash.com/photo-1490818387583-1b5ba45227d8?q=80&w=400', 
        capa: r.imagens?.capaUrl || null,
        avaliacao: r.avaliacao || 5.0,
        descricao: r.descricao || r.especialidade || 'O melhor da região para você.',
        especialidade: r.especialidade || '', 
        tempoEntrega: r.tempo_entrega || '30-40',
        taxaEntrega: r.taxa_entrega || 0,
        pedidoMinimo: r.pedido_minimo || 10,
      }));

      const listaProdutos = await ProdutoModel.buscarTodos();

      setProdutosBase(listaProdutos);
      setRestaurantesBase(formatados);
      setRestaurantesFiltrados(formatados);
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar dados iniciais.");
    } finally {
      setCarregando(false);
    }
  };

  const filtrarPorCategoria = (nomeCategoria) => {
    setBusca(''); 
    if (categoriaSelecionada === nomeCategoria) {
      setCategoriaSelecionada(null);
      carregarDadosIniciais(null);
    } else {
      setCategoriaSelecionada(nomeCategoria);
      carregarDadosIniciais(nomeCategoria);
    }
  };

  const realizarBusca = (texto) => {
    setBusca(texto);
    
    if (texto.trim() === '') {
      setRestaurantesFiltrados(restaurantesBase);
    } else {
      const textoMinusculo = texto.toLowerCase();
      
      const resultados = restaurantesBase.filter(restaurante => {
        const nomeSeguro = String(restaurante.nome || '').toLowerCase();
        const especialidadeSegura = String(restaurante.especialidade || '').toLowerCase();
        const matchRestaurante = nomeSeguro.includes(textoMinusculo) || especialidadeSegura.includes(textoMinusculo);
        
        const matchPrato = produtosBase.some(produto => {
          if (produto.id_restaurante !== restaurante.id) return false;
          const nomeProduto = String(produto.nome || '').toLowerCase();
          const descProduto = String(produto.descricao || '').toLowerCase();
          return nomeProduto.includes(textoMinusculo) || descProduto.includes(textoMinusculo);
        });
        
        return matchRestaurante || matchPrato;
      });
      
      setRestaurantesFiltrados(resultados);
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
    restaurantesFiltrados, 
    carregando,
    categoriaSelecionada,
    filtrarPorCategoria,
    busca,
    realizarBusca
  };
};