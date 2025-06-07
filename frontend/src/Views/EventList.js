import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../App';

function EventList() {
  const userId = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const selectedBranch = JSON.parse(localStorage.getItem('selectedBranch'));

  useEffect(() => {
    if (selectedBranch) {
      fetch(`http://localhost:3001/branches/${selectedBranch.id}/events`)
        .then(res => res.json())
        .then(data => setEvents(data));
    }
  }, [selectedBranch]);

  const register = async (eventId) => {
    const res = await fetch(`http://localhost:3001/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="container">
      <h2>📅 Wydarzenia w {selectedBranch?.name}</h2>
      {events.length === 0 ? <p>Brak zaplanowanych wydarzeń.</p> : (
        <ul className="loans-list">
          {events.map(ev => (
            <li key={ev.id} className="loan-item">
              <strong>{ev.title}</strong><br />
              {ev.description}<br />
              📆 {new Date(ev.date).toLocaleString()}<br />
              <button onClick={() => register(ev.id)}>✅ Zapisz się</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EventList;
