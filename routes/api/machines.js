const express = require('express');
const moment = require('moment');

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

router.post('/borrow', (req, res) => {
    const borrowTimeString = req.body.borrowTime;
    const borrowTime =  moment(borrowTimeString, "YYYY-MM-DD HH:mm:ss").utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
    console.log("🚀 ~ file: machines.js:48 ~ router.post ~ borrowTime:", borrowTime);
});

router.post('/return_time', (req, res) => {
    const returnTimeString = req.body.returnTime;
    const returnTime =  moment(returnTimeString, "YYYY-MM-DD HH:mm:ss").utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
    console.log("🚀 ~ file: machines.js:48 ~ router.post ~ returnTime:", returnTime);
});

router.get('/state', (req, res) => {
    myDatabase.getMachineList().then((results) => {
        data = { status: "success", data: results };
        res.status(200).send(data);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Server Error');
    });
});


module.exports = router;