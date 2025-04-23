import React, { useState, useEffect } from 'react';
import '../style.css'; // lub zmień ścieżkę, jeśli masz osobny plik CSS

function BookSearch({ onResults, branchId }) {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);

  // Pobierz dostępne gatunki książek
  useEffect(() => {
    fetch('http://localhost:3001/books/genres')
      .then(res => res.json())
      .then(data => setGenres(data));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.append('title', query);
    if (genre) params.append('genre', genre);
    if (branchId) params.append('branchId', branchId);

    fetch(`http://localhost:3001/books/search?${params.toString()}`)
      .then(res => res.json())
      .then(data => onResults(data));
  };

  return (
    <div className="book-search-bar">
      <input
        type="text"
        placeholder="Wpisz czego szukasz"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <select value={genre} onChange={e => setGenre(e.target.value)}>
        <option value="">Dowolna kategoria</option>
        {genres.map((g, index) => (
          <option key={index} value={g}>{g}</option>
        ))}
      </select>
      <button onClick={handleSearch}>🔍</button>
    </div>
  );
}

export default BookSearch;
