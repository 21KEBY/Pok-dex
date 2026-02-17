import requests
import math
from utils.logger import AgentLogger
from utils.config import TYPE_EFFECTIVENESS, STATS_WEIGHTS

class SuggestionTypesTool:
    """Tool: Suggest pokemon by type advantages/disadvantages"""
    
    def __init__(self):
        self.logger = AgentLogger("SuggestionTypesTool")
        self.pokeapi_base = "https://pokeapi.co/api/v2"
    
    def suggest_by_types(self, base_pokemon, limit=50):
        """
        Suggest compatible pokemon based on type coverage
        - If base has weaknesses, suggest pokemon strong against those types
        - If base has resistances, suggest pokemon that complement them
        """
        self.logger.log_info("Type suggestion started", {
            "base_name": base_pokemon['name'],
            "base_types": base_pokemon['types']
        })
        
        try:
            base_types = base_pokemon['types']
            
            # Identify base pokemon weaknesses and strong points
            weaknesses = set()
            strong_against = set()
            
            for ptype in base_types:
                if ptype in TYPE_EFFECTIVENESS:
                    weaknesses.update(TYPE_EFFECTIVENESS[ptype]['weak_to'])
                    strong_against.update(TYPE_EFFECTIVENESS[ptype]['strong_against'])
            
            # Get all pokemon (simplified - in production, paginate)
            all_pokemon = self._get_all_pokemon(limit)
            
            # Score candidates
            scored = []
            for candidate in all_pokemon:
                if candidate['id'] == base_pokemon['id']:
                    continue  # Skip base pokemon
                
                score = self._score_compatibility(
                    candidate,
                    weaknesses,
                    strong_against,
                    base_types
                )
                
                scored.append({
                    'id': candidate['id'],
                    'name': candidate['name'],
                    'types': candidate['types'],
                    'compatibility_score': score
                })
            
            # Sort by score and return top candidates
            scored.sort(key=lambda x: x['compatibility_score'], reverse=True)
            top_candidates = scored[:limit]
            
            self.logger.log_success("Type suggestion completed", {
                "candidates_count": len(top_candidates),
                "top_3": [c['name'] for c in top_candidates[:3]]
            })
            
            return top_candidates
            
        except Exception as e:
            self.logger.log_error("Type suggestion failed", str(e))
            raise
    
    def _score_compatibility(self, candidate, weaknesses, strong_against, base_types):
        """Score how well candidate complements base pokemon"""
        score = 0.0
        candidate_types = candidate['types']
        
        # Bonus: covers base pokemon weaknesses
        for weakness in weaknesses:
            if weakness in TYPE_EFFECTIVENESS:
                strong = TYPE_EFFECTIVENESS[weakness]['strong_against']
                for ctype in candidate_types:
                    if ctype in strong:
                        score += 2.0
        
        # Bonus: complements base pokemon's strengths
        for strength in strong_against:
            for ctype in candidate_types:
                if ctype == strength:
                    score += 1.0
        
        # Penalty: same type as base (less synergy)
        for btype in base_types:
            if btype in candidate_types:
                score -= 0.5
        
        return score
    
    def _get_all_pokemon(self, limit):
        """Get all pokemon (simplified - first 151 for demo)"""
        try:
            url = f"{self.pokeapi_base}/pokemon?limit={limit}&offset=0"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            results = []
            poke_list = response.json()['results']
            
            # Process with timeout for each pokemon
            for i, poke in enumerate(poke_list[:limit]):
                try:
                    poke_data = requests.get(poke['url'], timeout=5).json()
                    
                    # Get species data for French name
                    try:
                        species_data = requests.get(poke_data['species']['url'], timeout=5).json()
                        french_name = next(
                            (n['name'] for n in species_data['names'] if n['language']['name'] == 'fr'),
                            poke_data['name']
                        )
                    except:
                        french_name = poke_data['name']
                    
                    results.append({
                        'id': poke_data['id'],
                        'name': french_name,
                        'name_en': poke_data['name'],
                        'types': [t['type']['name'] for t in poke_data['types']]
                    })
                    
                    # Log progress every 10 pokemon
                    if (i + 1) % 10 == 0:
                        self.logger.log_debug("Loading progress", {"count": i + 1})
                        
                except Exception as e:
                    self.logger.log_debug("Skipped pokemon", {"name": poke['name'], "error": str(e)})
                    continue
            
            self.logger.log_info("All pokemon loaded", {"count": len(results)})
            return results
        except Exception as e:
            self.logger.log_error("Get all pokemon failed", str(e))
            raise


