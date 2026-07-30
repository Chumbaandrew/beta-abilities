async function loadQuestions() {

    const response = await fetch("http://localhost:3000/questions");
    const questions = await response.json();

    console.log(questions);

    const policiesContainer = document.getElementById("PoliciesContainer");
    const visualContainer = document.getElementById("VisualContainer");
    const hearingContainer = document.getElementById("HearingContainer");

    questions.forEach(q => {

    let html = `
        <div>
            <p>${q.question}</p>
    `;

    if (q.type === "yes_no") {

        html += `
            <label>
                <input type="radio" name="${q._id}" value="Yes">
                Yes
            </label>
            <label>
                <input type="radio" name="${q._id}" value="No">
                No
            </label>
        `;

    } else if (q.type === "checkbox") {

        q.options.forEach(option => {
            html += `
                <label>
                    <input type="checkbox" name="${q._id}" value="${option}">
                    ${option}
                </label><br>
            `;
            
        });

    }
    html += `
        <br><br>
        </div>
    `;
    // Display questions in the correct section
            if (q.section === "Policies" && policiesContainer) {
    policiesContainer.innerHTML += html;
}

if (q.section === "Visual" && visualContainer) {
    visualContainer.innerHTML += html;
}

if (q.section === "Hearing" && hearingContainer) {
    hearingContainer.innerHTML += html;
}
});
}

loadQuestions();

//an event listener for the submit button
document.getElementById("submitBtn").addEventListener("click", async function(e) {

    e.preventDefault();
    console.log("Submit button clicked!");

    const answers = [];

    // Get the questions again
    const response = await fetch("http://localhost:3000/questions");
    const questions = await response.json();

//for each question, check the type and get the selected answer
    questions.forEach(q => {

        if (q.type === "yes_no") {

            const selected = document.querySelector(`input[name="${q._id}"]:checked`);

            answers.push({
                questionId: q._id,
                question: q.question,
                answer: selected ? selected.value : null
            });

        }

        else if (q.type === "checkbox") {

            const checked = document.querySelectorAll(`input[name="${q._id}"]:checked`);

            answers.push({
                questionId: q._id,
                question: q.question,
                answer: [...checked].map(c => c.value)
            });

        }

    });

//send the answers to the server 

    await fetch("http://localhost:3000/submit", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            responses: answers
        })

    });

    alert("Assessment submitted successfully!");

});