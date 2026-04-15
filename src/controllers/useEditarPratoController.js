import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { ProdutoModel } from '../models/ProdutoModel';

const TAGS = [
  'Alta Proteína', 'Low Carb', 'Baixa Caloria', 'Fibras',
  '100% Vegano', 'Vegetariano', 'Zero Açúcar', 'Sem Glúten',
  'Sem Lactose', 'Keto / Cetogênica', 'Pré-Treino', 'Pós-Treino',
  'Express / Rápido', 'Marmita Fit', 'Prensado a Frio', 'Orgânico',
  'Refeição Livre (Fit)'
];

export const useEditarPratoController = () => {
  const params = useLocalSearchParams();
  const idProduto = params.id;

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [calorias, setCalorias] = useState('');
  const [imagemUri, setImagemUri] = useState(null);
  const [imagemOriginal, setImagemOriginal] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

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
        setCategoria(prato.categoria || '');
        setCalorias(prato.calorias.toString());
        if (prato.foto) {
          setImagemUri(prato.foto);
          setImagemOriginal(prato.foto);
        }
      }
    } catch (error) {
      alert("Erro ao carregar dados do prato.");
    } finally {
      setCarregando(false);
    }
  };

  const selecionarTag = (tag) => {
    setCategoria(prev => prev === tag ? '' : tag);
  };

  const escolherImagem = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Precisamos de permissão para acessar suas fotos!');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImagemUri(result.assets[0].uri);
    }
  };

  const atualizarPrato = async () => {
    if (!nome || !preco) {
      alert("Por favor, preencha pelo menos o nome e o preço.");
      return;
    }

    setSalvando(true);
    try {
      // Upload da foto se mudou
      let fotoUrl = imagemUri || '';
      if (imagemUri && imagemUri !== imagemOriginal) {
        const urlNova = await ProdutoModel.uploadParaCloudinary(imagemUri, Platform.OS);
        if (!urlNova) {
          alert("Erro ao fazer upload da foto. Tente novamente.");
          setSalvando(false);
          return;
        }
        fotoUrl = urlNova;
      }

      const pratoAtualizado = {
        nome,
        descricao,
        preco: parseFloat(preco.replace(',', '.')),
        categoria,
        calorias: parseInt(calorias) || 0,
        foto: fotoUrl,
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
    categoria, calorias, setCalorias,
    imagemUri, escolherImagem, salvando, carregando, atualizarPrato,
    TAGS, selecionarTag, voltar: () => router.back()
  };
};