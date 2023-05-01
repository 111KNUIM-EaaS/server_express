const express = require('express');
const router  = express.Router();

const Database   = require('../database/database.js').DatabaseUsers;
const myDatabase = new Database();

const admin          = require('firebase-admin');
const firebaseConfig = require('../config/firebaseConfig.json');

admin.initializeApp(firebaseConfig);

// GET /api/users/google/login
router.post('/google/login', async (req, res) => {
    try {
        const localId   = req.get("User");
        const idToken   = req.get("Authorization");
        const data      = req.body;
        const name      = data.name;
        const email     = data.email;

        // console.log(`[L][${(new Date()).toLocaleString()}]📝 users.js[/google/login] 🔊 ${name}(${localId}) All Data: ${data}.`);
        // console.log(`[L][${(new Date()).toLocaleString()}]📝 users.js[/google/login] 🔊 ${name}(${localId}) name: ${name}, email: ${email}.`);

        await verifyIdToken(idToken)
            .then((decodedToken) => {
                // console.log(`[L][${(new Date()).toLocaleString()}]📝 users.js[/google/login] 🔊 ${name}(${localId}) decodedToken: ${decodedToken}.`);
                if(decodedToken.user_id !== localId) {
                    console.error(`[E][${(new Date()).toLocaleString()}]📝 users.js[/google/login] 🔊 ${fullName}(${localId}) Token and Uid is not match.`);
                    res.status(403).send({ code: "403", status: "Forbidden"});
                }
                myDatabase.checkUser(localId, name, email)
                        .then((results) => {
                            if (results.code === 1 || results.code === 2) {
                                res.status(200).send({ code: "200", status: "susses"});
                            } else {
                                console.log(`[L][${(new Date()).toLocaleString()}]📝 users.js[/google/login] 🔊 checkUser results: ${results.message}.`);
                                res.status(401).send({ code: "401", status: "Unauthorized"});
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                            console.error(`[E][${(new Date()).toLocaleString()}]📝 users.js[/google/login] checkUser error: ${error}.`);
                            res.status(500).send({ code: "500", status: "Server Error"});
                        });
            })
            .catch((error) => {
                console.error(`[E][${(new Date()).toLocaleString()}]📝 users.js[/google/login] 🔊 ${fullName}(${localId}) ${error}.`);
                res.status(403).send({ code: "403", status: "Forbidden"});
            });

    } catch (error) {
        console.log(`[L][${(new Date()).toLocaleString()}]📝 users.js[/google/login] 🔊 Get data error.`);
        res.status(401).send({ code: "401", status: "Unauthorized"});
    }
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