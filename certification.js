import { auth, db } from "./firebase-config.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


// =====================================
// Constants
// =====================================

const TOTAL_ASSESSMENTS = 4;

const assessmentPages = {

    physical: "physicalimpairment.html",

    visual: "visuallyimpaired.html",

    auditory: "hearingimpaired.html",

    policies: "policiesandprocedures.html"

};


// =====================================
// Load One Assessment Card
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

    const score =
        document.getElementById(`${category}Score`);

    const percentage =
        document.getElementById(`${category}Percentage`);

    const rating =
        document.getElementById(`${category}Rating`);

    const status =
        document.getElementById(`${category}Status`);

    const button =
        document.getElementById(`${category}Btn`);



    // =====================================
    // Assessment NOT completed
    // =====================================

    if (!assessmentSnap.exists()) {

        score.textContent = "--/10";

        percentage.textContent = "--%";

        rating.textContent = "--";

        status.innerHTML =
            `<i class="ri-time-line"></i> 10min`;

        status.classList.remove("completed-status");

        button.innerHTML =
            `Start <i class="ri-arrow-right-line"></i>`;

        button.classList.remove("completed");

        button.href =
            assessmentPages[category];

        button.onclick = null;

        return false;

    }



    // =====================================
    // Assessment completed
    // =====================================

    const data =
        assessmentSnap.data();

    score.textContent =
        `${data.score}/${data.totalQuestions}`;

    percentage.textContent =
        `${data.percentage}%`;

    rating.textContent =
        data.rating;

    status.innerHTML =
        `<i class="ri-check-line"></i> Done`;

    status.classList.add("completed-status");

    button.innerHTML =
        `Results <i class="ri-eye-line"></i>`;

    button.classList.add("completed");

    button.href = "#";

    button.onclick = function (e) {

        e.preventDefault();

        sessionStorage.setItem(

            "currentPage",

            "certification"

        );

        window.location.href =
            "institute_page.html";

    };

    return true;

}
// =====================================
// Update Progress Circle
// =====================================

function updateProgressCircle(completed) {

    const completionPercentage =
        (completed / TOTAL_ASSESSMENTS) * 100;

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

    document.getElementById(
        "circlePercentage"
    ).textContent =
        `${completionPercentage}%`;

    document.getElementById(
        "completedTests"
    ).textContent =
        `${completed} of ${TOTAL_ASSESSMENTS} Done`;

}



// =====================================
// Update Certificate Button
// =====================================

function updateCertificateButton(completed) {

    const downloadBtn =
        document.getElementById(
            "downloadCertificate"
        );

    if (completed === TOTAL_ASSESSMENTS) {

        downloadBtn.disabled = false;

        downloadBtn.innerHTML = `
            <i class="ri-download-2-line"></i>
            <span>Download Certificate</span>
        `;

        downloadBtn.onclick = async () => {

            await generateCertificate();

        };

        // Only congratulate once

        if (

            sessionStorage.getItem(
                "certificateUnlocked"
            ) === "true"

        ) {

            alert(

                "🎉 Congratulations!\n\n" +

                "You have successfully completed all accessibility assessments.\n\n" +

                "Your certificate is now available."

            );

            sessionStorage.removeItem(
                "certificateUnlocked"
            );

        }

    }

    else {

        const remaining =
            TOTAL_ASSESSMENTS - completed;

        downloadBtn.disabled = true;

        downloadBtn.innerHTML = `
            <i class="ri-lock-line"></i>
            <span>
                Complete ${remaining}
                more assessment${remaining > 1 ? "s" : ""}
            </span>
        `;

        downloadBtn.onclick = null;

    }

}



// =====================================
// Load Dashboard
// =====================================

async function loadDashboard(user) {

    // -------------------------
    // Institution Information
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

        document.getElementById(
            "institutionName"
        ).textContent =
            institution.name;

        document.getElementById(
            "email"
        ).textContent =
            institution.email;

    }



    // -------------------------
    // Load Assessments
    // -------------------------

    let completed = 0;

    const assessments = [

        "physical",

        "visual",

        "auditory",

        "policies"

    ];

    for (const category of assessments) {

        const exists =
            await loadAssessment(

                user.uid,

                category

            );

        if (exists)

            completed++;

    }



    // -------------------------
    // Update Dashboard
    // -------------------------

    updateProgressCircle(completed);

    updateCertificateButton(completed);

}

// =====================================
// Generate Certificate
// =====================================

async function generateCertificate() {

    try {

        // Load certificate template
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



        // -------------------------
        // Dashboard Values
        // -------------------------

        const institution =
            document.getElementById(
                "institutionName"
            ).textContent;

        const completed =
            document.getElementById(
                "completedTests"
            ).textContent;



        // -------------------------
        // Institution Name
        // -------------------------

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



        // -------------------------
        // Completion Status
        // -------------------------

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



        // -------------------------
        // Date
        // -------------------------

        const today =
            new Date().toLocaleDateString();

        page.drawText(today, {

            x: 470,

            y: 115,

            size: 12,

            font,

            color: PDFLib.rgb(
                0.3,
                0.3,
                0.3
            )

        });



        // -------------------------
        // Save PDF
        // -------------------------

        const pdfBytes =
            await pdfDoc.save();

        const blob =
            new Blob(
                [pdfBytes],
                {
                    type: "application/pdf"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const a =
            document.createElement("a");

        a.href = url;

        a.download =
            `${institution} Accessibility Certificate.pdf`;

        document.body.appendChild(a);

        a.click();

        a.remove();

        URL.revokeObjectURL(url);

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to generate certificate."
        );

    }

}

// =====================================
// Refresh Dashboard
// =====================================

async function refreshDashboard() {

    if (!auth.currentUser) return;

    await loadDashboard(auth.currentUser);

}



// =====================================
// Payment Reset Support
// =====================================

window.refreshCertificationDashboard =
    refreshDashboard;



// =====================================
// Authentication
// =====================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }

    await loadDashboard(user);

});



// =====================================
// Page Visibility Refresh
// =====================================

// If the user comes back to this page,
// automatically refresh everything.

document.addEventListener(

    "visibilitychange",

    async () => {

        if (

            document.visibilityState === "visible" &&

            auth.currentUser

        ) {

            await refreshDashboard();

        }

    }

);



// =====================================
// Window Focus Refresh
// =====================================

// Refresh when the browser tab gains focus.

window.addEventListener(

    "focus",

    async () => {

        if (auth.currentUser) {

            await refreshDashboard();

        }

    }

);