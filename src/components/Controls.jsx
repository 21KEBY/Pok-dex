import { useState } from 'react'
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
  onStartBattle,
  selectingOpponent,
  setSelectingOpponent
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
        {selectingOpponent ? (
          <>
            <div className="opponent-selection-header">
              <h3>Choisissez un adversaire</h3>
              <button 
                className="btn-cancel-opponent"
                onClick={() => setSelectingOpponent(false)}
              >
                ✕
              </button>
            </div>
            {pokemons.map((pokemon) => (
              <div
                key={pokemon.id}
                className="pokemon-card opponent-card"
                onClick={() => {
                  onStartBattle(selectedPokemon, pokemon)
                  setSelectingOpponent(false)
                }}
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
          </>
        ) : (
          <>
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
            {selectedPokemon && (
              <button 
                className="btn-start-battle"
                onClick={() => setSelectingOpponent(true)}
              >
                ⚔️ Défier en Combat
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Controls
