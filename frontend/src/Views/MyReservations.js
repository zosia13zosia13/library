import React, { useEffect, useState } from 'react';
import '../style.css';

function MyReservations({ userId }) {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3001/users/${userId}/room-reservations`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReservations(data);
        } else {
          console.error("⚠️ Rezerwacje nie są tablicą:", data);
          setReservations([]);
        }
      })
      .catch(err => {
        console.error("❌ Błąd pobierania rezerwacji:", err);
        setReservations([]);
      });
  }, [userId]);

  const handleCancel = async (reservationId) => {
    const confirm = window.confirm('Czy na pewno chcesz anulować tę rezerwację?');
    if (!confirm) return;

    const res = await fetch(`http://localhost:3001/room-reservations/${reservationId}/cancel`, {
      method: 'PATCH',
    });

    if (res.ok) {
      setReservations(prev =>
        prev.map(r => r.id === reservationId ? { ...r, canceled: true } : r)
      );
    } else {
      alert('❌ Nie udało się anulować rezerwacji.');
    }
  };

  return (
    <div className="container">
      <h1>📋 Moje rezerwacje sali</h1>
      {reservations.length === 0 ? (
        <p>Brak rezerwacji sali.</p>
      ) : (
        <ul className="loans-list">
          {reservations.map((res) => (
            <li key={res.id} className="loan-item">
              <p><strong>Cel:</strong> {res.purpose}</p>
              <p><strong>Od:</strong> {new Date(res.startTime).toLocaleString()}</p>
              <p><strong>Do:</strong> {new Date(res.endTime).toLocaleString()}</p>
              <p><strong>Status:</strong> {res.canceled ? '❌ Anulowana' : '✅ Aktywna'}</p>
              {!res.canceled && (
                <button
                  className="cancel-button"
                  onClick={() => handleCancel(res.id)}
                >
                  ❌ Anuluj
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyReservations;
