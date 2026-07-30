import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCUV8SGeApCqbXRmndSB1Q1U5gTN7ANnpI",
    authDomain: "beta-abilities.firebaseapp.com",
    projectId: "beta-abilities",
    storageBucket: "beta-abilities.firebasestorage.app",
    messagingSenderId: "1007793255653",
    appId: "1:1007793255653:web:6c9f99431bdeb8213bd00c",
    measurementId: "G-GZJQ2B09ZM"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);



export { auth, db };

