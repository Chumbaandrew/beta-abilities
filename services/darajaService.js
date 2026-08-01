const axios = require("axios");
const moment = require("moment");

async function getAccessToken() {

    const consumerKey = process.env.CONSUMER_KEY;
    const consumerSecret = process.env.CONSUMER_SECRET;

    const auth = Buffer
        .from(`${consumerKey}:${consumerSecret}`)
        .toString("base64");

    const response = await axios.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
            headers: {
                Authorization: `Basic ${auth}`
            }
        }
    );

    return response.data.access_token;
}

async function stkPush(phoneNumber, amount) {

    const accessToken = await getAccessToken();

    const timestamp =
        moment().format("YYYYMMDDHHmmss");

    const password =
        Buffer.from(
            process.env.SHORTCODE +
            process.env.PASSKEY +
            timestamp
        ).toString("base64");

    console.log({
        BusinessShortCode: process.env.SHORTCODE,
        TransactionType: "CustomerPayBillOnline",
        PartyA: phoneNumber,
        PartyB: process.env.SHORTCODE,
        PhoneNumber: phoneNumber,
        Callback: process.env.CALLBACK_URL
    });

    const response = await axios.post(

        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",

        {

            BusinessShortCode:
            process.env.SHORTCODE,

            Password:
            password,

            Timestamp:
            timestamp,

            TransactionType:
                "CustomerPayBillOnline",

            Amount:
            amount,

            PartyA:
            phoneNumber,

            PartyB:
            process.env.SHORTCODE,

            PhoneNumber:
            phoneNumber,

            CallBackURL:
            process.env.CALLBACK_URL,

            AccountReference:
                "BetaAbilities",

            TransactionDesc:
                "Assessment Retake"

        },

        {

            headers: {

                Authorization:
                    `Bearer ${accessToken}`

            }

        }

    );

    return response.data;
}

module.exports = {

    getAccessToken,

    stkPush

};