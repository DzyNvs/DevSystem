import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Platform } from 'react-native';
import { auth, db } from '../config/firebase';
import { ProdutoModel } from '../models/ProdutoModel';

const TAGS = [
  'Alta Proteína', 'Low Carb', 'Baixa Caloria', 'Fibras',
  '100% Vegano', 'Vegetariano', 'Zero Açúcar', 'Sem Glúten',
  'Sem Lactose', 'Keto / Cetogênica', 'Pré-Treino', 'Pós-Treino',
  'Express / Rápido', 'Marmita Fit', 'Prensado a Frio', 'Orgânico',
  'Refeição Livre (Fit)'
];

export const useCadastroPratoController = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [calorias, setCalorias] = useState('');
  const [imagemUri, setImagemUri] = useState(null);
  const [salvando, setSalvando] = useState(false);

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

  const salvarPrato = async () => {
    if (!nome || !preco) {
      alert("Por favor, preencha pelo menos o nome e o preço do prato.");
      return;
    }

    setSalvando(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Você precisa estar logado para cadastrar um prato.");
        return;
      }

      const docRef = doc(db, 'restaurantes', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists() || !docSnap.data().id_restaurante) {
        alert("Erro: ID do restaurante não encontrado no sistema.");
        return;
      }

      const idRestauranteAtual = docSnap.data().id_restaurante;

      // Upload da foto via Cloudinary
      let fotoUrl = '';
      if (imagemUri) {
        fotoUrl = await ProdutoModel.uploadParaCloudinary(imagemUri, Platform.OS);
        if (!fotoUrl) {
          alert("Erro ao fazer upload da foto. Tente novamente.");
          setSalvando(false);
          return;
        }
      }

      const novoPrato = {
        id_restaurante: idRestauranteAtual,
        nome,
        descricao,
        preco: parseFloat(preco.replace(',', '.')),
        categoria,
        calorias: parseInt(calorias) || 0,
        foto: fotoUrl,
      };

      await ProdutoModel.cadastrar(novoPrato);

      alert("Prato cadastrado com sucesso!");

      setNome('');
      setDescricao('');
      setPreco('');
      setCategoria('');
      setCalorias('');
      setImagemUri(null);
    } catch (error) {
      console.error("Erro ao salvar prato:", error);
      alert("Erro ao tentar salvar o prato.");
    } finally {
      setSalvando(false);
    }
  };

  return {
    nome, setNome, descricao, setDescricao, preco, setPreco,
    categoria, calorias, setCalorias,
    imagemUri, escolherImagem, salvarPrato, salvando,
    TAGS, selecionarTag
  };
};