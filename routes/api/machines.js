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
    myDatabase.getMachineType()
        .then((results) => {
            data = { status: "success", data: results };
            res.status(200).send(data);
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Server Error');
        });
});

router.post('/borrow_state', (req, res) => {
    const borrowTimeString = req.body.borrowTime;
    const borrowTime =  moment(borrowTimeString, "YYYY-MM-DD HH:mm:ss").utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
    const type_id = req.body.type_id;
    const user_uid = req.body.uid;

    myDatabase.sendMachineType(type_id)
        .then((results) => {
            data = { status: "success", data: results };
            res.status(200).send(data);
            let machines_id = results[0].machines_id;
            console.log("🚀 ~ file: machines.js:36 ~ router.post ~ machines_id:", machines_id);
            myDatabase.addMachineBorrow(machines_id);
            myDatabase.addRental(user_uid, machines_id, borrowTime)
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Server Error');
        });
    console.log("🚀 ~ file: machines.js:43 ~ router.post ~ borrowTime:", borrowTime);
    console.log("req.uid:", req.body);
});

router.post('/return_time', (req, res) => {
    const returnTimeString = req.body.returnTime;
    const returnTime =  moment(returnTimeString, "YYYY-MM-DD HH:mm:ss").utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
    const return_id = req.body.machineID;
    myDatabase.deleteMachineBorrow(return_id)
        .then((results) => {
            data = { status: "success", data: results };
            res.status(200).send(data);
            myDatabase.returnMachine(return_id);
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Server Error');
        });
    console.log("🚀 ~ file: machines.js:51 ~ router.post ~ return_id:", return_id);
    console.log("🚀 ~ file: machines.js:50 ~ router.post ~ returnTime:", returnTime);
});

router.post('/state', (req, res) => {
    const uid = req.body.uid;
    console.log("🚀 ~ file: machines.js:55 ~ router.post ~ uid:", uid);
    myDatabase.getMachineList(uid)
        .then((results) => {
            data = { status: "success", data: results };
            res.status(200).send(data);
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Server Error');
        });
});


module.exports = router;