// src/components/Layout.js
import { Link } from 'react-router-dom';
import './Layout.css'; // import stylu (stwórz ten plik zaraz obok)

function Layout() {
  return (
    <nav className="navbar">
      <Link to="/select-branch" className="nav-link">🏛 Wybierz filię</Link>
      <Link to="/my-loans" className="nav-link">📚 Moje wypożyczenia</Link>
      <Link to="/logout" className="nav-link logout">🚪 Wyloguj</Link>
    </nav>
  );
}

export default Layout;
