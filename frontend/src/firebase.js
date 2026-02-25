import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDpgrmY2KuFH1nMrm6EkUlbCTgt5VeO8Rg",
    authDomain: "smartmtms.firebaseapp.com",
    projectId: "smartmtms",
    storageBucket: "smartmtms.firebasestorage.app",
    messagingSenderId: "999280860886",
    appId: "1:999280860886:web:552f840a3e640bac7d7377",
    measurementId: "G-4610YLWDGJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };
