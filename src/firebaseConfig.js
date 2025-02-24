// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // <-- Importar getAuth
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYv5U0yFqFLp1Ujzml1UT4srXcHX9_qYc",
  authDomain: "ah-inicio.firebaseapp.com",
  projectId: "ah-inicio",
  storageBucket: "ah-inicio.firebasestorage.app",
  messagingSenderId: "280037182530",
  appId: "1:280037182530:web:4b621df36a718f608e71db",
  measurementId: "G-8SWYB6WVSY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exporta el Auth para poder usarlo en el Login
export const auth = getAuth(app);