import { router } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { auth, db } from "../config/firebase";
import { LoginModel } from "../models/LoginModel";

export const useLoginController = () => {
  const [identificador, setIdentificador] = useState("");
  const [codigo, setCodigo] = useState("");
  const [etapa, setEtapa] = useState("email");
  const [emailConfirmado, setEmailConfirmado] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // --- PASSO 1: SOLICITAR O CÓDIGO ---
  const handleSolicitarCodigo = async () => {
    if (!identificador) {
      setErro("Por favor, preencha o e-mail ou telefone.");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      let emailParaLogin = identificador.trim();

      // Se não tem @, assume que é telefone e busca o e-mail
      if (!emailParaLogin.includes("@")) {
        let telefoneBusca = emailParaLogin;
        const apenasNumeros = emailParaLogin.replace(/\D/g, "");

        if (apenasNumeros.length === 11) {
          telefoneBusca = apenasNumeros.replace(
            /^(\d{2})(\d{5})(\d{4})/,
            "($1) $2-$3",
          );
        }

        // 1. Busca nos Consumidores
        const qTelCons = query(
          collection(db, "consumidores"),
          where("telefone", "==", telefoneBusca),
        );
        const snapTelCons = await getDocs(qTelCons);

        let docUsuario = null;

        if (!snapTelCons.empty) {
          docUsuario = snapTelCons.docs[0].data();
        } else {
          // 2. Se não achou no consumidor, busca nos Entregadores (Motoboys)
          const qTelMoto = query(
            collection(db, "entregadores"),
            where("telefone", "==", telefoneBusca),
          );
          const snapTelMoto = await getDocs(qTelMoto);

          if (!snapTelMoto.empty) {
            docUsuario = snapTelMoto.docs[0].data();
          }
        }

        if (!docUsuario) {
          throw new Error("TELEFONE_NAO_ENCONTRADO");
        }

        if (!docUsuario.email) {
          throw new Error("EMAIL_NAO_VINCULADO");
        }

        emailParaLogin = docUsuario.email;
      }

      // Chama o Model para pedir o código ao Node.js
      await LoginModel.solicitarCodigoLogin(emailParaLogin);

      setEmailConfirmado(emailParaLogin);
      setEtapa("codigo");
    } catch (error) {
      console.log("Erro ao solicitar código:", error);
      let mensagemErro = "Erro ao enviar o código. Tente novamente.";

      if (error.message === "TELEFONE_NAO_ENCONTRADO") {
        mensagemErro = "Nenhuma conta encontrada com este número de telefone.";
      } else if (error.message === "EMAIL_NAO_VINCULADO") {
        mensagemErro =
          "Conta encontrada, mas não há um e-mail válido vinculado a ela.";
      } else if (error.message) {
        mensagemErro = error.message;
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
    setErro("");

    try {
      const resultado = await LoginModel.validarCodigoELogar(
        emailConfirmado,
        codigo,
      );
      const userUid = auth.currentUser?.uid || resultado.uid;

      if (!userUid) throw new Error("Falha ao recuperar ID do usuário.");

      // ✅ ADMIN — não exige verificação de e-mail, redireciona direto
      if (emailConfirmado.toLowerCase() === "devsystemimpacta@gmail.com") {
        router.replace("/(tabs)/admin/home");
        return;
      }

      // Recarrega o usuário para garantir o emailVerified mais recente
      await auth.currentUser.reload();
      const usuarioAtualizado = auth.currentUser;

      if (!usuarioAtualizado?.emailVerified) {
        // Desloga imediatamente para não deixar sessão aberta
        await LoginModel.sair();
        throw new Error("EMAIL_NAO_VERIFICADO");
      }

      // --- LÓGICA DE REDIRECIONAMENTO POR TIPO DE USUÁRIO ---

      // 1. Verificamos se é Restaurante
      const restSnap = await getDoc(doc(db, "restaurantes", userUid));
      if (restSnap.exists()) {
        const dadosRestaurante = restSnap.data();
        if (
          dadosRestaurante.onboardingConcluido ||
          (dadosRestaurante.endereco && dadosRestaurante.endereco.rua)
        ) {
          router.replace("/home-restaurante-screen");
        } else {
          router.replace("/onboarding-restaurante");
        }
        return;
      }

      // 2. Verificamos se é Entregador (Motoboy)
      const motoSnap = await getDoc(doc(db, "entregadores", userUid));
      if (motoSnap.exists()) {
        console.log("Motoboy logado:", motoSnap.data().nome);
        router.replace("/motoboy/home");
        return;
      }

      // 3. Se não é nenhum dos dois, assume-se que é Consumidor
      const consSnap = await getDoc(doc(db, "consumidores", userUid));
      if (consSnap.exists()) {
        console.log("Consumidor logado:", consSnap.data().nome);
      }
      router.replace("/home-consumidor-screen");
    } catch (error) {
      console.log("Erro no login:", error);
      if (error.message === "EMAIL_NAO_VERIFICADO") {
        setErro(
          "E-mail não confirmado. Acesse sua caixa de entrada e clique no link de verificação antes de fazer login.",
        );
      } else {
        setErro(error.message || "Código inválido ou expirado.");
      }
    } finally {
      setCarregando(false);
    }
  };

  const irParaCadastro = () => {
    router.push("/cadastro");
  };

  return {
    identificador,
    setIdentificador,
    codigo,
    setCodigo,
    etapa,
    setEtapa,
    carregando,
    erro,
    setErro,
    handleSolicitarCodigo,
    handleLogin,
    irParaCadastro,
  };
};