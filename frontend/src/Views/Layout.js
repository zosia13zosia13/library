import { Link, useNavigate } from 'react-router-dom';
import './Layout.css';

function Layout() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('userId');

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('selectedBranch'); // ⬅️ ważne
    navigate('/login');
  };  

  const toggleDarkMode = () => {
    const enabled = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', enabled);
  };

  return (
    <nav className="navbar">
      {isLoggedIn && (
        <>
          <Link to="/select-branch" className="nav-link">🏛 Wybierz filię</Link>
          <Link to="/info" className="nav-link">ℹ️ Informacje o filii</Link>
          <Link to="/my-loans" className="nav-link">📚 Wypożyczone książki</Link>
          <Link to="/my-reservations" className="nav-link">📋 Rezerwacje książek</Link>
          <Link to="/room-reservations" className="nav-link">🏠 Rezerwacje sali</Link>
          <Link to="/account" className="nav-link">👤 Moje konto</Link> {/* ← tu dodane */}
          <button onClick={handleLogout} className="nav-link logout">🚪 Wyloguj</button>
        </>
      )}
    </nav>
  );
}

export default Layout;
