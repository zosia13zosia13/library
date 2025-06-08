import React, { useEffect, useState } from 'react';
import '../Info.css';

function Info() {
  const [branch, setBranch] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('selectedBranch');
    if (saved) setBranch(JSON.parse(saved));
  }, []);

  const renderSchedule = () => (
    <ul className="schedule-list">
      <li><span>Poniedziałek – Piątek:</span><span>{branch.openHour}:00 – {branch.closeHour}:00</span></li>
      <li><span>Sobota:</span><span>8:00 – 12:00</span></li>
      <li><span>Niedziela:</span><span className="closed">Zamknięte 🛑</span></li>
    </ul>
  );

  return (
    <div className="branch-info-container">
      <h2 className="branch-info-title">📍 Informacje o filii</h2>
      {branch ? (
        <div className="branch-details">
          <p><strong>Nazwa:</strong> {branch.name}</p>
          <p><strong>Adres:</strong> {branch.address}</p>
          <p><strong>E-mail:</strong> {branch.email}</p>
          <p><strong>Telefon:</strong> {branch.phone}</p>

          <div className="opening-hours">
            <h3>🕒 Godziny otwarcia</h3>
            {renderSchedule()}
          </div>
        </div>
      ) : (
        <p className="no-branch">Nie wybrano filii.</p>
      )}
    </div>
  );
}

export default Info;
