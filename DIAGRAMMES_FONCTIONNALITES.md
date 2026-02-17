# 📊 Diagrammes des Fonctionnalités - Pokédex

## 🎮 Technologies Principales

```mermaid
graph TB
    A[Application React] --> B[Récupération de données]
    B --> C[Base de données PokeAPI]
    A --> D[Sons des Pokémons]
    A --> E[Animations visuelles]
    
    style A fill:#61dafb,stroke:#333,stroke-width:2px
    style C fill:#ff6b6b,stroke:#333,stroke-width:2px
```

**Ce schéma montre :**
- L'application est construite avec React (un outil pour créer des sites web)
- Elle va chercher les informations sur PokeAPI (une base de données gratuite)
- Elle affiche les Pokémons avec du son et des animations

---

## 1️⃣ Comment l'application récupère les Pokémons

### Vue d'ensemble

```mermaid
sequenceDiagram
    participant U as Toi (Utilisateur)
    participant P as Application
    participant API as Base de données PokeAPI
    participant S as Mémoire de l'appli

    U->>P: Je choisis une génération
    P->>P: L'application se prépare
    P->>API: Demande la liste des Pokémons
    API-->>P: Voici la liste !
    
    loop Pour chaque Pokémon
        P->>API: Donne-moi les détails du Pokémon
        API-->>P: Voici ses types, stats, attaques...
        P->>API: Donne-moi son nom en français
        API-->>P: Voici son nom !
    end
    
    P->>S: Je garde tout en mémoire
    S-->>U: Affichage des Pokémons à l'écran
```

**Explication simple :**
- Tu choisis une génération (1, 2, 3...)
- L'application demande la liste à internet
- Pour chaque Pokémon, elle récupère toutes ses infos
- Tout s'affiche joliment à l'écran !

### Images des Pokémons

**Comment ça marche ?**

L'application affiche de beaux GIFs 3D animés des Pokémons. Voici le processus :

```mermaid
flowchart LR
    A[Numéro du Pokémon] --> B[Créer l'adresse web de l'image]
    B --> C[Télécharger le GIF animé]
    C --> D{Le GIF existe ?}
    D -->|Non| E[Utiliser l'image de secours]
    D -->|Oui| F[Afficher le GIF animé]
    
    style B fill:#FF9800
    style F fill:#4CAF50
    style E fill:#2196F3
```

**Explication simple :**
- Chaque Pokémon a un numéro (Pikachu = 25, Bulbizarre = 1)
- Ce numéro permet de trouver son GIF animé sur le site Project Pokemon
- SiProcessus complet détaillé

```mermaid
flowchart TD
    A[Tu choisis une génération] --> B[L'application note ton choix]
    B --> C[Déclenchement automatique]
    C --> D[Chargement des Pokémons]
    D --> E{Quelle génération ?}
    E -->|Génération 1| F[151 premiers Pokémons]
    E -->|Génération 2| G[100 Pokémons suivants]
    E -->|Autres| H[...]
    
    F --> I[Demande à PokeAPI]
    G --> I
    H --> I
    
    I --> J[Réception de la liste]
    J --> K[Pour chaque Pokémon de la liste]
    
    K --> L[Récupère détails]
    L --> M[Types, stats, attaques]
    
    K --> N[Récupère infos espèce]
    N --> O[Nom français]
    
    M --> P[Assemble toutes les infos]
    O --> P
    
    P --> Q[Pokémon complet créé]
    Q --> R[ID et noms]
    Q --> S[Images GIF animées]
    Q --> T[Types, stats, attaques, cri]
    
    R --> U[Liste complète]
    S --> U
    T --> U
    
    U --> V[Sauvegarde en mémoire]
    V --> W[Sélectionne le premier]
    W --> X[Fin du chargement]
    X --> Y[Affichage à l'écrann first]
    W --> X[setLoading false]
    X --> Y[Affichage dans UI]
    
    style A fill:#4CAF50
    style Y fill:#2196F3
    style I fill:#FF9800
    style P fill:#9C27B0
```

