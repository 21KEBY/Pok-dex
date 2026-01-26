import { useState } from 'react'
import axios from 'axios'
import './Gacha.css'

const Gacha = ({ onPokemonPulled }) => {
  const [isOpening, setIsOpening] = useState(false)
  const [pulledPokemon, setPulledPokemon] = useState(null)
  const [showResult, setShowResult] = useState(false)

  // Système de rareté
  const rarityTiers = {
    common: { chance: 0.60, color: '#95a5a6', label: 'Commun' },      // 60%
    uncommon: { chance: 0.25, color: '#3498db', label: 'Rare' },      // 25%
    rare: { chance: 0.10, color: '#9b59b6', label: 'Épique' },        // 10%
    legendary: { chance: 0.05, color: '#f39c12', label: 'Légendaire' } // 5%
  }

  // Pokémons légendaires (par génération)
  const legendaryIds = [
    144, 145, 146, 150, 151, // Gen 1
    243, 244, 245, 249, 250, 251, // Gen 2
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386, // Gen 3
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, // Gen 4
    494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649 // Gen 5+
  ]

  const determineRarity = (pokemonId, stats) => {
    // Légendaires
    if (legendaryIds.includes(pokemonId)) {
      return 'legendary'
    }
    
    // Basé sur les stats totales
    const totalStats = stats.reduce((sum, stat) => sum + stat.base_stat, 0)
    
    if (totalStats >= 500) return 'rare'
    if (totalStats >= 400) return 'uncommon'
    return 'common'
  }

  const getRandomPokemon = () => {
    // Tirer un nombre aléatoire pour déterminer la rareté
    const roll = Math.random()
    let targetRarity = 'common'
    
    if (roll < 0.05) targetRarity = 'legendary'
    else if (roll < 0.15) targetRarity = 'rare'
    else if (roll < 0.40) targetRarity = 'uncommon'
    
    // Tirer un ID aléatoire entre 1 et 905 (Gen 1-9)
    let pokemonId
    
    if (targetRarity === 'legendary') {
      // Tirer directement un légendaire
      pokemonId = legendaryIds[Math.floor(Math.random() * legendaryIds.length)]
    } else {
      // Tirer un Pokémon normal
      pokemonId = Math.floor(Math.random() * 905) + 1
      // S'assurer qu'on ne tire pas un légendaire par accident
      while (legendaryIds.includes(pokemonId)) {
        pokemonId = Math.floor(Math.random() * 905) + 1
      }
    }
    
    return pokemonId
  }

  const openPack = async () => {
    setIsOpening(true)
    setPulledPokemon(null)
    setShowResult(false)

    try {
      const pokemonId = getRandomPokemon()
      
      // Récupérer les données du Pokémon
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
      const speciesResponse = await axios.get(response.data.species.url)
      
      const frenchName = speciesResponse.data.names.find(n => n.language.name === 'fr')
      
      const pokemon = {
        id: response.data.id,
        name: frenchName?.name || response.data.name,
        nameEn: response.data.name,
        types: response.data.types.map(t => t.type.name),
        stats: response.data.stats,
        image: `https://projectpokemon.org/images/normal-sprite/${response.data.name}.gif`,
        fallbackImage: response.data.sprites.other['official-artwork'].front_default,
        cry: response.data.cries?.latest || response.data.cries?.legacy
      }
      
      // Déterminer la rareté
      const rarity = determineRarity(pokemon.id, pokemon.stats)
      pokemon.rarity = rarity
      pokemon.rarityData = rarityTiers[rarity]

      // Simulation d'ouverture (2 secondes)
      setTimeout(() => {
        setPulledPokemon(pokemon)
        setShowResult(true)
        setIsOpening(false)
      }, 2000)

    } catch (error) {
      console.error('Erreur lors de l\'ouverture du pack:', error)
      setIsOpening(false)
    }
  }

  const addToCollection = () => {
    if (pulledPokemon && onPokemonPulled) {
      onPokemonPulled(pulledPokemon)
    }
    setShowResult(false)
    setPulledPokemon(null)
  }

  return (
    <div className="gacha-container">
      <div className="gacha-header">
        <h1>Système Gacha</h1>
        <p>Ouvre un pack pour découvrir un Pokémon !</p>
      </div>

      {!isOpening && !showResult && (
        <div className="gacha-packs">
          <div className="pack-card">
            <div className="pack-image">
              <div className="booster-pack-design">
                <div className="pack-top"></div>
                <div className="pack-main">
                  <div className="pokemon-logo">POKÉMON</div>
                  <div className="pack-edition">Édition Spéciale</div>
                  <div className="pack-count">1 POKÉMON</div>
                </div>
                <div className="pack-shine"></div>
              </div>
            </div>
            <h3>Pack Pokémon</h3>
            <div className="pack-rates">
              <div className="rate-item">
                <span className="rate-dot common"></span>
                <span>Commun: 60%</span>
              </div>
              <div className="rate-item">
                <span className="rate-dot uncommon"></span>
                <span>Rare: 25%</span>
              </div>
              <div className="rate-item">
                <span className="rate-dot rare"></span>
                <span>Épique: 10%</span>
              </div>
              <div className="rate-item">
                <span className="rate-dot legendary"></span>
                <span>Légendaire: 5%</span>
              </div>
            </div>
            <button className="open-pack-button" onClick={openPack}>
              Ouvrir le Pack
            </button>
          </div>
        </div>
      )}

      {isOpening && (
        <div className="opening-animation">
          <div className="pack-opening">
            <div className="pokeball-opening"></div>
            <p className="opening-text">Ouverture en cours...</p>
          </div>
        </div>
      )}

      {showResult && pulledPokemon && (
        <div className="result-modal">
          <div className={`result-card rarity-${pulledPokemon.rarity}`}>
            <div className="result-header">
              <span className="rarity-badge" style={{ backgroundColor: pulledPokemon.rarityData.color }}>
                {pulledPokemon.rarityData.label}
              </span>
              <h2>{pulledPokemon.name}</h2>
              <span className="pokemon-number">#{String(pulledPokemon.id).padStart(3, '0')}</span>
            </div>
            
            <div className="result-image">
              <img 
                src={pulledPokemon.image} 
                alt={pulledPokemon.name}
                onError={(e) => {
                  e.target.src = pulledPokemon.fallbackImage
                }}
              />
            </div>

            <div className="result-types">
              {pulledPokemon.types.map((type, index) => (
                <span key={index} className={`type-badge type-${type}`}>
                  {type}
                </span>
              ))}
            </div>

            <div className="result-actions">
              <button className="add-button" onClick={addToCollection}>
                Ajouter à la Collection
              </button>
              <button className="retry-button" onClick={() => {
                setShowResult(false)
                setPulledPokemon(null)
              }}>
                Nouveau Tirage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gacha
