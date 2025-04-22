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
    coverUrl: '/book.jpg', // lub zewnętrzny link
    branchId: branchId,
  }));
};

async function main() {
  // Najpierw usuń wszystko (opcjonalnie)
  await prisma.loan.deleteMany();
  await prisma.book.deleteMany();
  await prisma.branch.deleteMany();

  // Dodaj 3 filie
  const branches = await prisma.branch.createMany({
    data: [
      { name: 'Biblioteka Kraków', location: 'Kraków' },
      { name: 'Biblioteka Warszawa', location: 'Warszawa' },
      { name: 'Biblioteka Gdańsk', location: 'Gdańsk' },
    ]
  });

  const createdBranches = await prisma.branch.findMany();

  // Dodaj po 30 książek do każdej filii
  for (const branch of createdBranches) {
    const books = getBooksForBranch(branch.id, 30);
    await prisma.book.createMany({ data: books });
  }

  console.log('✅ Załadowano 90 książek (3 filie × 30)');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());