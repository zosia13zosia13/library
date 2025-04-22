import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../style.css';

function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/books/${id}`)
      .then(res => res.json())
      .then(data => setBook(data));
  }, [id]);
  console.log(book)

  if (!book) return <p>Ładowanie...</p>;

  return (
    <div className="book-detail-container">
      <img
        src={book.coverUrl || '/book.jpg'} // ← użycie lokalnego obrazka
        alt={book.title}
      />
      <h1>{book.title}</h1>
      <h3>{book.author}</h3>
      <p><strong>Gatunek:</strong> {book.genre}</p>
      <p><strong>Rok:</strong> {book.publishedYear}</p>
      <p><strong>Opis:</strong> {book.description}</p>
      <p><strong>Filiia:</strong> {book.branch}</p>
      <p><strong>Dostępnych:</strong> {book.quantity}</p>
      <p><strong>Wypożyczono:</strong> {book.timesLoaned} razy</p>
      <Link to={'/branches/'+book.branchId}>← Powrót</Link>
    </div>
  );
}

export default BookDetails;
