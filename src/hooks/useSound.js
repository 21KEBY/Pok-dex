import { useState, useRef, useEffect } from 'react'
import { Howl } from 'howler'

/**
 * Hook personnalisé pour gérer la lecture des sons Pokémon
 * Utilise Howler.js pour une gestion audio optimisée
 * 
 * @param {string} soundUrl - URL du fichier audio à jouer
 * @returns {Object} - { isPlaying, play, stop, error }
 */
const useSound = (soundUrl) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(null)
  const soundRef = useRef(null)

  useEffect(() => {
    // Nettoyer l'ancien son si l'URL change
    if (soundRef.current) {
      soundRef.current.unload()
      soundRef.current = null
    }

    // Créer un nouveau son si URL valide
    if (soundUrl) {
      try {
        soundRef.current = new Howl({
          src: [soundUrl],
          html5: true, // Utiliser HTML5 Audio pour streaming
          format: ['ogg', 'mp3'], // Formats supportés
          onplay: () => setIsPlaying(true),
          onend: () => setIsPlaying(false),
          onstop: () => setIsPlaying(false),
          onloaderror: (id, error) => {
            console.error('Erreur de chargement audio:', error)
            setError('Impossible de charger le son')
            setIsPlaying(false)
          },
          onplayerror: (id, error) => {
            console.error('Erreur de lecture audio:', error)
            setError('Impossible de lire le son')
            setIsPlaying(false)
          }
        })
        setError(null)
      } catch (err) {
        console.error('Erreur création Howl:', err)
        setError('Erreur audio')
      }
    }

    // Cleanup lors du démontage
    return () => {
      if (soundRef.current) {
        soundRef.current.unload()
        soundRef.current = null
      }
    }
  }, [soundUrl])

  const play = () => {
    if (soundRef.current && !isPlaying) {
      try {
        soundRef.current.play()
      } catch (err) {
        console.error('Erreur play:', err)
        setError('Erreur de lecture')
      }
    }
  }

  const stop = () => {
    if (soundRef.current && isPlaying) {
      soundRef.current.stop()
    }
  }

  return { isPlaying, play, stop, error }
}

export default useSound
