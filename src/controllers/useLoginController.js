import { router } from 'expo-router';
import { useState } from 'react';
import { LoginModel } from '../models/LoginModel';

export const useLoginController = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    if (!email || !senha) {
      setErro("Por favor, preencha e-mail e senha.");
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      // Recebe o usuário logado e o seu tipo
      const resultado = await LoginModel.entrar(email, senha);
      
      // Redireciona baseado no tipo
      if (resultado.tipo === 'restaurante') {
        router.replace('/home-restaurante');
      } else {
        router.replace('/home-consumidor');
      }
      
    } catch (error) {
      console.log("Erro no login:", error);
      
      let mensagemErro = "Erro ao fazer login. Tente novamente.";

      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        mensagemErro = "E-mail ou senha incorretos.";
      } else if (error.code === 'auth/invalid-email') {
        mensagemErro = "O formato do e-mail é inválido.";
      } else if (error.message === "TIPO_NAO_ENCONTRADO") {
        mensagemErro = "Conta existente, mas não foi possível definir se é consumidor ou restaurante.";
      }

      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  const irParaCadastro = () => {
    router.push('/cadastro');
  };

  return { email, setEmail, senha, setSenha, carregando, erro, handleLogin, irParaCadastro };
};