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
app.use('/users',    usersRoutes);
app.use('/espdev',   espdevRoutes);
app.use('/machines', machinesRoutes);

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
