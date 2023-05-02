const express = require('express');
const router  = express.Router();

const Database   = require('../database/database.js').DatabaseMachines;
const myDatabase = new Database();

const key = Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000;

// GET /api/machines/list
router.get('/list', (req, res) => {
    myDatabase.getMachineType()
        .then((results) => {
            if(results.code == 1) {
                res.status(200).send({ status: "success", data: results.data });
            } else {
                console.error(`[E][${(new Date()).toLocaleString()}]📝 machines.js[/list] 🔊 getMachineType Can not get data.`);
                res.status(401).send({ status: "Bad Request", data: null });
            }
        }).catch((err) => {
            console.error(`[E][${(new Date()).toLocaleString()}]📝 machines.js[/list] 🔊 getMachineType error: ${err}.`);
            res.status(500).send('Server Error');
        });
});

router.post('/borrow/state', (req, res) => {
    try {
        const my_user   = req.get("User");
        const data      = req.body
        // console.log(`[POST]/borrow/state (${my_user}): ${JSON.stringify(data)}`);

        const type_id       = data.type_id;
        const user_project  = data.user_project;
        const user_name     = data.user_name;
        const repo          = data.repo;
        const token         = data.token;
        // console.log(`[POST]/borrow/state (${my_user}): type_id: ${type_id}, user_project: ${user_project}, user_name: ${user_name}, repo: ${repo}, token: ${token}`);

        if(user_project.length == 0 || user_name.length == 0 || repo.length == 0){
            console.log(`[POST]/borrow/state (${my_user}): user_project: ${user_project}, user_name: ${user_name}, repo: ${repo}`);
            res.status(401).send("Bad Request");
            return;
        }

        myDatabase.setRentalsMachineUser(type_id, my_user)
            .then((results) => {
                if(results.status == 1){
                    myDatabase.setRentalsInfo(results.machines_id, my_user, user_project, user_name, repo, token)
                        .then((results2) => {
                            console.log(`[POST]/borrow/state (${my_user}): results2: ${JSON.stringify(results2)}`);
                            if(results2.status == 1){
                                console.log(`[POST]/borrow/state (${my_user}): Success!, machines_id: ${results.machines_id}`);
                                res.status(200).send("Success");
                            } else {
                                console.log(`[POST]/borrow/state (${my_user}): Failed!, machines_id: ${results.machines_id}`);
                                res.status(401).send("Bad Request");
                            }
                        }).catch((err) => {
                            console.error('[POST]/borrow/state: setRentalsInfo', err);
                            res.status(500).send('Server Error');
                        });
                } else {
                console.error('[POST]/borrow/state: setRentalsMachineUser: Unknown Error');
                res.status(401).send("Bad Request");                    
                }
            }).catch((err) => {
                console.error('[POST]/borrow/state: setRentalsMachineUser', err);
                res.status(500).send('Server Error');
            });

    } catch (error) {
        res.status(401).send("Bad Request");
    }
});

router.post('/state', (req, res) => {
    const uid = req.body.uid;
    console.log("🚀 ~ file: machines.js:55 ~ router.post ~ uid:", uid);
    myDatabase.getMachineList(uid)
        .then((results) => {
            results.data.map((item) => {
                item.id = getCipherText(item.id);
            });
            // console.log("[POST]/state susses results:", JSON.stringify(results));
            console.log("[POST]/state susses");
            res.status(200).send(results);
        }).catch((err) => {
            console.error("[POST]/state error:", err);
            res.status(500).send('Server Error');
        });
});

router.post('/delete', (req, res) => {
    try {
        const uid   = req.get('User');
        const data  = req.body;
        const rid   = data.rid;

        const _rid = decryptedText(rid);

        console.log(`[POST]/delete (${uid}): rid: ${_rid}`);

        myDatabase.deleteRentalsMachineUser(uid, _rid)
            .then((results) => {
                console.log(`[POST]/delete (${uid}): ${JSON.stringify(results)}`);
                if(results.status == 1) {
                    console.log(`[POST]/delete (${uid}): Success!`);
                    res.status(200).send("Success");

                } else {
                    console.error(`[POST]/delete (${uid}): Failed!`);
                    res.status(401).send("Bad Request");
                }

            }).catch((err) => {
                console.error("[POST]/delete error:", err);
                res.status(500).send('Server Error');
            });

    } catch (error) {
        res.status(401).send("Bad Request");
    }
});

