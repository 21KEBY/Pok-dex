from utils.logger import AgentLogger
from agents.suggestion_agent import SuggestionAgent
from agents.fusion_agent import FusionAgent
from tools.pokedex_tools import AddPokedexEntry

class OrchestratorAgent:
    """Main orchestrator agent - routes between sub-agents"""
    
    def __init__(self):
        self.logger = AgentLogger("OrchestratorAgent")
        self.suggestion_agent = SuggestionAgent()
        self.fusion_agent = FusionAgent()
        self.add_pokedex_tool = AddPokedexEntry()
    
    def suggest_fusion_candidates(self, pokemon_id):
        """Route to suggestion agent"""
        self.logger.log_info("Flow graph", {
            "flow": "API /api/suggest -> OrchestratorAgent -> SuggestionAgent -> SuggestionTypesTool -> StatFilterTop3Tool"
        })
        self.logger.log_info("Orchestrator: Starting suggestion flow", {"pokemon_id": pokemon_id})
        
        try:
            # Call suggestion agent
            candidates = self.suggestion_agent.suggest_top_3(pokemon_id)
            
            self.logger.log_success("Orchestrator: Suggestions generated", {
                "pokemon_id": pokemon_id,
                "candidates_count": len(candidates)
            })
            
            return candidates
            
        except Exception as e:
            self.logger.log_error("Orchestrator: Suggestion flow failed", str(e))
            raise
    
    def fuse_pokemons(self, pokemon1_id, pokemon2_id):
        """Route to fusion agent"""
        self.logger.log_info("Flow graph", {
            "flow": "API /api/fuse -> OrchestratorAgent -> FusionAgent -> NameFusionTool -> ImageFusionTool -> CryFusionTool -> FusionStatsMovesTool"
        })
        self.logger.log_info("Orchestrator: Starting fusion flow", {
            "pokemon1_id": pokemon1_id,
            "pokemon2_id": pokemon2_id
        })
        
        try:
            # Call fusion agent
            fusion_result = self.fusion_agent.fuse(pokemon1_id, pokemon2_id)
            
            self.logger.log_success("Orchestrator: Fusion completed", {
                "fused_id": f"{pokemon1_id}-{pokemon2_id}"
            })
            
            return fusion_result
            
        except Exception as e:
            self.logger.log_error("Orchestrator: Fusion flow failed", str(e))
            raise
    
    def add_to_pokedex(self, fusion_data):
        """Route to add pokedex tool"""
        self.logger.log_info("Flow graph", {
            "flow": "API /api/pokedex/add -> OrchestratorAgent -> AddPokedexEntry"
        })
        self.logger.log_info("Orchestrator: Adding to pokedex", {
            "fusion_id": fusion_data.get('id')
        })
        
        try:
            # Call add pokedex tool
            result = self.add_pokedex_tool.add_entry(fusion_data)
            
            self.logger.log_success("Orchestrator: Pokedex entry added", {
                "url": result.get('url')
            })
            
            return result
            
        except Exception as e:
            self.logger.log_error("Orchestrator: Add pokedex failed", str(e))
            raise

    def get_pokedex_entry(self, fusion_id):
        """Route to get pokedex entry"""
        self.logger.log_info("Orchestrator: Get pokedex entry", {
            "fusion_id": fusion_id
        })

        try:
            result = self.add_pokedex_tool.get_entry(fusion_id)

            if not result:
                self.logger.log_error("Orchestrator: Entry not found", {"fusion_id": fusion_id})
                return None

            self.logger.log_success("Orchestrator: Entry fetched", {
                "fusion_id": fusion_id
            })

            return result
        except Exception as e:
            self.logger.log_error("Orchestrator: Get pokedex failed", str(e))
            raise

    def list_pokedex_entries(self):
        """Route to list pokedex entries"""
        self.logger.log_info("Orchestrator: List pokedex entries", {})

        try:
            results = self.add_pokedex_tool.list_entries()
            self.logger.log_success("Orchestrator: Entries listed", {
                "count": len(results)
            })
            return results
        except Exception as e:
            self.logger.log_error("Orchestrator: List pokedex failed", str(e))
            raise
