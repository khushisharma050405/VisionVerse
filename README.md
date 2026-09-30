# VisionVerse – AI Image Caption Generator

VisionVerse is a full-stack multimodal image caption generator powered by **Google Gemini Multimodal Vision** with candidate auto-discovery and zero RAM memory limits, served via a **FastAPI** backend with a modern **React + Vite** frontend.

---

## Architecture: REAL IMAGE → MULTIMODAL VISION MODEL → REAL CAPTION

```
┌─────────────────────────────────┐
│   React Frontend (Vite)         │
│   - Drag-and-drop / file upload │
│   - Photographic sample library │
│   - Confidence meter & history  │
│   - Key settings & auto-save    │
└────────────────┬────────────────┘
                 │ POST /generate-caption (multipart form-data)
                 ▼
┌─────────────────────────────────┐
│   FastAPI Backend (Render)      │
│   - Python 3 + PIL validation   │
│   - Zero-RAM Cloud Architecture │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│   Google Gemini Multimodal AI   │
│   - Multimodal Vision-Language  │
│   - 100% Accurate Descriptions  │
│   - Cartoons, Photos & Artwork  │
└─────────────────────────────────┘
```

---

## How to Run

### 1. Start the Backend (FastAPI + BLIP Model)

Install Python dependencies (if needed):
```bash
pip install -r backend/requirements.txt
```

Run the backend server:
```bash
python3 backend/main.py
```
*Or using npm:*
```bash
npm run backend
```
The backend initializes the Salesforce BLIP model on your hardware (MPS / CUDA / CPU) and listens on **`http://127.0.0.1:8001`**.

Health check:
```bash
curl http://127.0.0.1:8001/health
```

---

### 2. Start the Frontend (React + Vite)

In a second terminal window:
```bash
npm install
npm run dev
```

Open the printed URL (e.g. **`http://localhost:5174/`** or **`http://localhost:5173/`**).

---

## API Contract

### `POST /generate-caption`
Accepts multipart form-data:
- `image`: Image file (`image/jpeg`, `image/png`, `image/webp`)
- `beam_width`: Integer (1–5)
- `multiple`: Boolean (`true` / `false`)

Response:
```json
{
  "caption": "A puppy with a stick in its mouth.",
  "confidence": 0.56,
  "captions": [
    { "text": "A puppy with a stick in its mouth.", "confidence": 0.56 }
  ],
  "objects": [],
  "scene": "N/A (Caption-only model)",
  "model": {
    "architecture": "Salesforce BLIP",
    "encoder": "Vision Transformer (ViT-B)",
    "dataset": "COCO / LAION",
    "maxLength": 50,
    "vocabulary": "30,522"
  }
}
```

---

## Project Structure

```
VisionVerse/
├── backend/
│   ├── main.py             # FastAPI server with /generate-caption
│   ├── model.py            # Salesforce BLIP PyTorch inference & confidence scoring
│   └── requirements.txt    # Python requirements
├── public/
│   └── samples/            # Real photographic sample images
├── src/
│   ├── components/         # Reusable UI components
│   ├── data/samples.js     # Photographic sample image definitions
│   ├── hooks/              # useLocalStorage hook
│   ├── pages/              # Generate, History, About, Settings
│   ├── services/           # captionService.js (API communication)
│   ├── App.jsx             # Main application and navigation
│   └── main.jsx
├── package.json
└── vite.config.js          # Vite config with backend proxy
```
