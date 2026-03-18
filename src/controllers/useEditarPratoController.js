import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { ProdutoModel } from '../models/ProdutoModel';

export const useEditarPratoController = () => {
  // Pega o ID que vai vir da tela de Cardápio
  const params = useLocalSearchParams();
  const idProduto = params.id;

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [calorias, setCalorias] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Quando a tela abrir, busca os dados daquele prato
  useEffect(() => {
    if (idProduto) {
      carregarPrato();
    }
  }, [idProduto]);

  const carregarPrato = async () => {
    try {
      setCarregando(true);
      const prato = await ProdutoModel.buscarPorId(idProduto);
      if (prato) {
        setNome(prato.nome);
        setDescricao(prato.descricao);
        setPreco(prato.preco.toString()); 
        setCategoria(prato.categoria);
        setCalorias(prato.calorias.toString());
      }
    } catch (error) {
      alert("Erro ao carregar dados do prato.");
    } finally {
      setCarregando(false);
    }
  };

  const atualizarPrato = async () => {
    if (!nome || !preco) {
      alert("Por favor, preencha pelo menos o nome e o preço.");
      return;
    }

    setSalvando(true);
    try {
      const pratoAtualizado = {
        nome,
        descricao,
        preco: parseFloat(preco.replace(',', '.')),
        categoria,
        calorias: parseInt(calorias) || 0,
      };

      await ProdutoModel.atualizar(idProduto, pratoAtualizado);
      
      alert("Prato atualizado com sucesso!");
      router.back(); 
    } catch (error) {
      alert("Erro ao atualizar o prato.");
    } finally {
      setSalvando(false);
    }
  };

  return {
    nome, setNome, descricao, setDescricao, preco, setPreco,
    categoria, setCategoria, calorias, setCalorias,
    salvando, carregando, atualizarPrato
  };
};