const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const mysql = require('mysql2');
// const databaseConfig  =  require('./config/databaseConfig.json')

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Router Setting
const homeRoutes = require('./routes/homeRoutes');
const usersRoutes = require('./routes/api/users');
const machinesRoutes = require('./routes/api/machines');
const billsRoutes = require('./routes/api/bill');

const { config } = require('process');
const router = require('./routes/homeRoutes');
app.use('/', homeRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/machines/', machinesRoutes);
app.use('/api/bills/', billsRoutes);

// 40X
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// 50X
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Start Express service
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
