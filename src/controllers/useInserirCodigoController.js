import { useRouter } from 'expo-router';
import { useState } from 'react';
import { API_URL } from '../config/api'; // <-- Mágica do IP automático aqui

export const useInserirCodigoController = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleValidarCodigo = async (email, codigo) => {
    // Validação básica antes de enviar para o servidor
    if (!codigo || codigo.length !== 6) {
      setErro('Por favor, insira o código de 6 dígitos.');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      // Usando o IP dinâmico
      const response = await fetch(`${API_URL}/verificar-codigo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, codigo }),
      });

      const data = await response.json();

      if (response.ok) {
        // Se o código estiver correto, vai para a tela de redefinir senha.
        // Formato com crase para evitar erros de tipagem na rota do Expo
        router.push(`/redefinir-senha?emailDaRecuperacao=${email}`);
      } else {
        setErro(data.message || 'Código inválido ou expirado.');
      }
    } catch (error) {
      console.error(error);
      setErro('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleValidarCodigo,
    loading,
    erro,
  };
};