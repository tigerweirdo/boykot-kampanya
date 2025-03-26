// src/firebase/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Create React App, process.env aracılığıyla değişkenlere erişim sağlar
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KE,
  authDomain: process.env.REACT_APP_FIREBASE_AUT_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Değişkenlerin doğru yüklendiğini kontrol etmek için
console.log("Firebase Config:", firebaseConfig);

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };