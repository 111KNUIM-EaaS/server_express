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
     * User login
     * @param {string} username user name
     * @param {string} password user password
     * @returns returns a promise that resolves to the results of the query
     */

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
            this.connection.query('SELECT type_name, price FROM machine_type_table', (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    getMachineList() {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT machines_id, type_name, machines_power  FROM machines_table, machine_type_table WHERE machines_type = type_id;', (err, results, fields) => {
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
    
    // borrow api
    getBorrow() {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT * FROM borrow_table', (err, results, fields) => {
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
