import React, { useEffect, useState } from 'react';
import '../style.css';

function Books() {
  const [books, setBooks] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');

  useEffect(() => {
    fetchBooks();
    fetchBranches();
  }, []);

  const fetchBooks = async () => {
    const res = await fetch('http://localhost:3001/books');
    const data = await res.json();
    setBooks(data);
  };

  const fetchBranches = async () => {
    const res = await fetch('http://localhost:3001/branches');
    const data = await res.json();
    setBranches(data);
  };

  const filteredBooks = selectedBranch === 'all'
    ? books
    : books.filter(book => book.branchId === parseInt(selectedBranch));

  return (
    <div className="container">
      <h1>Dostępne książki</h1>

      <label>Wybierz filię: </label>
      <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
        <option value="all">Wszystkie filie</option>
        {branches.map(branch => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>

      <ul>
        {filteredBooks.map(book => (
          <li key={book.id}>
            <strong>{book.title}</strong> — {book.author} ({book.genre})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Books;
