import os
import base64
import time
import random
import requests
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import HumanMessage, SystemMessage
from utils.logger import AgentLogger

class ImageFusionTool:
    """Tool: Generate fused pokemon image via Leonardo AI"""
    
    def __init__(self):
        self.logger = AgentLogger("ImageFusionTool")
        self.leonardo_api_key = os.getenv('LEONARDO_API_KEY')
        self.generate_url = "https://cloud.leonardo.ai/api/rest/v1/generations"
        self.check_url = "https://cloud.leonardo.ai/api/rest/v1/generations/{}"
        if not self.leonardo_api_key:
            self.logger.log_error("Leonardo API key missing", {
                "api_key_set": False
            })
    
    def generate_image(self, pokemon1, pokemon2, fusion_name):
        """
        Generate image for fused pokemon using Leonardo AI
        1. Create detailed image prompt
        2. Send to Leonardo AI
        3. Poll generation status
        4. Download and save image
        5. Return image path
        """
        self.logger.log_info("Image generation started", {
            "pokemon1": pokemon1['name'],
            "pokemon2": pokemon2['name'],
            "fusion_name": fusion_name
        })
        
        try:
            if not self.leonardo_api_key:
                raise Exception("Leonardo API key missing. Set LEONARDO_API_KEY in .env.")
            
            # Step 1: Create detailed prompt for image generation
            image_prompt = self._create_image_prompt(pokemon1, pokemon2, fusion_name)
            negative_prompt = self._create_negative_prompt()
            
            self.logger.log_debug("Image prompt created", {
                "prompt": image_prompt[:100] + "..."
            })
            
            # Step 2: Call Leonardo AI generation
            image_url = self._generate_with_leonardo(image_prompt, negative_prompt)
            self.logger.log_info("Leonardo image URL", {"image_url": image_url})
            
            # Step 3: Download image
            image_bytes = self._download_image(image_url)
            
            # Step 4: Save image locally
            local_path = self._save_image_locally(image_bytes, fusion_name)
            
            self.logger.log_success("Image generated and saved", {
                "fusion_name": fusion_name,
                "local_path": local_path,
                "size_kb": len(image_bytes) / 1024
            })
            
            return {
                "type": "image",
                "local_path": local_path,
                "fusion_name": fusion_name,
                "size_bytes": len(image_bytes)
            }
            
        except Exception as e:
            self.logger.log_error("Image generation failed", str(e))
            raise

    def _create_image_prompt(self, pokemon1, pokemon2, fusion_name):
        """Create detailed prompt for Leonardo image generation"""
        prompt = f"""Create an original Pokémon fusion creature inspired by {pokemon1['name']} and {pokemon2['name']}.

Single unified creature design, fully integrated anatomy, seamless fusion of traits, no split body, no half-and-half design, no mirrored symmetry.

The creature has a compact electric rodent body structure enhanced with subtle dragon musculature. Yellow fur blended naturally with black armored dragon scales across the shoulders, back, and tail. Blue glowing lightning patterns running organically through the fur and scales.

Large but proportionate dragon wings emerging naturally from the back, with black outer membranes and electric blue inner glow. Long lightning-bolt shaped tail infused with dark energy. Small red electric cheek markings glowing faintly. Sharp but cute eyes glowing cyan with electric sparks.

Face design combines {pokemon1['name']}’s expressiveness with {pokemon2['name']}’s sharp angular features in a harmonious way. No vertical color division. Colors are blended gradients of yellow, black, and electric blue.

Official Pokémon Trading Card Game illustration style. Clean anime lineart, smooth cel shading, vibrant but balanced colors. Professional Pokémon card artwork quality. Centered character, neutral light gradient background, soft vignette, studio lighting, subtle rim light, high resolution, sharp focus, polished digital illustration."""
        return prompt

    def _create_negative_prompt(self):
        return "split body, half and half, symmetrical split, divided face, vertical line separation, mirrored composition, poorly blended fusion, bad anatomy, extra limbs, extra wings, blurry, low quality"

    def _generate_with_leonardo(self, prompt, negative_prompt):
        headers = {
            "Authorization": f"Bearer {self.leonardo_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "alchemy": True,
            "height": 1024,
            "width": 1024,
            "contrast": 3.5,
            "num_images": 1,
            "prompt": prompt,
            "negative_prompt": negative_prompt
        }
        response = requests.post(self.generate_url, json=payload, headers=headers, timeout=30)
        if not response.ok:
            self.logger.log_error("Leonardo API error", {
                "status": response.status_code,
                "response": response.text
            })
            response.raise_for_status()
        generation_id = response.json()["sdGenerationJob"]["generationId"]
        self.logger.log_debug("Leonardo generation started", {"generation_id": generation_id})
        return self._poll_generation(generation_id, headers)

    def _poll_generation(self, generation_id, headers, max_wait=300):
        start_time = time.time()
        while time.time() - start_time < max_wait:
            check_response = requests.get(self.check_url.format(generation_id), headers=headers, timeout=30)
            check_response.raise_for_status()
            data = check_response.json()
            status = data["generations_by_pk"]["status"]
            if status == "COMPLETE":
                image_url = data["generations_by_pk"]["generated_images"][0]["url"]
                self.logger.log_info("Leonardo generation complete", {"image_url": image_url})
                return image_url
            if status == "FAILED":
                raise Exception(data["generations_by_pk"].get("error", "Generation failed"))
            time.sleep(5)
        raise Exception(f"Leonardo generation timeout after {max_wait}s")

    def _download_image(self, image_url):
        response = requests.get(image_url, timeout=30)
        response.raise_for_status()
        return response.content

    def _save_image_locally(self, image_bytes, fusion_name):
        """Save image bytes to local file"""
        try:
            image_dir = "server/static/images/fusions"
            os.makedirs(image_dir, exist_ok=True)

            filename = f"{fusion_name.lower().replace(' ', '_')}.png"
            filepath = os.path.join(image_dir, filename)

            with open(filepath, 'wb') as f:
                f.write(image_bytes)

            self.logger.log_debug("Image saved locally", {
                "filepath": filepath,
                "size_kb": len(image_bytes) / 1024
            })

            return f"/static/images/fusions/{filename}"

        except Exception as e:
            self.logger.log_error("Failed to save image locally", str(e))
            raise