class StatFilterTop3Tool:
    """Tool: Filter candidates by stat similarity to base pokemon"""
    
    def __init__(self):
        self.logger = AgentLogger("StatFilterTop3Tool")
        self.pokeapi_base = "https://pokeapi.co/api/v2"
    
    def filter_top_3(self, base_pokemon, candidates):
        """
        Filter top 3 candidates based on stat similarity
        - Normalize stats
        - Calculate distance from base
        - Return 3 closest
        """
        self.logger.log_info("Stat filter started", {
            "base_name": base_pokemon['name'],
            "candidates_count": len(candidates)
        })
        
        try:
            base_stats_norm = self._normalize_stats(base_pokemon['stats'])
            
            scored = []
            for candidate_data in candidates[:20]:  # Sample first 20
                try:
                    candidate = self._fetch_pokemon_stats(candidate_data['id'])
                    candidate_stats_norm = self._normalize_stats(candidate['stats'])
                    
                    distance = self._euclidean_distance(base_stats_norm, candidate_stats_norm)
                    
                    scored.append({
                        'id': int(candidate['id']),
                        'name': str(candidate['name']),
                        'types': list(candidate['types']),
                        'compatibility_score': float(1.0 / (1.0 + distance))  # Convert distance to score
                    })
                except Exception as e:
                    self.logger.log_debug("Skipped candidate during stat filter", {
                        "candidate_id": candidate_data.get('id'),
                        "error": str(e)
                    })
                    continue
            
            # Sort by compatibility score (higher = better)
            scored.sort(key=lambda x: x['compatibility_score'], reverse=True)
            top_3 = scored[:3]
            
            self.logger.log_info("Stat filter completed", {
                "top_3": [p['name'] for p in top_3],
                "count": len(top_3)
            })
            
            return top_3
            
        except Exception as e:
            self.logger.log_error("Stat filter failed", str(e))
            raise
    
    def _normalize_stats(self, stats):
        """Normalize stats using min-max normalization"""
        # Simple normalization: divide by max possible stat (255)
        return {
            'hp': stats['hp'] / 255.0,
            'attack': stats['attack'] / 255.0,
            'defense': stats['defense'] / 255.0,
            'sp_attack': stats['sp_attack'] / 255.0,
            'sp_defense': stats['sp_defense'] / 255.0,
            'speed': stats['speed'] / 255.0,
        }
    
    def _euclidean_distance(self, stats1, stats2):
        """Calculate euclidean distance between two normalized stat sets"""
        distance = 0.0
        for key in stats1:
            weight = STATS_WEIGHTS.get(key, 0.1)
            distance += weight * ((stats1[key] - stats2[key]) ** 2)
        return math.sqrt(distance)
    
    def _fetch_pokemon_stats(self, pokemon_id):
        """Fetch pokemon stats from PokeAPI with proper error handling"""
        try:
            url = f"{self.pokeapi_base}/pokemon/{pokemon_id}"
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            # Get French name
            try:
                species_url = data['species']['url']
                species_response = requests.get(species_url, timeout=5)
                species_data = species_response.json()
                
                french_name = next(
                    (n['name'] for n in species_data['names'] if n['language']['name'] == 'fr'),
                    data['name']
                )
            except:
                french_name = data['name']
            
            # Extract stats safely
            stats_dict = {}
            stat_names = ['hp', 'attack', 'defense', 'sp-attack', 'sp-defense', 'speed']
            
            for stat_name in stat_names:
                try:
                    stat_value = next(
                        s['base_stat'] for s in data['stats'] if s['stat']['name'] == stat_name
                    )
                    key = stat_name.replace('-', '_')
                    stats_dict[key] = stat_value
                except StopIteration:
                    key = stat_name.replace('-', '_')
                    stats_dict[key] = 0
            
            return {
                'id': data['id'],
                'name': french_name,
                'name_en': data['name'],
                'types': [t['type']['name'] for t in data['types']],
                'stats': stats_dict
            }
        except Exception as e:
            self.logger.log_error("Fetch pokemon stats failed", {
                "pokemon_id": pokemon_id,
                "error": str(e),
                "error_type": type(e).__name__
            })
            raise
