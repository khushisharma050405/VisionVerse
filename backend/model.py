import torch
import torch.nn.functional as F
from transformers import AutoProcessor, BlipForConditionalGeneration
from PIL import Image

# Apple Silicon MPS / CUDA / CPU device detection
if torch.backends.mps.is_available():
    DEVICE = torch.device("mps")
elif torch.cuda.is_available():
    DEVICE = torch.device("cuda")
else:
    DEVICE = torch.device("cpu")

MODEL_ID = "Salesforce/blip-image-captioning-base"

class CaptionModel:
    def __init__(self, model_name: str = MODEL_ID):
        self.device = DEVICE
        print(f"[BLIP] Initializing {model_name} on {self.device}...")
        try:
            self.processor = AutoProcessor.from_pretrained(model_name, local_files_only=True)
            self.model = BlipForConditionalGeneration.from_pretrained(
                model_name,
                use_safetensors=False,
                local_files_only=True
            ).to(self.device)
        except Exception as e:
            print(f"[BLIP] Offline load failed ({e}), loading with network fallback...")
            self.processor = AutoProcessor.from_pretrained(model_name)
            self.model = BlipForConditionalGeneration.from_pretrained(model_name).to(self.device)

        self.model.eval()
        print("[BLIP] Model loaded successfully and ready for inference!")

    def predict(
        self,
        image: Image.Image,
        num_beams: int = 5,
        beam_width: int = None,
        multiple: bool = False,
        attention: bool = False,
    ) -> dict:
        """
        Official Hugging Face Transformers BLIP inference pipeline:
        uploaded image -> PIL Image -> processor(images=..., return_tensors='pt')
        -> model.generate(max_new_tokens=30, num_beams=5, early_stopping=True,
                          no_repeat_ngram_size=2, repetition_penalty=1.2)
        -> processor.decode(..., skip_special_tokens=True)
        """
        rgb_image = image.convert("RGB")
        inputs = self.processor(images=rgb_image, return_tensors="pt").to(self.device)

        chosen_beams = beam_width if beam_width is not None else num_beams
        beams = max(1, min(int(chosen_beams), 5))
        if beams < 3:
            beams = 5
        num_return = min(3, beams) if multiple else 1

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=30,
                num_beams=beams,
                early_stopping=True,
                no_repeat_ngram_size=2,
                repetition_penalty=1.2,
                num_return_sequences=num_return,
                return_dict_in_generate=True,
                output_scores=True
            )

        captions = []
        for idx in range(num_return):
            seq = outputs.sequences[idx]
            raw_text = self.processor.decode(seq, skip_special_tokens=True).strip()
            if raw_text:
                formatted_text = raw_text[0].upper() + raw_text[1:]
                if not formatted_text.endswith((".", "!", "?")):
                    formatted_text += "."
            else:
                formatted_text = "An image."

            # Calculate authentic beam sequence confidence
            conf = None
            if hasattr(outputs, "sequences_scores") and outputs.sequences_scores is not None and len(outputs.sequences_scores) > idx:
                log_score = outputs.sequences_scores[idx].item()
                conf = round(max(0.20, min(0.98, float(torch.exp(torch.tensor(log_score)).item()))), 2)

            captions.append({
                "text": formatted_text,
                "confidence": conf
            })

        primary = captions[0] if captions else {"text": "Unable to generate caption.", "confidence": None}

        # Real Vision Transformer spatial attention extraction
        attention_grid = None
        if attention:
            try:
                with torch.no_grad():
                    v_out = self.model.vision_model(inputs["pixel_values"], output_attentions=True)
                    if hasattr(v_out, "attentions") and v_out.attentions is not None:
                        last_attn = v_out.attentions[-1]  # shape: (1, num_heads, seq_len, seq_len)
                        # Average attention from CLS token across all heads to spatial patches
                        cls_attn = last_attn[0, :, 0, 1:].mean(dim=0)
                        side = int(cls_attn.shape[0] ** 0.5)
                        grid = cls_attn.reshape(side, side)
                        # Interpolate to 8x8 grid matching UI display
                        grid_8x8 = F.interpolate(
                            grid.unsqueeze(0).unsqueeze(0),
                            size=(8, 8),
                            mode="bilinear",
                            align_corners=False
                        )[0, 0]
                        # Min-max normalization into [0.0, 1.0]
                        norm_grid = (grid_8x8 - grid_8x8.min()) / (grid_8x8.max() - grid_8x8.min() + 1e-8)
                        attention_grid = [[round(float(val), 3) for val in row] for row in norm_grid.tolist()]
            except Exception as attn_err:
                print(f"[BLIP] Failed to extract attention map: {attn_err}")
                attention_grid = None

        return {
            "caption": primary["text"],
            "confidence": primary["confidence"],
            "captions": captions,
            "attention": attention_grid,
            "objects": [],
            "scene": "N/A (Caption-only model)",
            "model": {
                "architecture": "Salesforce BLIP",
                "encoder": "Vision Transformer (ViT-B)",
                "dataset": "COCO / LAION",
                "maxLength": 30,
                "vocabulary": "30,522"
            }
        }

caption_model = CaptionModel()
