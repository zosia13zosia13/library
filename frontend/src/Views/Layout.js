import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Layout.css';

function Layout() {
  const navigate = useNavigate();

  // 🔹 Wylogowanie użytkownika przez sesję
  const handleLogout = async () => {
    await fetch('http://localhost:3001/logout', {
      method: 'POST',
      credentials: 'include'
    });

    localStorage.removeItem('selectedBranch'); // ⬅️ ewentualnie
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {(
        <>
          <Link to="/select-branch" className="nav-link">🏛 Wybierz filię</Link>
          <Link to="/info" className="nav-link">ℹ️ Informacje o filii</Link>
          <Link to="/my-loans" className="nav-link">📚 Wypożyczone książki</Link>
          <Link to="/my-reservations" className="nav-link">📋 Rezerwacje książek</Link>
          <Link to="/room-reservations" className="nav-link">🏠 Rezerwacje sali</Link>
          <Link to="/account" className="nav-link">👤 Moje konto</Link>
          <button onClick={handleLogout} className="nav-link logout">🚪 Wyloguj</button>
        </>
      )}
    </nav>
  );
}

export default Layout;

