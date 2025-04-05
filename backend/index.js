const express = require('express');
const app = express();
const PORT = 3001;
const bcrypt = require('bcrypt');
const cors = require('cors');
const { sql, config } = require('./db');


app.use(cors());
app.use(express.json());


// Endpoint testowy
app.get('/healthcheck', (req, res) => {
  res.status(200).send('Backend działa poprawnie!');
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});






app.get('/books', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Books');
        res.json(result.recordset);
    } catch (err) {
        console.error('Błąd SQL:', err);
        res.status(500).send('Błąd serwera');
    }
});




app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await sql.connect(config);

        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('password_hash', sql.NVarChar, hashedPassword)
            .query('INSERT INTO Users (name, email, password_hash) VALUES (@name, @email, @password_hash)');

        res.status(201).send('Użytkownik zarejestrowany!');
    } catch (err) {
        console.error('Błąd przy rejestracji:', err);
        res.status(500).send('Wystąpił błąd serwera.');
    }
});
