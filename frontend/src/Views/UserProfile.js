import React, { useContext, useEffect, useState } from 'react';
import { toggleDarkMode, applyDarkModeSetting } from '../utils/toggleDarkMode';
import '../Account.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

function Account({onLogout}) {
  const [user, setUser] = useState(null);
  const [branch, setBranch] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  const userId = useContext(UserContext)

  useEffect(() => {
    const savedBranch = localStorage.getItem('selectedBranch');
    if (savedBranch) setBranch(JSON.parse(savedBranch));

    const savedDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDark);
    applyDarkModeSetting();

    if (userId) {
      fetch(`http://localhost:3001/users/${userId}`)
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(err => console.error('❌ Błąd pobierania użytkownika:', err));
    }
  }, [userId]);

  const logout = () => {
    console.log('wylogowywanie')
    return fetch(`http://localhost:3001/logout`, {
      method: 'POST',
      credentials: 'include',
      
    });
  };

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', newValue);
  };

  const handleLogout = async () => {
    await logout();
    localStorage.clear();
    onLogout();
    navigate('/login')
  };

  return (
    <div className="account-container">
      <h2>👤 Moje konto</h2>
      <div className="account-info">
        <p><strong>Imię:</strong> {user?.name || '—'}</p>
        <p><strong>Email:</strong> {user?.email || '—'}</p>
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
