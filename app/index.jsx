import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth, db } from "../src/config/firebase";
import { LoginScreen } from "../src/views/LoginScreen";

export default function Index() {
  const [verificando, setVerificando] = useState(true);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // ✅ ADMIN — checa pelo e-mail antes de tudo
          if (user.email?.toLowerCase() === "devsystemimpacta@gmail.com") {
            router.replace("/(tabs)/admin/home");
            setVerificando(false);
            return;
          }

          // Checa se é restaurante
          const docRest = await getDoc(doc(db, "restaurantes", user.uid));
          if (docRest.exists()) {
            router.replace("/home-restaurante-screen");
            setVerificando(false);
            return;
          }

          // Checa se é entregador (motoboy)
          const docMoto = await getDoc(doc(db, "entregadores", user.uid));
          if (docMoto.exists()) {
            router.replace("/motoboy/home");
            setVerificando(false);
            return;
          }

          // Se não é nenhum dos anteriores, assume consumidor
          router.replace("/home-consumidor-screen");
        } catch (error) {
          console.log("Erro ao verificar tipo de conta:", error);
          setMostrarLogin(true);
        }
      } else {
        setMostrarLogin(true);
      }
      setVerificando(false);
    });

    return () => unsubscribe();
  }, []);

  if (verificando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F2E3BB",
        }}
      >
        <ActivityIndicator size="large" color="#93BD57" />
      </View>
    );
  }

  if (mostrarLogin) {
    return <LoginScreen />;
  }

  return null;
}
