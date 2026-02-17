import requests
from utils.logger import AgentLogger
from tools.suggestion_tools import SuggestionTypesTool, StatFilterTop3Tool

class SuggestionAgent:
    """Suggestion agent - recommends top 3 compatible pokemon"""
    
    def __init__(self):
        self.logger = AgentLogger("SuggestionAgent")
        self.suggestion_types_tool = SuggestionTypesTool()
        self.stat_filter_tool = StatFilterTop3Tool()
        self.pokeapi_base = "https://pokeapi.co/api/v2"
    
    def suggest_top_3(self, pokemon_id):
        """Main method: Get base pokemon, suggest candidates, filter top 3"""
        
        self.logger.log_info("Suggestion Agent: Started", {"pokemon_id": pokemon_id})
        
        try:
            # Get base pokemon data
            base_pokemon = self._fetch_pokemon(pokemon_id)
            self.logger.log_debug("Base pokemon fetched", {
                "name": base_pokemon.get('name'),
                "types": base_pokemon.get('types')
            })
            
            # Step 1: Get candidates by type suggestion
            candidates = self.suggestion_types_tool.suggest_by_types(
                base_pokemon,
                limit=50  # Get 50 candidates first
            )
            self.logger.log_info("Type suggestion completed", {
                "candidates_count": len(candidates)
            })
            
            # Step 2: Filter top 3 by stats similarity
            top_3 = self.stat_filter_tool.filter_top_3(
                base_pokemon,
                candidates
            )
            self.logger.log_success("Top 3 filtered", {
                "top_3": [p.get('name') for p in top_3]
            })
            
            return top_3
            
        except Exception as e:
            self.logger.log_error("Suggestion flow failed", str(e))
            raise
    
    def _fetch_pokemon(self, pokemon_id):
        """Fetch pokemon data from PokeAPI"""
        try:
            url = f"{self.pokeapi_base}/pokemon/{pokemon_id}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            self.logger.log_info("Pokemon data fetched", {"name": data['name']})
            
            # Fetch species data for French name
            try:
                species_url = data['species']['url']
                species_response = requests.get(species_url, timeout=10)
                species_data = species_response.json()
                
                french_name = next(
                    (n['name'] for n in species_data['names'] if n['language']['name'] == 'fr'),
                    data['name']
                )
            except Exception as e:
                self.logger.log_debug("Could not fetch French name", {"error": str(e)})
                french_name = data['name']
            
            # Extract stats safely
            stats_dict = {}
            stat_names = ['hp', 'attack', 'defense', 'sp-attack', 'sp-defense', 'speed']
            
            for stat_name in stat_names:
                try:
                    stat_value = next(
                        s['base_stat'] for s in data['stats'] if s['stat']['name'] == stat_name
                    )
                    # Convert stat name (sp-attack -> sp_attack)
                    key = stat_name.replace('-', '_')
                    stats_dict[key] = stat_value
                except StopIteration:
                    self.logger.log_debug("Stat not found, using default", {"stat": stat_name})
                    key = stat_name.replace('-', '_')
                    stats_dict[key] = 0
                except Exception as e:
                    self.logger.log_debug("Error extracting stat", {"stat": stat_name, "error": str(e)})
                    key = stat_name.replace('-', '_')
                    stats_dict[key] = 0
            
            pokemon_obj = {
                'id': data['id'],
                'name': french_name,
                'name_en': data['name'],
                'types': [t['type']['name'] for t in data['types']],
                'stats': stats_dict
            }
            
            self.logger.log_info("Pokemon processed", {
                "id": pokemon_obj['id'],
                "name": pokemon_obj['name'],
                "types": pokemon_obj['types']
            })
            
            return pokemon_obj
            
        except Exception as e:
            self.logger.log_error("Fetch pokemon failed", str(e))
            raise
