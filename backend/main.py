import io
import json
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from model import caption_model

app = FastAPI(
    title="VisionVerse Caption Backend",
    description="Real AI Image Captioning powered by Salesforce BLIP (Transformers + PyTorch)",
    version="1.0.0"
)

# Enable CORS for frontend Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VisionVerse Caption Generator",
        "model": "Salesforce/blip-image-captioning-base",
        "device": str(caption_model.device)
    }

@app.post("/generate-caption")
@app.post("/caption")
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
            detail="No image file provided. Please attach an image in the 'image' or 'file' form field."
        )

    # Parse options if passed as JSON string
    opts = {}
    if options:
        try:
            opts = json.loads(options)
        except Exception:
            opts = {}

    final_beam_width = beam_width if beam_width is not None else opts.get("beamWidth", opts.get("beam_width", 5))
    final_multiple = multiple if multiple is not None else opts.get("multiple", False)
    final_attention = attention if attention is not None else opts.get("attention", False)

    try:
        content = await upload_file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        pil_image = Image.open(io.BytesIO(content))
        # Ensure image is valid and can be loaded
        pil_image.verify()
        # Re-open after verify() since verify() can mutate internal state
        pil_image = Image.open(io.BytesIO(content))
    except UnidentifiedImageError:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Please upload a valid JPG, JPEG, PNG, or WEBP image."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process image: {str(e)}")

    try:
        result = caption_model.predict(
            image=pil_image,
            beam_width=int(final_beam_width),
            multiple=bool(final_multiple),
            attention=bool(final_attention)
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=False)
