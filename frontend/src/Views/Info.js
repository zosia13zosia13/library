// src/Views/Info.js
import React from 'react';

function Info() {
  const selected = JSON.parse(localStorage.getItem('selectedBranch'));

  if (!selected) return <p>Nie wybrano jeszcze filii.</p>;

  return (
    <div className="container">
      <h2>📍 Wybrana filia: {selected.name}</h2>
      <p><strong>Miasto:</strong> {selected.location}</p>
      <p><strong>Godziny działania:</strong> {selected.openHour}:00 – {selected.closeHour}:00</p>
    </div>
  );
}

export default Info;
