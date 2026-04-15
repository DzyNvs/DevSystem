import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyABqUR1DTGlBAvExdWBg3Os4ixY1SGk3tI",
  authDomain: "fitway-98104.firebaseapp.com",
  projectId: "fitway-98104",
  storageBucket: "fitway-98104.firebasestorage.app",
  messagingSenderId: "613129940263",
  appId: "1:613129940263:web:3e66c85e0ccc91a3734d02"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// A Web aceita o getAuth padrão sem reclamar
const auth = getAuth(app);

export { auth, db, storage };
