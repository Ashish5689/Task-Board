// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDg8Yg4NSJyGfvQmM8Ra8b98ydEsC8xszo",
  authDomain: "collaborative-task-board.firebaseapp.com",
  databaseURL: "https://collaborative-task-board-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "collaborative-task-board",
  storageBucket: "collaborative-task-board.firebasestorage.app",
  messagingSenderId: "944076116513",
  appId: "1:944076116513:web:7cd7d6520b58311bc18960",
  measurementId: "G-SFHMTLE79C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };