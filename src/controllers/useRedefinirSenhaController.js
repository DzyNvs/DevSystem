import { useRouter } from 'expo-router';
import { useState } from 'react';
import { API_URL } from '../config/api'; // <-- Mágica do IP automático aqui

export const useRedefinirSenhaController = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleAtualizarSenha = async (email, novaSenha, confirmarSenha) => {
    if (!novaSenha || !confirmarSenha) {
      setErro('Preencha os dois campos.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      // Usando o IP dinâmico
      const response = await fetch(`${API_URL}/atualizar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, novaSenha }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Sucesso! Senha alterada com sucesso. Faça login novamente.');
        // Volta para a tela inicial de Login (a raiz do app)
        router.replace('/'); 
      } else {
        setErro(data.message || 'Erro ao atualizar a senha.');
      }
    } catch (error) {
      console.error(error);
      setErro('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return { handleAtualizarSenha, loading, erro };
};