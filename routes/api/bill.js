const express = require('express');
const { database } = require('firebase-admin');
const Database = require('../../database/database.js').Database;
const myDatabase = new Database();
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello, bills');
});

router.post('/table', (req, res) => {
    const user_uid = req.body.uid;
    console.log("🚀 ~ file: bill.js:11 ~ router.get ~ user_uid:", user_uid);
    myDatabase.getBillList(user_uid)
        .then((results) => {
            console.log("🚀 ~ file: bill.js:13 ~ router.get ~ results:", results);
            data = { status: "success", data: results };
            res.status(200).json(data);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Server Error');
        });
});

module.exports = router;