**En résumé :**
1. L'utilisateur choisit une génération (1, 2, 3...)
2. L'application demande la liste des Pokémons à l'API
3. Pour chaque Pokémon, on récupère ses informations détaillées
4. Tout s'affiche à l'écran

---

## 2️⃣ Système Gacha (Ouverture de Boosters)

### Comment ça marche

```mermaid
flowchart TD
    A[Tu cliques sur le booster] --> B[Démarrage de l'ouverture]
    B --> C[Animation de secousse]
    C --> D[Attente de 2 secondes]
    
    D --> E[Tirage de la rareté]
    E --> F{Nombre aléatoire}
    
    F -->|60% de chance| G[COMMUN<br/>Pokémon 1-300]
    F -->|25% de chance| H[RARE<br/>Pokémon 301-600]
    F -->|10% de chance| I[ÉPIQUE<br/>Pokémon 601-800]
    F -->|5% de chance| J[LÉGENDAIRE<br/>Pokémon 801-1025]
    
    G --> K[Choix d'un Pokémon au hasard]
    H --> K
    I --> K
    J --> K
    
    K --> L[Récupération des infos]
    L --> M[Récupération du nom français]
    M --> N[Création du Pokémon complet]
    
    N --> O[Sauvegarde du résultat]
    O --> P[Animation de révélation]
    P --> Q[Affichage 3D du Pokémon]
    
    Q --> R{Tu cliques sur Ajouter}
    R --> S[Envoi vers le Pokédex]
    S --> T[Retour à la vue normale]
    T --> U[Affichage dans les détails]
    
    style A fill:#4CAF50
    style G fill:#9E9E9E
    style H fill:#2196F3
    style I fill:#9C27B0
    style J fill:#FFD700
    style U fill:#FF5722
```

### Étapes du processus

```mermaid
sequenceDiagram
    participant U as Toi
    participant G as Système Gacha
    participant API as Base de données
    participant P as Pokédex principal

    U->>G: Clic sur le booster
    G->>G: Début d'ouverture
    G->>G: Secousse du pack (animation)
    
    Note over G: Suspense pendant 2 secondes...
    
    G->>G: Tirage au sort de la rareté
    
    alt Commun (60%)
        G->>G: Pokémon entre 1 et 300
    else Rare (25%)
        G->>G: Pokémon entre 301 et 600
    else Épique (10%)
        G->>G: Pokémon entre 601 et 800
    else Légendaire (5%)
        G->>G: Pokémon entre 801 et 1025
    end
    
    G->>G: Choix d'un numéro au hasard
    G->>API: Demande les détails du Pokémon
    API-->>G: Voici ses infos !
    G->>API: Demande son nom en français
    API-->>G: Voici son nom !
    
    G->>G: Création du Pokémon complet
    G->>G: Sauvegarde du résultat
    
    Note over G: Révélation en 3D !
    
    U->>G: Clic sur "Ajouter au Pokédex"
    G->>P: Envoie le Pokémon
    P->>P: Sélectionne ce Pokémon
    P->>P: Ferme le Gacha
    
    Note over P,U: Affichage dans les détails
```

**Probabilités de rareté :**
- 60% de chance d'obtenir un Pokémon COMMUN
- 25% de chance d'obtenir un Pokémon RARE
- 10% de chance d'obtenir un Pokémon ÉPIQUE
- 5% de chance d'obtenir un Pokémon LÉGENDAIRE

**Le processus :**
1. Tu cliques sur le booster → Animation de secousse
2. Attente de 2 secondes (suspense !)
3. Tirage aléatoire selon les probabilités
4. Révélation en 3D du Pokémon obtenu

---

## 3️⃣ Système de Combat

### Architecture globale

