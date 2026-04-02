import { router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { auth, db } from '../config/firebase';
import { ProdutoModel } from '../models/ProdutoModel';

export const useCardapioController = () => {
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarProdutos();
  }, []);

  // Filtro por nome
  useEffect(() => {
    if (!busca.trim()) {
      setProdutosFiltrados(produtos);
    } else {
      const termo = busca.toLowerCase();
      setProdutosFiltrados(produtos.filter(p => p.nome.toLowerCase().includes(termo)));
    }
  }, [busca, produtos]);

  const carregarProdutos = async () => {
    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'restaurantes', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().id_restaurante) {
        const idRestauranteAtual = docSnap.data().id_restaurante;
        const lista = await ProdutoModel.buscarPorRestaurante(idRestauranteAtual);
        setProdutos(lista);
      }
    } catch (error) {
      alert("Erro ao carregar o cardápio.");
    } finally {
      setCarregando(false);
    }
  };

  const deletarProduto = async (idProduto) => {
    const confirmacao = Platform.OS === 'web'
      ? window.confirm("Tem certeza que deseja excluir este prato?")
      : true;

    if (confirmacao) {
      try {
        await ProdutoModel.deletar(idProduto);
        alert("Prato excluído com sucesso!");
        carregarProdutos();
      } catch (error) {
        alert("Erro ao excluir o prato.");
      }
    }
  };

  const toggleDisponibilidade = async (idProduto, valorAtual) => {
    try {
      await ProdutoModel.atualizarDisponibilidade(idProduto, !valorAtual);
      // Atualiza local sem recarregar tudo
      setProdutos(prev =>
        prev.map(p => p.id === idProduto ? { ...p, disponivel: !valorAtual } : p)
      );
    } catch (error) {
      alert("Erro ao alterar disponibilidade.");
    }
  };

  const editarProduto = (idProduto) => {
    router.push({ pathname: '/restaurante/editar-prato', params: { id: idProduto } });
  };

  return {
    produtosFiltrados, carregando, busca, setBusca,
    deletarProduto, editarProduto, toggleDisponibilidade
  };
};