import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform } from 'react-native'; // <-- Importamos o Alert e o Platform aqui também
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

      // --- NOVA REGRA: CAPTURA DO E-MAIL NÃO VERIFICADO ---
      if (error.message === "EMAIL_NAO_VERIFICADO") {
        mensagemErro = "Por favor, verifique seu e-mail antes de entrar.";
        
        const msgAlerta = "Você precisa clicar no link que enviamos para o seu e-mail antes de acessar o aplicativo.";
        if (Platform.OS === 'web') {
          window.alert(msgAlerta);
        } else {
          Alert.alert("E-mail não verificado", msgAlerta, [{ text: "Entendi" }]);
        }
      } 
      // ----------------------------------------------------
      else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
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