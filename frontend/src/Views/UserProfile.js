import React, { useEffect, useState } from 'react';
import { toggleDarkMode, applyDarkModeSetting } from '../utils/toggleDarkMode';
import '../Account.css';

function Account() {
  const [user] = useState({ name: 'Zosia', email: 'zosiazosia13@gmail.com' });
  const [branch, setBranch] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedBranch = localStorage.getItem('selectedBranch');
    if (savedBranch) setBranch(JSON.parse(savedBranch));

    applyDarkModeSetting(); // Ustawienie klasy na body przy ładowaniu
    const savedDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDark);
  }, []);

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', newValue);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="account-container">
      <h2>👤 Moje konto</h2>
      <div className="account-info">
        <p><strong>Imię:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Obecna filia:</strong> {branch?.name || 'Nie przypisano'}</p>
      </div>

      <div className="account-actions">
        <button onClick={handleToggleDarkMode} className="dark-mode-btn">
          {darkMode ? '☀️ Tryb dzienny' : '🌙 Tryb nocny'}
        </button>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Wyloguj
        </button>
      </div>
    </div>
  );
}

export default Account;
