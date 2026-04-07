import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth, db } from '../src/config/firebase';
import { LoginScreen } from '../src/views/LoginScreen';

export default function Index() {
  const [verificando, setVerificando] = useState(true);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRest = await getDoc(doc(db, 'restaurantes', user.uid));
          
          if (docRest.exists()) {
            router.replace('/home-restaurante-screen');
          } else {
            router.replace('/home-consumidor-screen');
          }
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2E3BB' }}>
        <ActivityIndicator size="large" color="#93BD57" />
      </View>
    );
  }

  if (mostrarLogin) {
    return <LoginScreen />;
  }

  return null;
}