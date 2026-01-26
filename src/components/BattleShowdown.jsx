import { useState, useEffect, useRef } from 'react'
import usePokemonMoves from '../hooks/usePokemonMoves'
import useSound from '../hooks/useSound'
import './BattleShowdown.css'

const BattleShowdown = ({ pokemon1, pokemon2, generation, onClose }) => {
  const [activePokemon, setActivePokemon] = useState('player')
  const [battleLog, setBattleLog] = useState([])
  const [hp1, setHp1] = useState(pokemon1.stats[0].base_stat)
  const [hp2, setHp2] = useState(pokemon2.stats[0].base_stat)
  const [battleInProgress, setBattleInProgress] = useState(true)
  const [waitingForAction, setWaitingForAction] = useState(false)
  const [selectedMove, setSelectedMove] = useState(null)
  const [opponent2Hp, setOpponent2Hp] = useState(pokemon2.stats[0].base_stat)
  const [attackingPokemon, setAttackingPokemon] = useState(null)
  const [takingDamagePokemon, setTakingDamagePokemon] = useState(null)

  const playerSpriteRef = useRef(null)
  const opponentSpriteRef = useRef(null)

  const { moves: moves1 } = usePokemonMoves(pokemon1, generation)
  const { moves: moves2 } = usePokemonMoves(pokemon2, generation)

  // Sons pour les combats
  const { play: playAttackSound } = useSound('https://raw.githubusercontent.com/PokeAPI/sprites/master/pokémon-cries/en/ogg/52.ogg')
  const { play: playDamageSound } = useSound('https://raw.githubusercontent.com/PokeAPI/cries/main/ogg/52.ogg')

  const maxHp1 = pokemon1.stats[0].base_stat
  const maxHp2 = pokemon2.stats[0].base_stat

  const addBattleLog = (text, type = 'normal') => {
    setBattleLog(prev => [...prev, { text, type, id: Date.now() }])
  }

  const playAttackAnimation = async (isPlayer) => {
    if (isPlayer) {
      setAttackingPokemon('player')
      playAttackSound()
      await new Promise(resolve => setTimeout(resolve, 400))
      setAttackingPokemon(null)
    } else {
      setAttackingPokemon('opponent')
      playAttackSound()
      await new Promise(resolve => setTimeout(resolve, 400))
      setAttackingPokemon(null)
    }
  }

  const playDamageAnimation = async (isPlayer) => {
    if (isPlayer) {
      setTakingDamagePokemon('player')
      playDamageSound()
      await new Promise(resolve => setTimeout(resolve, 400))
      setTakingDamagePokemon(null)
    } else {
      setTakingDamagePokemon('opponent')
      playDamageSound()
      await new Promise(resolve => setTimeout(resolve, 400))
      setTakingDamagePokemon(null)
    }
  }

  const calculateDamage = (attacker, move, defender) => {
    // Formule simplifiée du calcul de dégâts Pokémon
    const atkStat = attacker.stats[1].base_stat
    const defStat = defender.stats[2].base_stat
    const level = 50
    
    let baseDamage = ((2 * level / 5 + 2) * move.power * atkStat) / defStat / 50 + 2
    baseDamage = Math.floor(baseDamage)
    
    // Variance 85-100%
    const variance = Math.random() * 0.15 + 0.85
    const finalDamage = Math.floor(baseDamage * variance)

    return Math.max(1, finalDamage)
  }

  const executeAttack = async (move, isPlayer) => {
    if (!battleInProgress) return

    setWaitingForAction(true)

    const attacker = isPlayer ? pokemon1 : pokemon2
    const defender = isPlayer ? pokemon2 : pokemon1
    const attackerHp = isPlayer ? hp1 : hp2
    const defenderHp = isPlayer ? hp2 : hp1
    const maxDefenderHp = isPlayer ? maxHp2 : maxHp1

    // Animation d'attaque
    await playAttackAnimation(isPlayer)

    // Vérifier si l'attaque touche
    const hitChance = Math.random() * 100
    const hits = hitChance <= move.accuracy

    // Afficher l'attaque utilisée
    addBattleLog(
      `${attacker.name} utilise ${move.name}!`,
      'attack'
    )

    // Attendre un peu avant de continuer
    await new Promise(resolve => setTimeout(resolve, 800))

    if (!hits) {
      addBattleLog(`L'attaque de ${attacker.name} a échoué!`, 'miss')
      await new Promise(resolve => setTimeout(resolve, 600))
      executeAIAttack()
      return
    }

    // Calculer les dégâts
    const damage = calculateDamage(attacker, move, defender)
    const newDefenderHp = Math.max(0, defenderHp - damage)

    // Animation de dégâts
    await playDamageAnimation(!isPlayer)

    // Mettre à jour l'HP du défenseur
    if (isPlayer) {
      setHp2(newDefenderHp)
    } else {
      setHp1(newDefenderHp)
    }

    addBattleLog(`${defender.name} reçoit ${damage} dégâts!`, 'damage')

    await new Promise(resolve => setTimeout(resolve, 600))

    // Vérifier si c'est K.O
    if (newDefenderHp === 0) {
      addBattleLog(
        `${defender.name} est K.O.!`,
        'knockout'
      )
      await new Promise(resolve => setTimeout(resolve, 600))
      addBattleLog(
        `${attacker.name} remporte la victoire!`,
        'victory'
      )
      setBattleInProgress(false)
      setWaitingForAction(false)
      return
    }

    // IA joue
    if (isPlayer) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      executeAIAttack()
    } else {
      setWaitingForAction(false)
    }
  }

  const executeAIAttack = async () => {
    if (!battleInProgress) return

    // IA choisit une attaque aléatoire
    const randomMove = moves2[Math.floor(Math.random() * moves2.length)]
    if (!randomMove) return

    const damage = calculateDamage(pokemon2, randomMove, pokemon1)
    const newHp1 = Math.max(0, hp1 - damage)

    addBattleLog(
      `${pokemon2.name} utilise ${randomMove.name}!`,
      'attack'
    )

    await new Promise(resolve => setTimeout(resolve, 800))

    setHp1(newHp1)
    addBattleLog(`${pokemon1.name} reçoit ${damage} dégâts!`, 'damage')

    await new Promise(resolve => setTimeout(resolve, 600))

    if (newHp1 === 0) {
      addBattleLog(`${pokemon1.name} est K.O.!`, 'knockout')
      await new Promise(resolve => setTimeout(resolve, 600))
      addBattleLog(`${pokemon2.name} remporte la victoire!`, 'victory')
      setBattleInProgress(false)
      setWaitingForAction(false)
      return
    }

    setWaitingForAction(false)
  }

  const calculateHpPercentage = (current, max) => {
    return Math.max(0, (current / max) * 100)
  }

  const getHpBarColor = (percentage) => {
    if (percentage > 50) return '#66BB6A'
    if (percentage > 25) return '#FFB74D'
    return '#EF5350'
  }

  const getTypeColor = (type) => {
    const typeColors = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    }
    return typeColors[type] || '#A8A878'
  }

  return (
    <div className="battle-showdown">
      {/* Header */}
      <div className="battle-header-showdown">
        <div className="header-left">
          <h1>Combat Pokémon</h1>
        </div>
        <div className="header-right">
          {!battleInProgress && (
            <button className="btn-close-battle" onClick={onClose}>
              Fermer ✕
            </button>
          )}
        </div>
      </div>

      {/* Arena */}
      <div className="battle-arena-showdown">
        {/* Pokémon Adversaire (haut) */}
        <div className="pokemon-opponent">
          <div className="pokemon-header">
            <div className="pokemon-name-box">
              <h3 className="pokemon-name">{pokemon2.name}</h3>
              <span className="pokemon-level">Niv. 50</span>
            </div>
            <div className="pokemon-hp-info">
              <div className="hp-bar-container">
                <div className="hp-bar-label">
                  <span>PV</span>
                  <span className="hp-numbers">{Math.max(0, hp2)}/{maxHp2}</span>
                </div>
                <div className="hp-bar-bg">
                  <div
                    className="hp-bar"
                    style={{
                      width: `${calculateHpPercentage(hp2, maxHp2)}%`,
                      backgroundColor: getHpBarColor(calculateHpPercentage(hp2, maxHp2))
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <img
            src={pokemon2.image || pokemon2.fallbackImage}
            alt={pokemon2.name}
            ref={opponentSpriteRef}
            className={`pokemon-sprite opponent ${
              attackingPokemon === 'opponent' ? 'attacking' : ''
            } ${takingDamagePokemon === 'opponent' ? 'takingDamage' : ''}`}
            onError={(e) => {
              e.target.src = pokemon2.fallbackImage
            }}
          />
        </div>

        {/* Pokémon Joueur (bas) */}
        <div className="pokemon-player">
          <img
            src={pokemon1.image || pokemon1.fallbackImage}
            alt={pokemon1.name}
            ref={playerSpriteRef}
            className={`pokemon-sprite player ${
              attackingPokemon === 'player' ? 'attacking' : ''
            } ${takingDamagePokemon === 'player' ? 'takingDamage' : ''}`}
            onError={(e) => {
              e.target.src = pokemon1.fallbackImage
            }}
          />
          <div className="pokemon-footer">
            <div className="pokemon-name-box">
              <h3 className="pokemon-name">{pokemon1.name}</h3>
              <span className="pokemon-level">Niv. 50</span>
            </div>
            <div className="pokemon-hp-info">
              <div className="hp-bar-container">
                <div className="hp-bar-label">
                  <span>PV</span>
                  <span className="hp-numbers">{Math.max(0, hp1)}/{maxHp1}</span>
                </div>
                <div className="hp-bar-bg">
                  <div
                    className="hp-bar"
                    style={{
                      width: `${calculateHpPercentage(hp1, maxHp1)}%`,
                      backgroundColor: getHpBarColor(calculateHpPercentage(hp1, maxHp1))
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogue/Combat Log */}
      <div className="battle-dialogue">
        {battleLog.length === 0 && battleInProgress ? (
          <div className="dialogue-message">Choisissez une attaque!</div>
        ) : (
          <div className="log-container">
            {battleLog.map(log => (
              <div key={log.id} className={`log-line log-${log.type}`}>
                {log.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contrôles */}
      {battleInProgress ? (
        <div className="battle-controls-showdown">
          <div className="controls-container">
            {moves1.length > 0 ? (
              <div className="moves-grid">
                {moves1.map((move, index) => (
                  <button
                    key={index}
                    className={`move-btn type-${move.type}`}
                    onClick={() => executeAttack(move, true)}
                    disabled={waitingForAction}
                    style={{
                      borderLeftColor: getTypeColor(move.type)
                    }}
                  >
                    <div className="move-name">{move.name}</div>
                    <div className="move-info">
                      <span className="move-type">{move.type}</span>
                      <span className="move-power">Puis: {move.power}</span>
                    </div>
                    <div className="move-pp">PP {move.pp}/{move.pp}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-moves">Chargement des attaques...</div>
            )}
          </div>
        </div>
      ) : (
        <div className="battle-end-showdown">
          <h2 className="end-message">Combat Terminé!</h2>
          <button className="btn-back-pokedex" onClick={onClose}>
            Retour au Pokédex
          </button>
        </div>
      )}
    </div>
  )
}

export default BattleShowdown
