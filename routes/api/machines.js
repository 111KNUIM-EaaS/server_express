const express = require('express');

const Database = require('../../database/database.js').Database;
const myDatabase = new Database();

const router = express.Router();

// GET /api/machines/
router.get('/', (req, res) => {
    res.send('Hello, machines');
});

// GET /api/machines/list
router.get('/list', (req, res) => {
    myDatabase.getMachineType().then((results) => {
        data = { status: "success", data: results };
        res.status(200).send(data);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Server Error');
    });
});


module.exports = router;