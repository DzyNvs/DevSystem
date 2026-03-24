import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const AuthModel = {

  registrarConsumidor: async (dados) => {
    // 1. Verifica se o CPF já existe no banco
    const q = query(collection(db, "consumidores"), where("cpf", "==", dados.cpf));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error("CPF_JA_CADASTRADO");
    }

    // 2. Cria o usuário no Firebase Auth com senha padrão
    const userCredential = await createUserWithEmailAndPassword(auth, dados.email, 'fitway@2026');
    const user = userCredential.user;

    // 3. Dispara o e-mail de verificação nativo do Firebase
    await sendEmailVerification(user);

    // 4. Salva os dados no banco
    await setDoc(doc(db, "consumidores", user.uid), {
      nome: dados.nome,
      email: dados.email,
      cpf: dados.cpf,
      telefone: dados.telefone,
      data_nascimento: dados.dataNascimento,
      id_consumidor: dados.id_consumidor,
      data_criacao: new Date()
    });

    return user;
  },

  registrarRestaurante: async (dados) => {
    // 1. Verifica se o CNPJ já existe no banco
    const q = query(collection(db, "restaurantes"), where("cnpj", "==", dados.cnpj));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error("CNPJ_JA_CADASTRADO");
    }

    // 2. Cria o usuário no Firebase Auth com senha padrão
    const userCredential = await createUserWithEmailAndPassword(auth, dados.email, 'fitway@2026');
    const user = userCredential.user;

    // 3. Dispara o e-mail de verificação nativo do Firebase
    await sendEmailVerification(user);

    // 4. Salva os dados no banco
    await setDoc(doc(db, "restaurantes", user.uid), {
      nome_fantasia: dados.nomeFantasia,
      razao_social: dados.razaoSocial,
      cnpj: dados.cnpj,
      email_rest: dados.email,
      id_restaurante: dados.id_restaurante,
      data_criacao: new Date()
    });

    return user;
  }
};