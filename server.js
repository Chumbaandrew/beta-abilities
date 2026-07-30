const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const uri = "mongodb://127.0.0.1:27017";

const client = new MongoClient(uri);

let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("Project-18");
        console.log("MongoDB Connected");
    } catch(err) {
        console.error(err);
    }
}

connectDB();

//Api Endpoints TO GET Questions
app.get('/questions', async (req, res) => {

    const questions = await db
        .collection('Questions')
        .find()
        .toArray();

    res.json(questions);
});


//API endpoint to submit answers
app.post('/submit', async (req, res) => {

    const answers = req.body;

    await db.collection('Answers').insertOne(answers);

    res.json({
        message: "Submitted successfully"
    });
});

app.get("/", (req, res) => {
    res.send("Project-18 API is running");
});

const PORT = 3000;
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

