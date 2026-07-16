import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
apiKey: "AIzaSyCwVrB8MDRNWmmmNWhuhC257DOevSeIeuA",
  authDomain: "piobariv2.firebaseapp.com",
  projectId: "piobariv2",
  storageBucket: "piobariv2.firebasestorage.app",
  messagingSenderId: "769758486370",
  appId: "1:769758486370:web:8c825b4fe42834b7f8563b"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
