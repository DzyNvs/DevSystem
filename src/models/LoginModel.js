import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export const LoginModel = {
  entrar: async (email, senha) => {
    // Faz a requisição para o Firebase tentar logar o usuário
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    return userCredential.user;
  }
};