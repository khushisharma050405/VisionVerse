import gradio as gr
from main import app as fastapi_app

# Create a clean fallback interface while serving all FastAPI endpoints
demo = gr.Interface(
    fn=lambda: "VisionVerse Multimodal Captioning API is operational.",
    inputs=None,
    outputs="text",
    title="VisionVerse Caption API",
    description="Backend API powering VisionVerse with Salesforce BLIP on Hugging Face Spaces."
)

# Mount the FastAPI app so /generate-caption and /health endpoints are live
app = gr.mount_gradio_app(fastapi_app, demo, path="/")
