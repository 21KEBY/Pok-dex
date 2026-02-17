import json
from pathlib import Path
from utils.logger import AgentLogger

class AddPokedexEntry:
    """Tool: Add fused pokemon to pokedex database"""
    
    def __init__(self):
        self.logger = AgentLogger("AddPokedexEntry")
        self.db_file = Path(__file__).parent.parent.parent / "src" / "data" / "fused_pokemons.json"
        self.db_file.parent.mkdir(parents=True, exist_ok=True)
    
    def add_entry(self, fusion_data):
        """Add fusion pokemon to database"""
        self.logger.log_info("Add pokedex entry started", {
            "fusion_id": fusion_data.get('id')
        })
        
        try:
            # Load existing database
            pokemons = self._load_db()
            
            # Create entry
            entry = {
                'id': fusion_data['id'],
                'name': fusion_data['name'],
                'image': fusion_data['image'],
                'cry': fusion_data['cry'],
                'types': fusion_data['types'],
                'stats': fusion_data['stats'],
                'moves': fusion_data['moves']
            }
            
            # Add to database
            pokemons[fusion_data['id']] = entry
            
            # Save database
            self._save_db(pokemons)
            
            # Create URL
            url = f"/pokemon/{fusion_data['id']}"
            
            self.logger.log_success("Pokedex entry added", {
                "fusion_id": fusion_data['id'],
                "url": url
            })
            
            return {
                'url': url,
                'fusion_id': fusion_data['id']
            }
            
        except Exception as e:
            self.logger.log_error("Add pokedex entry failed", str(e))
            raise

    def get_entry(self, fusion_id):
        """Get fusion pokemon entry by id"""
        try:
            pokemons = self._load_db()
            return pokemons.get(fusion_id)
        except Exception as e:
            self.logger.log_error("Get pokedex entry failed", str(e))
            raise

    def list_entries(self):
        """List all fused pokemon entries"""
        try:
            pokemons = self._load_db()
            return list(pokemons.values())
        except Exception as e:
            self.logger.log_error("List pokedex entries failed", str(e))
            raise
    
    def _load_db(self):
        """Load fused pokemons database"""
        try:
            if self.db_file.exists():
                with open(self.db_file, 'r') as f:
                    return json.load(f)
            return {}
        except Exception as e:
            self.logger.log_error("Load DB failed", str(e))
            return {}
    
    def _save_db(self, pokemons):
        """Save fused pokemons database"""
        try:
            with open(self.db_file, 'w') as f:
                json.dump(pokemons, f, indent=2)
            self.logger.log_debug("DB saved", {"entries": len(pokemons)})
        except Exception as e:
            self.logger.log_error("Save DB failed", str(e))
            raise
