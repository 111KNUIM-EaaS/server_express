const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const mysql = require('mysql2');
const databaseConfig  =  require('./config/databaseConfig.json')

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// DB Setting
const connection = mysql.createConnection({
    host: databaseConfig.host,
    user: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database
})

// Router Setting
const homeRoutes = require('./routes/homeRoutes');
const usersRoutes = require('./routes/api/users');
const { config } = require('process');
app.use('/', homeRoutes);
app.use('/api/users', usersRoutes);

// 40X
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// 50X
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

connection.connect((err) => {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
    connection.query('SHOW DATABASES', (error, results, fields) => {
        if (error) throw error;
    
        console.log('Databases:');
        console.log(results);
    
        // Retrieve table information
        connection.query('SHOW TABLES', (error, results, fields) => {
          if (error) throw error;
    
          console.log('Tables:');
          console.log(results);
    
          // Close the connection
          connection.end((err) => {
            if (err) throw err;
            console.log('Connection closed.');
          });
        });      
    });
})

// Start Express service
const port = process.env.PORT || 8001;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