```mLes différentes vues de l'application

```mermaid
stateDiagram-v2
    [*] --> VueNormale: Démarrage de l'appli
    
    VueNormale --> SelectionAdversaire: Clic sur "Lancer Combat"
    Note right of VueNormale: Vue normale :<br/>Liste + Détails
    
    SelectionAdversaire --> Combat: Tu choisis un adversaire
    Note right of SelectionAdversaire: Mode sélection :<br/>Liste des adversaires
    
    Combat --> VueNormale: Fermeture du combat
    Note right of Combat: Vue combat :<br/>Face à face
    
    state VueNormale {
        [*] --> Ecran_Details
        [*] --> Liste_Pokemon
        Ecran_Details --> Selection
        Liste_Pokemon --> Selection
    }
    
    state Combat {
        [*] --> Affichage_Combat
        Affichage_Combat --> Animations_Attaque
        Affichage_Combat --> Comparaison_Stats
    }
```

**Explication :**
- **Vue normale** : Tu vois la liste des Pokémons et les détails de celui que tu as choisi
- **Mode sélection** : Tu choisis qui va être ton adversaire
- **Vue combat** : Les deux Pokémons se font face avec leurs statistiques

### Les 4 phases d'un combat

```mermaid
sequenceDiagram
    participant U as Toi
    participant E as Écran des détails
    participant P as Pokédex principal
    participant L as Liste
    participant C as Écran de combat

    Note over U,C: PHASE 1 : DÉCLENCHEMENT
    
    U->>E: Clic sur "⚔️ Lancer un Combat"
    E->>P: Signal de démarrage
    P->>P: Mode sélection activé
    P->>L: Active la liste des adversaires
    L->>L: Affiche tous les Pokémons disponibles
    
    Note over U,C: PHASE 2 : CHOIX DE L'ADVERSAIRE
    
    U->>L: Clic sur un adversaire
    L->>P: Voici ton choix !
    P->>P: Sauvegarde le joueur
    P->>P: Sauvegarde l'adversaire
    P->>P: Active le mode combat
    P->>P: Désactive la sélection
    
    Note over U,C: PHASE 3 : AFFICHAGE DU COMBAT
    
    P->>C: Lance l'écran de combat<br/>avec les 2 Pokémons
    C->>C: Affichage face à face
    C->>C: Comparaison des stats
    C->>C: Animations d'attaque
    
    Note over U,C: PHASE 4 : FIN DU COMBAT
    
    U->>C: Clic sur "Fermer"
    C->>P: Signal de fermeture
    P->>P: Désactive le mode combat
    P->>P: Supprime l'adversaire
    P->>E: Retour à la vue normale
    P->>L: Retour à la
**Comment lancer un combat :**
1. Clique sur le bouton "⚔️ Lancer un Combat"
2. Choisis un adversaire dans la liste
3. Les deux Pokémons apparaissent face à face
4. Compare leurs statistiques !
5. Ferme pour revenir à la vue normale
Organisation de l'application

### Comment les parties communiquent entre elles

