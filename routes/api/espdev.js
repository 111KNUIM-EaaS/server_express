const express = require('express');
const router = express.Router();

const Database = require('../../database/database.js').Database;
const myDatabase = new Database();

// [GET] /api/espdev
router.get('/', (req, res) => {
    res.status(200).send({ status: "success", code: 200, url: "/api/espdev", method: "GET" });
});

// [POST] /api/espdev
router.post('/', (req, res) => {
    res.status(200).send({ status: "success", code: 200, url: "/api/espdev", method: "POST" });
});

// [POST] /api/espdev/get/status
router.post('/get/status', async (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    const user  = req.get('user');
    const token = req.get('token');
    // const data  = req.body;
    // console.log(`🚀 ~ file: espdev.js:23 ~ router.post ~ [${user}: ${token}]:`, data);

    // Check token
    myDatabase.checkMachineToken(user, token)
        .then((results) => {
            if(results == false) {
                console.error(`[POST] /api/espdev/get/status: [401: Unauthorized]${user}`);
                res.status(401).send("Unauthorized");
                return;
            } else {
                // Get machine status
                myDatabase.getMachineState(user)
                    .then((results) => {
                        if(results >= 0) {
                            // console.log(`[POST] /api/espdev/get/status: [${user}]status: ${results}`);
                            res.status(200).send(`results${results}`);
                        } else {
                            res.status(500).send("Server Error");
                            return;;
                        }
                    })
                    .catch((err) => {
                        console.log("🚀 ~ file: espdev.js:45 ~ router.post ~ err:", err);
                        res.status(500).send("Server Error");
                        return;
                    });
            }
        })
        .catch((err) => {
            console.log("🚀 ~ file: espdev.js:52 ~ router.post ~ err:", err);
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
    console.log(`🚀 ~ file: espdev.js:51 ~ router.post ~ [${user}: ${token}]:`, data);

    try {
        if(data.status === undefined) {
            res.status(400).send("Bad Request");
            return;
        } 
        
        status = parseInt(data.status);

        if(status < 0 || status > 4) {
            res.status(400).send("Bad Request");
            return;
        }
    } catch (error) {
        res.status(400).send("Bad Request");
        return;
    }

    // Check token
    myDatabase.checkMachineToken(user, token)
        .then((results) => {
            if(results == false) {
                console.error(`[POST] /api/espdev/set/status: [401: Unauthorized]${user}`);
                res.status(401).send("Unauthorized");
                return;
            } else {
                myDatabase.setMachineState(user, status)
                    .then((results) => {
                        if(results == true) {
                            console.log(`[POST] /api/espdev/set/status: [${user}]status: ${results}`);
                            res.status(200).send('Success');
                            return;
                        } else {
                            res.status(500).send("Server Error");
                            return;;
                        }
                    })
                    .catch((err) => {
                        console.log("🚀 ~ file: espdev.js:85 ~ router.post ~ err:", err);
                        res.status(500).send("Server Error");
                        return;
                    });
            }
        })
        .catch((err) => {
            console.log("🚀 ~ file: espdev.js:92 ~ router.post ~ err:", err);
            res.status(500).send("Server Error");
            return;
        });
});

/**
 * 
 * @param   { String } user   - MAC address of the machine.
 * @param   { String } token  - Token of the machine.
 * @returns { JSON   } my_res - Response data, code and message.
 */
function checkToken(user, token) {
    let my_res = {
        code: 200,
        message: {}
    }

    myDatabase.checkMachineToken(user, token)
        .then((results) => {
            if(results == false) {
                console.log(`User: ${user} Token ${token} not found in database.`);
                my_res.code = 401;
                my_res.message = { status: "error", code: code, message: "Unauthorized" };
            }
        })
        .catch((err) => {
            console.log("🚀 ~ file: espdev.js:28 ~ router.post ~ err:", err)
            my_res.code = 500;
            my_res.message = { status: "error", code: code, message: "Server Error" };
        });
    
    return my_res;
}

module.exports = router;