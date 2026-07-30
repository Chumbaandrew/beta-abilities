import { auth, db } from "./firebase-config.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


// =====================================
// Load Assessment Results
// =====================================

async function loadAssessment(userId, category) {

    const assessmentRef = doc(
        db,
        "institutions",
        userId,
        "assessments",
        category
    );

    const assessmentSnap = await getDoc(assessmentRef);

    if (!assessmentSnap.exists()) {
        return false;
    }

    const data = assessmentSnap.data();

    document.getElementById(`${category}Score`).textContent =
        `${data.score}/${data.totalQuestions}`;

    document.getElementById(`${category}Percentage`).textContent =
        `${data.percentage}%`;

    document.getElementById(`${category}Rating`).textContent =
        data.rating;

    const assessmentLink =
        document.getElementById(`${category}Btn`);

    if (assessmentLink) {

        assessmentLink.innerHTML =
            `Results <i class="ri-eye-line"></i>`;

        assessmentLink.classList.add("completed");

        assessmentLink.href = "#";

        assessmentLink.addEventListener("click", function (e) {

            e.preventDefault();

            sessionStorage.setItem("currentPage", "certification");

            window.location.href = "institute_page.html";

        });

        const status =
            document.getElementById(`${category}Status`);

        if (status) {

            status.innerHTML =
                `<i class="ri-check-line"></i> Done`;

            status.classList.add("completed-status");

        }


    }

    return true;

}


// =====================================
// Load Dashboard
// =====================================

onAuthStateChanged(auth, async (user) => {

    if (!user) return;

    // -------------------------
    // Institution Details
    // -------------------------

    const institutionRef = doc(
        db,
        "institutions",
        user.uid
    );

    const institutionSnap =
        await getDoc(institutionRef);

    if (institutionSnap.exists()) {

        const institution =
            institutionSnap.data();

        document.getElementById("institutionName").textContent =
            institution.name;

        document.getElementById("email").textContent =
            institution.email;

    }

    // -------------------------
    // Load Assessments
    // -------------------------

    let completed = 0;

    if (await loadAssessment(user.uid, "physical"))
        completed++;

    if (await loadAssessment(user.uid, "visual"))
        completed++;

    if (await loadAssessment(user.uid, "auditory"))
        completed++;

    if (await loadAssessment(user.uid, "policies"))
        completed++;

    console.log("Completed:", completed);

    // -------------------------
    // Progress Circle
    // -------------------------

    const completionPercentage =
        (completed / 4) * 100;

    const degrees =
        completionPercentage * 3.6;

    const circle =
        document.getElementById("progressCircle");

    circle.style.background = `
        conic-gradient(
            #ff914d ${degrees}deg,
            #e9e9e9 ${degrees}deg
        )
    `;

    document.getElementById("circlePercentage").textContent =
        `${completionPercentage}%`;

    document.getElementById("completedTests").textContent =
        `${completed} of 4 Completed`;

    // -------------------------
    // Certificate Button
    // -------------------------

    const downloadBtn =
        document.getElementById("downloadCertificate");

    if (completed === 4) {

        downloadBtn.disabled = false;

        downloadBtn.innerHTML = `
            <i class="ri-download-2-line"></i>
            <span>Download Certificate</span>
        `;

        if (sessionStorage.getItem("certificateUnlocked") === "true") {

            alert(
                "🎉 Congratulations!\n\n" +
                "You have successfully completed all accessibility assessments.\n\n" +
                "Your certificate is now available."
            );

            sessionStorage.removeItem("certificateUnlocked");

        }

        downloadBtn.onclick = generateCertificate;

    }

    else {

        const remaining = 4 - completed;

        downloadBtn.disabled = true;

        downloadBtn.innerHTML = `
            <i class="ri-lock-line"></i>
            <span>Complete ${remaining} more assessment${remaining > 1 ? "s" : ""}</span>
        `;

    }

});


// =====================================
// Generate Certificate
// =====================================

async function generateCertificate() {

    const existingPdfBytes = await fetch(
        "certificates/beta-certificate.pdf"
    ).then(res => res.arrayBuffer());

    const pdfDoc =
        await PDFLib.PDFDocument.load(existingPdfBytes);

    const page =
        pdfDoc.getPages()[0];

    const font =
        await pdfDoc.embedFont(
            PDFLib.StandardFonts.TimesRoman
        );

    const institution =
        document.getElementById("institutionName").textContent;

    const completed =
        document.getElementById("completedTests").textContent;

    page.drawText(institution, {

        x: 180,
        y: 445,

        size: 25,

        font,

        color: PDFLib.rgb(
            51 / 255,
            51 / 255,
            51 / 255
        )

    });

    page.drawText(completed, {

        x: 115,
        y: 230,

        size: 20,

        font,

        color: PDFLib.rgb(
            51 / 255,
            51 / 255,
            51 / 255
        )

    });

    const pdfBytes =
        await pdfDoc.save();

    const blob =
        new Blob(
            [pdfBytes],
            { type: "application/pdf" }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        `${institution} Accessibility Certificate.pdf`;

    a.click();

    URL.revokeObjectURL(url);

}