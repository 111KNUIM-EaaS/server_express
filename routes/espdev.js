const express = require('express');
const router = express.Router();

const Database = require('../database/database.js').DatabaseESP;
const myDatabase = new Database();

// [POST] /api/espdev/get/status
router.post('/get/status', async (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    const user  = req.get('user');
    const token = req.get('token');
    // const data  = req.body;
    // const currentDate = new Date();
    // console.log(`[L][${currentDate.toLocaleString()}]📝 espdev.js[/get/status] 🔊 [${user}: ${token}]data: ${data}.`);

    // Check token
    myDatabase.checkMachineToken(user, token)
        .then((results) => {
            if(results == false) {
                const currentDate = new Date();
                console.error(`[E][${currentDate.toLocaleString()}]📝 espdev.js[/get/status] 🔊 checkMachineToken error: Unauthorized.`);
                res.status(401).send("Unauthorized");
                return;
            } else {
                // Get machine status
                myDatabase.getMachineState(user)
                    .then((results) => {
                        if(results >= 0) {
                            // const currentDate = new Date();
                            // console.log(`[L][${currentDate.toLocaleString()}]📝 espdev.js[/get/status] 🔊 getMachineState [${user}]status: ${results}.`);
                            res.status(200).send(`results${results}`);
                        } else {
                            const currentDate = new Date();
                            console.error(`[E][${currentDate.toLocaleString()}]📝 espdev.js[/get/status] 🔊 getMachineState error: results is out of range.`);
                            res.status(500).send("Server Error");
                            return;
                        }
                    })
                    .catch((err) => {
                        const currentDate = new Date();
                        console.error(`[E][${currentDate.toLocaleString()}]📝 espdev.js[/get/status] 🔊 getMachineState error: ${err}.`);
                        res.status(500).send("Server Error");
                        return;
                    });
            }
        })
        .catch((err) => {
            const currentDate = new Date();
            console.error(`[E][${currentDate.toLocaleString()}]📝 espdev.js[/get/status] 🔊 checkMachineToken error: ${err}.`);
            res.status(500).send("Server Error");
            return;
        });
});

// [POST] /api/espdev/set/status
router.post('/set/status', async (req, res) => {
    res.setHeader('Content-Type', 'text/plain');

    let status = -1;
    const user  = req.get('user');
    const token = req.get('token');
    const data  = req.body;
    // const currentDate = new Date();
    // console.log(`[L][${currentDate.toLocaleString()}]📝 espdev.js[/set/status] 🔊 [${user}: ${token}]data: ${data}.`);

    try {
        if(data.status === undefined) {
            const currentDate = new Date();
            console.error(`[E][${currentDate.toLocaleString()}]📝 espdev.js[/set/status] 🔊 data status is undefined.`);
            res.status(400).send("Bad Request");
            return;
        } 
        
        status = parseInt(data.status);

        if(status < 0 || status > 6) {
            const currentDate = new Date();
            console.error(`[E][${currentDate.toLocaleString()}]📝 espdev.js[/set/status] 🔊 data status is out of range.`);
            res.status(400).send("Bad Request");
            return;
        }
    } catch (error) {
        const currentDate = new Date();
        console.error(`[E][${currentDate.toLocaleString()}]📝 espdev.js[/set/status] 🔊 data status is error: ${error}.`);
        res.status(400).send("Bad Request");
        return;
    }

    // Check token
    myDatabase.checkMachineToken(user, token)
        .then((results) => {
            if(results == false) {
                const currentDate = new Date();
                console.error(`[E][${currentDate.toLocaleString()}]📝 espdev.js[/set/status] 🔊 [${user}]checkMachineToken: results is false.`);
                res.status(401).send("Unauthorized");
                return;
            } else {
                myDatabase.setMachineState(user, status)
                    .then((results) => {
                        if(results == true) {
                            // const currentDate = new Date();
                            // console.log(`[L][${currentDate.toLocaleString()}]📝 espdev.js[/set/status] 🔊 [${user}]setMachineState: results${status}`);
                            res.status(200).send(`Success results${status}`);
                            return;
                        } else {
                            const currentDate = new Date();
                            console.error(`[E][${currentDate.toLocaleString()}]📝 espdev.js[/set/status] 🔊 [${user}]setMachineState: results is false.`);
                            res.status(500).send("Server Error");
                            return;;
                        }
                    })
                    .catch((err) => {
                        const currentDate = new Date();
                        console.error(`[E][${currentDate.toLocaleString()}]📝 espdev.js[/set/status] 🔊 [${user}]setMachineState: error: ${err}.`);
                        res.status(500).send("Server Error");
                        return;
                    });
            }
        })
        .catch((err) => {
            const currentDate = new Date();
            console.error(`[E][${currentDate.toLocaleString()}]📝 espdev.js[/set/status] 🔊 [${user}]checkMachineToken: error: ${err}.`);
            res.status(500).send("Server Error");
            return;
        });
});

// [POST] /api/espdev/get/url
router.post('/get/url', async (req, res) => {
    try {
        const user  = req.get('user');
        const token = req.get('token');
        myDatabase.getOTAInfo(user, token)
            .then((results) => {
                if(results.status != 1) {
                    const currentDate = new Date();
                    console.error(`[E][${currentDate.toLocaleString()}]📝 espdev.js[/get/url] 🔊 [${user}]getOTAInfo: Unauthorized.`);
                    res.status(401).send("Unauthorized");
                    return;
                } else {
                    const currentDate = new Date();
                    console.log(`[L][${currentDate.toLocaleString()}]📝 espdev.js[/get/url] 🔊 [${user}]getOTAInfo: url: ${results.url}`);
                    res.status(200).send(results.url);
                    return;
                }
            })
            .catch((err) => {
                const currentDate = new Date();
                console.error(`[E][${currentDate.toLocaleString()}]📝 espdev.js[/get/url] 🔊 [${user}]getOTAInfo: error: ${err}.`);
                res.status(500).send("Server Error");
                return;
            }
        );

    } catch(err) {
        const currentDate = new Date();
        console.error(`[E][${currentDate.toLocaleString()}]📝 espdev.js[/get/url] 🔊 [${user}]error: ${err}.`);
        res.status(400).send("Bad Request");
    }
});

module.exports = router;