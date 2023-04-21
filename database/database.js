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
                    console.log("🚀 ~ file: database.js:77 ~ this.connection.query ~ results:", results);
                    resolve(results);
                }
            });
        });
    }
    
    getMachineList(uid) {
        const query = 'SELECT machines.machines_id, type.type_name FROM machines JOIN type ON machines.machines_type = type.type_id JOIN rentals ON rentals.machines_id = machines.machines_id JOIN user ON rentals.user_uid = user.user_uid WHERE rentals.user_uid = ?';
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
            this.connection.query('SELECT machines_id FROM machines WHERE machines_type = ? AND status = 0 ORDER BY machines_id ASC LIMIT 1', [machineType], (err, results, fields) => {
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
