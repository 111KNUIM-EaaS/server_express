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
        });
    }

    // user api
    checkUser(user_uid, user_name, user_email) {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT user_uid FROM user_table WHERE user_uid = ?', user_uid, (err, results, fields) => {
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
            this.connection.query('INSERT INTO user_table(user_uid, user_name, user_email) VALUES (?, ?, ?)', [user_uid, user_name, user_email], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    // machine api
    checkPassword(username, password) {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT user_name FROM user_table', [username, password], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    getMachineType() {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT * FROM machine_type_table WHERE NOT EXISTS ( SELECT * FROM machines_table WHERE type_id = machines_type AND lent_state = 1 ) OR EXISTS ( SELECT * FROM machines_table WHERE type_id = machines_type AND lent_state = 0 )', (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
    
    getMachineList(uid) {
        const query = 'SELECT machines_table.machines_id, machine_type_table.type_name, machines_table.machines_power FROM machines_table JOIN machine_type_table ON machines_table.machines_type = machine_type_table.type_id JOIN rentals_table ON rentals_table.machines_id = machines_table.machines_id JOIN user_table ON rentals_table.user_uid = user_table.user_uid WHERE rentals_table.user_uid = ?';
        const sql = uid;
        return new Promise((resolve, reject) => {
            this.connection.query(query, sql, (err, results, fields) => {
                if (err) {
                    console.log("🚀 ~ file: database.js:44 ~ Database ~ this.connection.query ~ err:", err)
                    reject(err);
                } else {
                    console.log("🚀 ~ file: database.js:48 ~ Database ~ this.connection.query ~ results:", results)
                    resolve(results);
                }
            });
        });
    }

    sendMachineType(machineType) {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT machines_id FROM machines_table WHERE machines_type = ? AND lent_state = 0 ORDER BY machines_id ASC LIMIT 1', [machineType], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
    // borrow api
    addRental(user_uid, machines_id, rental_time) {
        return new Promise((resolve, reject) => {
            this.connection.query('UPDATE rentals_table SET user_uid = ?, rental_time = ? WHERE machines_id = ?', [user_uid, rental_time, machines_id], (err, results, fields) => {
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
            this.connection.query('UPDATE rentals_table SET user_uid = ?, return_time = ? WHERE machines_id = ?', [user_uid, return_time, machines_id], (err, results, fields) => {
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
            this.connection.query('SELECT * FROM borrow_table WHERE user_uid = ?', user_uid, (err, results, fields) => {
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
            this.connection.query('UPDATE machines_table SET lent_state = 1 WHERE machines_id = ?;', [machines_id], (err, results, fields) => {
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
            this.connection.query('UPDATE rentals_table SET user_uid = NULL, rental_time = NULL, return_time = NULL WHERE machines_id = ?', [machines_id], (err, results, fields) => {
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
            this.connection.query('UPDATE machines_table SET lent_state = 0 WHERE machines_id = ?;', [machines_id], (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    getMachineTime(user_uid) {
        const query = 'SELECT user_uid, machines_table.machines_id, machine_type_table.type_name, rental_time, return_time, machine_type_table.price FROM rentals_table JOIN machines_table ON rentals_table.machines_id = machines_table.machines_id JOIN machine_type_table ON machines_table.machines_type = machine_type_table.type_id WHERE user_uid = ?'
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
        const query = 'SELECT machines_table.machines_id, invoices.machine_time, invoices.total_value, machine_type_table.type_name FROM invoices JOIN machines_table ON invoices.machines_id = machines_table.machines_id JOIN machine_type_table ON machine_type_table.type_id = machines_table.machines_type WHERE user_uid = ? ORDER BY `machines_table`.`machines_id` ASC'
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

    /***  ESP32 Machine API [/api/espdev]  ***/

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
            this.connection.query(query, [user, token], (err, results, fields) => {
                if (err) {
                    console.log("database.js checkMachineToken err:", err);
                    reject(err);
                } else {
                    // console.log("database.js checkMachineToken results:", results);
                    if(results.length == 1) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
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
            this.connection.query(query, [mac], (err, results, fields) => {
                if (err) {
                    console.log("database.js getMachineState[1] err:", err);
                    reject(err);
                } else {
                    // console.log("database.js getMachineState results:", results);
                    if(results.length == 1) {
                        try {
                            let status = parseInt(results[0].status);
                            if(status > -1 && status < 5) {
                                resolve(status);
                            } else {
                                resolve(-1);
                            }
                        } catch (e) {
                            console.log("database.js getMachineState[2] ~ e:", e)
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
        const table = 'machines';
        const status_th = 'status';
        const query = `UPDATE ${table} SET ${status_th} = ? WHERE machines_mac = ?`
        return new Promise((resolve, reject) => {
            this.connection.query(query, [status, user], (err, results, fields) => {
                if (err) {
                    console.log("🚀 ~ file: database.js:275 ~ Database ~ this.connection.query ~ err:", err)
                    reject(err);
                } else {
                    console.log("🚀 ~ file: database.js:278 ~ Database ~ this.connection.query ~ results:", results)
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
