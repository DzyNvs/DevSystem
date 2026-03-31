import { useState, useEffect } from 'react';
import { ProdutoModel } from '../models/ProdutoModel';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import { auth, db } from '../config/firebase'; // 👉 Importamos o auth e db
import { doc, getDoc } from 'firebase/firestore';

export const useCardapioController = () => {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'restaurantes', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().id_restaurante) {
        const idRestauranteAtual = docSnap.data().id_restaurante;
        
        // Busca usando o ID real
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