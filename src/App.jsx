import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PokemonDetailPage from './pages/PokemonDetailPage';
import GachaPage from './pages/GachaPage';
import BattlePage from './pages/BattlePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
          <Route path="/gacha" element={<GachaPage />} />
          <Route path="/battle" element={<BattlePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
