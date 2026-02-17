from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from agents.orchestrator import OrchestratorAgent
from utils.logger import AgentLogger

load_dotenv()

app = Flask(__name__)
CORS(app)

logger = AgentLogger(__name__)
orchestrator = OrchestratorAgent()

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    logger.log_info("Health check", {})
    return jsonify({"status": "ok", "service": "pokemon-fusion-agents"}), 200

@app.route('/api/suggest', methods=['POST'])
def suggest():
    """Suggestion endpoint - Get top 3 compatible pokemon"""
    try:
        data = request.json
        pokemon_id = data.get('pokemon_id')
        
        logger.log_info("Suggest request received", {"pokemon_id": pokemon_id})
        
        if not pokemon_id:
            return jsonify({"error": "pokemon_id required"}), 400
        
        result = orchestrator.suggest_fusion_candidates(pokemon_id)
        
        logger.log_success("Suggest completed", {"result_count": len(result)})
        return jsonify(result), 200
        
    except Exception as e:
        logger.log_error("Suggest failed", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/fuse', methods=['POST'])
def fuse():
    """Fusion endpoint - Generate fused pokemon"""
    try:
        data = request.json
        pokemon1_id = data.get('pokemon1_id')
        pokemon2_id = data.get('pokemon2_id')
        
        logger.log_info("Fuse request received", {
            "pokemon1_id": pokemon1_id,
            "pokemon2_id": pokemon2_id
        })
        
        if not pokemon1_id or not pokemon2_id:
            return jsonify({"error": "pokemon1_id and pokemon2_id required"}), 400
        
        result = orchestrator.fuse_pokemons(pokemon1_id, pokemon2_id)

        # Auto add to pokedex
        pokedex_result = orchestrator.add_to_pokedex(result)

        logger.log_success("Fuse completed", {
            "fused_id": f"{pokemon1_id}-{pokemon2_id}",
            "pokedex_url": pokedex_result.get('url')
        })

        result['pokedex_url'] = pokedex_result.get('url')
        return jsonify(result), 200
        
    except Exception as e:
        logger.log_error("Fuse failed", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/pokedex/add', methods=['POST'])
def add_pokedex():
    """Add fused pokemon to pokedex"""
    try:
        data = request.json
        fusion_data = data.get('fusion_data')
        
        logger.log_info("Add pokedex request received", {
            "fusion_id": fusion_data.get('id')
        })
        
        if not fusion_data:
            return jsonify({"error": "fusion_data required"}), 400
        
        result = orchestrator.add_to_pokedex(fusion_data)
        
        logger.log_success("Pokedex entry added", {"url": result.get('url')})
        return jsonify(result), 200
        
    except Exception as e:
        logger.log_error("Add pokedex failed", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/pokedex/<fusion_id>', methods=['GET'])
def get_pokedex_entry(fusion_id):
    """Get fused pokemon from pokedex by id"""
    try:
        result = orchestrator.get_pokedex_entry(fusion_id)

        if not result:
            return jsonify({"error": "fusion_id not found"}), 404

        return jsonify(result), 200

    except Exception as e:
        logger.log_error("Get pokedex failed", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/pokedex', methods=['GET'])
def list_pokedex_entries():
    """List fused pokemons in pokedex"""
    try:
        result = orchestrator.list_pokedex_entries()
        return jsonify(result), 200
    except Exception as e:
        logger.log_error("List pokedex failed", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 8081))
    logger.log_info("Flask server starting", {"port": port})
    app.run(host='0.0.0.0', port=port, debug=True)
