import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fusedPokemons from '../data/fused_pokemons.json';
import './GeneratedPage.css';

function GeneratedPage() {
  const navigate = useNavigate();
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    try {
      const entries = Object.values(fusedPokemons || {});
      setPokemons(entries);
    } catch (err) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="generated-page">
      <div className="generated-header">
        <h1>Pokémons générés</h1>
        <p>Liste des fusions enregistrées dans le Pokédex.</p>
      </div>

      {loading && <div className="generated-loading">Chargement...</div>}
      {error && <div className="generated-error">{error}</div>}

      {!loading && !error && (
        <div className="pokemon-grid">
          {pokemons.map((pokemon) => {
            const imagePath = pokemon.image?.local_path || pokemon.image?.url || pokemon.image;
            const imageUrl = imagePath ? `http://localhost:8081${imagePath}` : null;

            return (
              <div
                key={pokemon.id}
                className="pokemon-card"
                onClick={() => navigate(`/pokemon/${pokemon.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/pokemon/${pokemon.id}`)}
              >
                <div className="pokemon-card-inner">
                  <div className="pokemon-id">#{pokemon.id}</div>
                  <div className="pokemon-image-container">
                    {imageUrl ? (
                      <img src={imageUrl} alt={pokemon.name} className="pokemon-image" />
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
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GeneratedPage;
