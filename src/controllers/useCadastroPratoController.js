import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ProdutoModel } from '../models/ProdutoModel';
import { Platform } from 'react-native';
import { auth, db } from '../config/firebase'; // 👉 Importamos o auth e db
import { doc, getDoc } from 'firebase/firestore'; // 👉 Importamos o doc e getDoc

export const useCadastroPratoController = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [calorias, setCalorias] = useState('');
  const [imagemUri, setImagemUri] = useState(null);
  const [salvando, setSalvando] = useState(false);

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
      quality: 0.1, 
      base64: true, 
    });

    if (!result.canceled) {
      const formatoBase64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImagemUri(formatoBase64);
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

      // Vai no banco buscar o id_restaurante deste usuário
      const docRef = doc(db, 'restaurantes', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists() || !docSnap.data().id_restaurante) {
        alert("Erro: ID do restaurante não encontrado no sistema.");
        return;
      }

      const idRestauranteAtual = docSnap.data().id_restaurante;

      const novoPrato = {
        id_restaurante: idRestauranteAtual, // 👉 Usa o ID real que veio do banco
        nome,
        descricao,
        preco: parseFloat(preco.replace(',', '.')), 
        categoria,
        calorias: parseInt(calorias) || 0,
      };

      await ProdutoModel.cadastrar(novoPrato, null);
      
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
    categoria, setCategoria, calorias, setCalorias,
    imagemUri, escolherImagem, salvarPrato, salvando
  };
};