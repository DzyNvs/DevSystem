import { initializeApp } from "firebase/app";

// Importa os serviços que vamos usar no FitWay (Banco, Login e STORAGE)
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 
// Sua configuração do Firebase
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

// 4. Inicializa o Storage (Guarda as fotos) <-- 2. Inicializamos o serviço
const storage = getStorage(app);

// 5. Exporta essas variáveis para usarmos nas outras telas! <-- 3. Exportamos o storage
export { auth, db, storage };