import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style.css';

function UserProfile() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const enabled = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', enabled);
  };

  if (!user) return <p>Ładowanie profilu...</p>;

  return (
    <div className="container">
      <h2>👤 Moje konto</h2>
      <p><strong>Imię:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Filia:</strong> {user.branchName || "Nie przypisano"}</p>

      <button onClick={toggleDarkMode}>🌙 Przełącz tryb nocny</button>
      <button onClick={handleLogout} style={{ marginLeft: "10px" }}>🚪 Wyloguj</button>
    </div>
  );
}

export default UserProfile;
