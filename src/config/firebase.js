// Importa a função de inicialização principal
import { initializeApp } from "firebase/app";

// TODO: Importar os serviços que vamos usar no FitWay (Banco e Login)
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Sua configuração do Firebase (mantive a sua)
const firebaseConfig = {
  apiKey: "AIzaSyABqUR1DTGlBAvExdWBg3Os4ixY1SGk3tI",
  authDomain: "fitway-98104.firebaseapp.com",
  projectId: "fitway-98104",
  storageBucket: "fitway-98104.firebasestorage.app",
  messagingSenderId: "613129940263",
  appId: "1:613129940263:web:3e66c85e0ccc91a3734d02"
};

// 1. Inicializa o aplicativo Firebase
const app = initializeApp(firebaseConfig);

// 2. Inicializa o Banco de Dados (Firestore)
const db = getFirestore(app);

// 3. Inicializa a Autenticação (Login)
const auth = getAuth(app);

// 4. Exporta essas variáveis para usarmos nas outras telas!
export { auth, db };
