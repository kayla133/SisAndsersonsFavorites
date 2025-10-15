// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCu0ct8FQ_rt6UWaxfiqjoPNI4FdCTScd0",
  authDomain: "dayspark-b3bd1.firebaseapp.com",
  projectId: "dayspark-b3bd1",
  storageBucket: "dayspark-b3bd1.firebasestorage.app",
  messagingSenderId: "299625790469",
  appId: "1:299625790469:web:939ff3f171cfaf807c706c",
  measurementId: "G-65ZXFVQWWC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);