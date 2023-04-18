const express = require('express');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const firebaseConfig = require('../../config/firebaseConfig.json');
const router = express.Router();

const Database = require('../../database/database.js').Database;
const myDatabase = new Database();

admin.initializeApp(firebaseConfig);
    
// GET /api/users
router.get('/', (req, res) => {
    res.send('Hello, user!');
});

// GET /api/users/google/login
router.post('/google/login', async (req, res) => {
    const data = req.body;
    console.log("🚀 ~ file: users.js:19~ router.post ~ data:", data);
    console.log("🚀 ~ file: users.js:19 ~ router.post ~ data.idToken:", data.idToken);

    let res_data;

    myDatabase.checkUser(data.localId)
        .then((results) => {
            if (results.length > 0) {
                console.log(`User ${data.localId} found in database.`);
            } else {
                console.log(`User ${data.localId} not found in database.`);
                console.log(`Adding user ${data.localId} to database.`);
                myDatabase.addUser(data.localId, data.fullName, data.email);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Server Error');
        });


    await verifyIdToken(data.idToken)
        .then((decodedToken) => {
            console.log("🚀 ~ file: users.js:47~ .then ~ decodedToken:", decodedToken);
            res.cookie('name', decodedToken.name);
            res.cookie('email', decodedToken.email);
            res.cookie('uid:', decodedToken.uid);
            res.cookie('token:', decodedToken.data.idToken);

            res_data = { status: "susses", name: data.fullName, email: data.email };
        })
        .catch((error) => {
            console.log("🚀 ~ file: users.js:57 ~ router.post ~ error:", error);
            res.clearCookie('name');
            res.clearCookie('email');
            res.clearCookie('uid');
            res.clearCookie('token');

            res_data = { status: "error" };
        });

    res.json(res_data);
});

async function verifyIdToken(idToken) {
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        throw new Error('Invalid ID token');
    }
}

module.exports = router;