import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookSearch from './BookSearch'; // <-- dodaj jeśli plik w tym samym folderze
import '../style.css';

function Books() {
  const [books, setBooks] = useState([]);

  // Domyślnie pobierz wszystkie książki
  useEffect(() => {
    fetch('http://localhost:3001/books')
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  return (
    <div className="books-container">
      {/* Wyszukiwarka */}
      <BookSearch onResults={setBooks} />

      {/* Lista książek */}
      <div className="scroll-container">
        {books.map(book => (
          <Link to={`/books/${book.id}`} key={book.id} className="book-card">
            <img
              src={book.coverUrl || '/book.jpg'} // obrazek z public/
              alt={book.title}
            />
            <h3>{book.title}</h3>
            <p>{book.author}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Books;
