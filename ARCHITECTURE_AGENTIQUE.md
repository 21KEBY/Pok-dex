# Architecture Agentique Pokédex - Documentation

## 📋 Vue d'ensemble

Système multi-agents LangChain Python + Flask API pour fusion de Pokémon avec suggestion intelligente par types et stats.

**Port API** : 8081  
**Framework** : Flask + LangChain Python  
**LLM** : Mistral (via API)  
**État** : 🟡 En développement

---

## 🏗️ Architecture

### Schéma Agentique

```
┌─────────────────────────────────────────────────────┐
│         Frontend (React) - Port 3000                │
│  Bouton "Generate new pokemon"                      │
└────────────────────┬────────────────────────────────┘
                     │
                     │ HTTP POST
                     ▼
┌─────────────────────────────────────────────────────┐
│   Flask API (Python) - Port 8081                    │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │  Agent Principal Orchestrateur             │   │
│  │  - Route vers Agent Suggestion             │   │
│  │  - Route vers Agent Fusion                 │   │
│  │  - Route vers Tool AddPokedexEntry         │   │
│  └────────────────────────────────────────────┘   │
│                     │                              │
│       ┌─────────────┼─────────────┐               │
│       ▼             ▼             ▼               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Agent    │  │ Agent    │  │ Tool     │       │
│  │Suggestion│  │ Fusion   │  │ AddPokédex       │
│  └──────────┘  └──────────┘  └──────────┘       │
│       │             │                            │
│   ┌───┴───┐     ┌───┴───────┐                    │
│   ▼       ▼     ▼           ▼                    │
│ Tool1   Tool2 Tool3-Tool5  DB                    │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Agents et Tools

### Agent 1 : Suggestion
**Entrée** : pokemon_base (id)  
**Sortie** : Top 3 pokémon compatibles

**Tools** :
- `SuggestionTypes` : Filtre par types (avantages/désavantages)
- `StatFilterTop3` : Sélectionne Top 3 par similarité stats

---

### Agent 2 : Fusion
**Entrée** : pokemon1_id, pokemon2_id  
**Sortie** : Image, Cri, Stats+Attaques fusionnés

**Tools** :
- `ImageFusion` : Génère image via prompt IA
- `CryFusion_ElevenLabs` : Fusionne cris via ElevenLabs
- `FusionStatsMoves` : Normalise stats et attaques

---

### Tool Global : AddPokedexEntry
**Entrée** : id1-id2, image, stats, attaques, cri  
**Sortie** : URL `/pokemon/id1-id2` créée

---

## 📁 Structure Dossiers

```
Pokédex/
├── src/
│   ├── components/
│   ├── pages/
│   └── ...
├── server/
│   ├── .env
│   ├── requirements.txt
│   ├── app.py
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── orchestrator.py
│   │   ├── suggestion_agent.py
│   │   └── fusion_agent.py
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── suggestion_tools.py
│   │   ├── fusion_tools.py
│   │   └── pokedex_tools.py
│   ├── logs/
│   │   └── agents.log
│   └── utils/
│       ├── logger.py
│       └── config.py
└── ARCHITECTURE_AGENTIQUE.md
```

---

## 📦 Dépendances Python

```
flask==2.3.0
langchain==0.1.0
mistralai==0.0.7
requests==2.31.0
python-dotenv==1.0.0
```

---

## 🚀 Endpoints API

| Endpoint | Méthode | Entrée | Sortie |
|----------|---------|--------|--------|
| `/api/suggest` | POST | `pokemon_id` | `[{id, name, stats}, ...]` |
| `/api/fuse` | POST | `pokemon1_id, pokemon2_id` | `{image, cry, stats, moves}` |
| `/api/pokedex/add` | POST | `fusion_data` | `{url: "/pokemon/id1-id2"}` |
| `/api/health` | GET | - | `{status: "ok"}` |

---

## 📊 Logs

**Format** : JSON  
**Fichier** : `server/logs/agents.log`  

```json
{
  "timestamp": "2026-02-17T10:30:00",
  "agent": "SuggestionAgent",
  "tool": "SuggestionTypes",
  "status": "success",
  "input": {"pokemon_id": 1},
  "output": [{"id": 4, "name": "Salamèche"}]
}
```

---

## 🔄 Flux Complet

1. **Frontend** : Clic bouton "Generate new pokemon" → POST `/api/suggest?pokemon_id=X`
2. **Agent Principal** : Appelle Agent Suggestion
3. **Agent Suggestion** : 
   - Tool SuggestionTypes → Candidates
   - Tool StatFilterTop3 → Top 3
4. **Frontend** : Affiche Top 3 → Utilisateur choisit
5. **Agent Principal** : Appelle Agent Fusion avec (pokemon1, pokemon2)
6. **Agent Fusion** :
   - Tool ImageFusion → Image générée
   - Tool CryFusion → Cri fusionné
   - Tool FusionStatsMoves → Stats/Attaques
7. **Agent Principal** : Appelle Tool AddPokedexEntry
8. **Tool AddPokedexEntry** : Crée DB entry + URL `/pokemon/id1-id2`
9. **Frontend** : Redirection et affichage nouveau Pokémon

---

## ✅ Checklist Développement

- [x] Setup Flask + LangChain
- [x] Agents créés (Principal, Suggestion, Fusion)
- [x] Tools SuggestionTypes & StatFilterTop3
- [x] Tools ImageFusion & CryFusion (placeholders)
- [x] Tool FusionStatsMoves
- [x] Tool AddPokedexEntry
- [ ] Endpoints REST testés
- [ ] Logs JSON centralisés (en place)
- [ ] Frontend connecté à API
- [ ] Tests end-to-end

---

## 🔗 Intégration Frontend

```javascript
// Dans une page React (ex: FusionPage.jsx)
const generatePokemon = async (pokemonId) => {
  const res = await fetch('http://localhost:8081/api/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pokemon_id: pokemonId })
  });
  const suggestions = await res.json();
  return suggestions;
};
```

---

**Dernière mise à jour** : 17 Feb 2026 - API Flask complète avec tous les agents et tools

