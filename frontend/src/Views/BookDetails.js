import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../style.css";


function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/books/${id}`)
      .then((res) => res.json())
      .then((data) => setBook(data));
  }, [id]);
  console.log(book);

  if (!book) return <p>Ładowanie...</p>;

  const handleReserve = async () => {
    const userId = localStorage.getItem('userId'); // lub z kontekstu
    const branchId = book.branchId;
  
    const res = await fetch('http://localhost:3001/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: parseInt(userId),
        bookId: book.id,
        branchId: branchId
      })
    });
  
    const data = await res.json();
  
    if (res.ok) {
      alert('📚 Książka została zarezerwowana na 7 dni!');
    } else {
      alert('❌ Błąd przy rezerwacji: ' + data.error);
    }
  };  

  return (
    <div className="book-detail-container">
      <img
        src={book.coverUrl || "/book.jpg"} // ← użycie lokalnego obrazka
        alt={book.title}
      />
      <h1>{book.title}</h1>
      <h3>{book.author}</h3>
      <p>
        <strong>Gatunek:</strong> {book.genre}
      </p>
      <p>
        <strong>Rok:</strong> {book.publishedYear}
      </p>
      <p>
        <strong>Opis:</strong> {book.description}
      </p>
      <p>
        <strong>Filiia:</strong> {book.branch}
      </p>
      <p>
        <strong>Dostępnych:</strong> {book.quantity}
      </p>
      <p>
        <strong>Wypożyczono:</strong> {book.timesLoaned} razy
      </p>
      <p>
        {" "}
        <button
          onClick={handleReserve}
          style={{ marginTop: "20px", padding: "10px 20px" }}
        >
          📥 Zarezerwuj
        </button>
      </p>
      <Link to={"/branches/" + book.branchId}>← Powrót</Link>
    </div>
  );
}

export default BookDetails;
