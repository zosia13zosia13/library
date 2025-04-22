import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../style.css';

function BranchBooks() {
  const { id } = useParams();
  const [books, setBooks] = useState([]);
  const [branchName, setBranchName] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetch(`http://localhost:3001/branches/${id}/books`)
      .then(res => res.json())
      .then(data => setBooks(data));
  }, [id]);

  useEffect(() => {
    fetch('http://localhost:3001/branches')
      .then(res => res.json())
      .then(allBranches => {
        const current = allBranches.find(b => b.id === parseInt(id));
        if (current) setBranchName(current.name);
      });
  }, [id]);

  return (
    <div className="branch-books-container">
      <h1>Książki w: {branchName}</h1>
      <div className="book-list-empik">
        {books.map(book => (
          <Link to={`/books/${book.id}`} key={book.id} className="book-card-empik">
            <img src={book.coverUrl || '/book.jpg'} alt={book.title} />
            <div className="book-info">
              <h3>{book.title}</h3>
              <p>{book.author}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BranchBooks;

  