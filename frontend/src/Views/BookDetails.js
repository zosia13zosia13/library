import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../style.css";

function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  // Pobieranie danych książki
  useEffect(() => {
    fetch(`http://localhost:3001/books/${id}`)
      .then(async (res) => {
        const text = await res.text();
        console.log("📦 Odpowiedź z serwera:", text);

        try {
          const json = JSON.parse(text);
          setBook(json);
        } catch (err) {
          console.error("❌ Błąd parsowania JSON-a:", err);
          alert("Błąd danych książki: " + err.message);
        }
      })
      .catch((err) => {
        console.error("❌ Błąd zapytania:", err);
        alert("Nie udało się połączyć z serwerem");
      });
  }, [id]);

  // Rezerwacja książki
  const handleReserve = async () => {
    const userId = localStorage.getItem("userId");
    const branchId = book.branchId;

    try {
      const res = await fetch("http://localhost:3001/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(userId),
          bookId: book.id,
          branchId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("📚 Książka została zarezerwowana na 7 dni!");

        // Odśwież dane książki po rezerwacji
        fetch(`http://localhost:3001/books/${id}`)
          .then((res) => res.json())
          .then((data) => setBook(data));
      } else {
        alert("❌ Błąd przy rezerwacji: " + (data.message || data.error || "Nieznany błąd"));
      }
    } catch (err) {
      console.error("❌ Błąd przy rezerwacji:", err);
      alert("Błąd połączenia z serwerem.");
    }
  };

  if (!book) return <p>Ładowanie...</p>;

  return (
    <div className="book-detail-container">
      <img src={book.coverUrl || "/book.jpg"} alt={book.title} />
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
        <strong>Filia:</strong> {book.branch}
      </p>
      <p>
        <strong>Dostępnych:</strong> {book.quantity}
      </p>
      <p>
        <strong>Wypożyczono:</strong> {book.timesLoaned || 0} razy
      </p>

      <button className="reserve-button" onClick={handleReserve}>
        📥 Zarezerwuj
      </button>

      <p style={{ marginTop: "20px" }}>
        <Link to={"/branches/" + book.branchId}>← Powrót</Link>
      </p>
    </div>
  );
}

export default BookDetails;

