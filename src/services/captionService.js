export const MODEL = {
  architecture: 'Salesforce BLIP',
  encoder: 'Vision Transformer (ViT-B/16)',
  dataset: 'COCO / LAION',
  maxLength: 50,
  vocabulary: '30,522',
}

export const ATTN = 8

const API = import.meta.env.VITE_API_URL || 'http://localhost:8001'

const words = t => t ? t.replace(/[.!?]$/, '').split(/\s+/).filter(Boolean).length : 0

/**
 * Sends the real uploaded image (or photographic sample) to the FastAPI BLIP model backend.
 * POST /generate-caption
 */
export async function generateCaption(image, options = {}) {
  if (!image || !image.dataUrl) {
    throw new Error('Please select or upload an image first.')
  }

  const opts = {
    multiple: false,
    beam: false,
    beamWidth: 3,
    ...options,
  }

  // Convert image URL (whether data: URL or /samples/xxx.jpg) to a Blob
  let blob
  try {
    const res = await fetch(image.dataUrl)
    blob = await res.blob()
  } catch (err) {
    throw new Error('Failed to read image data. Please try re-uploading the image.')
  }

  const formData = new FormData()
  const fileName = image.name || 'image.jpg'
  formData.append('image', blob, fileName)
  formData.append('file', blob, fileName)
  formData.append('options', JSON.stringify(opts))
  if (opts.beamWidth) formData.append('beam_width', String(opts.beamWidth))
  if (opts.multiple !== undefined) formData.append('multiple', String(opts.multiple))
  if (opts.attention !== undefined) formData.append('attention', String(opts.attention))

  let response
  try {
    response = await fetch(`${API}/generate-caption`, {
      method: 'POST',
      body: formData,
    })
  } catch (netErr) {
    throw new Error(
      `Cannot connect to caption backend at ${API}. Please ensure the FastAPI server is running.`
    )
  }

  if (!response.ok) {
    let errMsg = `Backend error (${response.status})`
    try {
      const errJson = await response.json()
      if (errJson.detail) errMsg = errJson.detail
    } catch {
      // fallback to status text
    }
    throw new Error(errMsg)
  }

  const data = await response.json()

  // Format captions array
  const captionsList = Array.isArray(data.captions) && data.captions.length > 0
    ? data.captions
    : [{ text: data.caption || 'No caption generated.', confidence: data.confidence ?? 0.85 }]

  const primaryText = captionsList[0].text
  const primaryConf = captionsList[0].confidence

  return {
    caption: primaryText,
    confidence: primaryConf,
    captions: captionsList,
    attention: data.attention || null,
    objects: Array.isArray(data.objects) ? data.objects : [],
    scene: data.scene || 'N/A (Caption-only model)',
    model: data.model || MODEL,
    captionLength: words(primaryText),
    options: opts,
    createdAt: Date.now(),
  }
}
