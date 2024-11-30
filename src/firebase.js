// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5XUJQAa7Y5Qqrq9hh11bD8VqvPPJjnBc",
  authDomain: "react-budget-planner-43d05.firebaseapp.com",
  projectId: "react-budget-planner-43d05",
  storageBucket: "react-budget-planner-43d05.firebasestorage.app",
  messagingSenderId: "886810451471",
  appId: "1:886810451471:web:a5c76934159255b1bacd7a"
};




/// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

export { db, auth, collection, addDoc, getDocs, updateDoc, doc, deleteDoc };