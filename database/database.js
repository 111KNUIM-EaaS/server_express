const mysql          = require('mysql2');
const crypto         = require('crypto');
const fs             = require('fs');
const databaseConfig = require('../config/databaseConfig.json');

class DatabaseUsers {
    constructor() {
        this.pool = mysql.createPool(databaseConfig);
        this.pool.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
            if(error) {
                console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseUsers constructor error: ${error}.`);
            } else {
                console.log(`[L][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseUsers constructor susses.`);
            }
        });
    }

    // user api
    checkUser(user_uid, user_name, user_email) {
        return new Promise((resolve, reject) => {
            this.pool.query('SELECT user_uid FROM user WHERE user_uid = ?', [user_uid], (err, results, fields) => {
                if (err) {
                    console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseUsers checkUser error: ${err}.`);
                    reject(err);
                } else {
                    if(results.length == 0) {
                        console.log(`[L][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseUsers checkUser Add New user.`);
                        this.pool.query('INSERT INTO user(user_uid, user_name, user_email) VALUES (?, ?, ?)', [user_uid, user_name, user_email], (err, results, fields) => {
                            if (err) {
                                console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseUsers checkUser Add User error: ${err}.`);
                                reject(err);
                            } else {
                                console.log(`[L][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseUsers checkUser Add User(${user_name}) susses.`);
                                resolve({status: "susses", message: "User Add susses.", code: 2});
                            }
                        });
                    } else if(results.length == 1){
                        // console.log(`[L][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseUsers checkUser User(${results[0].user_name}) Login susses.`);
                        resolve({status: "susses", message: "User Login susses.", code: 1});
                    } else {
                        console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseUsers checkUser Found many user!.`);
                        reject({status: "error", message: "Found many user!", code: -1});
                    }
                }
            });
        });
    }

