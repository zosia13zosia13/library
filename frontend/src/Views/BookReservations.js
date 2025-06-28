import React, { useEffect, useState } from 'react';
import '../style.css';

function BookReservations({ userId }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);   // 🆕 stan ładowania
  const [error, setError] = useState(null);       // 🆕 stan błędu

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function fetchReservations() {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/users/${userId}/reservations`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setReservations(data);
      } else {
        throw new Error('Odpowiedź nie jest tablicą');
      }
    } catch (err) {
      console.error('❌ Błąd pobierania rezerwacji:', err);
      setError('Nie udało się pobrać rezerwacji.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(reservationId) {
    if (!window.confirm('Czy na pewno chcesz anulować tę rezerwację?')) return;

    const res = await fetch(`http://localhost:3001/reservations/${reservationId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setReservations(prev =>
        prev.map(r => (r.id === reservationId ? { ...r, canceled: true } : r))
      );
    } else {
      alert('❌ Nie udało się anulować rezerwacji.');
    }
  }

  /* --------- RENDER --------- */

  return (
<div className="container">
<h1 className="page-title">Moje rezerwacje</h1>

      {loading && <p>Ładowanie…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && reservations.length === 0 && (
        <p>Nie masz jeszcze żadnych rezerwacji.</p>
      )}

      {!loading && reservations.length > 0 && (
        <ul className="loans-list">
          {reservations.map(res => (
            <li key={res.id} className="loan-item">
              <p><strong>Książka:</strong> {res.title}</p>          {/* 🆕 */}
              <p><strong>Filia:</strong> {res.branchName}</p>       {/* 🆕 */}
              <p><strong>Od:</strong> {new Date(res.reservedAt).toLocaleString()}</p>
              <p><strong>Do:</strong> {new Date(res.expiresAt).toLocaleString()}</p>
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

export default BookReservations;

