const mysql = require('mysql2');
const databaseConfig  =  require('../config/databaseConfig.json')


class Database {
    constructor() {
        this.connection = mysql.createConnection({
            host: databaseConfig.host,
            user: databaseConfig.user,
            password: databaseConfig.password,
            database: databaseConfig.database
        });
        this.connection.connect((err) => {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }
            console.log('connected as id ' + this.connection.threadId);
        })
    }
    
    /**
     * User login˙
     * @param {string} username user name
     * @param {string} password user password
     * @returns returns a promise that resolves to the results of the query
     */

    
    // user api
    checkUser(user_uid, user_name, user_email) {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT user_uid FROM user WHERE user_uid = ?', user_uid, (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    addUser(user_uid, user_name, user_email) {
        return new Promise((resolve, reject) => {
            this.connection.query('INSERT INTO user(user_uid, user_name, user_email) VALUES (?, ?, ?)', [user_uid, user_name, user_email], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    checkPassword(username, password) {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT user_name FROM user', [username, password], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    // machine api

    /**
     * [ { "type_name": "3D", "type_price": 10, "info": "Hello 3D", "total": 2 } ]
     * @returns { List } 
     */
    getMachineType() {
        return new Promise((resolve, reject) => {
            let machine_list = [];
            const query = 'SELECT machines_type, COUNT(CASE WHEN status = 0 THEN 1 ELSE NULL END) AS count_same, type_name, price, introduce FROM machines, type WHERE machines_type = type_id GROUP BY machines_type';

            this.connection.query(query, (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    // console.log("🚀 ~ file: database.js:77 ~ this.connection.query ~ results:", results);
                    resolve(results);
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
        const select = 'type.type_name, type.price, rentals.project_name, rentals.rental_time, rentals.git_repo, rentals.git_owner, machines.status';
        const from   = 'rentals, machines, type';
        const where  = 'rentals.return_time IS NULL AND rentals.machines_id = machines.machines_id AND machines.machines_type = type.type_id AND rentals.user_uid = ?';
        // const query = 'SELECT machines.machines_id, type.type_name FROM machines JOIN type ON machines.machines_type = type.type_id JOIN rentals ON rentals.machines_id = machines.machines_id JOIN user ON rentals.user_uid = user.user_uid WHERE rentals.user_uid = ?';
        const query = `SELECT ${select} FROM ${from} WHERE ${where}`;
        const sql = uid;
        return new Promise((resolve, reject) => {
            this.connection.query(query, sql, (err, results, fields) => {
                if (err) {
                    console.log("🚀 ~ file: database.js:44 ~ Database ~ this.connection.query ~ err:", err);
                    reject(err);
                } else {
                    // console.log("🚀 ~ file: database.js:48 ~ Database ~ this.connection.query ~ results:", results);
                    if(results.length > 0) {
                        try {
                            let data_List = []
                            results.map((item) => {
                                let data = {
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
            this.connection.query('SELECT machines_id FROM machines WHERE machines_type = ? AND status = 0 ORDER BY machines_id ASC LIMIT 1', [machineType], (err, results, fields) => {
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
            this.connection.query(query, [machines_type], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    if(results.length > 0) {
                        const machines_id = results[0].machines_id;
                        this.connection.query(`UPDATE ${table} SET status = 4 WHERE machines_id = ?`, [machines_id], (err, results, fields) => {
                            if (err) {
                                reject(err);
                            } else {
                                const table2 = 'rentals'
                                const column = '(user_uid, machines_id, rental_time, return_time, total_time, git_token, project_name, git_repo, git_owner)';
                                const value  = '(?, ?, NOW(), NULL, NULL, NULL, NULL, NULL, NULL)';
                                this.connection.query(`INSERT INTO ${table2} ${column} VALUES ${value}`, [user_uid, machines_id], (err, results, fields) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        // console.log("[setRentalsMachineUser]results: ", results);
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
        const query = `UPDATE ${table} SET project_name = ?, git_owner = ?, git_repo = ?, git_token = ? WHERE user_uid = ? AND machines_id = ?`;
        return new Promise((resolve, reject) => {
            this.connection.query(query, [project, owner, repo, token, user_uid, machines_id], (err, results, fields) => {
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

    // borrow api
    addRental(user_uid, machines_id, rental_time) {
        return new Promise((resolve, reject) => {
            this.connection.query('UPDATE rentals SET user_uid = ?, rental_time = ? WHERE machines_id = ?', [user_uid, rental_time, machines_id], (err, results, fields) => {
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
            this.connection.query('UPDATE rentals SET user_uid = ?, return_time = ? WHERE machines_id = ?', [user_uid, return_time, machines_id], (err, results, fields) => {
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
            this.connection.query('SELECT * FROM borrow WHERE user_uid = ?', user_uid, (err, results, fields) => {
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
            this.connection.query('UPDATE machines SET status = 1 WHERE machines_id = ?;', [machines_id], (err, results, fields) => {
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
            this.connection.query('UPDATE rentals SET user_uid = NULL, rental_time = NULL, return_time = NULL WHERE machines_id = ?', [machines_id], (err, results, fields) => {
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
            this.connection.query('UPDATE machines SET status = 0 WHERE machines_id = ?;', [machines_id], (err, results, fields) => {
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
            this.connection.query(query, [user_uid], (err, results, fields) => {
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
            this.connection.query('INSERT INTO invoices (machines_id, user_uid, machine_time, total_value) VALUES (?, ?, ?, ?)', [machines_id, user_uid,  total_time, total_value], (err, results, fields) => {
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
            this.connection.query(query, [user_uid], (err, results, fields) => {
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
            this.connection.end(err => {
                if (err) {
                    reject(new Error(`Error closing database connection: ${err.message}`));
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports.Database = Database;