router.post('/info', (req, res) => {
    try {
        const uid   = req.get('User');
        const data  = req.body;
        const rid   = data.rid;

        const _rid = decryptedText(rid);

        console.log(`[L]${(new Date()).toLocaleString()}]📝 machines.js[/info] 🔊 uid: ${uid}, rid: ${_rid}.`);

        myDatabase.getMachineInfo(uid, _rid)
            .then((results) => {
                // console.log(`[L]${(new Date()).toLocaleString()}]📝 machines.js[/info] 🔊 getMachineInfo ${uid}(${_rid}) results: ${JSON.stringify(results)}.`);
                if(results.status == 1) {
                    // console.log(`[L]${(new Date()).toLocaleString()}]📝 machines.js[/info] 🔊 getMachineInfo ${uid}(${_rid}) Susses.`);
                    res.status(200).send(results.data);

                } else {
                    console.error(`[E]${(new Date()).toLocaleString()}]📝 machines.js[/info] 🔊 getMachineInfo ${uid}(${_rid}) Error.`);
                    res.status(401).send("Bad Request");
                }

            }).catch((err) => {
                console.error(`[E]${(new Date()).toLocaleString()}]📝 machines.js[/info] 🔊 getMachineInfo ${uid}(${_rid}) Error: ${err}.`);
                res.status(500).send('Server Error');
            });

    } catch (error) {
        console.error(`[E]${(new Date()).toLocaleString()}]📝 machines.js[/info] 🔊 Data Error: ${error}.`);
        res.status(401).send("Bad Request");
    }
});

router.post('/update/info', (req, res) => {
    console.log("🚀 ~ file: machines.js:55 ~ router.post ~ req.body:", req.body);
    try {
        const data  = req.body;
        const rid   = data.rid;
        const owner = data.owner;
        const repo  = data.repo; 
        const token = data.token;

        const _rid = decryptedText(rid);

        if(owner.length == 0 || repo.length == 0) {
            console.error("[POST]/update/info error: empty input");
            res.status(401).send("Bad Request");
            return;
        }

        myDatabase.updateRentalsInfo(_rid, owner, repo, token)
            .then((results) => {
                console.log("🚀 ~ file: machines.js:191 ~ router.post ~ results:", results);
                console.log("update/info success");
                res.status(200).send( {status: "Success"} );
            })
            .catch((err) => {
                console.error("[POST]/update/info error:", err);
                res.status(500).send('Server Error');
            })
    } catch (error) {
        res.status(401).send("Bad Request");
    }
});

router.post('/update/status', (req, res) => {
    console.log("🚀 ~ file: machines.js:204 ~ router.post ~ req.body:", req.body);
    try {
        const uid          = req.get('User');
        const data         = req.body;
        const rid          = data.rid;
        const status       = data.status;

        const _rid = decryptedText(rid);

        console.log(`[POST]/update/status (${uid}): rid: ${_rid}, status: ${status}`);
        myDatabase.updateMachineStatus(uid, _rid, status)
            .then((results) => {
                console.log("update/status success");
                console.log("🚀 ~ file: machines.js:213~ router.post ~ results:", results);
                res.status(200).send( {status: "Success"} );
            })
            .catch((err) => {
                console.error("[POST]/update/status error:", err);
                res.status(500).send('Server Error');
            })
    } catch (error) {
        res.status(401).send("Bad Request");
    }
});

router.post('/ota', (req, res) => {
    try {
        const uid  = req.get('User');
        const data = req.body;
        const rid  = data.rid;
        const url  = data.firmware.url;
        const tag  = data.firmware.tag;

        const _rid = decryptedText(rid);

        console.log(`[L][${(new Date()).toLocaleString()}]📝 machines.js[/ota] 🔊 ${uid}(${_rid})data: url: ${url}, tag: ${tag}.`);

        myDatabase.sendMachineOTA(uid, _rid, url, tag)
            .then((results) => {
                console.log(`[L][${(new Date()).toLocaleString()}]📝 machines.js[/ota] 🔊 sendMachineOTA results:`, results);

                if(results.status === 1) {
                    console.log(`[L][${(new Date()).toLocaleString()}]📝 machines.js[/ota] 🔊 sendMachineOTA ${uid}(${_rid})results: Success`);
                    res.status(200).send("Success");

                } else {
                    console.error(`[E][${(new Date()).toLocaleString()}]📝 machines.js[/ota] 🔊 sendMachineOTA ${uid}(${_rid})Failed! status: ${results.status}`);
                    res.status(401).send("Bad Request");
                }

            }).catch((err) => {
                console.error(`[E][${(new Date()).toLocaleString()}]📝 machines.js[/ota] 🔊 sendMachineOTA ${uid}(${_rid}) Error:`, err);
                res.status(500).send('Server Error');
            });

    } catch (error) {
        console.error(`[E][${(new Date()).toLocaleString()}]📝 machines.js[/ota] 🔊 sendMachineOTA Error:`, error);
        res.status(401).send("Bad Request");
    }
});

function getCipherText(num) {
    return num * key;
}

function decryptedText(num) {
    return parseInt(num / key);
}

module.exports = router;