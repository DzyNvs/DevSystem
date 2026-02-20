import { router } from 'expo-router';
import { useState } from 'react';
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
        // Manda direto para a Home do Restaurante
        router.replace('/home-restaurante');
      } else {
        if (!cpf) throw new Error("CPF_VAZIO");
        await AuthModel.registrarConsumidor({ email, senha, nome, cpf, telefone, dataNascimento });
        // Manda direto para a Home do Consumidor
        router.replace('/home-consumidor');
      }
      
    } catch (error) {
      console.log("Erro capturado:", error);
      let mensagemErro = "Ocorreu um erro ao realizar o cadastro.";

      if (error.message === "CPF_JA_CADASTRADO") mensagemErro = "Este CPF já está vinculado a uma conta.";
      else if (error.message === "CNPJ_JA_CADASTRADO") mensagemErro = "Este CNPJ já está vinculado a um restaurante.";
      else if (error.message === "CPF_VAZIO") mensagemErro = "Por favor, preencha o campo de CPF.";
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
    nome, setNome, cpf, setCpf, telefone, setTelefone, dataNascimento, setDataNascimento,
    nomeFantasia, setNomeFantasia, razaoSocial, setRazaoSocial, cnpj, setCnpj,
    handleCadastro, carregando, erro, irParaLogin 
  };
};