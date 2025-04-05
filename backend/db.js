const sql = require('mssql');

const config = {
    user: 'library_user',
    password: 'Biblioteka2000@',
    server: 'localhost',
    database: 'library_db',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

module.exports = { sql, config };
