# 📚 Architecture du Projet Pokédex

## 🎯 Diagramme d'Architecture Globale

```mermaid
graph TB
    subgraph "Frontend - React + Vite"
        A[App.jsx] --> B[Pokedex Component]
        B --> C[Screen Component]
        B --> D[Controls Component]
        
        C --> E[Affichage Pokémon]
        C --> F[Stats & Types]
        
        D --> G[Recherche]
        D --> H[Sélecteur Génération]
        D --> I[Liste Pokémons]
    end
    
    subgraph "APIs Externes"
        J[PokeAPI]
        K[Project Pokemon GIFs 3D]
        L[Pokepedia Données]
    end
    
    B --> J
    B -.Future.-> K
    B -.Future.-> L
    
    style A fill:#61dafb
    style B fill:#61dafb
    style C fill:#4fc3f7
    style D fill:#4fc3f7
    style J fill:#ffeb3b
    style K fill:#ff9800
    style L fill:#ff9800
```

## 🏗️ Structure des Composants

```mermaid
graph LR
    subgraph "Composants React"
        A[App] --> B[Pokedex]
        B --> C[Screen<br/>Écran principal<br/>Affichage détaillé]
        B --> D[Controls<br/>Panneau de contrôle<br/>Navigation]
        
        C --> C1[PokemonDisplay<br/>Image + Stats]
        C --> C2[TypeBadges<br/>Types Pokémon]
        C --> C3[StatsChart<br/>Statistiques]
        
        D --> D1[SearchBar<br/>Recherche]
        D --> D2[GenSelector<br/>Générations]
        D --> D3[PokemonList<br/>Grille cartes]
    end
    
    style A fill:#e91e63
    style B fill:#9c27b0
    style C fill:#3f51b5
    style D fill:#2196f3
    style C1 fill:#4caf50
    style C2 fill:#4caf50
    style C3 fill:#4caf50
    style D1 fill:#00bcd4
    style D2 fill:#00bcd4
    style D3 fill:#00bcd4
```

## 🔄 Flux de Données

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant P as Pokedex
    participant A as PokeAPI
    participant S as Screen
    participant C as Controls
    
    U->>P: Charge l'application
    P->>A: GET /pokemon?limit=151
    A-->>P: Liste Pokémons Gen 1
    P->>S: Affiche 1er Pokémon
    P->>C: Liste des cartes
    
    U->>C: Clique sur Pokémon
    C->>P: setSelectedPokemon(pokemon)
    P->>S: Update affichage
    
    U->>C: Change génération
    C->>P: setGeneration(2)
    P->>A: GET /pokemon?offset=151&limit=100
    A-->>P: Liste Pokémons Gen 2
    P->>C: Update liste
    P->>S: Affiche 1er de Gen 2
    
    U->>C: Recherche "pikachu"
    C->>C: Filtre local
    C->>P: Liste filtrée
```

## 🔊 Architecture Audio - Récupération des Sons

```mermaid
graph TB
    subgraph "Flux de Récupération Audio"
        A[Pokedex Component] -->|Fetch Pokemon Data| B[PokeAPI]
        B -->|Response| C{Données Pokémon}
        
        C -->|cries.latest| D[URL Audio OGG]
        C -->|cries.legacy| E[URL Audio Legacy]
        C -->|Aucun son| F[null]
        
        D --> G[Objet Pokemon]
        E --> G
        F --> G
        
        G -->|pokemon.cry| H[Screen Component]
        H -->|Affichage| I{Bouton Son Visible?}
        
        I -->|Oui si cry existe| J[SoundButton Actif]
        I -->|Non si null| K[Pas de bouton]
    end
    
    subgraph "Lecture Audio - useSound Hook"
        J -->|Click Utilisateur| L[useSound Hook]
        L -->|Initialise| M[Howler.js]
        M -->|Crée| N[Howl Instance]
        N -->|Configure| O[HTML5 Audio]
        
        O -->|Streaming| P[PokeAPI CDN]
        P -->|Stream OGG/MP3| Q[Lecture Audio]
        
        Q -->|Événements| R{States}
        R -->|onplay| S[isPlaying: true]
        R -->|onend| T[isPlaying: false]
        R -->|onerror| U[error: message]
    end
    
    subgraph "Gestion UI"
        S --> V[Animation Pulse]
        T --> W[Bouton Normal]
        U --> X[Bouton Désactivé]
    end
    
    style A fill:#9c27b0
    style B fill:#4caf50
    style H fill:#3f51b5
    style L fill:#ff9800
    style M fill:#ff5722
    style Q fill:#2196f3
