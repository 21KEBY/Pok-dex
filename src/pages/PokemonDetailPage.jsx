import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Howl } from 'howler';
import './PokemonDetailPage.css';
import MovesList from '../components/MovesList';

function PokemonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadPokemonDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadPokemonDetails = async () => {
    setLoading(true);
    try {
      const isFusion = id.includes('-');

      if (isFusion) {
        const fusionResponse = await axios.get(`http://localhost:8081/api/pokedex/${id}`);
        const fusion = fusionResponse.data;

        const fusionImagePath = fusion.image?.local_path || fusion.image?.url || fusion.image;
        const fusionImage = fusionImagePath
          ? `http://localhost:8081${fusionImagePath}`
          : null;

        const statsArray = Object.entries(fusion.stats || {}).map(([key, value]) => ({
          stat: { name: key.replace('_', '-') },
          base_stat: value
        }));

        const movesArray = (fusion.moves || []).map((moveName) => ({
          move: { name: moveName }
        }));

        const fusionData = {
          id: fusion.id,
          name: fusion.name,
          nameEn: fusion.name,
          image: fusionImage,
          fallbackImage: fusionImage,
          types: fusion.types || [],
          stats: statsArray,
          moves: movesArray,
          cry: fusion.cry || null,
          height: null,
          weight: null,
          abilities: []
        };

        setPokemon(fusionData);
        setDescription("Fusion générée par l'agentique.");
        return;
      }

      const details = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const species = await axios.get(details.data.species.url);

      const frenchName =
        species.data.names.find((name) => name.language.name === "fr")?.name ||
        details.data.name;

      // Récupérer la description en français
      const frenchDescription = species.data.flavor_text_entries
        .find((entry) => entry.language.name === "fr")?.flavor_text
        .replace(/\f/g, ' ') || "Aucune description disponible.";

      const gifUrl = `https://projectpokemon.org/images/normal-sprite/${details.data.name}.gif`;

      const pokemonData = {
        id: details.data.id,
        name: frenchName,
        nameEn: details.data.name,
        image: gifUrl,
        fallbackImage: details.data.sprites.other["official-artwork"].front_default,
        types: details.data.types.map((type) => type.type.name),
        stats: details.data.stats,
        moves: details.data.moves.slice(0, 8),
        cry: details.data.cries?.latest || null,
        height: details.data.height / 10, // en mètres
        weight: details.data.weight / 10, // en kg
        abilities: details.data.abilities.map(a => a.ability.name),
      };

      setPokemon(pokemonData);
      setDescription(frenchDescription);
    } catch (error) {
      console.error("Erreur lors du chargement du Pokémon:", error);
    } finally {
      setLoading(false);
    }
  };

  const playCry = () => {
    if (pokemon?.cry) {
      const sound = new Howl({
        src: [pokemon.cry],
        volume: 0.5,
      });
      sound.play();
    }
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div className="loading-container">
          <div className="pokeball-loader"></div>
          <p>Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="detail-page">
        <div className="error-container">
          <h2>Pokémon introuvable</h2>
          <button onClick={() => navigate('/')} className="back-button">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <button onClick={() => navigate('/')} className="back-button-top">
        ← Retour
      </button>

      <div className="detail-container">
        <div className="detail-header">
          <div className="detail-image-section">
            <div className="pokemon-id-large">#{String(pokemon.id)}</div>
            <div className="detail-image-wrapper">
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="detail-image"
                onError={(e) => {
                  e.target.src = pokemon.fallbackImage;
                }}
              />
            </div>
            <button onClick={playCry} className="cry-button" disabled={!pokemon.cry}>
              🔊 Cri du Pokémon
            </button>
          </div>

          <div className="detail-info-section">
            <h1 className="detail-name">{pokemon.name}</h1>
            <div className="detail-types">
              {pokemon.types.map((type) => (
                <span key={type} className={`type-badge-large type-${type}`}>
                  {type}
                </span>
              ))}
            </div>

            <div className="description-box">
              <h3>Description</h3>
              <p>{description}</p>
            </div>

            <div className="physical-info">
              <div className="info-item">
                <span className="info-label">Taille</span>
                <span className="info-value">{pokemon.height ? `${pokemon.height} m` : 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Poids</span>
                <span className="info-value">{pokemon.weight ? `${pokemon.weight} kg` : 'N/A'}</span>
              </div>
            </div>

            <div className="abilities-section">
              <h3>Capacités</h3>
              <div className="abilities-list">
                {pokemon.abilities.length === 0 && (
                  <span className="ability-badge">N/A</span>
                )}
                {pokemon.abilities.map((ability, index) => (
                  <span key={index} className="ability-badge">
                    {ability}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-stats-section">
          <h2>Statistiques</h2>
          <div className="stats-grid">
            {pokemon.stats.map((stat) => (
              <div key={stat.stat.name} className="stat-item">
                <div className="stat-header">
                  <span className="stat-name">{stat.stat.name}</span>
                  <span className="stat-value">{stat.base_stat}</span>
                </div>
                <div className="stat-bar">
                  <div
                    className="stat-bar-fill"
                    style={{
                      width: `${(stat.base_stat / 255) * 100}%`,
                      backgroundColor: stat.base_stat > 100 ? '#48bb78' : stat.base_stat > 60 ? '#ed8936' : '#f56565'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-moves-section">
          <h2>Attaques</h2>
          <MovesList moves={pokemon.moves} />
        </div>

        <div className="actions-section">
          <button
            onClick={() => navigate('/battle', { state: { pokemon } })}
            className="action-button battle"
          >
            ⚔️ Lancer un Combat
          </button>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetailPage;
