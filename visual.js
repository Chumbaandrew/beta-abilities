
import { auth, db } from "./firebase-config.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


let maxScore = 0;
async function loadQuestions() {

    //load the json
    const response = await fetch("mongodbquestions3.json");
    const questions = await response.json();

    //get the container
    const questionContainer = document.getElementById("VisualContainer");

    //filter only adaptation(visually impaired) questions
    const adaptationsQuestions =
        questions.filter(question =>
            question.section === "Visual"
        );

    //calculating maximum score
     maxScore = 0;

    adaptationsQuestions.forEach(question => {

        if (question.type === "yes_no") {

            maxScore += Math.max(...Object.values(question.scores));

        }

        else if (question.type === "checkbox") {

            question.options.forEach(option => {

                maxScore += option.score;

            });

        }

    });

    console.log("Maximum Score:", maxScore);
    //loop through the questions
    adaptationsQuestions.forEach(question => {
        //create the html for questions-card
        const card = document.createElement("div");

        card.classList.add("question-card");

        card.innerHTML = `
     
     <p>${question.question}</p>`;

        questionContainer.appendChild(card);

        //choices for radio buttons
        if (question.type === "yes_no") {
            card.innerHTML += `
<label>
    <input type="radio"
           name="q${question.questionNo}"
           value="${question.scores.Yes}">
    Yes
</label>

<label>
    <input type="radio"
           name="q${question.questionNo}"
           value="${question.scores.No}">
    No
</label>
`;
        //choices for checkboxes
        }else if (question.type === "checkbox") {
            let optionsHTML = "";

            question.options.forEach(option => {

                optionsHTML += `
        <label>
            <input
                type="checkbox"
                name="q${question.questionNo}"
                value="${option.score}">
            ${option.text}
        </label>
    `;

            });

            card.innerHTML += optionsHTML;
        }

    });

    console.log(adaptationsQuestions);


}

loadQuestions();

//calculating the score
const form = document.getElementById("assessmentForm");

form.addEventListener("submit", function (event) {

    event.preventDefault();

    calculateScore();

});
 async function calculateScore() {

    let totalScore = 0;

    const radios =
        document.querySelectorAll(
            'input[type="radio"]:checked'
        );

    radios.forEach(radio => {

        totalScore += Number(radio.value);

    });

    const checkboxes =
        document.querySelectorAll(
            'input[type="checkbox"]:checked'
        );

    checkboxes.forEach(box => {

        totalScore += Number(box.value);

    });

    const percentage =
        Math.round((totalScore / maxScore) * 100);

    let rating = "";

    if (percentage >= 85) {

        rating = "Excellent";

    }
    else if (percentage >= 70) {

        rating = "Good";

    }
    else if (percentage >= 50) {

        rating = "Fair";

    }
    else {

        rating = "Needs Improvement";

    }

    console.log(totalScore);
    console.log(maxScore);
    console.log(percentage);
    console.log(rating);

     const user = auth.currentUser;

     if (!user) {
         alert("No institution is logged in.");
         return;
     }

     try {

         await setDoc(
             doc(db, "institutions", user.uid, "assessments", "visual"),
             {
                 score: totalScore,
                 totalQuestions: maxScore,
                 percentage: percentage,
                 rating: rating,
                 completedAt: serverTimestamp()
             }
         );

         alert("Visual assessment saved!");
         sessionStorage.setItem("currentPage", "assessment");
         window.location.href = "institute_page.html";

     } catch (error) {

         console.error(error);
         alert(error.message);

     }

}
