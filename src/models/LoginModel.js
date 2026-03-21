import { signInWithCustomToken, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { API_URL } from '../config/api'; // <-- Puxando o IP dinâmico para conversar com o Node
import { auth, db } from '../config/firebase';

export const LoginModel = {
  // 1. Pede pro backend enviar o código pro e-mail
  solicitarCodigoLogin: async (email) => {
    const res = await fetch(`${API_URL}/enviar-codigo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.erro || "Erro ao solicitar código.");
    }
    
    return true;
  },

  // 2. Envia o código digitado e faz o Login com o Token (Passe VIP)
  validarCodigoELogar: async (email, codigo) => {
    const res = await fetch(`${API_URL}/verificar-codigo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, codigo })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.erro || "Código inválido.");
    }

    // A MÁGICA: Faz o login nativo no Firebase usando o Custom Token recebido do backend!
    const userCredential = await signInWithCustomToken(auth, data.token);
    const user = userCredential.user;

    // Procura na coleção de Restaurantes para ver se ele é restaurante
    const restDoc = await getDoc(doc(db, "restaurantes", user.uid));
    if (restDoc.exists()) {
      return { user, tipo: 'restaurante' };
    }

    // Procura na coleção de Consumidores para ver se ele é consumidor
    const consDoc = await getDoc(doc(db, "consumidores", user.uid));
    if (consDoc.exists()) {
      return { user, tipo: 'consumidor' };
    }

    // Se logar mas não tiver documento (erro de banco), avisa:
    throw new Error("TIPO_NAO_ENCONTRADO");
  },

  sair: async () => {
    // Função simples de logoff do Firebase
    await signOut(auth);
  }
};