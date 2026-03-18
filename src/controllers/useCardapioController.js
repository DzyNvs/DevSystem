import { useState, useEffect } from 'react';
import { ProdutoModel } from '../models/ProdutoModel';
import { router } from 'expo-router';
import { Platform } from 'react-native';

export const useCardapioController = () => {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Carrega os dados assim que a tela abre
  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    setCarregando(true);
    try {
      const idRestauranteAtual = 'rest_01'; // O mesmo ID que estamos usando
      const lista = await ProdutoModel.buscarPorRestaurante(idRestauranteAtual);
      setProdutos(lista);
    } catch (error) {
      alert("Erro ao carregar o cardápio.");
    } finally {
      setCarregando(false);
    }
  };

  const deletarProduto = async (idProduto) => {
    // Confirmação antes de excluir (Tratamento para Web e Celular)
    const confirmacao = Platform.OS === 'web' 
      ? window.confirm("Tem certeza que deseja excluir este prato?") 
      : true; // No celular faríamos um Alert.alert, mas para simplificar na web usamos o confirm nativo

    if (confirmacao) {
      try {
        await ProdutoModel.deletar(idProduto);
        alert("Prato excluído com sucesso!");
        carregarProdutos(); // Recarrega a lista para a tela atualizar
      } catch (error) {
        alert("Erro ao excluir o prato.");
      }
    }
  };

  const editarProduto = (idProduto) => {
    router.push({ pathname: '/restaurante/editar-prato', params: { id: idProduto } });
  }; 

  const irParaNovoPrato = () => {
    router.push('/restaurante/pratos');
  };

  return {
    produtos, carregando, carregarProdutos,
    deletarProduto, editarProduto, irParaNovoPrato
  };
};