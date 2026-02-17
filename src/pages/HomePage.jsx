import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [generation, setGeneration] = useState(1);

  useEffect(() => {
    loadPokemons(generation);
  }, [generation]);

  useEffect(() => {
    const filtered = pokemons.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pokemon.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPokemons(filtered);
  }, [searchTerm, pokemons]);

  const loadPokemons = async (gen) => {
    setLoading(true);
    
    const ranges = {
      1: { offset: 0, limit: 151 },
      2: { offset: 151, limit: 100 },
      3: { offset: 251, limit: 135 },
      4: { offset: 386, limit: 107 },
      5: { offset: 493, limit: 156 },
      6: { offset: 649, limit: 72 },
      7: { offset: 721, limit: 88 },
      8: { offset: 809, limit: 96 },
      9: { offset: 905, limit: 120 },
    };

    const { offset, limit } = ranges[gen];

    try {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
      );

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
          };
        })
      );

      setPokemons(pokemonList);
      setFilteredPokemons(pokemonList);
    } catch (error) {
      console.error("Erreur lors du chargement des Pokémons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonClick = (pokemonId) => {
    navigate(`/pokemon/${pokemonId}`);
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">Explorez le monde des Pokémons</h1>
        <p className="home-subtitle">Découvrez, collectionnez et combattez !</p>
      </div>

      <div className="home-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un Pokémon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="generation-filters">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => (
            <button
              key={gen}
              onClick={() => setGeneration(gen)}
              className={`gen-button ${generation === gen ? 'active' : ''}`}
            >
              Gen {gen}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="pokeball-loader"></div>
          <p>Chargement des Pokémons...</p>
        </div>
      ) : (
        <div className="pokemon-grid">
          {filteredPokemons.map((pokemon) => (
            <div
              key={pokemon.id}
              className="pokemon-card"
              onClick={() => handlePokemonClick(pokemon.id)}
            >
              <div className="pokemon-card-inner">
                <div className="pokemon-id">#{String(pokemon.id).padStart(3, '0')}</div>
                <div className="pokemon-image-container">
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    className="pokemon-image"
                    onError={(e) => {
                      e.target.src = pokemon.fallbackImage;
                    }}
                  />
                </div>
                <h3 className="pokemon-name">{pokemon.name}</h3>
                <div className="pokemon-types">
                  {pokemon.types.map((type) => (
                    <span key={type} className={`type-badge type-${type}`}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredPokemons.length === 0 && (
        <div className="no-results">
          <span className="no-results-icon">😢</span>
          <p>Aucun Pokémon trouvé</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
