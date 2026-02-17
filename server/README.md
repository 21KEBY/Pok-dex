# API Agentique Pokédex - Backend Python

## 🚀 Installation et Lancement

### 1. Installation des dépendances

```bash
cd server
pip install -r requirements.txt
```

### 2. Configuration .env

Modifiez le fichier `.env` avec votre clé Mistral :

```env
MISTRAL_API_KEY=your_actual_mistral_key
FLASK_PORT=8081
FLASK_ENV=development
LOG_LEVEL=INFO
```

### 3. Lancement du serveur

```bash
python app.py
```

Le serveur démarre sur `http://localhost:8081`

---

## 📡 Endpoints API

### 1. Health Check
```
GET /api/health
```
**Réponse** :
```json
{
  "status": "ok",
  "service": "pokemon-fusion-agents"
}
```

### 2. Suggestion de Pokémon
```
POST /api/suggest
```

**Corps** :
```json
{
  "pokemon_id": 1
}
```

**Réponse** :
```json
[
  {
    "id": 4,
    "name": "Salamèche",
    "types": ["fire"],
    "compatibility_score": 2.5
  },
  ...
]
```

### 3. Fusion de Pokémon
```
POST /api/fuse
```

**Corps** :
```json
{
  "pokemon1_id": 1,
  "pokemon2_id": 4
}
```

**Réponse** :
```json
{
  "id": "1-4",
  "name": "Bulbizarre ∞ Salamèche",
  "image": "https://...",
  "cry": "https://...",
  "stats": {
    "hp": 52,
    "attack": 64,
    ...
  },
  "moves": ["tackle", "vine-whip", ...],
  "types": ["grass", "fire"]
}
```

### 4. Ajouter au Pokédex
```
POST /api/pokedex/add
```

**Corps** :
```json
{
  "fusion_data": {
    "id": "1-4",
    "name": "Bulbizarre ∞ Salamèche",
    "image": "https://...",
    "cry": "https://...",
    "stats": {...},
    "moves": [...],
    "types": [...]
  }
}
```

**Réponse** :
```json
{
  "url": "/pokemon/1-4",
  "fusion_id": "1-4"
}
```

---

## 📊 Logs

Les logs sont stockés en JSON dans `server/logs/agents.log` :

```json
{
  "timestamp": "2026-02-17T10:30:00.123456",
  "agent": "SuggestionAgent",
  "level": "INFO",
  "message": "Suggestion Agent: Started",
  "data": {"pokemon_id": 1}
}
```

### Visualisation des logs

```bash
tail -f server/logs/agents.log | jq .
```

---

## 🏗️ Architecture Interne

```
app.py (Flask server)
  ├── agents/
  │   ├── orchestrator.py (Agent Principal)
  │   ├── suggestion_agent.py (Agent Suggestion)
  │   └── fusion_agent.py (Agent Fusion)
  ├── tools/
  │   ├── suggestion_tools.py (SuggestionTypes, StatFilterTop3)
  │   ├── fusion_tools.py (ImageFusion, CryFusion, FusionStatsMoves)
  │   └── pokedex_tools.py (AddPokedexEntry)
  ├── utils/
  │   ├── logger.py (Logs JSON)
  │   └── config.py (Config et type effectiveness)
  └── logs/
      └── agents.log
```

---

## 🔌 Intégration Frontend

### Exemple React (fetch)

```javascript
// Suggestion
const response = await fetch('http://localhost:8081/api/suggest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pokemon_id: 1 })
});
const suggestions = await response.json();

// Fusion
const fuseResponse = await fetch('http://localhost:8081/api/fuse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pokemon1_id: 1, pokemon2_id: 4 })
});
const fused = await fuseResponse.json();

// Add to Pokédex
const addResponse = await fetch('http://localhost:8081/api/pokedex/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fusion_data: fused })
});
const result = await addResponse.json();
```

---

## 🐛 Dépannage

### Erreur : "MISTRAL_API_KEY not found"
→ Vérifiez que votre clé est bien dans le `.env`

### Erreur : "Port 8081 already in use"
→ Changez le port dans `.env` ou tuez le processus existant

### Logs vides
→ Vérifiez que le dossier `server/logs/` existe

---

**État** : 🟡 En développement  
**Prochaines étapes** : Intégration image/cry, tests end-to-end
