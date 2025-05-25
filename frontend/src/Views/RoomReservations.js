// src/Views/RoomReservations.js
import React, { useEffect, useState } from 'react';
import '../style.css';

function RoomReservations() {
  const userId = localStorage.getItem('userId');
  const selectedBranch = JSON.parse(localStorage.getItem('selectedBranch')); // ⬅️ wczytujemy filię
  const [reservations, setReservations] = useState([]);
  const [hour, setHour] = useState('');
  const [purpose, setPurpose] = useState('Gry planszowe');

  // 🔹 Pobieranie aktualnych rezerwacji użytkownika
  useEffect(() => {
    fetch(`http://localhost:3001/users/${userId}/room-reservations`)
      .then(res => res.json())
      .then(data => setReservations(data));
  }, [userId]);

  // 🔹 Obsługa rezerwacji sali na 2h
  const handleReserve = async () => {
    if (!hour || !selectedBranch) return alert('Wybierz godzinę i filię');

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hour));
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // +2h

    const res = await fetch('http://localhost:3001/room-reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: parseInt(userId),
        branchId: selectedBranch.id, // ⬅️ podajemy wybraną filię
        startTime: start,
        endTime: end,
        purpose
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      window.location.reload();
    } else {
      alert('Błąd rezerwacji: ' + (data.message || data.error));
    }
  };

  // 🔹 Anulowanie istniejącej rezerwacji
  const cancelReservation = async (id) => {
    const confirm = window.confirm('Na pewno anulować rezerwację?');
    if (!confirm) return;

    const res = await fetch(`http://localhost:3001/room-reservations/${id}/cancel`, {
      method: 'PATCH'
    });

    if (res.ok) {
      alert('Rezerwacja anulowana!');
      window.location.reload();
    } else {
      alert('Błąd anulowania');
    }
  };

  return (
    <div className="container">
      <h2>🏠 Moje rezerwacje sali</h2>

      {selectedBranch && (
        <>
          <p><strong>Wybrana filia:</strong> {selectedBranch.name}</p>
          <p><strong>Godziny otwarcia:</strong> {selectedBranch.openHour}:00 – {selectedBranch.closeHour}:00</p>

          <label>Wybierz godzinę (pełne godziny):</label>
          <select value={hour} onChange={e => setHour(e.target.value)}>
            {Array.from({ length: selectedBranch.closeHour - selectedBranch.openHour }, (_, i) => {
              const h = selectedBranch.openHour + i;
              return <option key={h} value={h}>{`${h}:00`}</option>;
            })}
          </select>

          <br />
          <label>Cel rezerwacji:</label>
          <select value={purpose} onChange={e => setPurpose(e.target.value)}>
            <option value="Gry planszowe">Gry planszowe</option>
            <option value="Spotkanie rodzinne">Spotkanie rodzinne</option>
            <option value="Zajęcia edukacyjne">Zajęcia edukacyjne</option>
            <option value="Inne">Inne</option>
          </select>

          <br />
          <button onClick={handleReserve}>📅 Zarezerwuj</button>
        </>
      )}

<ul className="loans-list">
  {reservations
    .filter(r => !r.canceled) // 🔹 pokazuj tylko aktywne
    .map((r) => (
      <li key={r.id} className="loan-item">
        <p><strong>Cel:</strong> {r.purpose}</p>
        <p><strong>Od:</strong> {new Date(r.startTime).toLocaleString()}</p>
        <p><strong>Do:</strong> {new Date(r.endTime).toLocaleString()}</p>
        <p><strong>Status:</strong> ✅ Aktywna</p>
        <button className="cancel-button" onClick={() => cancelReservation(r.id)}>
          ❌ Anuluj
        </button>
      </li>
    ))}
</ul>

    </div>
  );
}

export default RoomReservations;
