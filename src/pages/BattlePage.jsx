import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import BattleShowdown from '../components/BattleShowdown';
import './BattlePage.css';

function BattlePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pokemons, setPokemons] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(location.state?.pokemon || null);
  const [opponent, setOpponent] = useState(null);
  const [battleMode, setBattleMode] = useState(false);
  const [selectingOpponent, setSelectingOpponent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllPokemons();
  }, []);

  useEffect(() => {
    // Si on arrive avec un Pokémon depuis la page détails
    if (selectedPokemon && !selectingOpponent && !battleMode) {
      setSelectingOpponent(true);
    }
  }, [selectedPokemon]);

  const loadAllPokemons = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151&offset=0');

      const pokemonList = await Promise.all(
        response.data.results.map(async (pokemon) => {
          const details = await axios.get(pokemon.url);
          const species = await axios.get(details.data.species.url);

          const frenchName =
            species.data.names.find((name) => name.language.name === "fr")?.name ||
            details.data.name;

          const gifUrl = `https://projectpokemon.org/images/normal-sprite/${details.data.name}.gif`;

          return {
            id: details.data.id,
            name: frenchName,
            nameEn: details.data.name,
            image: gifUrl,
            fallbackImage: details.data.sprites.other["official-artwork"].front_default,
            types: details.data.types.map((type) => type.type.name),
            stats: details.data.stats,
            moves: details.data.moves,
            cry: details.data.cries?.latest || null,
          };
        })
      );

      setPokemons(pokemonList);
    } catch (error) {
      console.error("Erreur lors du chargement des Pokémons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlayer = (pokemon) => {
    setSelectedPokemon(pokemon);
    setSelectingOpponent(true);
  };

  const handleSelectOpponent = (pokemon) => {
    setOpponent(pokemon);
    setBattleMode(true);
    setSelectingOpponent(false);
  };

  const handleCloseBattle = () => {
    setBattleMode(false);
    setOpponent(null);
    setSelectedPokemon(null);
    setSelectingOpponent(false);
  };

  const handleQuitToHome = () => {
    navigate('/');
  };

  const filteredPokemons = pokemons.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pokemon.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (battleMode && selectedPokemon && opponent) {
    return (
      <div className="battle-page">
        <button onClick={handleQuitToHome} className="back-to-home-arena-button">
          ← Retour à l'accueil
        </button>
        <BattleShowdown
          pokemon1={selectedPokemon}
          pokemon2={opponent}
          generation={1}
          onClose={handleCloseBattle}
        />
      </div>
    );
  }

  return (
    <div className="battle-page">
      <button onClick={handleQuitToHome} className="back-to-home-button">
        ← Retour à l'accueil
      </button>
      
      <div className="battle-header">
        <h1 className="battle-title">Arène de Combat</h1>
        <p className="battle-subtitle">
          {!selectedPokemon
            ? 'Choisis ton Pokémon pour commencer'
            : selectingOpponent
            ? 'Choisis ton adversaire'
            : 'Prêt au combat !'}
        </p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="pokeball-loader"></div>
          <p>Chargement des combattants...</p>
        </div>
      ) : (
        <>
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un Pokémon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="selection-container">
            {selectedPokemon && !selectingOpponent && (
              <div className="selected-pokemon-display">
                <h3>Ton Champion</h3>
                <div className="champion-card">
                  <img
                    src={selectedPokemon.image}
                    alt={selectedPokemon.name}
                    className="champion-image"
                    onError={(e) => {
                      e.target.src = selectedPokemon.fallbackImage;
                    }}
                  />
                  <p className="champion-name">{selectedPokemon.name}</p>
                </div>
              </div>
            )}

            <div className="pokemon-selection-grid">
              <h3 className="selection-title">
                {!selectedPokemon
                  ? '⚔️ Choisis ton Pokémon'
                  : selectingOpponent
                  ? '🎯 Choisis ton Adversaire'
                  : 'Sélectionne un autre Pokémon'}
              </h3>
              <div className="pokemon-grid-battle">
                {filteredPokemons.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    className={`pokemon-battle-card ${
                      selectedPokemon?.id === pokemon.id ? 'selected' : ''
                    }`}
                    onClick={() => {
                      if (!selectedPokemon) {
                        handleSelectPlayer(pokemon);
                      } else if (selectingOpponent && pokemon.id !== selectedPokemon.id) {
                        handleSelectOpponent(pokemon);
                      }
                    }}
                  >
                    <div className="pokemon-battle-id">#{String(pokemon.id).padStart(3, '0')}</div>
                    <img
                      src={pokemon.image}
                      alt={pokemon.name}
                      className="pokemon-battle-image"
                      onError={(e) => {
                        e.target.src = pokemon.fallbackImage;
                      }}
                    />
                    <p className="pokemon-battle-name">{pokemon.name}</p>
                    <div className="pokemon-battle-types">
                      {pokemon.types.map((type) => (
                        <span key={type} className={`type-badge-small type-${type}`}>
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default BattlePage;
