import { useRef, useState } from 'react'
import { UploadCloud, Upload, X, RefreshCw, Copy, Check, Sparkles, Loader2, Replace, AlertCircle, Image as Img } from 'lucide-react'
import { SAMPLES } from '../data/samples'
import { generateCaption } from '../services/captionService'
import { Card, Toggle, readFile } from '../components/ui'

export default function Generate({ session, setSession, settings, setSettings, onSave }) {
  const { image, result } = session
  const [opts, setOpts] = useState(result?.options || settings.defaults)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [keyInput, setKeyInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [drag, setDrag] = useState(false)
  const [pick, setPick] = useState(0)
  const input = useRef()

  const load = async f => {
    if (!f) return
    if (!/^image\/(jpeg|png|webp)$/i.test(f.type)) {
      return setErr('Unsupported file. Choose a JPG, JPEG, PNG, or WEBP image.')
    }
    if (f.size > 10 * 1024 * 1024) {
      return setErr('That image is over 10 MB. Choose a smaller one.')
    }
    setErr('')
    setSession({ image: { dataUrl: await readFile(f), name: f.name }, result: null })
  }

  const run = async (o = opts, overrideKey = null) => {
    if (!image || loading) return
    setLoading(true)
    setErr('')
    const effectiveKey = overrideKey !== null ? overrideKey : (settings?.apiKey || '')
    try {
      const r = await generateCaption(image, { ...o, beamWidth: settings.beamWidth, apiKey: effectiveKey })
      setSession({ image, result: r })
      setPick(0)
      if (settings.autoSave) onSave(image, r)
    } catch (e) {
      setErr(e.message || 'Caption generation failed.')
    } finally {
      setLoading(false)
    }
  }

  const saveInlineKey = () => {
    const k = keyInput.trim()
    if (!k) return
    if (setSettings) {
      setSettings(s => ({ ...s, apiKey: k }))
    }
    localStorage.setItem('visionverse_gemini_api_key', k)
    setErr('')
    run(opts, k)
  }

  const setOpt = (k, v) => {
    const n = { ...opts, [k]: v }
    setOpts(n)
    if (image && result) run(n)
  }

  const cap = result?.captions?.[pick] || result?.captions?.[0]
  const copy = async () => {
    if (!cap?.text) return
    try {
      await navigator.clipboard.writeText(cap.text)
    } catch {
      const t = document.createElement('textarea')
      t.value = cap.text
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      t.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="animate-rise">
      <p className="text-xs tracking-wide text-forest-600 mb-2">Computer vision and NLP</p>
      <h1 className="font-serif text-4xl md:text-5xl leading-tight">Turn images into words</h1>
      <p className="mt-3 text-ink/60 max-w-xl">
        Upload an image and the model describes what it sees, using a Vision Transformer encoder and neural language decoder.
      </p>

      {/* ── TOP SECTION: SPACIOUS 2-COLUMN GRID (IMAGE UPLOAD + CAPTION BLOCK) ── */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2 items-stretch w-full">
        {/* Left Card: Large Image Upload Block */}
        <Card className="flex flex-col justify-between">
          <div>
            {!image ? (
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); load(e.dataTransfer.files[0]) }}
                className={`h-72 sm:h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center gap-3 p-6 transition-colors ${
                  drag ? 'border-forest-600 bg-forest-100/60' : 'border-cream-300 hover:border-forest-600/40 bg-cream-50/50'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center shadow-sm">
                  <UploadCloud size={32} />
                </div>
                <div>
                  <p className="font-medium text-base text-ink">Drag and drop an image here</p>
                  <p className="text-xs text-ink/50 mt-1">Supports JPG, JPEG, PNG, or WEBP up to 10 MB</p>
                </div>
                <div className="flex items-center gap-2 my-0.5">
                  <span className="h-px w-8 bg-cream-300" />
                  <span className="text-xs text-ink/40 uppercase tracking-wider font-mono">or</span>
                  <span className="h-px w-8 bg-cream-300" />
                </div>
                <button
                  type="button"
                  onClick={() => input.current.click()}
                  className="flex items-center gap-2 bg-forest-800 hover:bg-forest-700 text-cream-100 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm cursor-pointer"
                >
                  <Upload size={16} />
                  <span>Choose file</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-cream-200 shadow-inner">
                  <img src={image.dataUrl} alt={image.name} className="w-full h-full object-cover" />

                  {/* Real Attention Map Overlay */}
                  {opts.attention && (
                    result?.attention && Array.isArray(result.attention) ? (
                      <div
                        className="absolute inset-0 grid pointer-events-none transition-opacity duration-300"
                        style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}
                        aria-label="Vision Transformer Attention Map"
                      >
                        {result.attention.flat().map((weight, i) => (
                          <div
                            key={i}
                            title={`Attention weight: ${weight}`}
                            style={{
                              backgroundColor: `rgba(245, 158, 11, ${Math.max(0.04, weight * 0.72)})`,
                              boxShadow: weight > 0.65 ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.45)' : 'none',
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      result && (
                        <div className="absolute bottom-2 left-2 right-2 bg-forest-950/80 backdrop-blur-sm text-cream-100 text-[11px] px-3 py-1.5 rounded-lg text-center pointer-events-none">
                          Attention map unavailable for this image
                        </div>
                      )
                    )
                  )}

                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      aria-label="Replace image"
                      title="Replace image"
                      onClick={() => input.current.click()}
                      className="p-2 rounded-lg bg-white/90 hover:bg-white shadow-sm cursor-pointer"
                    >
                      <Replace size={16} />
                    </button>
                    <button
                      aria-label="Remove image"
                      title="Remove image"
                      onClick={() => { setSession({ image: null, result: null }); setErr('') }}
                      className="p-2 rounded-lg bg-white/90 hover:bg-white shadow-sm cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Attention Legend */}
                {opts.attention && result?.attention && (
                  <div className="mt-3 flex items-center justify-between text-xs text-ink/70 bg-cream-100/70 px-3.5 py-2 rounded-xl border border-cream-200">
                    <span className="font-medium text-forest-800">Attention (ViT)</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-ink/50">Low</span>
                      <div className="w-24 h-2 rounded-full bg-gradient-to-r from-amber-100 via-amber-400 to-amber-700 shadow-inner" />
                      <span className="text-[11px] text-ink/50">High</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={e => { load(e.target.files[0]); e.target.value = '' }}
            />

            <div className="mt-5 pt-3 border-t border-cream-200/70">
              <p className="text-xs text-ink/60 mb-2.5 font-medium">Or try a sample photograph</p>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {SAMPLES.map(s => (
                  <button
                    key={s.id}
                    title={s.name}
                    aria-label={`Use sample: ${s.name}`}
                    onClick={() => {
                      setErr('')
                      setSession({ image: { dataUrl: s.url, name: `${s.id}.jpg`, sampleId: s.id }, result: null })
                    }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      image?.sampleId === s.id
                        ? 'border-forest-700 ring-2 ring-forest-600/30 scale-105 shadow-md'
                        : 'border-transparent hover:opacity-90 hover:scale-102'
                    }`}
                  >
                    <img src={s.url} alt={s.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-2">
            <button
              disabled={!image || loading}
              onClick={() => run()}
              className="w-full flex items-center justify-center gap-2 bg-forest-800 hover:bg-forest-700 active:scale-[0.99] disabled:bg-cream-300 disabled:text-ink/40 text-cream-100 py-3.5 px-6 rounded-xl font-medium text-base transition-all shadow-sm hover:shadow cursor-pointer"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Analyzing with Gemini Vision…' : 'Generate caption'}
            </button>

            {err && (
              <div role="alert" className="mt-3 text-sm text-red-800 bg-red-50 p-3.5 rounded-xl border border-red-200">
                <div className="flex gap-2 items-start">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                  <span className="leading-snug">{err}</span>
                </div>
                {err.toLowerCase().includes('api key') && (
                  <div className="mt-3 pt-3 border-t border-red-200/80">
                    <p className="text-xs font-semibold text-ink/80 mb-1.5">
                      Enter Gemini API key to activate instant AI vision:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Paste AIzaSy... key"
                        value={keyInput}
                        onChange={e => setKeyInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-cream-300 bg-white font-mono text-ink outline-none focus:border-forest-600"
                      />
                      <button
                        type="button"
                        onClick={saveInlineKey}
                        className="text-xs bg-forest-800 hover:bg-forest-700 text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors"
                      >
                        Save & Generate
                      </button>
                    </div>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-[11px] text-forest-700 hover:underline font-medium"
                    >
                      Get your free Gemini API key (takes 10 seconds, no credit card) &rarr;
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Right Card: Large Generated Caption Block */}
        <Card className="flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <h3 className="font-serif text-xl flex items-center gap-2 text-ink">
                <Sparkles size={18} className="text-forest-600" />
                <span>Generated caption</span>
              </h3>
              {cap && !loading && (
                <button
                  onClick={copy}
                  className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-cream-100 border border-cream-200 text-ink/80 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="mt-8 space-y-4 py-8 animate-pulse" aria-live="polite">
                <div className="h-6 bg-cream-200 rounded-xl w-11/12" />
                <div className="h-6 bg-cream-200 rounded-xl w-8/12" />
                <div className="h-4 bg-cream-200/60 rounded-xl w-5/12 pt-1" />
                <p className="text-sm text-ink/50 pt-4 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-forest-700" />
                  <span>Vision Transformer is encoding features and generating caption…</span>
                </p>
              </div>
            ) : cap ? (
              <div className="mt-5 animate-rise space-y-5">
                <div className="bg-cream-100/80 border border-cream-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <p className="font-serif text-xl sm:text-2xl leading-relaxed text-ink italic">
                    “{cap.text}”
                  </p>
                </div>

                {/* Multiple alternative candidate captions */}
                {result.captions && result.captions.length > 1 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs text-ink/60 font-medium uppercase tracking-wider font-mono">
                      Alternative hypotheses ({result.captions.length})
                    </p>
                    <div className="space-y-2">
                      {result.captions.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => setPick(i)}
                          className={`w-full text-left text-sm px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            i === pick
                              ? 'border-forest-700 bg-forest-100/60 font-medium text-forest-900 shadow-sm'
                              : 'border-cream-200 hover:bg-cream-100/70 text-ink/80'
                          }`}
                        >
                          <span>{c.text}</span>
                          {c.confidence != null && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cream-200/80 text-ink/70 font-mono">
                              {Math.round(c.confidence * 100)}%
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 grid grid-cols-2 gap-4 text-sm border-t border-cream-200/80">
                  <div>
                    <p className="text-xs text-ink/50">Model confidence</p>
                    <p className="font-medium text-ink mt-0.5">
                      {cap.confidence != null ? `${Math.round(cap.confidence * 100)}%` : 'Beam search optimal'}
                    </p>
                    {cap.confidence != null && (
                      <div className="h-1.5 bg-cream-200 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-forest-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round(cap.confidence * 100))}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-ink/50">Caption length</p>
                    <p className="font-medium text-ink mt-0.5">
                      {cap.text.replace(/[.!?]$/, '').split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-ink/50 gap-3 py-16">
                <div className="w-14 h-14 rounded-2xl bg-cream-100 flex items-center justify-center text-ink/40">
                  <Img size={30} />
                </div>
                <div>
                  <p className="text-base font-medium text-ink/70">Awaiting image input</p>
                  <p className="text-xs text-ink/40 mt-1">Add an image, then choose Generate caption.</p>
                </div>
              </div>
            )}
          </div>

          {cap && !loading && (
            <div className="pt-4 mt-6 border-t border-cream-200 flex justify-end">
              <button
                onClick={() => run()}
                className="flex items-center gap-2 text-xs font-medium border border-cream-300 hover:bg-cream-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Regenerate caption</span>
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* ── DOWN SECTION: OPTIONS (IN DOWN WHILE SCROLLING) ── */}
      <div className="mt-12 pt-2">
        <Card className="p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-cream-200">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-ink">More options</h3>
              <p className="text-xs sm:text-sm text-ink/60 mt-0.5">
                Configure multimodal decoding, beam search parameters, and spatial attention overlays.
              </p>
            </div>
            {image && result && (
              <span className="text-xs text-forest-800 bg-forest-100 px-3 py-1 rounded-full font-medium w-fit">
                Auto-updates on change
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-cream-100/60 p-5 rounded-2xl border border-cream-200 flex flex-col justify-between">
              <Toggle
                label="Generate multiple captions"
                hint="Sample 3 distinct candidate interpretations using beam hypothesis ranking"
                checked={opts.multiple}
                onChange={v => setOpt('multiple', v)}
              />
            </div>
            <div className="bg-cream-100/60 p-5 rounded-2xl border border-cream-200 flex flex-col justify-between">
              <Toggle
                label="Use beam search"
                hint={`Beam search width ${settings.beamWidth} for optimal sequence likelihood`}
                checked={opts.beam}
                onChange={v => setOpt('beam', v)}
              />
            </div>
            <div className="bg-cream-100/60 p-5 rounded-2xl border border-cream-200 flex flex-col justify-between">
              <Toggle
                label="Show attention map"
                hint="Overlay authentic Vision Transformer 8×8 CLS-to-patch attention heatmap"
                checked={opts.attention}
                onChange={v => setOpt('attention', v)}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
