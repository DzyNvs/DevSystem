import { router } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { db } from '../config/firebase';
import { AuthModel } from '../models/AuthModel';

const validarCNPJ = (cnpj) => {
  const numeros = cnpj.replace(/\D/g, '');

  if (numeros.length !== 14) return false;

  // Rejeita sequências iguais: 00.000.000/0000-00, 11.111.111/1111-11, etc.
  if (/^(\d)\1{13}$/.test(numeros)) return false;

  // Valida 1º dígito verificador
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 12; i++) soma += parseInt(numeros[i]) * pesos1[i];
  let resto = soma % 11;
  const dv1 = resto < 2 ? 0 : 11 - resto;
  if (dv1 !== parseInt(numeros[12])) return false;

  // Valida 2º dígito verificador
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  soma = 0;
  for (let i = 0; i < 13; i++) soma += parseInt(numeros[i]) * pesos2[i];
  resto = soma % 11;
  const dv2 = resto < 2 ? 0 : 11 - resto;
  if (dv2 !== parseInt(numeros[13])) return false;

  return true;
};

const validarCPF = (cpf) => {
  const numeros = cpf.replace(/\D/g, '');

  if (numeros.length !== 11) return false;

  // Rejeita sequências iguais: 000.000.000-00, 111.111.111-11, etc.
  if (/^(\d)\1{10}$/.test(numeros)) return false;

  // Valida 1º dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(numeros[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numeros[9])) return false;

  // Valida 2º dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(numeros[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numeros[10])) return false;

  return true;
};

// Retorna 'ok', 'vazia', 'invalida' ou 'futura'
const validarDataNascimento = (dataStr) => {
  if (!dataStr || dataStr.length < 10) return 'vazia';

  const partes = dataStr.split('/');
  if (partes.length !== 3) return 'invalida';

  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1; // mês base 0
  const ano = parseInt(partes[2], 10);

  // Checa se os valores fazem sentido antes de criar o objeto
  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return 'invalida';
  if (ano < 1900 || ano > 9999) return 'invalida';

  const data = new Date(ano, mes, dia);

  // Garante que o Date não "estourou" para o mês seguinte (ex: 31/02)
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes ||
    data.getDate() !== dia
  ) return 'invalida';

  // Data não pode ser hoje nem no futuro
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (data >= hoje) return 'futura';

  return 'ok';
};

export const useAuthController = () => {
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
  const [placaVeiculo, setPlacaVeiculo] = useState('');

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
        if (!validarCNPJ(cnpj)) throw new Error("CNPJ_INVALIDO");
        const id_restaurante = `rest_${numeroAleatorio}`;
        await AuthModel.registrarRestaurante({ email, nomeFantasia, razaoSocial, cnpj, id_restaurante });

      } else if (tipoUsuario === 'motoboy') {
        if (!cpf) throw new Error("CPF_VAZIO");
        if (!validarCPF(cpf)) throw new Error("CPF_INVALIDO");
        if (!placaVeiculo) throw new Error("PLACA_VAZIA");

        const id_motoboy = `moto_${numeroAleatorio}`;
        await AuthModel.registrarMotoboy({
          email, nome, cpf, telefone, placaVeiculo, id_motoboy, tipo: 'motoboy'
        });

      } else {
        // Consumidor
        if (!cpf) throw new Error("CPF_VAZIO");
        if (!validarCPF(cpf)) throw new Error("CPF_INVALIDO");

        if (!telefone) throw new Error("TELEFONE_VAZIO");
        const telefoneLimpo = telefone.replace(/\D/g, '');
        if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
          throw new Error("TELEFONE_INVALIDO");
        }

        const resultadoData = validarDataNascimento(dataNascimento);
        if (resultadoData === 'vazia') throw new Error("DATA_NASCIMENTO_VAZIA");
        if (resultadoData === 'invalida') throw new Error("DATA_NASCIMENTO_INVALIDA");
        if (resultadoData === 'futura') throw new Error("DATA_NASCIMENTO_FUTURA");

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
      else if (error.message === "CPF_INVALIDO") mensagemErro = "CPF inválido. Verifique os dígitos e tente novamente.";
      else if (error.message === "TELEFONE_VAZIO") mensagemErro = "Por favor, preencha o campo de telefone.";
      else if (error.message === "TELEFONE_INVALIDO") mensagemErro = "Telefone inválido. Informe um número com DDD (10 ou 11 dígitos).";
      else if (error.message === "TELEFONE_JA_CADASTRADO") mensagemErro = "Este telefone já está cadastrado. Tente fazer login.";
      else if (error.message === "CPF_JA_CADASTRADO") mensagemErro = "Este CPF já está cadastrado. Tente fazer login.";
      else if (error.message === "CNPJ_JA_CADASTRADO") mensagemErro = "Este CNPJ já está cadastrado. Tente fazer login.";
      else if (error.message === "CNPJ_VAZIO") mensagemErro = "Por favor, preencha o campo de CNPJ.";
      else if (error.message === "CNPJ_INVALIDO") mensagemErro = "CNPJ inválido. Verifique os dígitos e tente novamente.";
      else if (error.message === "DATA_NASCIMENTO_VAZIA") mensagemErro = "Por favor, informe sua data de nascimento.";
      else if (error.message === "DATA_NASCIMENTO_INVALIDA") mensagemErro = "Data de nascimento inválida. Use o formato DD/MM/AAAA.";
      else if (error.message === "DATA_NASCIMENTO_FUTURA") mensagemErro = "Data de nascimento inválida. A data não pode ser hoje ou no futuro.";
      else if (error.code === "auth/email-already-in-use") mensagemErro = "Este e-mail já está cadastrado. Tente fazer login.";
      else if (error.code === "auth/invalid-email") mensagemErro = "E-mail inválido. Verifique e tente novamente.";
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