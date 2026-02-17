import requests
from utils.logger import AgentLogger
from tools.fusion_tools import ImageFusionTool, CryFusionTool, FusionStatsMovesTool, NameFusionTool

class FusionAgent:
    """Fusion agent - generates fused pokemon data"""
    
    def __init__(self):
        self.logger = AgentLogger("FusionAgent")
        self.image_tool = ImageFusionTool()
        self.cry_tool = CryFusionTool()
        self.stats_moves_tool = FusionStatsMovesTool()
        self.name_tool = NameFusionTool()
        self.pokeapi_base = "https://pokeapi.co/api/v2"
    
    def fuse(self, pokemon1_id, pokemon2_id):
        """Main fusion method"""
        
        self.logger.log_info("Fusion Agent: Started", {
            "pokemon1_id": pokemon1_id,
            "pokemon2_id": pokemon2_id
        })
        
        try:
            # Fetch both pokemons
            pokemon1 = self._fetch_pokemon(pokemon1_id)
            pokemon2 = self._fetch_pokemon(pokemon2_id)
            
            self.logger.log_info("Both pokemons fetched", {
                "pokemon1_id": pokemon1.get('id'),
                "pokemon1_name": pokemon1.get('name'),
                "pokemon2_id": pokemon2.get('id'),
                "pokemon2_name": pokemon2.get('name')
            })
            
            # Generate fusion name (Mistral or fallback)
            fusion_name = self.name_tool.generate_name(pokemon1, pokemon2)
            fusion_id = f"{pokemon1_id}-{pokemon2_id}"
            
            # Step 1: Generate image
            image_url = self.image_tool.generate_image(pokemon1, pokemon2, fusion_name)
            self.logger.log_info("Image generated", {"fusion_id": fusion_id})
            
            # Step 2: Fuse cry
            cry_url = self.cry_tool.fuse_cry(pokemon1, pokemon2, fusion_name)
            self.logger.log_info("Cry fused", {"fusion_id": fusion_id})
            
            # Step 3: Fuse stats and moves
            stats_moves = self.stats_moves_tool.fuse_stats_moves(pokemon1, pokemon2)
            self.logger.log_info("Stats and moves fused", {
                "total_stats": sum(stats_moves['stats'].values())
            })
            
            fusion_result = {
                'id': fusion_id,
                'name': fusion_name,
                'image': image_url,
                'cry': cry_url,
                'stats': stats_moves['stats'],
                'moves': stats_moves['moves'],
                'types': list(set(pokemon1['types'] + pokemon2['types']))[:2]  # Max 2 types
            }
            
            self.logger.log_success("Fusion completed", {
                "fusion_id": fusion_id,
                "name": fusion_name
            })
            
            return fusion_result
            
        except Exception as e:
            self.logger.log_error("Fusion failed", {
                "pokemon1_id": pokemon1_id,
                "pokemon2_id": pokemon2_id,
                "error": str(e),
                "error_type": type(e).__name__
            })
            raise
    
    def _fetch_pokemon(self, pokemon_id):
        """Fetch pokemon data from PokeAPI with proper error handling"""
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
                    key = stat_name.replace('-', '_')
                    stats_dict[key] = stat_value
                except StopIteration:
                    self.logger.log_debug("Stat not found", {"stat": stat_name})
                    key = stat_name.replace('-', '_')
                    stats_dict[key] = 0
            
            # Extract moves
            moves = []
            for move in data.get('moves', [])[:8]:
                try:
                    moves.append(move['move']['name'])
                except:
                    pass

            cry_url = None
            try:
                cries = data.get('cries', {})
                cry_url = cries.get('latest') or cries.get('legacy')
            except Exception:
                cry_url = None
            
            pokemon_obj = {
                'id': data['id'],
                'name': french_name,
                'name_en': data['name'],
                'types': [t['type']['name'] for t in data['types']],
                'stats': stats_dict,
                'moves': moves,
                'cry': cry_url
            }
            
            self.logger.log_info("Pokemon processed", {
                "id": pokemon_obj['id'],
                "name": pokemon_obj['name'],
                "types": pokemon_obj['types']
            })
            
            return pokemon_obj
            
        except Exception as e:
            self.logger.log_error("Fetch pokemon failed", {
                "pokemon_id": pokemon_id,
                "error": str(e),
                "error_type": type(e).__name__
            })
            raise
