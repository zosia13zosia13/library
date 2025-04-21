const express = require('express');
const app = express();
const PORT = 3001;
const bcrypt = require('bcrypt');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


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



// GET /books – pobiera wszystkie książki z bazy
app.get('/books', async (req, res) => {
  try {
    const books = await prisma.book.findMany();
    res.json(books);
  } catch (err) {
    console.error('Błąd Prisma:', err);
    res.status(500).send('Błąd serwera');
  }
});


app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      // 1. Sprawdź, czy użytkownik już istnieje
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
  
      if (existingUser) {
        return res.status(400).json({ message: 'Użytkownik o tym e-mailu już istnieje.' });
      }
  
      // 2. Haszowanie hasła
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // 3. Zapis do bazy danych
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        }
      });
  
      res.status(201).send('Użytkownik zarejestrowany!');
    } catch (err) {
      console.error('Błąd przy rejestracji:', err);
      res.status(500).send('Wystąpił błąd serwera.');
    }
  });


  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // 1. Sprawdź, czy użytkownik już istnieje
      const hashedPassword = await bcrypt.hash(password, 10);

      const existingUser = await prisma.user.findUnique({
        where: {email, password:hashedPassword}
      });
  
      if (existingUser) {
        return res.status(400).json({ message: 'Zalogowano' });
      }
  
      // 3. Zapis do bazy danych
    return res.status(401).json({ message: 'Błędne dane logowania' });
  
    } catch (err) {
      console.error('Błąd przy logowaniu:', err);
      res.status(500).send('Wystąpił błąd serwera.');
    }
  });