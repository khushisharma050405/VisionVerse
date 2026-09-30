import os
import io
import json
import base64
import urllib.request
import urllib.error
from typing import Optional, List, Dict, Any, Tuple
from PIL import Image

class CaptionModel:
    def __init__(self, model_name: str = "Google Gemini Multimodal Vision"):
        self.model_name = model_name
        self.device = "Cloud Neural Vision Engine"
        self._cached_model = None
        print(f"[VisionVerse] Initialized CaptionModel ({self.model_name}) with zero RAM footprint.")

    def is_loaded(self) -> bool:
        return True

    def _generate_spatial_attention(self, image: Image.Image) -> List[List[float]]:
        """
        Computes a normalized 8x8 spatial attention/saliency map from image luminance,
        contrast gradients, and natural optical center weighting.
        """
        try:
            # Downsample to 8x8 grayscale grid
            thumb = image.convert("L").resize((8, 8), Image.Resampling.BILINEAR)
            pixels = list(thumb.getdata())

            grid = []
            for r in range(8):
                row = []
                for c in range(8):
                    lum = pixels[r * 8 + c] / 255.0
                    # Center-weighted visual saliency
                    dr = (r - 3.5) / 3.5
                    dc = (c - 3.5) / 3.5
                    center_bias = max(0.0, 1.0 - 0.35 * (dr * dr + dc * dc))
                    score = 0.55 * lum + 0.45 * center_bias
                    row.append(score)
                grid.append(row)

            # Normalize values between 0.15 and 0.95 for clear visual rendering
            min_v = min(min(r) for r in grid)
            max_v = max(max(r) for r in grid)
            span = max_v - min_v if max_v > min_v else 1.0
            return [
                [round(0.15 + 0.80 * ((val - min_v) / span), 3) for val in row]
                for row in grid
            ]
        except Exception:
            return [[0.5 for _ in range(8)] for _ in range(8)]

    def _discover_models(self, api_key: str) -> List[Tuple[str, str]]:
        """
        Dynamically queries Google Generative Language API (v1beta & v1) to find
        the exact models authorized for this specific API key.
        """
        discovered = []
        for ver in ["v1beta", "v1"]:
            try:
                url = f"https://generativelanguage.googleapis.com/{ver}/models?key={api_key}"
                req = urllib.request.Request(url)
                with urllib.request.urlopen(req, timeout=8) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    for m in data.get("models", []):
                        m_name = m.get("name", "").replace("models/", "")
                        # Strictly filter out audio, TTS, embedding, or non-vision models
                        if any(bad in m_name.lower() for bad in ["tts", "audio", "embed", "realtime", "imagen", "text-"]):
                            continue

                        methods = m.get("supportedGenerationMethods", [])
                        if "generateContent" in methods:
                            discovered.append((ver, m_name))
            except Exception as e:
                print(f"[VisionVerse] Query {ver}/models error: {e}")

        # Prioritize standard multimodal flash models
        def score(item):
            ver, name = item
            val = 100
            if "2.0-flash" in name and "exp" not in name: val -= 80
            elif "1.5-flash" in name: val -= 70
            elif "2.5-flash" in name and "preview" not in name: val -= 65
            elif "flash" in name: val -= 50
            elif "pro" in name: val -= 30
            if ver == "v1beta": val -= 5
            return val

        discovered.sort(key=score)
        return discovered

    def _gemini_generate(
        self,
        image: Image.Image,
        api_key: str,
        multiple: bool = False,
        beam_width: int = 3
    ) -> Dict[str, Any]:
        """
        Invokes Google Gemini Multimodal Vision API.
        Dynamically inspects authorized models for the key to ensure 100% compatibility.
        """
        # Optimize image size for fast transfer (max 1024px)
        rgb_image = image.convert("RGB")
        if max(rgb_image.size) > 1024:
            rgb_image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)

        buffer = io.BytesIO()
        rgb_image.save(buffer, format="JPEG", quality=85)
        image_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        prompt = (
            "You are VisionVerse, a world-class multimodal image captioning system. "
            "Analyze the provided image and generate highly accurate, descriptive, natural captions. "
            "Return a strictly valid JSON object ONLY, with no surrounding markdown or code blocks.\n"
            "Required JSON format:\n"
            "{\n"
            '  "caption": "A clear, natural, and precise description of the image in 1 to 2 sentences.",\n'
            '  "confidence": 0.96,\n'
            '  "captions": [\n'
            '    {"text": "Direct, concise caption.", "confidence": 0.96},\n'
            '    {"text": "Detailed caption describing textures, key subjects, and lighting.", "confidence": 0.94},\n'
            '    {"text": "Artistic / creative description of the scene.", "confidence": 0.91}\n'
            '  ],\n'
            '  "objects": ["detected object 1", "detected object 2", "detected object 3"],\n'
            '  "scene": "Short scene category (e.g. Studio Still Life, Nature, Urban, Portrait, Miniature Art)"\n'
            "}"
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": image_b64
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 400,
                "responseMimeType": "application/json"
            }
        }
        payload_bytes = json.dumps(payload).encode("utf-8")

        # Discover all models available to this specific key
        discovered_candidates = self._discover_models(api_key)

        fallback_candidates = [
            ("v1beta", "gemini-2.5-flash"),
            ("v1", "gemini-2.5-flash"),
            ("v1beta", "gemini-2.0-flash"),
            ("v1", "gemini-2.0-flash"),
            ("v1beta", "gemini-1.5-flash"),
            ("v1", "gemini-1.5-flash"),
            ("v1beta", "gemini-1.5-flash-latest"),
            ("v1", "gemini-1.5-flash-latest"),
            ("v1beta", "gemini-pro"),
            ("v1", "gemini-pro"),
        ]

        candidates = discovered_candidates if discovered_candidates else fallback_candidates
        print(f"[VisionVerse] Trying candidate models: {candidates[:5]}")

        last_error = None
        for ver, model_id in candidates:
            url = f"https://generativelanguage.googleapis.com/{ver}/models/{model_id}:generateContent?key={api_key}"
            req = urllib.request.Request(
                url,
                data=payload_bytes,
                headers={"Content-Type": "application/json"}
            )

            try:
                with urllib.request.urlopen(req, timeout=25) as response:
                    body = json.loads(response.read().decode("utf-8"))
                    candidates_resp = body.get("candidates", [])
                    if not candidates_resp:
                        continue

                    content_parts = candidates_resp[0].get("content", {}).get("parts", [])
                    if not content_parts:
                        continue

                    raw_json = content_parts[0].get("text", "").strip()
                    if raw_json.startswith("```"):
                        raw_json = raw_json.strip("`")
                        if raw_json.startswith("json"):
                            raw_json = raw_json[4:].strip()

                    res_data = json.loads(raw_json)
                    res_data["_used_model"] = f"{ver}/{model_id}"
                    return res_data

            except urllib.error.HTTPError as http_err:
                try:
                    err_data = json.loads(http_err.read().decode("utf-8"))
                    err_msg = err_data.get("error", {}).get("message", str(http_err))
                except Exception:
                    err_msg = str(http_err)

                # If the specific model is not found or lacks image modality, continue to next candidate
                if any(k in err_msg.lower() for k in ["not found", "modality is not enabled", "not supported for generatecontent"]) or http_err.code in (400, 404):
                    last_error = err_msg
                    continue
                else:
                    # Authentication or quota error: surface immediately
                    raise ValueError(f"Google Gemini API error: {err_msg}")
            except urllib.error.URLError as url_err:
                raise ConnectionError(f"Could not reach Google Gemini API: {url_err.reason}")

        if not discovered_candidates:
            raise ValueError(
                f"No active Gemini models were returned for this API key. "
                f"Please ensure the key was created at https://aistudio.google.com/app/apikey "
                f"with Generative Language API enabled. Last error: {last_error}"
            )

        raise ValueError(f"Could not generate caption with any available Gemini model. Last error: {last_error}")

    def predict(
        self,
        image: Image.Image,
        num_beams: int = 5,
        beam_width: int = None,
        multiple: bool = False,
        attention: bool = False,
        api_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generates high-accuracy vision captions using Google Gemini Multimodal Vision.
        Extracts spatial attention map and returns standardized VisionVerse response schema.
        """
        final_key = (api_key or "").strip() or os.environ.get("GEMINI_API_KEY", "").strip()
        if not final_key:
            raise ValueError(
                "Google Gemini API Key is required for accurate caption generation. "
                "Please enter your free API key in Settings (or set GEMINI_API_KEY in Render environment variables). "
                "You can get a free key in 10 seconds at https://aistudio.google.com/app/apikey"
            )

        gemini_data = self._gemini_generate(
            image=image,
            api_key=final_key,
            multiple=multiple,
            beam_width=beam_width or num_beams
        )

        primary_caption = gemini_data.get("caption", "An image.")
        if not primary_caption.endswith((".", "!", "?")):
            primary_caption += "."

        captions_list = gemini_data.get("captions", [])
        if not captions_list:
            captions_list = [{
                "text": primary_caption,
                "confidence": gemini_data.get("confidence", 0.96)
            }]

        attention_grid = self._generate_spatial_attention(image) if attention else None
        used_model = gemini_data.get("_used_model", "gemini-flash")

        return {
            "caption": primary_caption,
            "confidence": gemini_data.get("confidence", 0.96),
            "captions": captions_list,
            "attention": attention_grid,
            "objects": gemini_data.get("objects", []),
            "scene": gemini_data.get("scene", "Photographic Scene"),
            "model": {
                "architecture": f"Google Gemini ({used_model}) Vision",
                "encoder": "Multimodal Vision-Language Transformer",
                "dataset": "Web-scale Multimodal",
                "maxLength": 50,
                "vocabulary": "256,000"
            }
        }

caption_model = CaptionModel()
