import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAYFTAbgtgWFDaupZv3RCkIUPCbXtfeT-E',
  authDomain: 'stock-list-8fa75.firebaseapp.com',
  projectId: 'stock-list-8fa75',
  storageBucket: 'stock-list-8fa75.firebasestorage.app',
  messagingSenderId: '62966239058',
  appId: '1:62966239058:web:de95a02d6ceff3b9c4f48b',
  measurementId: 'G-EHTG8J1MF8'
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
