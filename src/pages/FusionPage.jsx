import { useEffect, useState } from 'react';
import axios from 'axios';
import './FusionPage.css';

function FusionPage() {
  const [basePokemons, setBasePokemons] = useState([]);
  const [filteredBase, setFilteredBase] = useState([]);
  const [baseLoading, setBaseLoading] = useState(true);
  const [generation, setGeneration] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBaseId, setSelectedBaseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const [fusionResult, setFusionResult] = useState(null);
  const [fusionLoading, setFusionLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    loadBasePokemons(generation);
  }, [generation]);

  useEffect(() => {
    const filtered = basePokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pokemon.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBase(filtered);
  }, [searchTerm, basePokemons]);

  const loadBasePokemons = async (gen) => {
    setBaseLoading(true);

    const ranges = {
      1: { offset: 0, limit: 151 },
      2: { offset: 151, limit: 100 },
      3: { offset: 251, limit: 135 },
      4: { offset: 386, limit: 107 },
      5: { offset: 493, limit: 156 },
      6: { offset: 649, limit: 72 },
      7: { offset: 721, limit: 88 },
      8: { offset: 809, limit: 96 },
      9: { offset: 905, limit: 120 }
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
            species.data.names.find((name) => name.language.name === 'fr')?.name ||
            details.data.name;

          const gifUrl = `https://projectpokemon.org/images/normal-sprite/${details.data.name}.gif`;

          return {
            id: details.data.id,
            name: frenchName,
            nameEn: details.data.name,
            image: gifUrl,
            fallbackImage: details.data.sprites.other['official-artwork'].front_default,
            types: details.data.types.map((type) => type.type.name)
          };
        })
      );

      setBasePokemons(pokemonList);
      setFilteredBase(pokemonList);
    } catch (err) {
      setError('Erreur lors du chargement des Pokémons.');
    } finally {
      setBaseLoading(false);
    }
  };

  const enrichSuggestions = async (list) => {
    const enriched = await Promise.all(
      list.map(async (pokemon) => {
        try {
          const details = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
          const nameEn = details.data.name;
          const gifUrl = `https://projectpokemon.org/images/normal-sprite/${nameEn}.gif`;
          return {
            ...pokemon,
            nameEn,
            image: gifUrl
          };
        } catch (e) {
          return pokemon;
        }
      })
    );

    return enriched;
  };

  const handleSuggest = async () => {
    if (!selectedBaseId) {
      setError('Sélectionnez un Pokémon de base.');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestions([]);
    setSelectedId(null);
    setFusionResult(null);
    setShowSummary(false);

    try {
      const response = await fetch('http://localhost:8081/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemon_id: Number(selectedBaseId) })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la suggestion');
      }

      const data = await response.json();
      const enriched = await enrichSuggestions(data || []);
      setSuggestions(enriched);
    } catch (err) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (pokemonId) => {
    setSelectedId(pokemonId);
    setShowSummary(true);
  };

  const handleFuse = async () => {
    if (!selectedBaseId || !selectedId) {
      setError('Sélectionnez un Pokémon de base et un Pokémon suggéré.');
      return;
    }

    setFusionLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8081/api/fuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokemon1_id: Number(selectedBaseId),
          pokemon2_id: Number(selectedId)
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la fusion');
      }

      const data = await response.json();
      setFusionResult(data);
    } catch (err) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setFusionLoading(false);
    }
  };

  return (
    <div className="fusion-page">
      <div className="fusion-header">
        <h1>Créer un nouveau Pokémon</h1>
        <p>Lance l’agentique de suggestion et sélectionne un Pokémon.</p>
      </div>

      <div className="fusion-form">
        <div className="fusion-controls">
          <div className="fusion-search">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Rechercher par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={baseLoading}
            />
          </div>
          <div className="generation-filters">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => (
              <button
                key={gen}
                className={`gen-button ${generation === gen ? 'active' : ''}`}
                onClick={() => setGeneration(gen)}
                type="button"
                disabled={baseLoading}
              >
                Gen {gen}
              </button>
            ))}
          </div>
        </div>
        <div className="fusion-action-row">
          <button
            className="fusion-button"
            onClick={handleSuggest}
            disabled={loading || !selectedBaseId}
          >
            {loading ? 'Génération…' : 'Lancer la suggestion'}
          </button>
        </div>
        {error && <div className="fusion-error">{error}</div>}
      </div>

      {suggestions.length === 0 && (
        <div className="fusion-base">
          <h2>Choisir un Pokémon de base</h2>
          {baseLoading ? (
            <div className="fusion-loading">Chargement...</div>
          ) : (
            <div className="pokemon-grid">
              {filteredBase.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className={`pokemon-card ${selectedBaseId === pokemon.id ? 'selected' : ''}`}
                  onClick={() => setSelectedBaseId(pokemon.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedBaseId(pokemon.id)}
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
                    <div className="pokemon-name">{pokemon.name}</div>
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
        </div>
      )}

      {suggestions.length > 0 && !showSummary && (
        <div className="fusion-results">
          <h2>Suggestions</h2>
          <div className="pokemon-grid">
            {suggestions.map((pokemon) => (
              <div
                key={pokemon.id}
                className={`pokemon-card ${selectedId === pokemon.id ? 'selected' : ''}`}
                onClick={() => handleSelectSuggestion(pokemon.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectSuggestion(pokemon.id)}
              >
                <div className="pokemon-card-inner">
                  <div className="pokemon-id">#{String(pokemon.id).padStart(3, '0')}</div>
                  <div className="pokemon-image-container">
                    {pokemon.image ? (
                      <img
                        src={pokemon.image}
                        alt={pokemon.name}
                        className="pokemon-image"
                      />
                    ) : (
                      <div className="pokemon-image-placeholder">?</div>
                    )}
                  </div>
                  <div className="pokemon-name">{pokemon.name}</div>
                  <div className="pokemon-types">
                    {(pokemon.types || []).map((type) => (
                      <span key={type} className={`type-badge type-${type}`}>
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSummary && (
        <div className="fusion-summary">
          <h2>Fusion sélectionnée</h2>
          <div className="fusion-summary-grid">
            <div className="fusion-summary-card">
              <h3>Base</h3>
              {filteredBase
                .filter((p) => p.id === selectedBaseId)
                .map((pokemon) => (
                  <div key={pokemon.id} className="pokemon-card-inner">
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
                    <div className="pokemon-name">{pokemon.name}</div>
                    <div className="pokemon-types">
                      {pokemon.types.map((type) => (
                        <span key={type} className={`type-badge type-${type}`}>
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            <div className="fusion-summary-card">
              <h3>Sélection</h3>
              {suggestions
                .filter((p) => p.id === selectedId)
                .map((pokemon) => (
                  <div key={pokemon.id} className="pokemon-card-inner">
                    <div className="pokemon-id">#{String(pokemon.id).padStart(3, '0')}</div>
                    <div className="pokemon-image-container">
                      {pokemon.image ? (
                        <img
                          src={pokemon.image}
                          alt={pokemon.name}
                          className="pokemon-image"
                        />
                      ) : (
                        <div className="pokemon-image-placeholder">?</div>
                      )}
                    </div>
                    <div className="pokemon-name">{pokemon.name}</div>
                    <div className="pokemon-types">
                      {(pokemon.types || []).map((type) => (
                        <span key={type} className={`type-badge type-${type}`}>
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <button
            className="fusion-button fusion-button-primary"
            onClick={handleFuse}
            disabled={fusionLoading}
          >
            {fusionLoading ? 'Fusion en cours…' : 'Fusionner'}
          </button>

          {fusionResult && (
            <div className="fusion-result">
              <h3>Fusion créée : {fusionResult.name}</h3>
              {fusionResult.pokedex_url && (
                <a href={fusionResult.pokedex_url} className="fusion-link">
                  Voir la page du Pokémon
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FusionPage;
