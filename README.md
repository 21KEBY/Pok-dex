# 🎮 Pokédex Web App - Guide de Démarrage

## 🚀 Démarrage Rapide

### Installation

```powershell
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## ✨ Fonctionnalités Actuelles (Phase 1)

### ✅ Implémenté
- **Design Pokédex authentique** : Interface fidèle aux Pokédex physiques
- **Affichage des Pokémons** : Images officielles haute qualité
- **9 Générations** : Sélection de la Gen 1 à la Gen 9
- **Recherche** : Par nom ou numéro
- **Détails complets** : 
  - Nom et numéro
  - Types avec badges colorés
  - Statistiques complètes avec barres de progression
- **Thèmes dynamiques** : Couleur du Pokédex change selon la génération
- **Animations** : 
  - Lévitation des Pokémons
  - LED clignotante
  - Transitions fluides

## 🎨 Design

L'application imite un vrai Pokédex avec :
- **Écran principal** : Effet CRT vert rétro
- **Panneau latéral** : Grille de cartes Pokémon
- **LED indicateurs** : Effet lumineux animé
- **Haut-parleur** : Design authentique en bas
- **Responsive** : Adapté mobile et desktop

## 📚 Structure du Projet

```
Pokédex/
├── src/
│   ├── components/
│   │   ├── Pokedex.jsx           # Container principal
│   │   ├── Pokedex.css           # Styles du Pokédex
│   │   ├── Screen.jsx            # Écran d'affichage
│   │   ├── Screen.css            # Styles écran
│   │   ├── Controls.jsx          # Panneau contrôles
│   │   ├── Controls.css          # Styles contrôles
│   │   ├── BattleShowdown.jsx    # Système de combat
│   │   ├── BattleShowdown.css    # Styles combat
│   │   ├── PokemonImage.jsx      # Composant image
│   │   └── ...
│   ├── hooks/
│   │   ├── usePokemonMoves.js    # Hook attaques Pokémon
│   │   └── useSound.js           # Hook gestion audio
│   ├── utils/
│   │   └── translations.js       # Traductions français
│   ├── App.jsx                   # Composant racine
│   ├── main.jsx                  # Point d'entrée
│   └── index.css                 # Styles globaux
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🔧 Documentation Technique Détaillée

### 1. **Gestion des Données Pokémon**

#### Chargement des Pokémons (Pokedex.jsx)
```javascript
// Récupération par génération avec les plages
const genRanges = {
  1: { offset: 0, limit: 151 },     // Gen 1: Bulbizarre à Mewtwo
  2: { offset: 151, limit: 100 },   // Gen 2: Germignon à Ho-Oh
  // ... jusqu'à Gen 9
}

// Chargement parallèle avec Promise.all
const pokemonList = await Promise.all(
  response.data.results.map(async (pokemon) => {
    // Récupérer détails individuels
    const details = await axios.get(pokemon.url)
    // Récupérer infos espèce pour traductions FR
    const speciesData = await axios.get(speciesUrl)
  })
)
```

**Points techniques :**
- Pagination par intervalle d'IDs (offset/limit)
- Appels API parallèles pour performance
- Cache des noms français via endpoint `/pokemon-species`

#### Structure d'un Pokémon
```javascript
{
  id: 25,
  name: "Pikachu",              // Nom français
  nameEn: "pikachu",            // Nom anglais
  image: "https://...gif",      // GIF du Pokédex
  fallbackImage: "https://...png", // Image statique fallback
  types: ["electric"],          // Types (1-2)
  stats: [
    { stat: { name: "hp" }, base_stat: 35 },
    // ... ATK, DEF, SP.ATK, SP.DEF, SPD
  ],
  cry: "https://...ogg"         // Son du Pokémon
}
```

### 2. **Système de Combat (BattleShowdown)**

