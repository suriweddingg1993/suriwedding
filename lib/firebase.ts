import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDucVOXnFVyka_hGRSou538EyCiz7eQJ5Q",
  authDomain: "suriwedding-bd405.firebaseapp.com",
  projectId: "suriwedding-bd405",
  storageBucket: "suriwedding-bd405.firebasestorage.app",
  messagingSenderId: "336389942765",
  appId: "1:336389942765:web:42ba9ca091f8515ea6cbe4",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);