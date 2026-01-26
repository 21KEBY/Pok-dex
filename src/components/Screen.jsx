import './Screen.css'
import PokemonImage from './PokemonImage'
import useSound from '../hooks/useSound'
import MovesList from './MovesList'
import { translateType, translateStat } from '../utils/translations'

const Screen = ({ selectedPokemon, loading, onBattle, generation, pokemons }) => {
  const { isPlaying, play, error } = useSound(selectedPokemon?.cry)
  
  if (loading) {
    return (
      <div className="screen">
        <div className="loading">
          <div className="pokeball-loader"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!selectedPokemon) {
    return (
      <div className="screen">
        <p className="no-pokemon">Sélectionnez un Pokémon</p>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="pokemon-header">
        <div className="pokemon-header-left">
          <h1 className="pokemon-name">{selectedPokemon.name}</h1>
          <span className="pokemon-number">#{String(selectedPokemon.id).padStart(3, '0')}</span>
        </div>
        <div className="pokemon-types">
          {selectedPokemon.types.map((type, index) => (
            <span key={index} className={`type-badge type-${type}`}>
              {translateType(type)}
            </span>
          ))}
        </div>
        {selectedPokemon.cry && (
          <button 
            className={`sound-button ${isPlaying ? 'playing' : ''}`}
            onClick={play}
            disabled={isPlaying || error}
            title={error || "Écouter le cri du Pokémon"}
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="currentColor"/>
                <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="currentColor"/>
              </svg>
            )}
          </button>
        )}
      </div>

      <div className="pokemon-image-container">
        <PokemonImage
          src={selectedPokemon.image}
          fallbackSrc={selectedPokemon.fallbackImage}
          alt={selectedPokemon.name}
          className="pokemon-image"
        />
      </div>

      <div className="pokemon-content">
        <div className="pokemon-stats-section">
          <h3>Statistiques</h3>
          <div className="pokemon-stats">
            {selectedPokemon.stats.map((stat, index) => (
              <div key={index} className="stat-row">
                <span className="stat-name">{translateStat(stat.stat.name)}</span>
                <div className="stat-bar-container">
                  <div 
                    className="stat-bar"
                    style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                  ></div>
                </div>
                <span className="stat-value">{stat.base_stat}</span>
              </div>
            ))}
          </div>

          <button className="btn-battle-quick" onClick={() => onBattle && onBattle(selectedPokemon)}>
            ⚔️ Lancer un Combat
          </button>
        </div>

        <div className="pokemon-moves-section">
          <MovesList 
            moves={selectedPokemon.moves} 
            pokemonName={selectedPokemon.name}
          />
        </div>
      </div>
    </div>
  )
}
export default Screen