#### Architecture du Combat
```
BattleShowdown.jsx (Component)
├── useSound() × 2              # Sons attaque/dégâts
├── usePokemonMoves()           # Récupère 4 attaques par Pokémon
├── State Management
│   ├── hp1, hp2               # Points de vie actuels
│   ├── battleLog[]            # Historique actions
│   ├── attackingPokemon       # Animation attaque
│   └── takingDamagePokemon    # Animation dégâts
└── Fonctions Principales
    ├── executeAttack()        # Logique d'attaque joueur
    ├── executeAIAttack()      # IA simple (random)
    ├── playAttackAnimation()  # Animation attaque sprite
    └── playDamageAnimation()  # Flash dégâts
```

#### Hook usePokemonMoves()
Récupère les 4 attaques d'un Pokémon selon la génération :

```javascript
// Filtre par version (version_group)
const genMap = {
  1: 'red-blue',
  2: 'gold-silver',
  // ... jusqu'à 'scarlet-violet'
}

// Récupère moves avec détails
const movesWithDetails = await Promise.all(
  filteredMoves.map(async (moveData) => {
    const moveDetails = await axios.get(moveData.move.url)
    return {
      id: moveDetails.data.id,
      name: moveDetails.data.names.find(n => n.language.name === 'fr').name,
      type: moveDetails.data.type.name,
      power: moveDetails.data.power,        // 0 si spéciale
      accuracy: moveDetails.data.accuracy,  // 0-100%
      category: moveDetails.data.damage_class.name, // physical/special/status
    }
  })
)
```

#### Calcul des Dégâts
Implémente la formule simplifiée Pokémon :
```javascript
const calculateDamage = (attacker, move, defender) => {
  const atkStat = attacker.stats[1].base_stat    // Attaque
  const defStat = defender.stats[2].base_stat    // Défense
  const level = 50
  
  // Formule Pokémon Gen V+
  let baseDamage = ((2 * level / 5 + 2) * move.power * atkStat) / defStat / 50 + 2
  baseDamage = Math.floor(baseDamage)
  
  // Variance 85-100% (comme les vrais jeux)
  const variance = Math.random() * 0.15 + 0.85
  return Math.floor(baseDamage * variance)
}
```

#### Flux de Combat
```
1. Joueur choisit une attaque
   ↓
2. Affichage "Pokémon utilise [Move]!"
   ↓
3. playAttackAnimation() - Sprite tremble
   ↓
4. Vérification précision (accuracy%)
   ↓
5. Calcul dégâts & playDamageAnimation()
   ↓
6. Mise à jour HP avec transition CSS smooth
   ↓
7. Vérification K.O
   ↓
8. IA joue automatiquement (aléatoire)
   ↓
9. Repeat ou Fin du combat
```

### 3. **Système d'Animations**

#### Animations CSS (BattleShowdown.css)
```css
/* Attaque - Tremblement */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Dégâts - Flash blanc */
@keyframes flashDamage {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3) drop-shadow(0 0 10px rgba(255, 107, 107, 0.8)); }
}

/* Entrée combat - Slide depuis les côtés */
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-50px); }
  to { opacity: 1; transform: translateX(0); }
}

/* HP Bar - Couleur progressive */
.hp-bar {
  transition: width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  background-image: repeating-linear-gradient(90deg, ...);
}
```

#### Transitions de Couleur HP
```javascript
const getHpBarColor = (percentage) => {
  if (percentage > 50) return '#66BB6A'  // Vert
  if (percentage > 25) return '#FFB74D'  // Orange
  return '#EF5350'                       // Rouge
}
```

### 4. **Gestion Audio**

#### Hook useSound() avec Howler.js
```javascript
const useSound = (soundUrl) => {
  const soundRef = useRef(null)
  
  useEffect(() => {
    // Création d'un objet Howl
    soundRef.current = new Howl({
      src: [soundUrl],
      html5: true,        // Streaming audio
      format: ['ogg', 'mp3'],
      onplay: () => setIsPlaying(true),
      onend: () => setIsPlaying(false),
    })
  }, [soundUrl])
  
  return { isPlaying, play, stop, error }
}
```

