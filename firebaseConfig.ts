// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Your Firebase configuration (fixed storageBucket domain)
const firebaseConfig = {
  apiKey: "AIzaSyAkFmf1ZDrqP72y3hAieO8wMWsnH50MZ3k",
  authDomain: "vira-lms.firebaseapp.com",
  projectId: "vira-lms",
  storageBucket: "vira-lms.appspot.com", // ✅ fixed here (was firebasestorage.app)
  messagingSenderId: "1083102963324",
  appId: "1:1083102963324:web:820b17f1da62aa706ccbf9"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Export for use in your app
export { app, auth, db, storage };
