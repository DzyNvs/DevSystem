import { router } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';

export const useEsqueciSenhaController = () => {
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleEnviar = async () => {
    if (!email) {
      setErro("Por favor, insira o e-mail cadastrado.");
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      // ⚠️ PEGADINHA DO EXPO: Se estiver rodando no celular, o localhost não funciona.
      // Você precisa colocar o IP local da sua rede (ex: 192.168.1.15). 
      // Se for no emulador do Android, use 10.0.2.2. Se for na Web, localhost funciona!
      const url = Platform.OS === 'web' 
        ? 'http://localhost:3000/esqueci-senha' 
        : 'http://255.255.255.0:3000/esqueci-senha'; 

      const resposta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        // Se o servidor devolveu erro (ex: e-mail não existe), disparamos a mensagem do seu Figma
        throw new Error(dados.erro || "Erro ao solicitar código.");
      }
      
      // Se deu tudo certo, enviamos o usuário para a TELA DO CÓDIGO.
      // E mandamos o e-mail "escondido" nos parâmetros para usarmos na próxima tela!
      router.push({ pathname: '/inserir-codigo', params: { emailDaRecuperacao: email } });
      
    } catch (error) {
      console.log("Erro ao recuperar senha:", error);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  const voltar = () => {
    router.back();
  };

  return { email, setEmail, carregando, erro, handleEnviar, voltar };
};