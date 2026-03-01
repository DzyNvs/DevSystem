import { router } from 'expo-router';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'; // Importando o Firebase
import { useState } from 'react';

export const useEsqueciSenhaController = () => {
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleEnviar = async () => {
    // Validação básica de campo vazio
    if (!email) {
      setErro("Por favor, insira o e-mail cadastrado.");
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const auth = getAuth(); // Pega a instância de autenticação do seu firebaseConfig

      // A mágica acontece aqui: O Firebase envia o e-mail de recuperação sozinho!
      await sendPasswordResetEmail(auth, email);

      // Feedback de sucesso para o usuário
      alert("Sucesso! Um link de redefinição foi enviado para o seu e-mail. Verifique sua caixa de entrada e spam. 🥗");

      // Como o Firebase envia um link e não um código, não precisamos mais da tela 'inserir-codigo'.
      // Vamos mandar o usuário de volta para o Login.
      router.push('/login'); 
      
    } catch (error) {
      console.log("Erro Firebase Auth:", error.code);

      // Tratando os erros comuns do Firebase para o usuário entender
      switch (error.code) {
        case 'auth/user-not-found':
          setErro("Este e-mail não está cadastrado no FitWay.");
          break;
        case 'auth/invalid-email':
          setErro("O formato do e-mail inserido é inválido.");
          break;
        default:
          setErro("Ocorreu um erro ao enviar o e-mail. Tente novamente mais tarde.");
      }
    } finally {
      setCarregando(false);
    }
  };

  const voltar = () => {
    router.back();
  };

  return { email, setEmail, carregando, erro, handleEnviar, voltar };
};