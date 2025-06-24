const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require('express-session'); 
const app = express();
const PORT = 3001;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.use(cors({
  origin: 'http://localhost:3000',  // frontend
  credentials: true                // umożliwia ciasteczka
}));

// ✅ 2. Potem sesja
app.use(session({
  secret: 'tajny-klucz',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// ✅ 3. Parsowanie JSONa
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


app.get('/books/genres', async (_req, res) => {
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

app.use(session({
  secret: 'tajny-klucz', // użyj zmiennej środowiskowej w produkcji
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 dzień
}));

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Błędne dane logowania' });
  }

  req.session.userId = user.id;
  res.json({ message: 'Zalogowano' });
});

function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  return res.status(401).json({ message: 'Brak autoryzacji' });
}

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

// ✅ Rezerwacja sali (z limitem + dozwolone dni/godziny)
app.post('/room-reservations', async (req, res) => {
  try {
    const { userId, startTime, endTime, branchId, purpose } = req.body;

    if (!userId || !startTime || !endTime || !branchId || !purpose) {
      return res.status(400).json({ message: 'Brakuje wymaganych danych.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const dayOfWeek = start.getDay(); // 0 = niedziela, 6 = sobota
    const startHour = start.getHours();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Nieprawidłowy format daty.' });
    }

    // 🔹 Pobranie danych filii
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) return res.status(404).json({ message: 'Nie znaleziono filii.' });

    // 🔹 Walidacja dni i godzin
    if (dayOfWeek === 0) {
      return res.status(400).json({ message: 'Biblioteka jest zamknięta w niedzielę.' });
    }

    if (dayOfWeek === 6) {
      if (startHour < 8 || startHour >= 12) {
        return res.status(400).json({ message: 'W soboty można rezerwować tylko między 8:00 a 12:00.' });
      }
    } else {
      if (startHour < branch.openHour || startHour + 2 > branch.closeHour) {
        return res.status(400).json({
          message: `Rezerwacje dozwolone tylko w godzinach ${branch.openHour}:00 – ${branch.closeHour - 2}:00.`
        });
      }
    }

    // 🔹 Zakres dnia i tygodnia
    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(start);
    dayEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() - start.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // 🔹 Rezerwacje dzienne
    const dayReservations = await prisma.roomReservation.count({
      where: {
        userId,
        startTime: { gte: dayStart, lte: dayEnd },
        canceled: false
      }
    });

    if (dayReservations >= 2) {
      return res.status(400).json({ message: 'Można zarezerwować maksymalnie 2 razy dziennie.' });
    }

    // 🔹 Rezerwacje tygodniowe (unikalne dni)
    const weekReservations = await prisma.roomReservation.findMany({
      where: {
        userId,
        startTime: { gte: weekStart, lte: weekEnd },
        canceled: false
      }
    });

    const uniqueDays = new Set(weekReservations.map(r => new Date(r.startTime).toDateString()));
    if (uniqueDays.size >= 3 && !uniqueDays.has(start.toDateString())) {
      return res.status(400).json({ message: 'Można zarezerwować tylko w 3 różnych dniach tygodnia.' });
    }

    // 🔹 Tworzenie rezerwacji
    const newReservation = await prisma.roomReservation.create({
      data: {
        userId,
        branchId,
        startTime: start,
        endTime: end,
        purpose,
        canceled: false
      }
    });

    res.json({ message: 'Zarezerwowano salę!', reservation: newReservation });
  } catch (err) {
    console.error('❌ Błąd rezerwacji sali:', err);
    res.status(500).json({ error: 'Błąd serwera przy rezerwacji sali.' });
  }
});


app.get('/users/:id/room-reservations', async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ error: 'Nieprawidłowe ID użytkownika.' });

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


app.patch('/room-reservations/:id/cancel', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Nieprawidłowe ID rezerwacji.' });

  try {
    const updated = await prisma.roomReservation.update({
      where: { id },
      data: { canceled: true }
    });

    res.json({ message: 'Rezerwacja anulowana.', reservation: updated });
  } catch (err) {
    console.error('Błąd anulowania rezerwacji sali:', err);
    res.status(500).json({ error: 'Błąd serwera przy anulowaniu.' });
  }
});

// 📅 Lista wydarzeń w filii
app.get('/branches/:branchId/events', async (req, res) => {
  const branchId = parseInt(req.params.branchId);
  const events = await prisma.event.findMany({
    where: { branchId },
    orderBy: { date: 'asc' }
  });
  res.json(events);
});


// ✅ Zapis na wydarzenie
app.post('/events/:eventId/register', async (req, res) => {
  const eventId = parseInt(req.params.eventId);
  const { userId } = req.body;

  const existing = await prisma.eventRegistration.findFirst({
    where: { userId, eventId }
  });

  if (existing) {
    return res.status(400).json({ message: 'Już zapisałeś się na to wydarzenie.' });
  }

  await prisma.eventRegistration.create({
    data: {
      userId,
      eventId
    }
  });

  res.status(201).json({ message: 'Zapisano na wydarzenie!' });
});

// 📅 Endpoint: pobierz wydarzenia dla konkretnej filii
app.get('/branches/:id/events', async (req, res) => {
  const branchId = parseInt(req.params.id);

  if (isNaN(branchId)) {
    return res.status(400).json({ error: 'Nieprawidłowe ID filii.' });
  }

  try {
    const events = await prisma.event.findMany({
      where: { branchId },
      orderBy: { date: 'asc' }
    });

    res.json(events);
  } catch (error) {
    console.error('❌ Błąd pobierania wydarzeń:', error);
    res.status(500).json({ error: 'Błąd serwera przy pobieraniu wydarzeń.' });
  }
});

// Obsługa globalnych błędów
process.on('uncaughtException', (err) => {
  console.error('❌ Nieobsłużony wyjątek:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Nieobsłużona obietnica:', reason);
});

app.get('/me', (req, res) => {
  if (req.session.userId) {
    res.json({ userId: req.session.userId });
  } else {
    res.status(401).json({ message: 'Nie zalogowany' });
  }
});

// pobranie uzytkownika
router.get('/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });

    res.json(user);
  } catch (error) {
    console.error('❌ Błąd pobierania użytkownika:', error);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Wylogowano' });
  });
});
