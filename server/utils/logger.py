import json
import logging
from datetime import datetime
from pathlib import Path

class AgentLogger:
    def __init__(self, agent_name):
        self.agent_name = agent_name
        self.log_file = Path(__file__).parent.parent / "logs" / "agents.log"
        self.log_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Setup logger
        self.logger = logging.getLogger(agent_name)
        self.logger.setLevel(logging.INFO)
        
        # File handler
        handler = logging.FileHandler(self.log_file)
        handler.setLevel(logging.INFO)
        
        # Formatter
        formatter = logging.Formatter('%(message)s')
        handler.setFormatter(formatter)
        
        self.logger.addHandler(handler)
    
    def _build_log(self, level, message, data):
        """Build JSON log entry"""
        return json.dumps({
            "timestamp": datetime.now().isoformat(),
            "agent": self.agent_name,
            "level": level,
            "message": message,
            "data": data
        })
    
    def log_info(self, message, data):
        """Log info level"""
        log_entry = self._build_log("INFO", message, data)
        self.logger.info(log_entry)
        print(f"✓ {message} - {data}")
    
    def log_success(self, message, data):
        """Log success"""
        log_entry = self._build_log("SUCCESS", message, data)
        self.logger.info(log_entry)
        print(f"✓ {message} - {data}")
    
    def log_error(self, message, error):
        """Log error level"""
        log_entry = self._build_log("ERROR", message, {"error": str(error)})
        self.logger.error(log_entry)
        print(f"✗ {message} - ERROR: {error}")
    
    def log_debug(self, message, data):
        """Log debug level"""
        log_entry = self._build_log("DEBUG", message, data)
        self.logger.debug(log_entry)