class NameFusionTool:
    """Tool: Generate original fusion name via Mistral"""

    def __init__(self):
        self.logger = AgentLogger("NameFusionTool")
        self.mistral_api_key = os.getenv('MISTRAL_API_KEY')
        self.llm = None
        if self.mistral_api_key:
            self.llm = ChatMistralAI(
                api_key=self.mistral_api_key,
                model="mistral-small-latest",
                temperature=0.8
            )

    def generate_name(self, pokemon1, pokemon2):
        """Generate a creative fusion name. Falls back to local blend if needed."""
        try:
            if not self.llm:
                raise Exception("Mistral API key missing")

            prompt = (
                "Create ONE original Pokémon fusion name. "
                "Return ONLY the name, no quotes. "
                f"Parents: {pokemon1['name']} and {pokemon2['name']}."
            )

            response = self.llm.invoke([
                SystemMessage(content="You are a creative Pokémon name generator."),
                HumanMessage(content=prompt)
            ])

            name = (response.content or "").strip()

            if not name:
                raise Exception("Empty name from Mistral")

            self.logger.log_info("Fusion name generated", {"name": name})
            return name

        except Exception as e:
            self.logger.log_debug("Mistral name generation failed, fallback", {"error": str(e)})
            return self._fallback_name(pokemon1, pokemon2)

    def _fallback_name(self, pokemon1, pokemon2):
        name1 = pokemon1['name']
        name2 = pokemon2['name']
        cut1 = max(3, len(name1) // 2)
        cut2 = max(3, len(name2) // 2)
        return f"{name1[:cut1]}{name2[-cut2:]}"


class CryFusionTool:
    """Tool: Generate fused cry via ElevenLabs API"""
    
    def __init__(self):
        self.logger = AgentLogger("CryFusionTool")
        # ElevenLabs disabled for now (using random parent cry instead)
        # self.elevenlabs_api_key = os.getenv('ELEVENLABS_API_KEY')
        # self.elevenlabs_url = "https://api.elevenlabs.io/v1"
    
    def fuse_cry(self, pokemon1, pokemon2, fusion_name):
        """
        Select a cry randomly between the two parent pokemons
        """
        self.logger.log_info("Cry fusion started", {
            "pokemon1": pokemon1['name'],
            "pokemon2": pokemon2['name']
        })
        
        try:
            cries = [c for c in [pokemon1.get('cry'), pokemon2.get('cry')] if c]
            if not cries:
                raise Exception("No cry URL available for both pokemons")

            selected_cry = random.choice(cries)

            self.logger.log_success("Cry selected", {
                "selected_cry": selected_cry
            })

            return selected_cry
            
        except Exception as e:
            self.logger.log_error("Cry fusion failed", str(e))
            raise
    
    # def _generate_cry_text(self, pokemon1, pokemon2, fusion_name):
    #     """Generate onomatopoeia for cry by blending parent cries"""
    #     # Simple algorithm: blend names
    #     name1_parts = pokemon1['name_en'].split()[:2]
    #     name2_parts = pokemon2['name_en'].split()[:2]
        
    #     # Create fusion cry sound (onomatopoeia)
    #     if name1_parts and name2_parts:
    #         cry = f"{name1_parts[0][:3]}-{name2_parts[0][:3]}"
    #     else:
    #         cry = f"{pokemon1['name_en'][:3]}-{pokemon2['name_en'][:3]}"
        
    #     return cry
    
    # ElevenLabs section (disabled)
    # def _text_to_speech_elevenlabs(self, text):
    #     """Convert text to speech using ElevenLabs API"""
    #     try:
    #         # Use default voice ID (Adam)
    #         voice_id = "pNInY6obpgDQGcFmaJgB"
    #         
    #         url = f"{self.elevenlabs_url}/text-to-speech/{voice_id}"
    #         
    #         headers = {
    #             "xi-api-key": self.elevenlabs_api_key,
    #             "Content-Type": "application/json"
    #         }
    #         
    #         payload = {
    #             "text": text,
    #             "model_id": "eleven_monolingual_v1",
    #             "voice_settings": {
    #                 "stability": 0.5,
    #                 "similarity_boost": 0.75
    #             }
    #         }
    #         
    #         response = requests.post(url, json=payload, headers=headers)
    #         response.raise_for_status()
    #         
    #         # Save audio file
    #         audio_path = f"server/static/cries/cry_{text.replace('-', '_')}.mp3"
    #         os.makedirs(os.path.dirname(audio_path), exist_ok=True)
    #         
    #         with open(audio_path, 'wb') as f:
    #             f.write(response.content)
    #         
    #         # Return URL path
    #         return f"/static/cries/cry_{text.replace('-', '_')}.mp3"
    #         
    #     except Exception as e:
    #         self.logger.log_error("Text-to-speech conversion failed", str(e))
    #         raise


class FusionStatsMovesTool:
    """Tool: Fuse stats and moves from two pokemons"""
    
    def __init__(self):
        self.logger = AgentLogger("FusionStatsMovesTool")
    
    def fuse_stats_moves(self, pokemon1, pokemon2):
        """
        Fuse stats and moves from two pokemons
        - Stats: average + 10% synergy bonus based on type compatibility
        - Moves: combine both movesets, deduplicate, keep best 8
        """
        self.logger.log_info("Stats and moves fusion started", {
            "pokemon1": pokemon1['name'],
            "pokemon2": pokemon2['name']
        })
        
        try:
            # Calculate type synergy bonus
            synergy_bonus = self._calculate_type_synergy(pokemon1['types'], pokemon2['types'])
            
            # Fuse stats: average + synergy bonus
            fused_stats = {}
            for stat_key in pokemon1['stats']:
                avg = (pokemon1['stats'][stat_key] + pokemon2['stats'][stat_key]) / 2.0
                bonus = avg * (0.05 + synergy_bonus)  # 5% base + synergy
                fused_stats[stat_key] = int(avg + bonus)
            
            self.logger.log_debug("Stats fused", {
                "total": sum(fused_stats.values()),
                "synergy_bonus": f"{(synergy_bonus*100):.1f}%"
            })
            
            # Fuse moves: combine and deduplicate
            all_moves = pokemon1.get('moves', []) + pokemon2.get('moves', [])
            fused_moves = list(dict.fromkeys(all_moves))[:8]  # Max 8 moves, preserve order
            
            self.logger.log_debug("Moves fused", {
                "moves_count": len(fused_moves),
                "moves": fused_moves
            })
            
            self.logger.log_success("Stats and moves fusion completed", {
                "stats_total": sum(fused_stats.values()),
                "moves_count": len(fused_moves)
            })
            
            return {
                'stats': fused_stats,
                'moves': fused_moves
            }
            
        except Exception as e:
            self.logger.log_error("Stats and moves fusion failed", str(e))
            raise
    
    def _calculate_type_synergy(self, types1, types2):
        """
        Calculate type synergy bonus
        Same types = low bonus
        Complementary types = high bonus
        """
        from utils.config import TYPE_EFFECTIVENESS
        
        synergy = 0.0
        
        # Check for type overlap
        overlap = len(set(types1) & set(types2))
        if overlap > 0:
            synergy -= 0.02 * overlap  # Penalty for same types
        
        # Check for coverage (one covers weaknesses of other)
        for t1 in types1:
            if t1 in TYPE_EFFECTIVENESS:
                weak_to = TYPE_EFFECTIVENESS[t1]['weak_to']
                for t2 in types2:
                    if t2 in TYPE_EFFECTIVENESS:
                        strong_against = TYPE_EFFECTIVENESS[t2]['strong_against']
                        if any(w in strong_against for w in weak_to):
                            synergy += 0.05  # Bonus for coverage
        
        return min(synergy, 0.15)  # Cap at 15%
