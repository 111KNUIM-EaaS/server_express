# Eaas Server

## NodeJS使用套件
1. `body-parser`
2. `cookie-parser`
3. `cors`
4. `express`
5. `firebase`
6. `firebase-admin`
7. `moment`
8. `mysql2`

## 專案架構
```
    ├── Dockerfile
    ├── README.md
    ├── app.js
    ├── config
    │   ├── databaseConfig
    │   ├── databaseConfig.json
    │   ├── firebaseConfig
    │   └── firebaseConfig.json
    ├── database
    │   └── database.js
    ├── node_modules
    ├── package.json
    ├── public
    │   └── 404.html
    ├── routes
    │   ├── api
    │   │   ├── bill.js
    │   │   ├── espdev.js
    │   │   ├── machines.js
    │   │   └── users.js
    │   └── homeRoutes.js
    ├── yarn-error.log
    └── yarn.lock
```