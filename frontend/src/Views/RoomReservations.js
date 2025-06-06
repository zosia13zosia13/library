import React, { useContext, useEffect, useState } from 'react';
import '../style.css';
import { UserContext } from '../App';

function RoomReservations() {
  const userId = useContext(UserContext);
  const selectedBranch = JSON.parse(localStorage.getItem('selectedBranch'));

  const [reservations, setReservations] = useState([]);
  const [hour, setHour] = useState('');
  const [purpose, setPurpose] = useState('Gry planszowe');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // yyyy-mm-dd
  });

  // ✅ Pobieranie rezerwacji
  useEffect(() => {
    if (!userId) return;

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

  // ✅ Rezerwacja sali
  const handleReserve = async () => {
    if (!hour || !selectedBranch || !selectedDate) {
      return alert('Wybierz datę, godzinę i filię');
    }

    const [year, month, day] = selectedDate.split('-');
    const start = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour));
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const res = await fetch('http://localhost:3001/room-reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: parseInt(userId),
        branchId: selectedBranch.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        purpose
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      window.location.reload();
    } else {
      alert('❌ Błąd: ' + (data.message || data.error));
    }
  };

  const cancelReservation = async (id) => {
    if (!window.confirm('Na pewno anulować rezerwację?')) return;

    const res = await fetch(`http://localhost:3001/room-reservations/${id}/cancel`, {
      method: 'PATCH'
    });

    if (res.ok) {
      alert('Rezerwacja anulowana!');
      window.location.reload();
    } else {
      alert('❌ Błąd anulowania');
    }
  };

  return (
    <div className="container">
      <h2>🏠 Moje rezerwacje sali</h2>

      {selectedBranch && (
        <>
          <p><strong>Wybrana filia:</strong> {selectedBranch.name}</p>
          <p>
            <strong>Godziny otwarcia:</strong> {selectedBranch.openHour}:00 – {selectedBranch.closeHour}:00
          </p>
          <p>
            <strong>Wybrana data:</strong> {new Date(selectedDate).toLocaleDateString()}
          </p>

          <label>📅 Wybierz datę:</label><br />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          /><br /><br />

          <label>⏰ Wybierz godzinę (pełne godziny):</label><br />
          <select value={hour} onChange={e => setHour(e.target.value)}>
            <option value="">-- Wybierz --</option>
            {Array.from({ length: selectedBranch.closeHour - selectedBranch.openHour - 1 }, (_, i) => {
              const h = selectedBranch.openHour + i;
              return <option key={h} value={h}>{`${h}:00`}</option>;
            })}
          </select>

          <br /><br />
          <label>🎯 Cel rezerwacji:</label><br />
          <select value={purpose} onChange={e => setPurpose(e.target.value)}>
            <option value="Gry planszowe">Gry planszowe</option>
            <option value="Zajęcia edukacyjne">Zajęcia edukacyjne</option>
            <option value="Inne">Inne</option>
          </select>

          <br /><br />
          <button onClick={handleReserve}>📅 Zarezerwuj</button>
        </>
      )}

      <ul className="loans-list">
        {reservations
          .filter(r => !r.canceled)
          .map(r => (
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

