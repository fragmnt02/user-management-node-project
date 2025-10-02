import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA67-VwHqzGIEKEKOo30S8rRfhg1WhglOU",
  authDomain: "user-management-88053.firebaseapp.com",
  databaseURL: "https://user-management-88053-default-rtdb.firebaseio.com",
  projectId: "user-management-88053",
  storageBucket: "user-management-88053.firebasestorage.app",
  messagingSenderId: "386099480719",
  appId: "1:386099480719:web:7a46b5062b9d9ed9d108fa",
  measurementId: "G-LY3WGF4LKJ"
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);

export default app;
