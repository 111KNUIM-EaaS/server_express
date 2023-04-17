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

    deleteMachineBorrow(machines_id) {
        return new Promise((resolve, reject) => {
            this.connection.query('UPDATE rentals_table SET user_uid = NULL, rental_time = NULL WHERE machines_id = ?', [machines_id], (err, results, fields) => {
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
