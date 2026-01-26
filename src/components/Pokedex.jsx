import { useState, useEffect } from 'react'
import axios from 'axios'
import Screen from './Screen'
import Controls from './Controls'
import Gacha from './Gacha'
import BattleShowdown from './BattleShowdown'
import './Pokedex.css'

const Pokedex = () => {
  const [pokemons, setPokemons] = useState([])
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [generation, setGeneration] = useState(1)
  const [showGacha, setShowGacha] = useState(false)
  const [battleMode, setBattleMode] = useState(false)
  const [opponent, setOpponent] = useState(null)
  const [selectingOpponent, setSelectingOpponent] = useState(false)

  // Charger les Pokémons au démarrage
  useEffect(() => {
    loadPokemons(generation)
  }, [generation])

  const loadPokemons = async (gen) => {
    setLoading(true)
    try {
      // Définir les limites par génération
      const genRanges = {
        1: { offset: 0, limit: 151 },
        2: { offset: 151, limit: 100 },
        3: { offset: 251, limit: 135 },
        4: { offset: 386, limit: 107 },
        5: { offset: 493, limit: 156 },
        6: { offset: 649, limit: 72 },
        7: { offset: 721, limit: 88 },
        8: { offset: 809, limit: 96 },
        9: { offset: 905, limit: 120 }
      }

      const range = genRanges[gen] || genRanges[1]
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?limit=${range.limit}&offset=${range.offset}`
      )

      const pokemonList = await Promise.all(
        response.data.results.map(async (pokemon) => {
          const details = await axios.get(pokemon.url)
          const pokemonId = details.data.id
          
          // Récupérer les informations d'espèce pour avoir le nom français
          const speciesUrl = details.data.species.url
          const speciesData = await axios.get(speciesUrl)
          
          // Trouver le nom français dans les noms de l'espèce
          const frenchName = speciesData.data.names.find(n => n.language.name === 'fr')
          const nameFr = frenchName ? frenchName.name : pokemon.name
          
          // Construire l'URL du GIF 3D depuis Project Pokemon (utilise le nom anglais)
          const gifUrl = `https://projectpokemon.org/images/normal-sprite/${pokemon.name}.gif`
          
          // Récupérer le cri du Pokémon depuis PokeAPI
          const cry = details.data.cries?.latest || details.data.cries?.legacy || null
          
          // Récupérer les attaques (limiter à 8 pour ne pas surcharger)
          const moves = details.data.moves.slice(0, 8).map(m => ({
            name: m.move.name,
            url: m.move.url
          }))
          
          return {
            id: pokemonId,
            name: nameFr, // Nom en français
            nameEn: pokemon.name, // Nom anglais pour référence
            image: gifUrl,
            fallbackImage: details.data.sprites.other['official-artwork'].front_default,
            types: details.data.types.map(t => t.type.name),
            stats: details.data.stats,
            cry: cry, // URL du son du Pokémon
            moves: moves // Liste des attaques
          }
        })
      )

      setPokemons(pokemonList)
      setSelectedPokemon(pokemonList[0]) // Sélectionner le premier par défaut
    } catch (error) {
      console.error('Erreur lors du chargement des Pokémons:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les Pokémons par recherche (en français et par numéro)
  const filteredPokemons = pokemons.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pokemon.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pokemon.id.toString().includes(searchTerm)
  )

  const handlePokemonPulled = (pulledPokemon) => {
    setSelectedPokemon(pulledPokemon)
    setShowGacha(false)
  }

  const handleStartBattle = (player, adversary) => {
    setSelectedPokemon(player)
    setOpponent(adversary)
    setBattleMode(true)
  }

  return (
    <div className="app-container">
      {battleMode && selectedPokemon && opponent ? (
        <BattleShowdown 
          pokemon1={selectedPokemon}
          pokemon2={opponent}
          generation={generation}
          onClose={() => {
            setBattleMode(false)
            setOpponent(null)
          }}
        />
      ) : (
        <>
          <Controls 
            pokemons={filteredPokemons}
            selectedPokemon={selectedPokemon}
            setSelectedPokemon={setSelectedPokemon}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            generation={generation}
            setGeneration={setGeneration}
            showGacha={showGacha}
            setShowGacha={setShowGacha}
            onStartBattle={handleStartBattle}
            selectingOpponent={selectingOpponent}
            setSelectingOpponent={setSelectingOpponent}
          />
          
          {showGacha ? (
            <Gacha onPokemonPulled={handlePokemonPulled} />
          ) : (
            <Screen 
              selectedPokemon={selectedPokemon}
              loading={loading}
            />
          )}
        </>
      )}
    </div>
  )
}

export default Pokedex
