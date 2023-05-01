const express = require('express');
const router  = express.Router();

const Database   = require('../database/database.js').DatabaseMachines;
const myDatabase = new Database();

const moment = require('moment');

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

router.post('/return_time', (req, res) => {
    const returnTimeString = req.body.returnTime;
    const returnTime =  moment(returnTimeString, "YYYY-MM-DD HH:mm:ss").utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
    const user_uid = req.body.uid;
    const machine_id = req.body.machineID;

    myDatabase.addReturn(user_uid, machine_id, returnTime).then((results) => {
        data = { status: "success", data: results };
        res.status(200).send(data);
        myDatabase.getMachineTime(user_uid).then((results) => {
            console.log("🚀 ~ file: machines.js:72 ~ myDatabase.addReturn ~ results:", results);
            
            let rental_time = results[0].rental_time;
            let return_time = results[0].return_time;
            let price       = results[0].price;
            let rental_time_moment = moment(rental_time, "YYYY-MM-DD HH:mm:ss").utcOffset(8);
            let return_time_moment = moment(return_time, "YYYY-MM-DD HH:mm:ss").utcOffset(8);
            let time_diff = return_time_moment.diff(rental_time_moment, 'seconds');
            let total_price = (price  * time_diff ).toFixed(2);
            let duration = new Date(0, 0, 0, 0, 0, time_diff);
            let timeString = moment(duration).format('HH:mm:ss');

            console.log(`🚀 ~ file: machines.js:63 ~ myDatabase.addReturn ~ time_diff:" ${time_diff} seconds`);
            console.log(`🚀 ~ file: machines.js:64 ~ myDatabase.addReturn ~ total_price:" ${total_price} dollars`);
            console.log(`🚀 ~ file: machines.js:65 ~ myDatabase.addReturn ~ timeString:" ${timeString} `);
            
            myDatabase.addBill(user_uid, machine_id, timeString, total_price);
            myDatabase.returnMachine(machine_id);
            myDatabase.deleteMachineBorrow(machine_id);
            
        })
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Server Error');
    });
    console.log("🚀 ~ file: machines.js:52 ~ router.post ~ return_id:", machine_id);
    console.log("🚀 ~ file: machines.js:50 ~ router.post ~ returnTime:", returnTime);
    console.log("req.body:", req.body);
});

router.post('/state', (req, res) => {
    const uid = req.body.uid;
    console.log("🚀 ~ file: machines.js:55 ~ router.post ~ uid:", uid);
    myDatabase.getMachineList(uid)
        .then((results) => {
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

        console.log(`[POST]/delete (${uid}): rid: ${rid}`);

        myDatabase.deleteRentalsMachineUser(uid, rid)
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

        console.log(`[POST]/info (${uid}): rid: ${rid}`);

        myDatabase.getMachineInfo(rid)
            .then((results) => {
                // console.log(`[POST]/info (${uid}): ${JSON.stringify(results)}`);
                if(results.status == 1) {
                    console.log(`[POST]/info (${uid}): Success!`);
                    res.status(200).send(results.data);

                } else {
                    console.error(`[POST]/info (${uid}): Failed!`);
                    res.status(401).send("Bad Request");
                }

            }).catch((err) => {
                console.error("[POST]/info error:", err);
                res.status(500).send('Server Error');
            });

    } catch (error) {
        res.status(401).send("Bad Request");
    }
});

router.post('/update_info', (req, res) => {
    console.log("🚀 ~ file: machines.js:55 ~ router.post ~ req.body:", req.body);
    try {
        const data  = req.body;
        const rid   = data.rid;
        const owner = data.owner;
        const repo  = data.repo; 
        const token = data.token;

        if(owner.length == 0 || repo.length == 0) {
            console.error("[POST]/update_info error: empty input");
            res.status(401).send("Bad Request");
            return;
        }

        myDatabase.updateRentalsInfo(rid, owner, repo, token)
            .then((results) => {
                console.log("🚀 ~ file: machines.js:191 ~ router.post ~ results:", results);
                console.log("update_info success");
                res.status(200).send( {status: "Success"} );
            })
            .catch((err) => {
                console.error("[POST]/update_info error:", err);
                res.status(500).send('Server Error');
            })
    } catch (error) {
        res.status(401).send("Bad Request");
    }
});

router.post('/update_status', (req, res) => {
    console.log("🚀 ~ file: machines.js:204 ~ router.post ~ req.body:", req.body);
    try {
        const uid          = req.get('User');
        const data         = req.body;
        const rid          = data.rid;
        const status       = data.status;
        console.log(`[POST]/update_status (${uid}): rid: ${rid}, status: ${status}`);
        myDatabase.updateMachineStatus(uid, rid, status)
            .then((results) => {
                console.log("update_status success");
                console.log("🚀 ~ file: machines.js:213~ router.post ~ results:", results);
                res.status(200).send( {status: "Success"} );
            })
            .catch((err) => {
                console.error("[POST]/update_status error:", err);
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

        console.log(`[POST]/info (${uid}): data: ${JSON.stringify(data)}`);

        myDatabase.sendMachineOTA(uid, rid, url, tag)
            .then((results) => {
                // console.log(`[POST]/info (${uid}): ${JSON.stringify(results)}`);
                if(results.status === 1) {
                    console.log(`[POST]/info (${uid}, ${rid}): Success!`);
                    res.status(200).send("Success");

                } else {
                    console.error(`[POST]/info (${uid}, ${rid}): Failed! status: ${results.status}`);
                    res.status(401).send("Bad Request");
                }

            }).catch((err) => {
                console.error("[POST]/info error:", err);
                res.status(500).send('Server Error');
            });

    } catch (error) {
        console.error("[POST]/ota error:", error);
        res.status(401).send("Bad Request");
    }
});

module.exports = router;