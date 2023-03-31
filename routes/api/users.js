const express = require('express');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const firebaseConfig = require('../../config/firebaseConfig.json');

const router = express.Router();

admin.initializeApp(firebaseConfig);

// GET /api/users
router.get('/', (req, res) => {
    res.send('Hello, user!');
});

// GET /api/users/google/login
router.post('/google/login', async (req, res) => {
    const data = req.body;
    console.log("🚀 ~ file: users.js:18 ~ router.post ~ data:", data);

    let res_data;

    await verifyIdToken(data.idToken)
    .then((decodedToken) => {
        console.log("🚀 ~ file: users.js:23~ .then ~ decodedToken:", decodedToken);

        res.cookie('name', decodedToken.name);
        res.cookie('email', decodedToken.email);
        res.cookie('uid:', decodedToken.uid);
        res.cookie('token:', decodedToken.data.idToken);
        
        res_data = { status: "susses", name: data.fullName, email: data.email };
    })
    .catch((error) => {
        console.log("🚀 ~ file: users.js:33 ~ router.post ~ error:", error);
        
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