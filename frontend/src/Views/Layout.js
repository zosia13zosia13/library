import { Link } from 'react-router-dom';
import './Layout.css';

function Layout() {
  return (
    <nav className="navbar">
      {(
        <>
          <Link to="/select-branch" className="nav-link">🏛 Wybierz filię</Link>
          <Link to="/info" className="nav-link">ℹ️ Informacje o filii</Link>
          <Link to="/my-loans" className="nav-link">📚 Wypożyczone książki</Link>
          <Link to="/my-reservations" className="nav-link">📋 Rezerwacje książek</Link>
          <Link to="/room-reservations" className="nav-link">🏠 Rezerwacje sali</Link>
          <Link to="/events" className="nav-link">📅 Wydarzenia</Link>
          <Link to="/account" className="nav-link">👤 Moje konto</Link>
        </>
      )}
    </nav>
  );
}

export default Layout;

