import { router } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { db } from '../config/firebase';
import { AuthModel } from '../models/AuthModel';

export const useAuthController = () => {
  const [isRestaurante, setIsRestaurante] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');

  const handleNomeChange = (texto) => {
    const textoLimpo = texto.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 100);
    setNome(textoLimpo);
  };

  const handleCpfChange = (texto) => {
    let formatado = texto.replace(/\D/g, ''); 
    if (formatado.length > 11) formatado = formatado.slice(0, 11);
    
    formatado = formatado.replace(/(\d{3})(\d)/, '$1.$2');
    formatado = formatado.replace(/(\d{3})(\d)/, '$1.$2');
    formatado = formatado.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setCpf(formatado);
  };

  const handleTelefoneChange = (texto) => {
    let formatado = texto.replace(/\D/g, ''); 
    if (formatado.length > 11) formatado = formatado.slice(0, 11);

    formatado = formatado.replace(/^(\d{2})(\d)/g, '($1) $2');
    formatado = formatado.replace(/(\d{5})(\d)/, '$1-$2');
    setTelefone(formatado);
  };

  const handleCnpjChange = (texto) => {
    let formatado = texto.replace(/\D/g, ''); 
    if (formatado.length > 14) formatado = formatado.slice(0, 14);

    formatado = formatado.replace(/^(\d{2})(\d)/, '$1.$2');
    formatado = formatado.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    formatado = formatado.replace(/\.(\d{3})(\d)/, '.$1/$2');
    formatado = formatado.replace(/(\d{4})(\d)/, '$1-$2');
    setCnpj(formatado);
  };

  const handleCadastro = async () => {
    if (!email || !senha) {
      setErro("E-mail e senha são obrigatórios!");
      return;
    }

    setCarregando(true);
    setErro('');
    
    try {
      if (isRestaurante) {
        if (!cnpj) throw new Error("CNPJ_VAZIO");
        await AuthModel.registrarRestaurante({ email, senha, nomeFantasia, razaoSocial, cnpj });
      } else {
        if (!cpf) throw new Error("CPF_VAZIO");
        if (!telefone) throw new Error("TELEFONE_VAZIO");

        const qTel = query(collection(db, 'consumidores'), where('telefone', '==', telefone));
        const snapTel = await getDocs(qTel);
        if (!snapTel.empty) {
          throw new Error("TELEFONE_JA_CADASTRADO");
        }

        await AuthModel.registrarConsumidor({ email, senha, nome, cpf, telefone, dataNascimento });
      }

      const mensagem = "Enviamos um link de verificação. Acesse sua caixa de entrada antes de fazer o login.";
      
      if (Platform.OS === 'web') {
        window.alert(mensagem); 
        router.back(); 
      } else {
        Alert.alert("Verifique seu e-mail", mensagem, [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
      
    } catch (error) {
      console.log("Erro capturado:", error);
      let mensagemErro = "Ocorreu um erro ao realizar o cadastro.";

      if (error.message === "CPF_JA_CADASTRADO") mensagemErro = "Este CPF já está vinculado a uma conta.";
      else if (error.message === "CNPJ_JA_CADASTRADO") mensagemErro = "Este CNPJ já está vinculado a um restaurante.";
      else if (error.message === "TELEFONE_JA_CADASTRADO") mensagemErro = "Este telefone já está cadastrado no sistema.";
      else if (error.message === "CPF_VAZIO") mensagemErro = "Por favor, preencha o campo de CPF.";
      else if (error.message === "TELEFONE_VAZIO") mensagemErro = "Por favor, preencha o campo de Telefone.";
      else if (error.message === "CNPJ_VAZIO") mensagemErro = "Por favor, preencha o campo de CNPJ.";
      else if (error.code === "auth/email-already-in-use") mensagemErro = "Este e-mail já está em uso por outra conta.";
      else if (error.code === "auth/invalid-email") mensagemErro = "O e-mail digitado não é válido.";
      else if (error.code === "auth/weak-password") mensagemErro = "A senha é muito fraca. Digite pelo menos 6 caracteres.";

      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  const irParaLogin = () => {
    router.back(); 
  };

  return {
    isRestaurante, setIsRestaurante,
    email, setEmail, senha, setSenha,
    nome, handleNomeChange, cpf, handleCpfChange, telefone, handleTelefoneChange, dataNascimento, setDataNascimento,
    nomeFantasia, setNomeFantasia, razaoSocial, setRazaoSocial, cnpj, handleCnpjChange,
    handleCadastro, carregando, erro, irParaLogin 
  };
};