import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const LoginModel = {
  entrar: async (email, senha) => {
    // 1. Tenta logar no Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // --- NOVA TRAVA DE SEGURANÇA: VERIFICAÇÃO DE E-MAIL ---
    if (!user.emailVerified) {
      await signOut(auth); // Desloga imediatamente para não manter sessão ativa
      throw new Error("EMAIL_NAO_VERIFICADO"); // Lança o erro para o Controller capturar
    }
    // ------------------------------------------------------

    // 2. Procura na coleção de Restaurantes para ver se ele é restaurante
    const restDoc = await getDoc(doc(db, "restaurantes", user.uid));
    if (restDoc.exists()) {
      return { user, tipo: 'restaurante' };
    }

    // 3. Procura na coleção de Consumidores para ver se ele é consumidor
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