**Utilisation en Combat :**
```javascript
const { play: playAttackSound } = useSound(pokemon1.cry)

// Dans animation
await playAttackAnimation(true)
playAttackSound()  // Son d'attaque
```

### 5. **Interface de Combat (UI)**

#### Layout Battle Arena
```
┌─────────────────────────────────────────┐
│        Pokemon Opponent (Haut)          │
│  [GIF animé]    [Stats/HP/Level]        │
├─────────────────────────────────────────┤
│             Journal de Combat           │
│     "Pikachu utilise Tonnerre!"         │
│     "Carapace reçoit 35 dégâts!"        │
├─────────────────────────────────────────┤
│  [Move 1] [Move 2]                      │
│  [Move 3] [Move 4]                      │
│                                         │
│  [GIF animé]    [Stats/HP/Level]        │
│        Pokemon Joueur (Bas)             │
└─────────────────────────────────────────┘
```

#### Barre de Vie (HP Bar)
- **Hauteur :** 32px (bien visible)
- **Bordure :** 3px or (#FFD700)
- **Couleurs :** Vert (>50%) → Orange (25%) → Rouge (<25%)
- **Animation :** cubic-bezier smooth (0.5s)
- **Rayures :** Pattern linéaire pour texture

### 6. **Traductions Français (translations.js)**

```javascript
// Traduction des types
const typeTranslations = {
  normal: "Normal",
  fire: "Feu",
  water: "Eau",
  // ...
}

// Traduction des stats
const statTranslations = {
  hp: "PV",
  attack: "Attaque",
  defense: "Défense",
  "special-attack": "Attaque Spé",
  "special-defense": "Défense Spé",
  speed: "Vitesse"
}
```

### 7. **Récupération des Ressources**

#### Images/GIFs
```javascript
// Priorité 1: GIF du Pokédex (250x250px)
image: `https://projectpokemon.org/images/normal-sprite/${nameEn}.gif`

// Priorité 2: Artwork officiel (fallback)
fallbackImage: details.data.sprites.other['official-artwork'].front_default
```

#### Sons
```javascript
// Cris Pokémon depuis PokeAPI
cry: details.data.cries?.latest || details.data.cries?.legacy

// Sons de combat (génériques)
playAttackSound()   // Howler.js generic
playDamageSound()   // Howler.js generic
```

### 8. **Performance et Optimisation**

#### Stratégie de Chargement
```javascript
// 1. Chargement parallèle (Promise.all)
const pokemonList = await Promise.all(
  response.data.results.map(pokemon => fetchDetails(pokemon))
)

// 2. Cache navigateur (Axios automatique)
// Les GIFs et images sont cached 30j

// 3. Lazy loading des GIFs
<img src={pokemon.image || pokemon.fallbackImage} 
     onError={(e) => e.target.src = fallback} />
```

#### Optimisation Mémoire
- State management avec React hooks
- Refs pour animations (évite re-render)
- Cleanup effects pour sons (unload Howl)



## 🔮 Roadmap - Prochaines Fonctionnalités

### Phase 2 - Enrichissement Visuel 🎨
- [ ] **GIFs 3D animés** : Intégration des modèles de Project Pokemon
- [ ] **Sons des Pokémons** : Cris authentiques des jeux
- [ ] **Animations d'attaques** : GIFs des moves
- [ ] **Améliorations UI** : Transitions plus fluides

### Phase 3 - Features Avancées ⚔️
- [ ] **Système de combat** : Combat 3D simplifié
- [ ] **Ouverture de packs** : Animation d'ouverture de boosters
- [ ] **Mode capture** : Mini-jeu avec avatar
- [ ] **Backend Node.js** : Cache API et fonctionnalités custom
- [ ] **Base de données** : Sauvegarde de collections

## 🛠️ Technologies Utilisées

- **React 18** : Framework UI
- **Vite** : Build tool ultra-rapide
- **Axios** : Client HTTP pour API calls
- **PokeAPI** : Source de données Pokémon
- **CSS pur** : Styling sans framework

### Pourquoi cette stack ?
- ✅ **Simple à maîtriser** : Pas de complexité inutile
- ✅ **Rapide en développement** : Vite HMR instantané
- ✅ **Performante** : React optimisé
- ✅ **Évolutive** : Facile d'ajouter des features
- ✅ **Pas de backend nécessaire** : Focus sur le front

## 🏗️ Architecture Complète & Détails Techniques

### Flux Principal de Données

```
PokeAPI
  ↓
[Pokedex.jsx] - State Management Principal
  ├─ [pokemons[]]           → Tous les Pokémon chargés
  ├─ [selectedPokemon]      → Pokémon sélectionné
  ├─ [battleMode]           → Affiche BattleShowdown si true
  ├─ [opponent]             → Adversaire combat
  └─ [selectingOpponent]    → Mode sélection adversaire
  
  ↓ Props Drilling
  
  ├─ Screen.jsx
  │   ├─ Affiche selectedPokemon détails
  │   ├─ Bouton "Lancer Combat" → onBattle()
  │   └─ useSound() pour cris Pokémon
  │
  ├─ Controls.jsx
  │   ├─ Search Input → [searchTerm]
  │   ├─ Gen Buttons (1-9) → [generation]
  │   └─ Pokemon Grid
  │       └─ onClick → setSelectedPokemon()
  │
  └─ BattleShowdown.jsx (Conditional Render)
      ├─ usePokemonMoves() × 2 pour moves
      ├─ useSound() × 2 pour audio
      ├─ Logique combat
      └─ Animations DOM
```

### Composants & Responsabilités

#### 1. **Pokedex.jsx** (Container Principal)
```javascript
// State critique
const [pokemons, setPokemons] = useState([])           // Tous Pokemon
const [selectedPokemon, setSelectedPokemon] = useState(null)
const [generation, setGeneration] = useState(1)       // Gen 1-9
const [battleMode, setBattleMode] = useState(false)   // Affichage
const [opponent, setOpponent] = useState(null)        // Combat
const [selectingOpponent, setSelectingOpponent] = useState(false)

// Chargement données avec effet
useEffect(() => {
  loadPokemons(generation)  // Rechargement quand gen change
}, [generation])

// Fonction critique
const handleStartBattle = (player, adversary) => {
  setSelectedPokemon(player)
  setOpponent(adversary)
  setBattleMode(true)     // Affiche BattleShowdown overlay
}
```

#### 2. **Screen.jsx** (Affichage Pokémon)
```javascript
// Props reçues
{ selectedPokemon, loading, onBattle, generation, pokemons }

// Affichage conditionnels
if (loading) return <div>Chargement...</div>
if (!selectedPokemon) return <div>Sélectionnez un Pokémon</div>

// Affichage stats
{selectedPokemon.stats.map(stat => (
  <div className="stat-row">
    <span className="stat-name">{translateStat(stat.stat.name)}</span>
    <div className="stat-bar-container">
      <div 
        className="stat-bar"
        style={{ width: `${(stat.base_stat / 255) * 100}%` }}
      />
    </div>
    <span className="stat-value">{stat.base_stat}</span>
  </div>
))}

// Bouton combat
<button className="btn-battle-quick" onClick={() => onBattle && onBattle()}>
  ⚔️ Lancer un Combat
</button>
```

#### 3. **Controls.jsx** (Panneau Contrôle)
```javascript
// State local pour sélection adversaire
const [selectingOpponent, setSelectingOpponent] = useState(false)

// Affichage conditionnel
{selectingOpponent ? (
  // Mode sélection adversaire
  <div className="opponent-selection-header">
    <h3>Choisissez un adversaire</h3>
    <button onClick={() => setSelectingOpponent(false)}>✕</button>
  </div>
  {pokemons.map(pokemon => (
    <div
      className="pokemon-card opponent-card"
      onClick={() => {
        onStartBattle(selectedPokemon, pokemon)
        setSelectingOpponent(false)
      }}
    >
      {/* Affichage pokemon */}
    </div>
  ))}
) : (
  // Mode normal - sélection joueur
  {pokemons.map(pokemon => (
    <div 
      className={`pokemon-card ${selectedPokemon?.id === pokemon.id ? 'selected' : ''}`}
      onClick={() => setSelectedPokemon(pokemon)}
    >
      {/* Affichage pokemon */}
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
)}
```

#### 4. **BattleShowdown.jsx** (Système Combat)

**Architecture Interne :**
```javascript
const BattleShowdown = ({ pokemon1, pokemon2, generation, onClose }) => {
  // State bataille
  const [hp1, setHp1] = useState(pokemon1.stats[0].base_stat)
  const [hp2, setHp2] = useState(pokemon2.stats[0].base_stat)
  const [battleLog, setBattleLog] = useState([])
  const [battleInProgress, setBattleInProgress] = useState(true)
  const [waitingForAction, setWaitingForAction] = useState(false)
  
  // Animations sprites
  const [attackingPokemon, setAttackingPokemon] = useState(null)  // 'player'|'opponent'
  const [takingDamagePokemon, setTakingDamagePokemon] = useState(null)
  
  // Refs pour accès direct DOM
  const playerSpriteRef = useRef(null)
  const opponentSpriteRef = useRef(null)
  
  // Hooks personnalisés
  const { moves: moves1 } = usePokemonMoves(pokemon1, generation)
  const { moves: moves2 } = usePokemonMoves(pokemon2, generation)
  const { play: playAttackSound } = useSound(soundUrl)
  const { play: playDamageSound } = useSound(soundUrl)
```

**Logique Combat Détaillée :**
```javascript
// Calcul dégâts (Formule Pokémon Gen V+)
const calculateDamage = (attacker, move, defender) => {
  const atkStat = attacker.stats[1].base_stat    // Index 1 = Attaque
  const defStat = defender.stats[2].base_stat    // Index 2 = Défense
  const level = 50
  
  // Formule: ((2 * Level / 5 + 2) * Power * ATK / DEF / 50 + 2) * Variance
  let baseDamage = ((2 * level / 5 + 2) * move.power * atkStat) / defStat / 50 + 2
  baseDamage = Math.floor(baseDamage)
  
  // Variance 85-100% (réalisme)
  const variance = Math.random() * 0.15 + 0.85
  const finalDamage = Math.floor(baseDamage * variance)
  
  return Math.max(1, finalDamage)  // Minimum 1 dégât
}

// Exécution attaque joueur
const executeAttack = async (move, isPlayer) => {
  if (!battleInProgress) return
  setWaitingForAction(true)
  
  const attacker = isPlayer ? pokemon1 : pokemon2
  const defender = isPlayer ? pokemon2 : pokemon1
  const defenderHp = isPlayer ? hp2 : hp1
  const maxDefenderHp = isPlayer ? maxHp2 : maxHp1
  
  // 1. Animation attaque
  await playAttackAnimation(isPlayer)
  
  // 2. Vérifier précision (100% par défaut, certaines moves moins)
  const hitChance = Math.random() * 100
  const hits = hitChance <= move.accuracy
  
  // 3. Afficher log
  addBattleLog(`${attacker.name} utilise ${move.name}!`, 'attack')
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 4. Si raté
  if (!hits) {
    addBattleLog(`L'attaque a échoué!`, 'miss')
    await new Promise(resolve => setTimeout(resolve, 600))
    executeAIAttack()  // IA joue quand même
    return
  }
  
  // 5. Calculer et appliquer dégâts
  const damage = calculateDamage(attacker, move, defender)
  await playDamageAnimation(!isPlayer)  // Animation défenseur
  
  const newDefenderHp = Math.max(0, defenderHp - damage)
  if (isPlayer) setHp2(newDefenderHp)
  else setHp1(newDefenderHp)
  
  addBattleLog(`${defender.name} reçoit ${damage} dégâts!`, 'damage')
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // 6. Vérifier K.O
  if (newDefenderHp === 0) {
    addBattleLog(`${defender.name} est K.O.!`, 'knockout')
    await new Promise(resolve => setTimeout(resolve, 600))
    addBattleLog(`${attacker.name} remporte la victoire!`, 'victory')
    setBattleInProgress(false)
    setWaitingForAction(false)
    return
  }
  
  // 7. IA joue
  if (isPlayer) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    executeAIAttack()
  } else {
    setWaitingForAction(false)
  }
}

// IA - choix aléatoire
const executeAIAttack = async () => {
  const randomMove = moves2[Math.floor(Math.random() * moves2.length)]
  if (!randomMove) return
  
  // Appel récursif pour continuer la boucle
  await executeAttack(randomMove, false)
}
```

### Hooks Personnalisés

#### **usePokemonMoves.js**
```javascript
const usePokemonMoves = (pokemon, generation) => {
  const [moves, setMoves] = useState([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (!pokemon) {
      setMoves([])
      return
    }
    
    const fetchMoves = async () => {
      try {
        // 1. Récupérer tous les moves du Pokémon
        const response = await axios.get(`/pokemon/${pokemon.id}`)
        
        // 2. Mapper génération → version_group
        const genMap = {
          1: 'red-blue',
          2: 'gold-silver',
          // ...
          9: 'scarlet-violet'
        }
        
        // 3. Filtrer par génération
        const filteredMoves = response.data.moves
          .filter(moveData => 
            moveData.version_group_details.some(detail =>
              detail.version_group.name === genMap[generation]
            )
          )
          .slice(0, 4)  // Limiter à 4 moves
        
        // 4. Fetch détails chaque move
        const movesWithDetails = await Promise.all(
          filteredMoves.map(async (moveData) => {
            const moveDetails = await axios.get(moveData.move.url)
            
            // Récupérer nom français
            const frenchName = moveDetails.data.names
              .find(n => n.language.name === 'fr')
            
            return {
              id: moveDetails.data.id,
              name: frenchName ? frenchName.name : moveData.move.name,
              type: moveDetails.data.type.name,
              power: moveDetails.data.power || 0,           // 0 = spéciale
              accuracy: moveDetails.data.accuracy || 100,   // % hit
              category: moveDetails.data.damage_class.name, // physical/special/status
              pp: moveDetails.data.pp || 15                 // Power Points
            }
          })
        )
        
        setMoves(movesWithDetails)
      } catch (err) {
        console.error('Erreur moves:', err)
      }
    }
    
    fetchMoves()
  }, [pokemon, generation])
  
  return { moves, loading }
}
```

#### **useSound.js**
```javascript
const useSound = (soundUrl) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(null)
  const soundRef = useRef(null)
  
  useEffect(() => {
    // Nettoyer ancien son
    if (soundRef.current) {
      soundRef.current.unload()
      soundRef.current = null
    }
    
    // Créer nouveau Howl instance
    if (soundUrl) {
      try {
        soundRef.current = new Howl({
          src: [soundUrl],
          html5: true,        // Streaming
          format: ['ogg', 'mp3'],
          onplay: () => setIsPlaying(true),
          onend: () => setIsPlaying(false),
          onstop: () => setIsPlaying(false),
          onloaderror: (id, error) => {
            console.error('Audio load error:', error)
            setError('Impossible de charger le son')
          }
        })
        setError(null)
      } catch (err) {
        setError('Erreur audio')
      }
    }
    
    // Cleanup
    return () => {
      if (soundRef.current) {
        soundRef.current.unload()
      }
    }
  }, [soundUrl])
  
  const play = () => {
    if (soundRef.current && !isPlaying) {
      soundRef.current.play()
    }
  }
  
  return { isPlaying, play, error }
}
```

### Système d'Animations CSS

```css
/* Attaque - Tremolo */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* Dégâts - Flash blanc/rouge */
@keyframes flashDamage {
  0%, 100% { filter: brightness(1); }
  50% { 
    filter: brightness(1.3) drop-shadow(0 0 10px rgba(255, 107, 107, 0.8));
  }
}

/* HP Bar - Transition lisse */
.hp-bar {
  transition: width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  /* Cubic-bezier = acceleration smoothe */
}

/* Couleur HP progressive */
const getHpBarColor = (percentage) => {
  if (percentage > 50) return '#66BB6A'   // Vert
  if (percentage > 25) return '#FFB74D'   // Orange
  return '#EF5350'                        // Rouge
}
```

### Performance & Optimisation

**Stratégies :**
```javascript
// 1. Lazy Loading Images
<img 
  src={pokemon.image}
  onError={(e) => e.target.src = pokemon.fallbackImage}
/>

// 2. Memoization si nécessaire (future)
const MemoizedScreen = React.memo(Screen)

// 3. useRef pour animations (évite re-render)
const spriteRef = useRef(null)
spriteRef.current.classList.add('attacking')

// 4. Cleanup Sounds
useEffect(() => {
  return () => soundRef.current?.unload()
}, [])
```

**Chargement Parallèle :**
```javascript
// Tous les Pokemon chargés en parallèle
const pokemonList = await Promise.all(
  response.data.results.map(pokemon => 
    fetchAndEnrichPokemon(pokemon)
  )
)
// Beaucoup plus rapide que boucle séquentielle
```

## 📖 Utilisation

### Changer de Génération
Cliquez sur les boutons numérotés (1-9) pour changer de génération. Le Pokédex changera de couleur !

### Rechercher un Pokémon
Tapez dans la barre de recherche :
- Par nom : "pikachu"
- Par numéro : "25"

### Sélectionner un Pokémon
Cliquez sur une carte dans le panneau de droite pour afficher ses détails complets.

## 🎯 Objectifs du Projet

Ce projet vise à créer une application web complète et maîtrisée :
1. **Apprentissage** : Comprendre React et les APIs
2. **Design** : Interface fidèle et authentique
3. **Progressif** : Ajout de features étape par étape
4. **Maintenable** : Code propre et documenté

## 🔗 Ressources

- **API principale** : [PokeAPI](https://pokeapi.co/)
- **GIFs 3D** : [Project Pokemon](https://projectpokemon.org/home/docs/spriteindex_148/3d-models-generation-1-pok%C3%A9mon-r90/)
- **Données FR** : [Pokepedia](https://www.pokepedia.fr/Liste_des_Pok%C3%A9mon_dans_l%27ordre_du_Pok%C3%A9dex_National)

## 💡 Conseils de Développement

1. **Teste régulièrement** : `npm run dev` pour voir les changements en temps réel
2. **Console du navigateur** : F12 pour débugger
3. **React DevTools** : Extension Chrome pour inspecter les composants
4. **Architecture.md** : Consulte pour comprendre la structure

## 🐛 Résolution de Problèmes

### L'app ne démarre pas
```powershell
# Supprimer node_modules et réinstaller
Remove-Item -Recurse -Force node_modules
npm install
```

### Les Pokémons ne chargent pas
- Vérifie ta connexion Internet (appels à PokeAPI)
- Regarde la console navigateur pour les erreurs

### Erreur de build
```powershell
npm run build
```

## 📝 Notes

- **Premier lancement** : Le chargement de la Gen 1 prend ~5-10 secondes (151 Pokémons)
- **Performance** : Les images sont mises en cache par le navigateur
- **Générations** : Gen 9 peut avoir des Pokémons manquants (en cours d'ajout à PokeAPI)

---

**Créé avec ❤️ par un fan de Pokémon pour un autre fan de Pokémon !**

*Gotta Code 'Em All!* ⚡
