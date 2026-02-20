import { router } from 'expo-router'; // Ferramenta de navegação do Expo
import { useState } from 'react';
import { LoginModel } from '../models/LoginModel';

export const useLoginController = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    // Evita tentar logar com campos vazios
    if (!email || !senha) {
      setErro("Por favor, preencha e-mail e senha.");
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      await LoginModel.entrar(email, senha);
      alert("Login realizado com sucesso!");
      
      // Futuramente, aqui faremos: router.replace('/home');
      
    } catch (error) {
      console.log("Erro no login:", error);
      
      let mensagemErro = "Erro ao fazer login. Tente novamente.";

      // Traduzindo os erros do Firebase
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        mensagemErro = "E-mail ou senha incorretos.";
      } else if (error.code === 'auth/invalid-email') {
        mensagemErro = "O formato do e-mail é inválido.";
      } else if (error.code === 'auth/too-many-requests') {
        mensagemErro = "Muitas tentativas falhas. Tente novamente mais tarde.";
      }

      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  const irParaCadastro = () => {
    // Navega para a rota de cadastro que vamos criar
    router.push('/cadastro');
  };

  return {
    email, setEmail,
    senha, setSenha,
    carregando, erro,
    handleLogin, irParaCadastro
  };
};