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

app.post("/reservations", async (req, res) => {
  const { userId, bookId, branchId } = req.body;

  try {
    const existing = await prisma.reservation.findFirst({
      where: {
        userId,
        bookId,
        expiresAt: { gte: new Date() },
      },
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Już masz aktywną rezerwację tej książki." });
    }

    const reservedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(reservedAt.getDate() + 7); // 7 dni

    const reservation = await prisma.reservation.create({
      data: {
        userId,
        bookId,
        branchId,
        reservedAt,
        expiresAt,
      },
    });

    res.status(201).json({ message: "Książka zarezerwowana!", reservation });
  } catch (err) {
    console.error("Błąd przy rezerwacji:", err);
    res.status(500).json({ error: "Nie udało się zarezerwować książki." });
  }
});