    // close connection
    close() {
        return new Promise((resolve, reject) => {
            this.pool.end(err => {
                if(err) {
                    console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseUsers close error: ${err}`);
                    reject(err);
                } else {
                    console.log(`[L][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseUsers close susses`);
                    resolve(true);
                }
            });
        });
    }
}

class DatabaseMachines {
    constructor() {
        this.pool = mysql.createPool(databaseConfig);
        this.pool.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
            if(error) {
                console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseMachines constructor error: ${error}.`);
            } else {
                console.log(`[L][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseMachines constructor susses.`);
            }
        });
    }

    /**
     * [ { "type_name": "3D", "type_price": 10, "info": "Hello 3D", "total": 2 } ]
     * @returns { List } 
     */
    getMachineType() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT machines_type, COUNT(CASE WHEN status = 0 THEN 1 ELSE NULL END) AS count_same, type_name, price, introduce FROM machines, type WHERE machines_type = type_id GROUP BY machines_type';

            this.pool.query(query, (err, results, fields) => {
                if (err) {
                    console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 getMachineType error: ${err}.`);
                    reject(err);
                } else {
                    if(results.length > 0) {
                        console.log(`[L][${(new Date()).toLocaleString()}]📝 database.js 🔊 getMachineType results: ${results}.`);
                        resolve({ status: "success", data: results, code: 1});
                    } else {
                        console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 getMachineType Can not get data.`);
                        resolve({ status: "no data", data: null, code: -1});
                    }
                    // console.log("🚀 ~ file: database.js:77 ~ this.pool.query ~ results:", results);
                }
            });
        });
    }
    
    /**
     * Get User Machine List
     * 
     * @param   {Sting} uid - user uid
     * @returns {Promise} status: 0 - no machine, 1 - success, -1 - error
     * 
     * data :
     *      project_name - project name
     *      time         - rental time
     *      machine -
     *          type    - machine type
     *          price   - machine price
     *          status  - machine status
     *      github -
     *          repo  - github repo
     *          owner - github owner
     * 
     */
    getMachineList(uid) {
        const select = 'type.type_name, type.price, rentals.rental_id, rentals.project_name, rentals.rental_time, rentals.git_repo, rentals.git_owner, machines.status';
        const from   = 'rentals, machines, type';
        const where  = 'rentals.return_time IS NULL AND rentals.machines_id = machines.machines_id AND machines.machines_type = type.type_id AND rentals.user_uid = ?';
        // const query = 'SELECT machines.machines_id, type.type_name FROM machines JOIN type ON machines.machines_type = type.type_id JOIN rentals ON rentals.machines_id = machines.machines_id JOIN user ON rentals.user_uid = user.user_uid WHERE rentals.user_uid = ?';
        const query = `SELECT ${select} FROM ${from} WHERE ${where}`;
        const sql = uid;
        return new Promise((resolve, reject) => {
            this.pool.query(query, sql, (err, results, fields) => {
                if (err) {
                    console.log("🚀 ~ file: database.js:44 ~ Database ~ this.pool.query ~ err:", err);
                    reject(err);
                } else {
                    // console.log("🚀 ~ file: database.js:48 ~ Database ~ this.pool.query ~ results:", results);
                    if(results.length > 0) {
                        try {
                            let data_List = []
                            results.map((item) => {
                                let data = {
                                    id: item.rental_id,
                                    project_name: item.project_name,
                                    time: item.rental_time,
                                    machine: {
                                        type: item.type_name,
                                        price: item.price,
                                        status: item.status
                                    },
                                    github: {
                                        repo: item.git_repo,
                                        owner: item.git_owner
                                    }
                                }
                                data_List.push(data);
                            });
                            // console.log("database.js getMachineList data_List:", JSON.stringify(data_List));
                            resolve( {length: results.length, data: data_List, status: 1} );
                        } catch (error) {
                            console.log("database.js getMachineList error:", error);
                            resolve( {length: 0, data: [], status: -1} );
                        }
                    } else {
                        resolve( {length: 0, data: [], status: 0} );
                    }
                }
            });
        });
    }

    sendMachineType(machineType) {
        return new Promise((resolve, reject) => {
            this.pool.query('SELECT machines_id FROM machines WHERE machines_type = ? AND status = 0 ORDER BY machines_id ASC LIMIT 1', [machineType], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    /**
     * 
     * @param   {Int    } machines_type - machine type id
     * @param   {String } user_uid - user uid
     * @returns {Promise} 0: no machine available, 1: success
     */
    setRentalsMachineUser(machines_type, user_uid) {
        return new Promise((resolve, reject) => {
            const table = 'machines'
            const query = `SELECT machines_id FROM ${table} WHERE machines_type = ? AND status = 0`;
            this.pool.query(query, [machines_type], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    if(results.length > 0) {
                        const machines_id = results[0].machines_id;
                        this.pool.query(`UPDATE ${table} SET status = 4 WHERE machines_id = ?`, [machines_id], (err, results, fields) => {
                            if (err) {
                                reject(err);
                            } else {
                                const table2 = 'rentals'
                                const column = '(user_uid, machines_id, rental_time, return_time, git_token, project_name, git_repo, git_owner)';
                                const value  = '(?, ?, NOW(), NULL, NULL, NULL, NULL, NULL)';
                                this.pool.query(`INSERT INTO ${table2} ${column} VALUES ${value}`, [user_uid, machines_id], (err, results, fields) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        console.log("[setRentalsMachineUser]results: ", results);
                                        resolve( {status: 1, machines_id: machines_id} );
                                    }
                                });
                            }
                        });
                    } else {
                        console.log("setMachineUser: no machine available");
                        resolve( {status: 0, machines_id: null} );
                    }
                }
            });
        });
    }

    /**
     * 
     * @param   {String} rid - rental id 
     * @returns {Promise} 0: no machine available, 1: success, -1: error
     */
    getMachineInfo(uid, rid) {
        return new Promise((resolve, reject) => {
            const table = 'rentals';
            const query = `SELECT machines.machines_id, type.type_name, type.price, rentals.rental_id, rentals.project_name, rentals.rental_time, rentals.git_repo, rentals.git_owner, rentals.git_token, machines.status FROM ${table} JOIN machines ON rentals.machines_id = machines.machines_id JOIN type ON machines.machines_type = type.type_id WHERE rentals.rental_id = ? AND rentals.user_uid = ?`;
            this.pool.query(query, [rid, uid], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    if(results.length > 0) {
                        try {
                            let data = {
                                id: results[0].rental_id,
                                project_name: results[0].project_name,
                                time: results[0].rental_time,
                                machine: {
                                    id: results[0].machines_id,
                                    type: results[0].type_name,
                                    price: results[0].price,
                                    status: results[0].status
                                },
                                github: {
                                    repo: results[0].git_repo,
                                    owner: results[0].git_owner,
                                    token: results[0].git_token
                                }
                            }
                            resolve( {data: data, status: 1} );
                        } catch (error) {
                            console.log("database.js getMachineInfo error:", error);
                            resolve( {data: null, status: -1} );
                        }
                    } else {
                        resolve( {data: null, status: 0} );
                    }
                }
            });
        });
    }

    /**
     * 
     * @param {String} uid 
     * @param {String} rid 
     * @param {String} url 
     * @param {String} tag 
     * @returns {Promise} 0: machine is not match, 1: success
     */
    sendMachineOTA(uid, rid, url, tag) {
        const table = 'rentals';
        const query = `SELECT machines_id FROM ${table} WHERE user_uid = ? AND rental_id = ? AND return_time IS NULL`;
        return new Promise((resolve, reject) => {
            // check 0 < url < 200, 0 < tag < 20 
            if(url !== undefined && tag !== undefined) {
                if(url.length < 1 || url.length > 200 || tag.length < 1 || tag.length > 20) {
                    console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 sendMachineOTA url or tag length is not match.`);
                    resolve( {status: -1} );
                }
            } else {
                console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 sendMachineOTA url or tag length is undefined.`);
                resolve( {status: -2} );
            }

            // check if the machine rid and uid is match
            this.pool.query(query, [uid, rid], (err, results, fields) => {
                if (err) {
                    console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 sendMachineOTA query Error: ${err}`);
                    reject(err);
                } else {
                    if(results.length === 1) {
                        const machines_id = results[0].machines_id;
                        const table2 = 'machines';
                        const query2 = `UPDATE ${table2} SET git_name = ?, git_tag = ?, status = 5 WHERE machines_id = ?`;
                        this.pool.query(query2, [url, tag, machines_id], (err, results, fields) => {
                            if (err) {
                                console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 sendMachineOTA query2 Error: ${err}`);
                                reject(err);
                            } else {
                                if(results.affectedRows !== 1) {
                                    console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 sendMachineOTA query2 Error: affectedRows is not 1`);
                                    resolve( {status: -3} );
                                } else {
                                    // console.log(`[L][${(new Date()).toLocaleString()}]📝 database.js 🔊 sendMachineOTA Success results:`, results);
                                    resolve( {status: 1} );
                                }
                            }
                        });
                    } else {
                        console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 sendMachineOTA query Error: machine is not match`);
                        resolve( {status: 0} );
                    }
                }
            });
        });
    }

    /**
     * 
     * @param {String} machines_id  - machine id
     * @param {String} user_uid     - user uid
     * @param {String} project      - project name
     * @param {String} owner        - git owner
     * @param {String} repo         - git repo
     * @param {String} token        - git token
     * @returns {Promise} 0: unknown error, 1: success
     */
    setRentalsInfo(machines_id, user_uid, project, owner, repo, token) {
        const table = 'rentals';
        const query = `UPDATE ${table} SET project_name = ?, git_owner = ?, git_repo = ?, git_token = ? WHERE user_uid = ? AND machines_id = ? AND return_time IS NULL`;
        return new Promise((resolve, reject) => {
            this.pool.query(query, [project, owner, repo, token, user_uid, machines_id], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    // console.log("setRentalsInfo: ", results);
                    if(results.affectedRows === 1) {
                        resolve( {status: 1} );
                    } else {
                        resolve( {status: 0} );
                    }
                }
            });
        });
    }

    /**
     * 
     * @param {String} rid          - rental id
     * @param {String} project      - project name
     * @param {String} owner        - git owner
     * @param {String} repo         - git repo
     * @param {String} token        - git token
     * @returns {Promise} 0: unknown error, 1: success
     * @description update rental info by rental id
     */
    updateRentalsInfo(rid, owner, repo, token) {
        const table = 'rentals';
        const query = `UPDATE ${table} SET git_owner = ?, git_repo = ?, git_token = ? WHERE rental_id = ? AND return_time IS NULL`;
        return new Promise((resolve, reject) => {
            this.pool.query(query, [owner, repo, token, rid], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    // console.log("setRentalsInfo: ", results);
                    if(results.affectedRows === 1) {
                        resolve( {status: 1} );
                    } else {
                        resolve( {status: 0} );
                    }
                }
            });
        });
    }

    /**
     * 
     * @param {String} rid - rental id
     * @param {String} status - machine status
     * @returns {Promise} 0: unknown error, 1: success
     * @description set return time
     */
    updateMachineStatus(uid, rid, status) {
        const table = 'rentals';
        const query = `SELECT machines_id FROM ${table} WHERE user_uid = ? AND rental_id = ?`;
        return new Promise((resolve, reject) => {
            this.pool.query(query, [uid, rid], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    if(results.length > 0) {
                        const machine_id = results[0].machines_id;
                        const table2 = 'machines';
                        const query2 = `UPDATE ${table2} SET status = ? WHERE machines_id = ?`;
                        this.pool.query(query2, [status, machine_id], (err, results, fields) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve( {status: 1} );
                                if(status === 0) {
                                    this.deleteRentalsMachineUser(uid, rid)
                                    .then((result) => {
                                        resolve(result);
                                    }).catch((err) => {
                                        reject(err);
                                    });
                                } else if (status === 1) {
                                    console.log("updateMachineStatus: ", results);
                                } else if (status === 3) {
                                    console.log("updateMachineStatus: ", results);
                                }
                                
                                console.log("updateMachineStatus: ", results);
                            }
                        });
                    } else {
                        resolve( {status: 0} );
                    }
                }
            });
        });
    }

    /**
     * 
     * @param {Sting} uid - user uid
     * @param {INT  } rid - rental id
     * @returns {Promise} 0: unknown error, 1: success, 2: Cna not set return time, 3: Can not set machine status
     */
    deleteRentalsMachineUser(uid, rid) {
        const table = 'rentals';
        const sql = `UPDATE ${table} SET return_time = NOW() WHERE user_uid = ? AND rental_id = ? AND return_time IS NULL`;
        return new Promise((resolve, reject) => {
            this.pool.query(sql, [uid, rid], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    // console.log("deleteRentalsMachineUser[1]: ", results);
                    if(results.affectedRows === 1) {
                        // Get machine id
                        this.pool.query(`SELECT machines_id FROM ${table} WHERE user_uid = ? AND rental_id = ?`, [uid, rid], (err, results, fields) => {
                            if (err) {
                                reject(err);
                            }
                            // console.log("deleteRentalsMachineUser[2]: ", results);
                            if(results.length > 0) {
                                const table2 = 'machines';
                                const machines_id = results[0].machines_id;
                                const status = 0;
                                this.pool.query(`UPDATE ${table2} SET status = ${status}, git_name = NULL, git_tag = NULL WHERE machines_id = ?`, [machines_id], (err, results, fields) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        if(results.affectedRows === 1) {
                                            // console.log("deleteRentalsMachineUser[3]: ", results);
                                            resolve( {status: 1} );
                                            // // Get ran time and return time
                                            // this.pool.query(`SELECT rental_time, return_time FROM ${table} WHERE user_uid = ? AND rental_id = ?`, [uid, rid], (err, results, fields) => {
                                            //     if (err) {
                                            //         reject(err);
                                            //     } else {
                                            //         if(results.affectedRows === 1) {
                                            //             // Update total time
                                            //             const rental_time = results[0].rental_time;
                                            //             const return_time = results[0].return_time;
                                            //             const total_time = return_time - rental_time;

                                            //         } else {
                                            //             console.log("deleteRentalsMachineUser: Can not get ran time and return time");
                                            //             resolve( {status: 4} );
                                            //         }
                                            //     }
                                            // });
                                        } else {
                                            console.log("deleteRentalsMachineUser: Can not set machine status");
                                            resolve( {status: 3} );
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        console.log("deleteRentalsMachineUser: Cna not set return time");
                        resolve( {status: 2} );
                    }
                }
            });
        });
    }

    // borrow api
    addRental(user_uid, machines_id, rental_time) {
        return new Promise((resolve, reject) => {
            this.pool.query('UPDATE rentals SET user_uid = ?, rental_time = ? WHERE machines_id = ?', [user_uid, rental_time, machines_id], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    addReturn(user_uid, machines_id, return_time) {
        return new Promise((resolve, reject) => {
            this.pool.query('UPDATE rentals SET user_uid = ?, return_time = ? WHERE machines_id = ?', [user_uid, return_time, machines_id], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    checkMachineBorrow(user_uid) {
        return new Promise((resolve, reject) => {
            this.pool.query('SELECT * FROM borrow WHERE user_uid = ?', user_uid, (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    addMachineBorrow(machines_id) {
        return new Promise((resolve, reject) => {
            this.pool.query('UPDATE machines SET status = 1 WHERE machines_id = ?;', [machines_id], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
    

    // return api
    deleteMachineBorrow(machines_id) {
        return new Promise((resolve, reject) => {
            this.pool.query('UPDATE rentals SET user_uid = NULL, rental_time = NULL, return_time = NULL WHERE machines_id = ?', [machines_id], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });

        });
    }
    returnMachine(machines_id) {
        return new Promise((resolve, reject) => {
            this.pool.query('UPDATE machines SET status = 0 WHERE machines_id = ?;', [machines_id], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    getMachineTime(user_uid) {
        const query = 'SELECT user_uid, machines.machines_id, type.type_name, rental_time, return_time, type.price FROM rentals JOIN machines ON rentals.machines_id = machines.machines_id JOIN type ON machines.machines_type = type.type_id WHERE user_uid = ?'
        return new Promise((resolve, reject) => {
            this.pool.query(query, [user_uid], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
    
    // bill api
    addBill(user_uid, machines_id, total_time, total_value) {
        return new Promise((resolve, reject) => {
            this.pool.query('INSERT INTO invoices (machines_id, user_uid, machine_time, total_value) VALUES (?, ?, ?, ?)', [machines_id, user_uid,  total_time, total_value], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    getBillList(user_uid) {
        const query = 'SELECT machines.machines_id, invoices.machine_time, invoices.total_value, type.type_name FROM invoices JOIN machines ON invoices.machines_id = machines.machines_id JOIN type ON type.type_id = machines.machines_type WHERE user_uid = ? ORDER BY `machines`.`machines_id` ASC'
        return new Promise((resolve, reject) => {
            this.pool.query(query, [user_uid], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    // close connection
    close() {
        return new Promise((resolve, reject) => {
            this.pool.end(err => {
                if(err) {
                    console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseMachines close error: ${err}`);
                    reject(err);
                } else {
                    console.log(`[L][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseMachines close susses`);
                    resolve(true);
                }
            });
        });
    }
}

/***  ESP32 Machine API [/api/espdev]  ***/
class DatabaseESP {
    constructor() {
        this.salt = fs.readFileSync('./config/key.bin').toString('base64');

        this.pool = mysql.createPool(databaseConfig);
        this.pool.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
            if(error) {
                console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseESP constructor error: ${error}.`);
            } else {
                console.log(`[L][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseESP constructor susses.`);
            }
        });
    }

    /**
     * 
     * @param   { String  } user  ESP32 device MAC Address.
     * @param   { String  } token ESP32 device Token.
     * @returns { boolean } true if token is valid.
     */
    checkMachineToken(user, token) {
        const table = 'machines';
        const user_th = 'machines_mac';
        const token_th = 'machines_password';
        const select_th = 'machines_id';
        const query = `SELECT ${select_th} FROM ${table} WHERE ${user_th} = ? AND ${token_th} = ?`
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(token, this.salt, 10000, 64, 'sha256', (err, derivedKey) => {
                if(err) {
                    console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseESP checkMachineToken() crypto error: ${err}`);
                    reject(err);
                } else {
                    this.pool.query(query, [user, derivedKey.toString('hex')], (err, results, fields) => {
                        if (err) {
                            console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseESP checkMachineToken() error: ${err}`);
                            reject(err);
                        } else {
                            // console.log("database.js checkMachineToken results:", results);
                            if(results.length == 1) {
                                resolve(true);
                            } else {
                                console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseESP checkMachineToken() error: results.length is not 1`);
                                resolve(false);
                            }
                        }
                    });
                }
            });
        });
    }

    /**
     * 
     * @param   { String } mac    ESP32 device MAC Address.
     * @returns { Int    } status of machine (0: offline, 1: booting, 2: boot, 3: pausing, 4: pause).
     */
    getMachineState(mac) {
        const table = 'machines';
        const status_th = 'status';
        const query = `SELECT ${status_th} FROM ${table} WHERE machines_mac = ?`
        return new Promise((resolve, reject) => {
            this.pool.query(query, [mac], (err, results, fields) => {
                if (err) {
                    console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseESP getMachineState()[1] error: ${err}`);
                    reject(err);
                } else {
                    // console.log("database.js getMachineState results:", results);
                    if(results.length == 1) {
                        try {
                            let status = parseInt(results[0].status);
                            if(status > -1 && status < 7) {
                                resolve(status);
                            } else {
                                console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseESP getMachineState()error: status out of range.`);
                                resolve(-1);
                            }
                        } catch (e) {
                            console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseESP getMachineState()[2] error: ${e}`);
                            resolve(-1);
                        }
                    } else {
                        resolve(-1);
                    }
                }
            });
        });
    }

    /**
     * 
     * @param   { String  } user   ESP32 device MAC Address.
     * @param   { String  } status Machine status.
     * @returns { boolean } true if sql query is success.
     */
    setMachineState(user, status) {
        if(status < 0 || status > 7) return new Promise((resolve, reject) => { resolve(false); });

        const table = 'machines';
        const status_th = 'status';
        const query = `UPDATE ${table} SET ${status_th} = ? WHERE machines_mac = ?`
        return new Promise((resolve, reject) => {
            this.pool.query(query, [status, user], (err, results, fields) => {
                if (err) {
                    console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseESP setMachineState() error: ${err}`);
                    reject(err);
                } else {
                    // console.log("🚀 ~ file: database.js:278 ~ Database ~ this.pool.query ~ results:", results)
                    resolve(true);
                }
            });
        });
    }

    getOTAInfo(mid, password) {
        const table = 'machines';
        const mid_th = 'machines_mac';
        const password_th = 'machines_password';
        const status = 5; // OTAing mode
        const query = `SELECT git_name FROM ${table} WHERE ${mid_th} = ? AND ${password_th} = ? AND status = ${status}`
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(password, this.salt, 10000, 64, 'sha256', (err, derivedKey) => {
                if(err) {
                    console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseESP getOTAInfo() crypto error: ${err}`);
                    reject(err);
                } else {
                    this.pool.query(query, [mid, derivedKey.toString('hex')], (err, results, fields) => {
                        if (err) {
                            console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseESP getOTAInfo() error: ${err}`);
                            reject(err);
                        } else {
                            // console.log("database.js getOTAInfo results:", results);
                            if(results.length == 1) {
                                if(results[0].git_name == null) {
                                    resolve( {status: 0, url: null} );
                                } else {
                                    resolve( {status: 1, url: results[0].git_name} );
                                }
                            } else {
                                resolve( {status: 0, url: null} );
                            }
                        }
                    });
                }
            });
        });
    }

    // close connection
    close() {
        return new Promise((resolve, reject) => {
            this.pool.end(err => {
                if(err) {
                    console.error(`[E][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseESP close error: ${err}`);
                    reject(err);
                } else {
                    console.log(`[L][${(new Date()).toLocaleString()}]📝 database.js 🔊 DatabaseESP close susses`);
                    resolve(true);
                }
            });
        });
    }
}

module.exports.DatabaseESP      = DatabaseESP;
module.exports.DatabaseUsers    = DatabaseUsers;
module.exports.DatabaseMachines = DatabaseMachines;
