import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCwVrB8MDRNWmmmNWhuhC257DOevSeIeuA",
  authDomain: "piobariv2.firebaseapp.com",
  projectId: "piobariv2",
  storageBucket: "piobariv2.firebasestorage.app",
  messagingSenderId: "769758486370",
  appId: "1:769758486370:web:8c825b4fe42834b7f8563b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const snap = await getDocs(collection(db, "facilities"));
    let count = 0;
    const items = [];
    snap.forEach(doc => {
      items.push(doc.data());
    });
    const idMap = {};
    items.forEach(i => {
      if (idMap[i.id]) idMap[i.id]++;
      else idMap[i.id] = 1;
    });
    console.log("Duplicate ids:");
    Object.keys(idMap).forEach(k => {
      if (idMap[k] > 1) console.log(k, idMap[k]);
    });
    
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
