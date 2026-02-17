import os
from dotenv import load_dotenv

load_dotenv()

# Mistral API Configuration
MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY')
MISTRAL_MODEL = "mistral-large-latest"

# Flask Configuration
FLASK_PORT = int(os.getenv('FLASK_PORT', 8081))
FLASK_ENV = os.getenv('FLASK_ENV', 'development')

# Logging Configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = os.path.join(os.path.dirname(__file__), '..', 'logs', 'agents.log')

# Type effectiveness for Pokemon suggestion
TYPE_EFFECTIVENESS = {
    'normal': {'resists': [], 'weak_to': ['fighting'], 'strong_against': []},
    'fire': {'resists': ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], 'weak_to': ['water', 'ground', 'rock'], 'strong_against': ['grass', 'ice', 'bug', 'steel']},
    'water': {'resists': ['water', 'grass', 'ice'], 'weak_to': ['electric', 'grass'], 'strong_against': ['fire', 'ground', 'rock']},
    'electric': {'resists': ['flying', 'steel'], 'weak_to': ['ground'], 'strong_against': ['water', 'flying']},
    'grass': {'resists': ['ground', 'water', 'grass'], 'weak_to': ['fire', 'ice', 'poison', 'flying', 'bug'], 'strong_against': ['water', 'ground', 'rock']},
    'ice': {'resists': ['ice'], 'weak_to': ['fire', 'fighting', 'rock', 'steel'], 'strong_against': ['grass', 'flying', 'ground', 'dragon']},
    'fighting': {'resists': ['rock', 'bug', 'dark'], 'weak_to': ['flying', 'psychic', 'fairy'], 'strong_against': ['normal', 'rock', 'steel', 'ice', 'dark']},
    'poison': {'resists': ['fighting', 'poison', 'bug', 'grass'], 'weak_to': ['ground', 'psychic'], 'strong_against': ['grass', 'fairy']},
    'ground': {'resists': ['poison', 'rock'], 'weak_to': ['water', 'grass', 'ice'], 'strong_against': ['fire', 'electric', 'poison', 'rock', 'steel']},
    'flying': {'resists': ['fighting', 'bug', 'grass'], 'weak_to': ['electric', 'ice', 'rock'], 'strong_against': ['fighting', 'bug', 'grass']},
    'psychic': {'resists': ['fighting', 'psychic'], 'weak_to': ['bug', 'ghost', 'dark'], 'strong_against': ['fighting', 'poison']},
    'bug': {'resists': ['fighting', 'ground', 'grass'], 'weak_to': ['fire', 'flying', 'rock'], 'strong_against': ['grass', 'psychic', 'dark']},
    'rock': {'resists': ['normal', 'flying', 'poison', 'fire'], 'weak_to': ['water', 'grass', 'fighting', 'ground', 'steel'], 'strong_against': ['flying', 'bug', 'fire']},
    'ghost': {'resists': ['poison', 'bug'], 'weak_to': ['ghost', 'dark'], 'strong_against': ['ghost', 'psychic']},
    'dragon': {'resists': ['fire', 'water', 'grass', 'electric'], 'weak_to': ['ice', 'dragon', 'fairy'], 'strong_against': ['dragon']},
    'dark': {'resists': ['ghost', 'dark'], 'weak_to': ['fighting', 'bug', 'fairy'], 'strong_against': ['ghost', 'psychic']},
    'steel': {'resists': ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'], 'weak_to': ['fire', 'water', 'ground'], 'strong_against': ['rock', 'ice', 'fairy']},
    'fairy': {'resists': ['fighting', 'bug', 'dark'], 'weak_to': ['poison', 'steel'], 'strong_against': ['fighting', 'dragon', 'dark']},
}

# Stats normalization
STATS_WEIGHTS = {
    'hp': 0.2,
    'attack': 0.2,
    'defense': 0.2,
    'sp_attack': 0.2,
    'sp_defense': 0.1,
    'speed': 0.1
}
