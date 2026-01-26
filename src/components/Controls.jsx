import './Controls.css'
import PokemonImage from './PokemonImage'

const Controls = ({ 
  pokemons, 
  selectedPokemon, 
  setSelectedPokemon, 
  searchTerm, 
  setSearchTerm,
  generation,
  setGeneration,
  showGacha,
  setShowGacha
}) => {
  return (
    <div className="controls">
      <div className="search-section">
        <input
          type="text"
          placeholder="Rechercher un Pokémon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <button 
        className={`gacha-button ${showGacha ? 'active' : ''}`}
        onClick={() => setShowGacha(!showGacha)}
      >
        {showGacha ? 'Pokédex' : 'Gacha'}
      </button>

      <div className="generation-selector">
        <label>Génération:</label>
        <div className="gen-buttons">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(gen => (
            <button
              key={gen}
              className={`gen-button ${generation === gen ? 'active' : ''}`}
              onClick={() => setGeneration(gen)}
            >
              {gen}
            </button>
          ))}
        </div>
      </div>

      <div className="pokemon-list">
        {pokemons.map((pokemon) => (
          <div
            key={pokemon.id}
            className={`pokemon-card ${selectedPokemon?.id === pokemon.id ? 'selected' : ''}`}
            onClick={() => setSelectedPokemon(pokemon)}
          >
            <PokemonImage
              src={pokemon.image}
              fallbackSrc={pokemon.fallbackImage}
              alt={pokemon.name}
              className="pokemon-card-image"
            />
            <div className="pokemon-card-info">
              <span className="pokemon-card-number">#{String(pokemon.id).padStart(3, '0')}</span>
              <span className="pokemon-card-name">{pokemon.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Controls
