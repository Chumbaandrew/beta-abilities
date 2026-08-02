
const { stkPush } = require("./services/darajaService");
const { getAccessToken } = require("./services/darajaService");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const admin = require("firebase-admin");

dotenv.config();

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();



const app = express();

app.use(cors());
app.use(express.json());

app.get("/test-firestore", async (req, res) => {

    try {

        const snapshot = await db
            .collection("payments")
            .where("checkoutRequestID", "==", checkoutRequestID)
            .get();

    }

    catch (error) {

        console.error(error);

        res.status(500).json(error.message);

    }

});

// We'll build the STK Push here
app.post("/stkpush", async (req, res) => {

    try {

        const {
            uid,
            phone,
            amount
        } = req.body;

        // Save payment as pending
        const paymentRef = await db
            .collection("payments")
            .add({

                uid,

                phone,

                amount,

                status: "pending",

                createdAt: new Date()

            });

        // Send STK Push
        const response = await stkPush(phone, amount);
        console.log(
            "Saving CheckoutRequestID:",
            response.CheckoutRequestID
        );

        // Save Daraja IDs
        await paymentRef.update({

            checkoutRequestID: response.CheckoutRequestID,

            merchantRequestID: response.MerchantRequestID

        });

        res.json({

            ...response,

            paymentId: paymentRef.id

        });

    }

    catch (error) {

        console.error(
            error.response?.data || error.message
        );

        res.status(500).json({

            success: false,

            error:
                error.response?.data || error.message

        });

    }

});

// Daraja will call this after payment

app.post("/callback", async (req, res) => {

    console.log("🔥 CALLBACK RECEIVED");
    console.log(JSON.stringify(req.body, null, 2));

    try {

        const callback = req.body.Body.stkCallback;

        console.log("Parsed callback successfully");

        const checkoutRequestID = callback.CheckoutRequestID;
        const resultCode = callback.ResultCode;

        console.log("CheckoutRequestID:", checkoutRequestID);
        console.log("ResultCode:", resultCode);

        // Find the payment
        const snapshot = await db
            .collection("payments")
            .where("checkoutRequestID", "==", checkoutRequestID)
            .get();

        console.log("Documents found:", snapshot.size);

        if (snapshot.empty) {

            console.log("❌ Payment not found.");

            return res.sendStatus(200);

        }

        const paymentDoc = snapshot.docs[0];
        const payment = paymentDoc.data();

        console.log("Payment document:", paymentDoc.id);

        // Ignore duplicate callbacks
        if (payment.status === "success") {

            console.log("⚠️ Payment already processed.");

            return res.sendStatus(200);

        }

        // Determine payment status
        const paymentStatus =
            resultCode === 0
                ? "success"
                : "failed";

        // Extract M-Pesa Receipt Number
        let receiptNumber = null;

        const metadata =
            callback.CallbackMetadata?.Item || [];

        metadata.forEach(item => {

            if (item.Name === "MpesaReceiptNumber") {

                receiptNumber = item.Value;

            }

        });

        // Update payment
        await paymentDoc.ref.update({

            status: paymentStatus,

            resultCode,

            receiptNumber,

            completedAt: new Date()

        });

        console.log("✅ Payment updated.");

        // Only unlock retake after successful payment
        if (paymentStatus === "success") {

            const uid = payment.uid;

            const assessments = [

                "physical",

                "visual",

                "auditory",

                "policies"

            ];

            // Delete all assessments in one batch
            const batch = db.batch();

            for (const assessment of assessments) {

                const assessmentRef = db
                    .collection("institutions")
                    .doc(uid)
                    .collection("assessments")
                    .doc(assessment);

                batch.delete(assessmentRef);

            }

            await batch.commit();

            console.log("🎉 Assessments reset successfully.");

        }

        res.sendStatus(200);

    }

    catch (error) {

        console.error("CALLBACK ERROR:", error);

        res.sendStatus(500);

    }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});
