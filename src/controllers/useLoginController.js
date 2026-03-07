import { router } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { db } from '../config/firebase';
import { LoginModel } from '../models/LoginModel';

export const useLoginController = () => {
  const [identificador, setIdentificador] = useState(''); 
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    if (!identificador || !senha) {
      setErro("Por favor, preencha o e-mail/telefone e a senha.");
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      let emailParaLogin = identificador.trim();

      if (!emailParaLogin.includes('@')) {
        let telefoneBusca = emailParaLogin;
        const apenasNumeros = emailParaLogin.replace(/\D/g, '');

        if (apenasNumeros.length === 11) {
          telefoneBusca = apenasNumeros.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }

        const qTel = query(collection(db, 'consumidores'), where('telefone', '==', telefoneBusca));
        const snapTel = await getDocs(qTel);

        if (snapTel.empty) {
          throw new Error("TELEFONE_NAO_ENCONTRADO");
        }

        const docUsuario = snapTel.docs[0].data();
        if (!docUsuario.email) {
          throw new Error("EMAIL_NAO_VINCULADO");
        }
        
        emailParaLogin = docUsuario.email; 
      }

      const resultado = await LoginModel.entrar(emailParaLogin, senha);
      
      if (resultado.tipo === 'restaurante') {
        router.replace('/home-restaurante-screen');
      } else {
        router.replace('/home-consumidor-screen');
      }
      
    } catch (error) {
      console.log("Erro no login:", error);
      let mensagemErro = "Erro ao fazer login. Tente novamente.";

      if (error.message === "TELEFONE_NAO_ENCONTRADO") {
        mensagemErro = "Nenhuma conta encontrada com este número de telefone.";
      } else if (error.message === "EMAIL_NAO_VINCULADO") {
        mensagemErro = "Conta encontrada, mas não há um e-mail válido vinculado a ela.";
      } else if (error.message === "EMAIL_NAO_VERIFICADO") {
        mensagemErro = "Por favor, verifique seu e-mail antes de entrar.";
        const msgAlerta = "Você precisa clicar no link que enviamos para o seu e-mail antes de acessar o aplicativo.";
        if (Platform.OS === 'web') {
          window.alert(msgAlerta);
        } else {
          Alert.alert("E-mail não verificado", msgAlerta, [{ text: "Entendi" }]);
        }
      } 
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

  return { identificador, setIdentificador, senha, setSenha, carregando, erro, handleLogin, irParaCadastro };
};