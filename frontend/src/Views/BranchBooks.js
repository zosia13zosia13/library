import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BookSearch from './BookSearch'; // dodaj ten import
import '../style.css';

function BranchBooks() {
  const { id } = useParams();
  const [books, setBooks] = useState([]);
  const [branchName, setBranchName] = useState('');

  // Pobierz domyślnie wszystkie książki z filii
  useEffect(() => {
    fetch(`http://localhost:3001/branches/${id}/books`)
      .then(res => res.json())
      .then(data => setBooks(data));

    fetch('http://localhost:3001/branches')
      .then(res => res.json())
      .then(data => {
        const current = data.find(branch => branch.id === parseInt(id));
        if (current) setBranchName(current.name);
      });
  }, [id]);

  return (
    <div className="books-container">
      <h1>Książki w filii: {branchName}</h1>

      {/* 🔍 WYSZUKIWARKA */}
      <BookSearch
        onResults={setBooks}
        branchId={id} // przekażemy ID filii, aby backend wiedział gdzie szukać
      />

      <div className="scroll-container">
        {books.map(book => (
          <Link to={`/books/${book.id}`} key={book.id} className="book-card">
            <img
              src={book.coverUrl || '/book.jpg'}
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

export default BranchBooks;


  