const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const csvFilePath = path.join(__dirname, 'books.csv');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  // 🏛️ Dodaj 4 filie
  await prisma.branch.createMany({
    data: [
      {
        name: 'Biblioteka Kraków',
        location: 'Kraków',
        openHour: 9,
        closeHour: 17,
        address: 'ul. Karmelicka 12, 30-123 Kraków',
        phone: '12 345 67 89',
        email: 'krakow@biblioteka.pl'
      },
      {
        name: 'Biblioteka Warszawa',
        location: 'Warszawa',
        openHour: 10,
        closeHour: 18,
        address: 'ul. Marszałkowska 45, 00-123 Warszawa',
        phone: '22 987 65 43',
        email: 'warszawa@biblioteka.pl'
      },
      {
        name: 'Biblioteka Gdańsk',
        location: 'Gdańsk',
        openHour: 8,
        closeHour: 16,
        address: 'ul. Długa 3, 80-831 Gdańsk',
        phone: '58 123 45 67',
        email: 'gdansk@biblioteka.pl'
      },
      {
        name: 'Biblioteka Wrocław',
        location: 'Wrocław',
        openHour: 11,
        closeHour: 19,
        address: 'ul. Świdnicka 25, 50-066 Wrocław',
        phone: '71 456 78 90',
        email: 'wroclaw@biblioteka.pl'
      }
    ]
  });  

  const branches = await prisma.branch.findMany();

  if (branches.length === 0) {
    throw new Error('Brak filii w bazie! Nie można dodać książek.');
  }

  const books = [];

  // 📄 Wczytaj CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const randomBranch = branches[getRandomInt(0, branches.length - 1)];

        books.push({
          title: row.Tytul,
          author: row.Autor,
          genre: row.Kategoria || 'Inne',
          publishedYear: getRandomInt(1950, 2024),
          description: (row.Opis && row.Opis !== 'NA') ? row.Opis : 'Brak opisu',
          quantity: getRandomInt(1, 10),
          coverUrl: '/book.jpg',
          branchId: randomBranch.id
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  // 📚 Dodaj książki do bazy
  for (const book of books) {
    await prisma.book.create({ data: book });
  }

  console.log(`✅ Dodano ${books.length} książek i ${branches.length} filie.`);
}

main()
  .catch((e) => {
    console.error('❌ Błąd podczas seeda:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
