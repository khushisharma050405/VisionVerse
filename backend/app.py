import io
import json
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import gradio as gr

from model import caption_model

api_app = FastAPI(
    title="VisionVerse Caption Backend",
    description="Real AI Image Captioning powered by Salesforce BLIP (Transformers + PyTorch)",
    version="1.0.0"
)

api_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api_app.get("/")
@api_app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VisionVerse Caption Generator",
        "model": "Salesforce/blip-image-captioning-base",
        "device": str(caption_model.device),
        "loaded": caption_model.is_loaded()
    }

@api_app.post("/generate-caption")
@api_app.post("/caption")
async def generate_caption_endpoint(
    image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    options: Optional[str] = Form(None),
    beam_width: Optional[int] = Form(None),
    multiple: Optional[bool] = Form(None),
    attention: Optional[bool] = Form(None)
):
    upload_file = image or file
    if not upload_file:
        raise HTTPException(
            status_code=400,
            detail="No image file provided."
        )

    opts = {}
    if options:
        try:
            opts = json.loads(options)
        except Exception:
            opts = {}

    final_beam_width = beam_width if beam_width is not None else opts.get("beamWidth", opts.get("beam_width", 5))
    final_multiple = multiple if multiple is not None else opts.get("multiple", False)
    final_attention = attention if attention is not None else opts.get("attention", False)

    contents = await upload_file.read()
    try:
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    caption_result = caption_model.predict(
        image=pil_image,
        beam_width=int(final_beam_width),
        multiple=bool(final_multiple),
        attention=bool(final_attention)
    )
    return caption_result

def predict_gradio(img):
    if img is None:
        return "Please upload an image"
    res = caption_model.predict(img)
    return res["caption"]

demo = gr.Interface(
    fn=predict_gradio,
    inputs=gr.Image(type="pil", label="Upload Image"),
    outputs=gr.Textbox(label="Generated Caption"),
    title="🌌 VisionVerse Multimodal Captioning Backend",
    description="Salesforce BLIP Vision Transformer API is active and ready."
)

app = gr.mount_gradio_app(api_app, demo, path="/")
