const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getBooksForBranch = (branchId, count) => {
  const genres = ['Fantasy', 'Kryminał', 'Romans', 'Sci-fi', 'Literatura piękna'];
  const authors = ['A. Sapkowski', 'S. King', 'J.K. Rowling', 'I. Karpowicz', 'O. Tokarczuk'];

  return Array.from({ length: count }, (_, i) => ({
    title: `Książka #${i + 1} - filia ${branchId}`,
    author: authors[i % authors.length],
    genre: genres[i % genres.length],
    publishedYear: 1990 + (i % 30),
    description: `To jest przykładowy opis książki numer ${i + 1}`,
    quantity: Math.floor(Math.random() * 5) + 1,
    coverUrl: '/book.jpg',
    branchId: branchId,
  }));
};

async function main() {
  // 🧹 Wyczyść dane z zależnościami
  await prisma.roomReservation.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.book.deleteMany();
  await prisma.event.deleteMany();
  await prisma.branch.deleteMany();

  // ➕ Dodaj 3 filie z godzinami otwarcia
  await prisma.branch.createMany({
    data: [
      { name: 'Biblioteka Kraków', location: 'Kraków', openHour: 9, closeHour: 17 },
      { name: 'Biblioteka Warszawa', location: 'Warszawa', openHour: 10, closeHour: 18 },
      { name: 'Biblioteka Gdańsk', location: 'Gdańsk', openHour: 8, closeHour: 16 },
    ]
  });

  const createdBranches = await prisma.branch.findMany();

  // 📚 Dodaj po 30 książek do każdej filii
  for (const branch of createdBranches) {
    const books = getBooksForBranch(branch.id, 30);
    await prisma.book.createMany({ data: books });
  }

  // 📅 Dodaj wydarzenia do pierwszej filii (przykładowo)
  await prisma.event.createMany({
    data: [
      {
        title: 'Warsztaty kreatywnego pisania',
        description: 'Zajęcia dla młodzieży i dorosłych z pisania opowiadań.',
        date: new Date('2025-06-21T17:00:00'),
        branchId: createdBranches[0].id
      },
      {
        title: 'Klub książki fantasy',
        description: 'Spotkanie fanów Wiedźmina, Tolkiena i innych.',
        date: new Date('2025-06-24T18:00:00'),
        branchId: createdBranches[0].id
      }
    ]
  });

  console.log('✅ Załadowano książki, filie i wydarzenia!');
}

main()
  .catch(e => {
    console.error('❌ Błąd w seed.js:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