```

## 📡 Sources des Données Audio

```mermaid
mindmap
  root((Sons Pokémon))
    PokeAPI
      cries.latest
        Format OGG
        Haute qualité
        Pokémon récents
      cries.legacy  
        Format OGG
        Sons classiques
        Générations 1-5
      CDN
        Streaming direct
        Pas de téléchargement
        Cache navigateur
    Howler.js
      Gestion Audio
        HTML5 Audio API
        Fallback automatique
        Cross-browser
      Features
        Streaming
        États lecture
        Gestion erreurs
      Formats supportés
        OGG primaire
        MP3 fallback
```

## 🎵 Détails Techniques Audio

### URLs des Cris Pokémon

Les sons sont fournis directement par **PokeAPI** dans la réponse des détails du Pokémon :

```javascript
// Exemple de réponse PokeAPI
{
  "id": 25,
  "name": "pikachu",
  "cries": {
    "latest": "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg",
    "legacy": "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/25.ogg"
  }
}
```

### Stratégie de Récupération

1. **Priorité** : `cries.latest` (sons les plus récents)
2. **Fallback** : `cries.legacy` (sons classiques)
3. **Aucun son** : Bouton masqué

### Howler.js - Pourquoi ?

- ✅ **Cross-browser** : Fonctionne partout
- ✅ **Streaming** : Pas de préchargement complet
- ✅ **Léger** : ~7KB gzippé
- ✅ **Gestion automatique** : États, erreurs, formats
- ✅ **HTML5 Audio** : Performance optimale

### Format Audio

- **OGG Vorbis** : Format principal (meilleure qualité/taille)
- **MP3** : Fallback automatique si OGG non supporté
- **Streaming** : Lecture directe sans téléchargement
- **Cache** : Géré par le navigateur


## 📦 Structure des Fichiers

```mermaid
graph TB
    subgraph "Racine du Projet"
        A[package.json<br/>Dépendances]
        B[vite.config.js<br/>Config Vite]
        C[index.html<br/>Point d'entrée HTML]
    end
    
    subgraph "src/"
        D[main.jsx<br/>Montage React]
        E[App.jsx<br/>Composant racine]
        F[index.css<br/>Styles globaux]
    end
    
    subgraph "src/components/"
        G[Pokedex.jsx<br/>Container principal]
        H[Screen.jsx<br/>Écran affichage]
        I[Controls.jsx<br/>Panneau contrôles]
        J[*.css<br/>Styles composants]
    end
    
    subgraph "Future Features"
        K[src/utils/<br/>Helpers API]
        L[src/assets/<br/>Images/Sons]
        M[src/hooks/<br/>Custom hooks]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    E --> G
    G --> H
    G --> I
    H --> J
    I --> J
    
    style A fill:#ffd54f
    style B fill:#ffd54f
    style C fill:#ffd54f
    style G fill:#64b5f6
    style H fill:#4fc3f7
    style I fill:#4fc3f7
    style K fill:#aed581
    style L fill:#aed581
    style M fill:#aed581
```

## 🎨 Architecture CSS (Thème Pokédex)

```mermaid
graph LR
    subgraph "Styles Hiérarchiques"
        A[index.css<br/>Reset + Background] --> B[App.css<br/>Container principal]
        B --> C[Pokedex.css<br/>Design Pokédex physique]
        
        C --> D[Screen.css<br/>Écran vert CRT]
        C --> E[Controls.css<br/>Panneau boutons]
        
        D --> F[Animations float<br/>pulse, spin]
        E --> G[Grille responsive<br/>Cards interactives]
    end
    
    subgraph "Thèmes Génération"
        H[Gen 1: Rouge]
        I[Gen 2: Bleu]
        J[Gen 3: Vert]
        K[Gen 4+: Autres]
    end
    
    C --> H
    C --> I
    C --> J
    C --> K
    
    style A fill:#ef5350
    style B fill:#ec407a
    style C fill:#ab47bc
    style D fill:#7e57c2
    style E fill:#5c6bc0
```

## ️ Stack Technique Détaillée

```mermaid
mindmap
  root((Pokédex App))
    Frontend
      React 18
        Hooks useState, useEffect
        Components modulaires
      Vite
        Fast HMR
        Build optimisé
      CSS Pur
        Animations CSS
        Grid/Flexbox
        Thèmes dynamiques
    API Management
      Axios
        HTTP requests
        Error handling
      PokeAPI
        Données officielles
        Free tier
    Future Backend
      Node.js + Express
        Cache API
        Custom endpoints
      Base de données
        MongoDB/PostgreSQL
        User profiles
    Features Avancées
      Three.js
        Modèles 3D
        Combats 3D
      Howler.js
        Sons Pokémon
        Audio management
      Framer Motion
        Animations fluides
        Transitions
```

## 📊 Gestion d'État (State Management)

```mermaid
stateDiagram-v2
    [*] --> Loading: App démarre
    Loading --> Loaded: Données récupérées
    
    state Loaded {
        [*] --> DefaultView: Affiche Gen 1
        DefaultView --> Searching: User tape recherche
        Searching --> Filtered: Résultats filtrés
        Filtered --> DefaultView: Clear search
        
        DefaultView --> ChangingGen: Select génération
        ChangingGen --> Loading: Fetch nouvelle gen
        Loading --> DefaultView: Données chargées
        
        DefaultView --> ViewingPokemon: Click Pokémon
        ViewingPokemon --> DefaultView: Back
    }
    
    Loaded --> Error: API fail
    Error --> Loading: Retry
```

## 🌐 Intégrations APIs Planifiées

```mermaid
graph TB
    subgraph "App Pokédex"
        A[Frontend React]
    end
    
    subgraph "APIs Actuelles"
        B[PokeAPI<br/>Données Pokémon<br/>Types, Stats, Moves]
    end
    
    subgraph "APIs Futures"
        C[Project Pokemon<br/>GIFs 3D animés<br/>Models haute qualité]
        D[Pokepedia<br/>Descriptions FR<br/>Lore complet]
        E[PokéAPI Sprites<br/>Textures HD<br/>Artworks officiels]
    end
    
    subgraph "Backend Custom (Phase 3)"
        F[Node.js Server<br/>Cache intelligent<br/>Agrégation données]
        G[MongoDB<br/>User profiles<br/>Collections]
    end
    
    A --> B
    A -.-> C
    A -.-> D
    A -.-> E
    
    B --> F
    C --> F
    D --> F
    E --> F
    F --> G
    
    style A fill:#61dafb
    style B fill:#4caf50
    style C fill:#ff9800
    style D fill:#ff9800
    style E fill:#ff9800
    style F fill:#9c27b0
    style G fill:#e91e63
```

---

## 📝 Notes Techniques

### Choix de React + Vite
- **React** : Parfait pour SPA, composants réutilisables, écosystème riche
- **Vite** : Setup rapide, HMR ultra-rapide, moderne
- **CSS Pur** : Pas de dépendance lourde, maîtrise totale, légère
- **PokeAPI** : Gratuite, complète, bien documentée

### Avantages de cette architecture
1. **Simple à maîtriser** : Stack légère, peu de dépendances
2. **Évolutive** : Facile d'ajouter des features progressivement
3. **Performante** : Vite + React optimisé
4. **Pas de backend au début** : Focus sur le front
5. **Visuel fidèle** : Design Pokédex authentique

### Pour la roadmap détaillée
Consultez le fichier [ROADMAP.md](ROADMAP.md) pour le planning complet des phases de développement.
