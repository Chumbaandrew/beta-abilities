import {

    auth,

    db,

    doc,

    onSnapshot

} from "./firebase-config.js";

const billingForm = document.getElementById("billingForm");

billingForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const payBtn = document.getElementById("payBtn");

    let phone = document
        .getElementById("phone")
        .value
        .trim();

    if (phone.startsWith("07")) {

        phone = "254" + phone.substring(1);

    }
    else if (!phone.startsWith("254")) {

        alert("Please enter a valid Safaricom phone number.");

        return;

    }

    if (!phone) {

        alert("Please enter your phone number.");

        return;

    }

    payBtn.disabled = true;

    payBtn.innerHTML = "Sending Request...";

    try {

        const response = await fetch(
            "http://localhost:3000/stkpush",
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    uid: auth.currentUser.uid,

                    phone,

                    amount: 1

                })

            }

        );

        const data = await response.json();

        console.log(data);

        if (!response.ok) {

            throw new Error(data.error || "Payment request failed.");

        }

        const paymentId = data.paymentId;

        alert("📱 Check your phone for the M-Pesa prompt.");

        payBtn.innerHTML = "Waiting for Payment...";

        // Listen for payment updates
        const paymentRef = doc(

            db,

            "payments",

            paymentId

        );

        const unsubscribe = onSnapshot(paymentRef, (snapshot) => {

            if (!snapshot.exists()) return;

            const payment = snapshot.data();

            console.log("Payment Update:", payment);

            if (payment.status === "success") {

                unsubscribe();

                payBtn.innerHTML = "Payment Successful ✅";

                setTimeout(() => {

                    resetAssessmentUI(payBtn);

                }, 1500);

            }

            else if (payment.status === "failed") {

                unsubscribe();

                alert("❌ Payment failed.");

                payBtn.disabled = false;

                payBtn.innerHTML = "Pay KSh 1";

            }

        });

    }

    catch (error) {

        console.error(error);

        alert("Something went wrong.");

        payBtn.disabled = false;

        payBtn.innerHTML = "Pay KSh 1";

    }

});

async function resetAssessmentUI(payBtn) {

    payBtn.disabled = false;

    payBtn.innerHTML = "Pay KSh 1";

    showPage("home");

    await loadDashboard(auth.currentUser);
    window.refreshCertificationDashboard = refreshDashboard;

}