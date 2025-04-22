import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../style.css';

function Books() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/books')
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  return (
    <div className="scroll-container">
      {books.map(book => (
        <Link to={`/books/${book.id}`} key={book.id} className="book-card">
          <img
            src={book.coverUrl || '/book.jpg'} // ← lokalny obrazek z public/
            alt={book.title}
          />
          <h3>{book.title}</h3>
          <p>{book.author}</p>
        </Link>
      ))}
    </div>
  );
}

export default Books;
