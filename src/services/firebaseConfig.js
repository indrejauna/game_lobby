import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBm5BbXQHtrUIR3uHHZF3YwZlyn3nOLhts",
  authDomain: "tail-hodler.firebaseapp.com",
  databaseURL: "https://tail-hodler-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tail-hodler",
  storageBucket: "tail-hodler.appspot.com",
  messagingSenderId: "611689392350",
  appId: "1:611689392350:web:73c32a926a64af6d9c3a4f",
  measurementId: "G-TNQDJ2WT1Y"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);