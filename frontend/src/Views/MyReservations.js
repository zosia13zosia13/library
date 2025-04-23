import React, { useEffect, useState } from 'react';
import '../style.css';

function MyReservations({ userId }) {
  const [reservations, setReservations] = useState([]);

  // Pobieranie rezerwacji użytkownika
  useEffect(() => {
    fetch(`http://localhost:3001/users/${userId}/reservations`)
      .then(res => res.json())
      .then(data => setReservations(data));
  }, [userId]);

  // Anulowanie rezerwacji
  const handleCancel = async (reservationId) => {
    const confirm = window.confirm('Czy na pewno chcesz anulować tę rezerwację?');
    if (!confirm) return;

    const res = await fetch(`http://localhost:3001/reservations/${reservationId}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      // Usuń rezerwację z listy
      setReservations(prev => prev.filter(r => r.id !== reservationId));
    } else {
      alert('❌ Nie udało się anulować rezerwacji.');
    }
  };

  return (
    <div className="container">
      <h1>📋 Moje rezerwacje</h1>
      {reservations.length === 0 ? (
        <p>Brak aktywnych rezerwacji.</p>
      ) : (
        <ul className="loans-list">
          {reservations.map((res) => (
            <li key={res.id} className="loan-item">
              <strong>{res.title}</strong> <br />
              Filia: {res.branchName} <br />
              Rezerwacja od: {new Date(res.reservedAt).toLocaleDateString()} <br />
              Wygasa: {new Date(res.expiresAt).toLocaleDateString()} <br />
              <button
                className="cancel-button"
                onClick={() => handleCancel(res.id)}
              >
                ❌ Anuluj
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyReservations;


