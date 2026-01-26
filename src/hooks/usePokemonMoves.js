import { useState, useEffect } from 'react'
import axios from 'axios'

/**
 * Hook pour récupérer les attaques d'un Pokémon selon la génération
 * @param {Object} pokemon - Le Pokémon sélectionné
 * @param {number} generation - La génération actuelle
 * @returns {Object} - { moves, loading, error }
 */
const usePokemonMoves = (pokemon, generation) => {
  const [moves, setMoves] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!pokemon) {
      setMoves([])
      return
    }

    const fetchMoves = async () => {
      setLoading(true)
      setError(null)
      try {
        // Récupérer toutes les attaques du Pokémon
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`
        )

        // Mapper les générations aux versions
        const genMap = {
          1: 'red-blue',
          2: 'gold-silver',
          3: 'ruby-sapphire',
          4: 'diamond-pearl',
          5: 'black-white',
          6: 'x-y',
          7: 'sun-moon',
          8: 'sword-shield',
          9: 'scarlet-violet'
        }

        const targetGeneration = genMap[generation] || genMap[1]

        // Filtrer les attaques par génération
        const filteredMoves = response.data.moves
          .filter(moveData => {
            // Vérifier si l'attaque est disponible dans cette génération
            return moveData.version_group_details.some(detail => {
              return detail.version_group.name === targetGeneration
            })
          })
          .sort((a, b) => b.version_group_details[0].level_learned_at - a.version_group_details[0].level_learned_at)
          .slice(0, 4) // Limiter à 4 attaques comme dans les vrais jeux

        // Récupérer les détails de chaque attaque
        const movesWithDetails = await Promise.all(
          filteredMoves.map(async (moveData) => {
            const moveDetails = await axios.get(moveData.move.url)
            
            // Récupérer le nom français
            const frenchName = moveDetails.data.names.find(n => n.language.name === 'fr')
            const frenchDesc = moveDetails.data.effect_entries.find(e => e.language.name === 'fr')
            
            return {
              id: moveDetails.data.id,
              name: frenchName ? frenchName.name : moveData.move.name,
              nameEn: moveData.move.name,
              type: moveDetails.data.type.name,
              power: moveDetails.data.power || 0,
              accuracy: moveDetails.data.accuracy || 100,
              priority: moveDetails.data.priority || 0,
              category: moveDetails.data.damage_class.name,
              description: frenchDesc?.effect || 'Pas de description',
              pp: moveDetails.data.pp || 15
            }
          })
        )

        setMoves(movesWithDetails)
      } catch (err) {
        console.error('Erreur lors du chargement des attaques:', err)
        setError('Impossible de charger les attaques')
      } finally {
        setLoading(false)
      }
    }

    fetchMoves()
  }, [pokemon, generation])

  return { moves, loading, error }
}

export default usePokemonMoves
