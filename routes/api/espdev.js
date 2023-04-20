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
    const user  = req.get('user');
    const token = req.get('token');
    const data  = req.body;
    console.log(`🚀 ~ file: espdev.js:22 ~ router.post ~ [${user}: ${token}]:`, data);

    my_res = checkToken(user, token);
    
    if(my_res.code != 401 && my_res.code != 500) {
        myDatabase.getMachineState(user).then((results) => {
            if(results >= 0) {
                my_res.code = 200;
                my_res.message = { status: "success", code: code, data: { mac: user, status: results } };
            } else {
                my_res.code = 500;
                my_res.message = { status: "error", code: code, message: "Server Error" };
            }
        })
        .catch((err) => {
            console.log("🚀 ~ file: espdev.js:28 ~ router.post ~ err:", err)
            my_res.code = 500;
            my_res.message = { status: "error", code: code, message: "Server Error" };
        });
    }

    res.status(my_res.code).send(my_res.message);
});

// [POST] /api/espdev/set/status
router.post('/set/status', async (req, res) => {
    const user  = req.get('user');
    const token = req.get('token');
    const data  = req.body;
    console.log(`🚀 ~ file: espdev.js:51 ~ router.post ~ [${user}: ${token}]:`, data);

    my_res = checkToken(user, token);
    
    if(my_res.code != 401 && my_res.code != 500) {
        if(data.status >= 0 && data.status <= 5) {
            myDatabase.setMachineState(user, data.status).then((results) => {
                if(results == true) {
                    my_res.code = 200;
                    my_res.message = { status: "success", code: code, data: { mac: user, status: results } };
                } else {
                    my_res.code = 500;
                    my_res.message = { status: "error", code: code, message: "Server Error" };
                }
            })
            .catch((err) => {
                console.log("🚀 ~ file: espdev.js:28 ~ router.post ~ err:", err)
                my_res.code = 500;
                my_res.message = { status: "error", code: code, message: "Server Error" };
            });
        } else {
            my_res.code = 400;
            my_res.message = { status: "error", code: code, message: "Bad Request" };
        }
    }

    res.status(my_res.code).send(my_res.message);
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