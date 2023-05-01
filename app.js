const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Router Setting
const usersRoutes    = require('./routes/users'   );
const espdevRoutes   = require('./routes/espdev'  );
const machinesRoutes = require('./routes/machines');

// const { config } = require('process');
app.use('/api/users',    usersRoutes);
app.use('/api/espdev',   espdevRoutes);
app.use('/api/machines', machinesRoutes);

// 40X
app.use((req, res, next) => {
    const data = {code:'404', message:'404 Not Found', path: req.path}
    const currentDate = new Date();
    console.error(`[E][${currentDate.toLocaleString()}]📝 app.js 🔊 40x method: ${req.method}, ip: ${req.ip}, path: ${req.path}`);
    res.status(404).send(JSON.stringify(data));
});

// 50X
app.use((err, req, res, next) => {
    const currentDate = new Date();
    console.error(`[E][${currentDate.toLocaleString()}]📝 app.js 🔊 50x method: ${req.method}, ip: ${req.ip}, path: ${req.path} error: ${err.stack}`);
    res.status(500).send('Internal Server Error');
});

// Start Express service
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
