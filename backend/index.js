const express = require("express");
const app = express();
const PORT = 3001;
const bcrypt = require("bcrypt");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Endpoint testowy
app.get("/healthcheck", (req, res) => {
  res.status(200).send("Backend działa poprawnie!");
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});

// GET /books – pobiera wszystkie książki z bazy
app.get("/books", async (req, res) => {
  try {
    const books = await prisma.book.findMany();
    res.json(books);
  } catch (err) {
    console.error("Błąd Prisma:", err);
    res.status(500).send("Błąd serwera");
  }
});

app.get('/books/genres', async (req, res) => {
    const genres = await prisma.book.findMany({
      distinct: ['genre'],
      select: { genre: true }
    });
  
    res.json(genres.map(g => g.genre));
  });
  
  app.get('/books/search', async (req, res) => {
    const { title, genre, branchId } = req.query;
  
    const books = await prisma.book.findMany({
      where: {
        AND: [
          title ? { title: { contains: title, mode: 'insensitive' } } : {},
          genre ? { genre: genre } : {},
          branchId ? { branchId: parseInt(branchId) } : {}
        ]
      }
    });
  
    res.json(books);
  });

//Zwraca tylko książki z wybranej filii
app.get("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);

  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        branch: true,
        loans: true,
      },
    });

    if (!book) return res.status(404).send("Nie znaleziono książki");

    res.json({
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      publishedYear: book.publishedYear,
      description: book.description,
      quantity: book.quantity,
      coverUrl: book.coverUrl,
      branch: book.branch.name,
      branchId: book.branchId,
      timesLoaned: book.loans.length,
    });
  } catch (err) {
    console.error("Błąd przy pobieraniu książki:", err);
    res.status(500).send("Błąd serwera");
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Sprawdź, czy użytkownik już istnieje
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Użytkownik o tym e-mailu już istnieje." });
    }

    // 2. Haszowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Zapis do bazy danych
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).send("Użytkownik zarejestrowany!");
  } catch (err) {
    console.error("Błąd przy rejestracji:", err);
    res.status(500).send("Wystąpił błąd serwera.");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Znajdź użytkownika po emailu
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 2. Jeśli nie istnieje
    if (!user) {
      return res.status(401).json({ message: "Błędne dane logowania" });
    }

    // 3. Porównaj hasło z hashem w bazie
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Błędne dane logowania" });
    }

    // 4. Logowanie zakończone sukcesem
    res.status(200).json({ message: "Zalogowano pomyślnie", userId: user.id });
  } catch (err) {
    console.error("Błąd przy logowaniu:", err);
    res.status(500).send("Wystąpił błąd serwera.");
  }
});

app.get("/branches", async (req, res) => {
  try {
    const branches = await prisma.branch.findMany();
    res.json(branches);
  } catch (err) {
    console.error("Błąd:", err);
    res.status(500).send("Błąd serwera");
  }
});

app.get("/branches/:id/books", async (req, res) => {
  const branchId = parseInt(req.params.id);

  try {
    const books = await prisma.book.findMany({
      where: { branchId },
    });

    res.json(books); // <- ZWRACAMY JSON
  } catch (err) {
    console.error("Błąd przy pobieraniu książek:", err);
    res.status(500).json({ error: "Błąd serwera" }); // <- też JSON
  }
});

app.get('/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    name: user.name,
    email: user.email
  });
});

app.get("/users/:id/loans", async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const loans = await prisma.loan.findMany({
      where: { userId },
      include: {
        book: true,
      },
    });

    const response = loans.map((loan) => ({
      id: loan.id,
      title: loan.book.title,
      dueDate: loan.dueDate,
    }));

    res.json(response);
  } catch (err) {
    console.error("Błąd przy pobieraniu wypożyczeń:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post('/reservations', async (req, res) => {
  const { userId, bookId, branchId } = req.body;

  try {
    // 🔹 Sprawdź, ile użytkownik już ma aktywnych rezerwacji
    const userReservations = await prisma.reservation.count({
      where: {
        userId,
        expiresAt: {
          gt: new Date() // rezerwacje, które jeszcze nie wygasły
        }
      }
    });

    if (userReservations >= 5) {
      return res.status(400).json({ message: 'Możesz mieć maksymalnie 5 rezerwacji.' });
    }

    // 🔹 Sprawdź dostępność książki
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!book || book.quantity <= 0) {
      return res.status(400).json({ message: 'Brak dostępnych egzemplarzy.' });
    }

    // 🔹 Zarezerwuj książkę
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(now.getDate() + 7); // rezerwacja ważna przez 7 dni

    await prisma.reservation.create({
      data: {
        user: { connect: { id: userId } },
        book: { connect: { id: bookId } },
        branch: { connect: {id: branchId }},
        reservedAt: now,
        expiresAt: expires,
      }
    });

    // 🔹 Zmniejsz ilość dostępnych egzemplarzy
    await prisma.book.update({
      where: { id: bookId },
      data: {
        quantity: {
          decrement: 1
        }
      }
    });

    res.status(201).json({ message: 'Książka została zarezerwowana!' });

  } catch (err) {
    console.error('❌ Błąd przy rezerwacji:', err);
    res.status(500).send('Wystąpił błąd serwera.');
  }
});

// Rezerwacje książek danego użytkownika
app.get('/users/:id/reservations', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      include: {
        book: true,
        branch: true
      }
    });

    const result = reservations.map(r => ({
      id: r.id,
      title: r.book.title,
      reservedAt: r.reservedAt,
      expiresAt: r.expiresAt,
      branchName: r.branch.name
    }));

    res.json(result);
  } catch (err) {
    console.error('Błąd pobierania rezerwacji:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Anulowanie rezerwacji książki
app.delete('/reservations/:id', async (req, res) => {
  const reservationId = parseInt(req.params.id);

  try {
    await prisma.reservation.delete({
      where: { id: reservationId }
    });

    res.status(200).json({ message: 'Rezerwacja anulowana.' });
  } catch (err) {
    console.error('Błąd przy anulowaniu:', err);
    res.status(500).json({ error: 'Nie udało się anulować rezerwacji.' });
  }
});

// Rezerwacja sali (z uwzględnieniem filii)
app.post('/room-reservations', async (req, res) => {
  const { userId, branchId, startTime, endTime, purpose } = req.body;

  try {
    await prisma.roomReservation.create({
      data: {
        user: { connect: { id: userId } },
        branch: { connect: { id: branchId } },
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        purpose
      }
    });

    res.status(201).json({ message: 'Sala została zarezerwowana!' });
  } catch (err) {
    console.error('Błąd przy rezerwacji sali:', err);
    res.status(500).send('Błąd serwera');
  }
});

// Pobieranie rezerwacji sali użytkownika
app.get('/users/:id/room-reservations', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const reservations = await prisma.roomReservation.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' }
    });

    res.json(reservations);
  } catch (err) {
    console.error('Błąd pobierania rezerwacji sali:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Anulowanie rezerwacji sali
app.patch('/room-reservations/:id/cancel', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.roomReservation.update({
      where: { id },
      data: { canceled: true }
    });

    res.json({ message: 'Rezerwacja anulowana.' });
  } catch (err) {
    console.error('Błąd anulowania rezerwacji sali:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Obsługa globalnych błędów
process.on('uncaughtException', (err) => {
  console.error('❌ Nieobsłużony wyjątek:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Nieobsłużona obietnica:', reason);
});
