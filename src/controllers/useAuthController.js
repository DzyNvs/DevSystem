import { router } from 'expo-router'; // <--- Adicionado para fazer a navegação
import { useState } from 'react';
import { AuthModel } from '../models/AuthModel';

export const useAuthController = () => {
  const [isRestaurante, setIsRestaurante] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  // Campos Comuns
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Campos Consumidor
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  // Campos Restaurante
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');

  const handleCadastro = async () => {
    // Validação básica para evitar mandar campos vazios
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
        alert('Restaurante cadastrado com sucesso!');
      } else {
        if (!cpf) throw new Error("CPF_VAZIO");
        await AuthModel.registrarConsumidor({ email, senha, nome, cpf, telefone, dataNascimento });
        alert('Consumidor cadastrado com sucesso!');
      }
      
      // Se o cadastro der certo, manda o usuário para o login (ou para a home futuramente)
      router.replace('/');
      
    } catch (error) {
      console.log("Erro capturado:", error); // Para te ajudar a ver o erro no console/terminal
      
      let mensagemErro = "Ocorreu um erro ao realizar o cadastro.";

      // 1. Traduzindo erros do nosso Model (CPF e CNPJ)
      if (error.message === "CPF_JA_CADASTRADO") {
        mensagemErro = "Este CPF já está vinculado a uma conta.";
      } else if (error.message === "CNPJ_JA_CADASTRADO") {
        mensagemErro = "Este CNPJ já está vinculado a um restaurante.";
      } else if (error.message === "CPF_VAZIO") {
        mensagemErro = "Por favor, preencha o campo de CPF.";
      } else if (error.message === "CNPJ_VAZIO") {
        mensagemErro = "Por favor, preencha o campo de CNPJ.";
      }
      
      // 2. Traduzindo erros padrões do Firebase Auth (E-mail e Senha)
      else if (error.code === "auth/email-already-in-use") {
        mensagemErro = "Este e-mail já está em uso por outra conta.";
      } else if (error.code === "auth/invalid-email") {
        mensagemErro = "O e-mail digitado não é válido.";
      } else if (error.code === "auth/weak-password") {
        mensagemErro = "A senha é muito fraca. Digite pelo menos 6 caracteres.";
      } else if (error.code === "auth/missing-password") {
        mensagemErro = "A senha é obrigatória.";
      } else if (error.code === "auth/network-request-failed") {
        mensagemErro = "Erro de conexão. Verifique sua internet.";
      }

      // Exibe a mensagem limpa na tela
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  // <--- NOVA FUNÇÃO ADICIONADA AQUI --->
  const irParaLogin = () => {
    // router.back() volta para a tela anterior na pilha de navegação (que é o Login)
    router.back(); 
  };

  return {
    isRestaurante, setIsRestaurante,
    email, setEmail, senha, setSenha,
    nome, setNome, cpf, setCpf, telefone, setTelefone, dataNascimento, setDataNascimento,
    nomeFantasia, setNomeFantasia, razaoSocial, setRazaoSocial, cnpj, setCnpj,
    handleCadastro, carregando, erro, irParaLogin // <--- Exportando a nova função
  };
};