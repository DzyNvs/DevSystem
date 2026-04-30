import { router } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { db } from '../config/firebase';
import { AuthModel } from '../models/AuthModel';

export const useAuthController = () => {
  // Mudança aqui: de boolean para string
  const [tipoUsuario, setTipoUsuario] = useState('consumidor'); // 'consumidor', 'restaurante', 'motoboy'
  
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [placaVeiculo, setPlacaVeiculo] = useState(''); // Novo campo para motoboy

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
    if (!email) {
      setErro("E-mail é obrigatório!");
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const numeroAleatorio = Math.floor(100000 + Math.random() * 900000);

      if (tipoUsuario === 'restaurante') {
        if (!cnpj) throw new Error("CNPJ_VAZIO");
        const id_restaurante = `rest_${numeroAleatorio}`;
        await AuthModel.registrarRestaurante({ email, nomeFantasia, razaoSocial, cnpj, id_restaurante });

      } else if (tipoUsuario === 'motoboy') {
        if (!cpf) throw new Error("CPF_VAZIO");
        if (!placaVeiculo) throw new Error("PLACA_VAZIA");
        
        const id_motoboy = `moto_${numeroAleatorio}`;
        // Aqui você chamará o método do seu AuthModel para motoboy
        await AuthModel.registrarMotoboy({ 
          email, nome, cpf, telefone, placaVeiculo, id_motoboy, tipo: 'motoboy' 
        });

      } else {
        // Consumidor
        if (!cpf) throw new Error("CPF_VAZIO");
        if (!telefone) throw new Error("TELEFONE_VAZIO");

        const qTel = query(collection(db, 'consumidores'), where('telefone', '==', telefone));
        const snapTel = await getDocs(qTel);
        if (!snapTel.empty) throw new Error("TELEFONE_JA_CADASTRADO");

        const id_consumidor = `cons_${numeroAleatorio}`;
        await AuthModel.registrarConsumidor({ email, nome, cpf, telefone, dataNascimento, id_consumidor });
      }

      const mensagem = "Enviamos um link de verificação. Acesse sua caixa de entrada antes de fazer o login.";
      if (Platform.OS === 'web') {
        window.alert(mensagem);
        router.back();
      } else {
        Alert.alert("Verifique seu e-mail", mensagem, [{ text: "OK", onPress: () => router.back() }]);
      }
    } catch (error) {
      console.log("Erro capturado:", error);
      let mensagemErro = "Ocorreu um erro ao realizar o cadastro.";
      if (error.message === "PLACA_VAZIA") mensagemErro = "Por favor, informe a placa do veículo.";
      else if (error.message === "CPF_VAZIO") mensagemErro = "Por favor, preencha o campo de CPF.";
      // ... (outros erros que você já tinha)
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  const irParaLogin = () => router.back();

  return {
    tipoUsuario, setTipoUsuario, 
    email, setEmail,
    nome, handleNomeChange, cpf, handleCpfChange, telefone, handleTelefoneChange, dataNascimento, setDataNascimento,
    nomeFantasia, setNomeFantasia, razaoSocial, setRazaoSocial, cnpj, handleCnpjChange,
    placaVeiculo, setPlacaVeiculo,
    handleCadastro, carregando, erro, setErro, irParaLogin
  };
};