import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Pokédex</span>
        </Link>
        
        <div className="navbar-menu">
          <Link 
            to="/" 
            className={`navbar-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span>Accueil</span>
          </Link>
          
          <Link 
            to="/gacha" 
            className={`navbar-item ${location.pathname === '/gacha' ? 'active' : ''}`}
          >
            <span className="nav-icon">🎁</span>
            <span>Gacha</span>
          </Link>

          <Link 
            to="/fusion" 
            className={`navbar-item ${location.pathname === '/fusion' ? 'active' : ''}`}
          >
            <span className="nav-icon">✨</span>
            <span>Créer un Pokémon</span>
          </Link>

          <Link 
            to="/generated" 
            className={`navbar-item ${location.pathname === '/generated' ? 'active' : ''}`}
          >
            <span className="nav-icon">🧬</span>
            <span>Pokémons générés</span>
          </Link>
          
          <Link 
            to="/battle" 
            className={`navbar-item ${location.pathname === '/battle' ? 'active' : ''}`}
          >
            <span className="nav-icon">⚔️</span>
            <span>Combat</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
