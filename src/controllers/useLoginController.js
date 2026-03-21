import { router } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { auth, db } from '../config/firebase';
import { LoginModel } from '../models/LoginModel';

export const useLoginController = () => {
  const [identificador, setIdentificador] = useState(''); 
  const [codigo, setCodigo] = useState('');
  const [etapa, setEtapa] = useState('email'); // Controla se mostra o campo de email ou de código
  const [emailConfirmado, setEmailConfirmado] = useState(''); // Guarda o e-mail real após a busca
  
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  // --- PASSO 1: SOLICITAR O CÓDIGO ---
  const handleSolicitarCodigo = async () => {
    if (!identificador) {
      setErro("Por favor, preencha o e-mail ou telefone.");
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      let emailParaLogin = identificador.trim();



      // Mantivemos a sua lógica: Se não tem @, assume que é telefone e busca o e-mail
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



      // Chama o Model para pedir o código ao Node.js
      await LoginModel.solicitarCodigoLogin(emailParaLogin);
      
      setEmailConfirmado(emailParaLogin); // Salva o e-mail em memória
      setEtapa('codigo'); // Muda a interface para pedir o código

    } catch (error) {
      console.log("Erro ao solicitar código:", error);
      let mensagemErro = "Erro ao enviar o código. Tente novamente.";
      
      if (error.message === "TELEFONE_NAO_ENCONTRADO") {
        mensagemErro = "Nenhuma conta encontrada com este número de telefone.";
      } else if (error.message === "EMAIL_NAO_VINCULADO") {
        mensagemErro = "Conta encontrada, mas não há um e-mail válido vinculado a ela.";
      } else if (error.message) {
        mensagemErro = error.message; // Erro vindo do backend (ex: e-mail não achado)
      }

      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  // --- PASSO 2: VALIDAR O CÓDIGO E ENTRAR ---
  const handleLogin = async () => {
    if (!codigo || codigo.length !== 6) {
      setErro("Por favor, digite o código de 6 dígitos.");
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      // Faz o login nativo usando o Passe VIP gerado pelo Node.js
      const resultado = await LoginModel.validarCodigoELogar(emailConfirmado, codigo);
      
      // Lógica de roteamento que já deixamos perfeita
      if (resultado.tipo === 'restaurante') {
        const userUid = auth.currentUser?.uid || resultado.uid; 
        
        if (userUid) {
          const docRef = doc(db, 'restaurantes', userUid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const dadosRestaurante = docSnap.data();
            if (dadosRestaurante.onboardingConcluido || (dadosRestaurante.endereco && dadosRestaurante.endereco.rua)) {
              router.replace('/home-restaurante-screen');
            } else {
              router.replace('/onboarding-restaurante');
            }
          } else {
            router.replace('/onboarding-restaurante');
          }
          
        } else {
          router.replace('/onboarding-restaurante');
        }
      } else {
        // É Consumidor
        console.log("Informações do Consumidor Logado:", dadosUsuario);
        router.replace('/home-consumidor-screen');
      }
      
    } catch (error) {
      console.log("Erro no login:", error);
      setErro(error.message || "Código inválido ou expirado.");
    } finally {
      setCarregando(false);
    }
  };

  const irParaCadastro = () => {
    router.push('/cadastro');
  };

  return { 
    identificador, setIdentificador, 
    codigo, setCodigo, 
    etapa, setEtapa, 
    carregando, erro, setErro, // <--- AQUI ESTÁ O SETERRO ADICIONADO!
    handleSolicitarCodigo, handleLogin, irParaCadastro 
  };
};