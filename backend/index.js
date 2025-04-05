const express = require('express');
const app = express();
const PORT = 3001;

// Endpoint testowy
app.get('/healthcheck', (req, res) => {
  res.status(200).send('Backend działa poprawnie!');
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});