```mermaid
graph TB
    subgraph Pokedex["POKÉDEX (Cerveau de l'application)"]
        direction TB
        States["Mémoire :<br/>Liste des Pokémons, Pokémon sélectionné<br/>Recherche, Génération choisie<br/>Mode Combat, Adversaire"]
        Logic["Actions possibles :<br/>Charger les Pokémons<br/>Démarrer un combat<br/>Ajouter un Pokémon du Gacha"]
    end
    
    subgraph Components["Les différentes sections visibles"]
        Controls["LISTE & FILTRES<br/>Liste de tous les Pokémons<br/>Barre de recherche<br/>Choix de génération<br/>Bouton Gacha<br/>Sélection d'adversaire"]
        Screen["DÉTAILS<br/>Infos du Pokémon choisi<br/>Statistiques et Types<br/>Liste des attaques<br/>Bouton Combat"]
        Battle["COMBAT<br/>Interface de combat<br/>Affichage face à face<br/>Animations"]
        Gacha["GACHA<br/>Ouverture de booster<br/>Système de rareté<br/>Animations du pack"]
    end
    
    subgraph External["Ce qui vient d'internet"]
        PokeAPI["BASE DE DONNÉES<br/>Infos des Pokémons<br/>Noms en français"]
        Audio["SONS<br/>Cris des Pokémons"]
    end
    
    Pokedex -->|Envoie les infos| Controls
    Pokedex -->|Envoie les infos| Screen
    Pokedex -->|Afficher ou cacher| Gacha
    Pokedex -->|Activer ou désactiver| Battle
    
    Controls -->|Signale les actions| Pokedex
    Screen -->|Signal de combat| Pokedex
    Gacha -->|Envoie le Pokémon obtenu| Pokedex
    Battle -->|Signal de fermeture| Pokedex
    
    Logic -->|Demande des infos| PokeAPI
    Screen -->|Joue| Audio
    
    style Pokedex fill:#61dafb
    style Controls fill:#4CAF50
    style Screen fill:#2196F3
    style Battle fill:#FF5722
    style Gacha fill:#9C27B0
    style PokeAPI fill:#ff6b6b
```

**Comment ça fonctionne :**
- Le **Pokédex** est le cerveau qui contrôle tout
- Les **sections visibles** (Liste, Détails, Combat, Gacha) affichent les choses
- Quand tu cliques, l'information remonte au Pokédex
- Le Pokédex décide quoi faire et met à jour l'affichage

### Les états du combat

```mermaid
stateDiagram-v2
    [*] --> Repos: Démarrage
    
    state Repos {
        Pas_de_combat
        Pas_d_adversaire
        Selection_desactivee
    }
    
    Repos --> Selection: Clic sur "Lancer Combat"
    
    state Selection {
        Toujours_pas_de_combat
        Toujours_pas_d_adversaire
        Selection_activee
    }
    
    Selection --> EnCombat: Tu choisis un adversaire
    
    state EnCombat {
        Combat_actif
        Adversaire_choisi
        Selection_desactivee
    }
    
    EnCombat --> Repos: Fermeture du combat
    
    note right of Selection
        La liste montre
        les adversaires possibles
    end note
    
    note right of EnCombat
        L'écran de combat
        s'affiche
    end note
```

**Les 3 états possibles :**
1. **Repos** : Tu navigues normalement dans le Pokédex
2. **Sélection** : Tu es en train de choisir un adversaire
3. **En combat** : Deux Pokémons se font face à l'écran     BattleShowdown
        affiché
    end note
```

---

## 📚 Technologies Utilisées (explications simples)

### 🎨 Interface graphique
- **React** : La bibliothèque qui crée l'interface que tu vois à l'écran
- **Vite** : L'outil qui rend l'application rapide et fluide
- **CSS** : Ce qui rend l'application jolie (couleurs, animations, effets)

### 🔊 Son
- **Howler.js** : Permet de jouer les cris des Pokémons

### 🌐 Données externes
- **PokeAPI** : Le site web qui fournit toutes les informations sur les Pokémons (noms, types, statistiques...)
- **Project Pokemon** : Le site qui fournit les GIFs animés en 3D
- **Axios** : Le messager qui va chercher les informations sur internet

### 💡 Communication entre les parties
- Les différentes sections de l'application se parlent entre elles
- Quand tu cliques quelque part, l'information se propage
- C'est comme un jeu de téléphone arabe, mais sans erreurs !
    
    Logic -->|axios| PokeAPI
    Screen -->|play| Audio
    
    style Pokedex fill:#61dafb
    style Controls fill:#4CAF50
    style Screen fill:#2196F3
    style Battle fill:#FF5722
    style Gacha fill:#9C27B0
    style PokeAPI fill:#ff6b6b