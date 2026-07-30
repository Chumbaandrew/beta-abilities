import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

//user log in page/sign in
//submit
const login = document.getElementById('login-btn');
if(login){

login.addEventListener("click", function (event){
    event.preventDefault()

    //inputs

    const mail = document.getElementById('mail').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, mail, password)
        .then((userCredential) => {
            // Signed up
            const user = userCredential.user;
            window.location.href="user_page.html";
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage)
            // ..
        });
    })
}
//create user for person
const signin = document.getElementById('sign-btn');
if(signin){
signin.addEventListener("click", function (event){
    event.preventDefault()

    //inputs s- sign in

    const smail = document.getElementById('s-mail').value;
    const spassword = document.getElementById('s-password').value;

    createUserWithEmailAndPassword(auth, smail, spassword)
        .then((userCredential) => {
            // Signed up
            const user = userCredential.user;
            alert('Account Created!')
            window.location.href="user_page.html";
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage)
            // ..
        });

})}

//institution log in page/sign in
//submit
const ologin = document.getElementById('ologin-btn');
if(ologin){
ologin.addEventListener("click", function (event){
    event.preventDefault()

    //inputs o - organization

    const omail = document.getElementById('omail').value;
    const opassword = document.getElementById('opassword').value;

    signInWithEmailAndPassword(auth, omail, opassword)
        .then((userCredential) => {
            // Signed up
            const user = userCredential.user;
            window.location.href="institute_page.html";
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage)
            // ..
        });

})}
//create user for organization
const osign = document.getElementById('osign-btn');
osign.addEventListener("click", async function (event) {

    event.preventDefault();

    const institutionName = document.getElementById("s-org").value;
    const somail = document.getElementById("so-mail").value;
    const sopassword = document.getElementById("so-password").value;

    try {

        // Create Firebase Authentication account
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            somail,
            sopassword
        );

        const user = userCredential.user;

        // Save institution profile to Firestore
        await setDoc(doc(db, "institutions", user.uid), {

            name: institutionName,

            email: somail,

            createdAt: new Date()

        });

        alert("Institution account created!");

        window.location.href = "institute_page.html";

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});

async function loadInstitution(user) {

    const docRef = doc(db, "institutions", user.uid);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {

        const data = docSnap.data();

        document.getElementById("institutionName").textContent = data.name;
        document.getElementById("email").textContent = data.email;

    }

}

onAuthStateChanged(auth, (user) => {

    if (user) {
        loadInstitution(user);
    }

});