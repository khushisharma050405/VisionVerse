import { useState } from 'react'
import { RotateCcw, Trash2, Key, ExternalLink, CheckCircle2 } from 'lucide-react'
import { Card, Toggle } from '../components/ui'

export const DEFAULT_SETTINGS = {
  autoSave: true,
  beamWidth: 3,
  apiKey: '',
  defaults: { multiple: false, beam: false, attention: false },
}

export default function Settings({ settings, setSettings, historyCount, onClear }) {
  const [done, setDone] = useState('')
  const [showKey, setShowKey] = useState(false)

  const flash = m => {
    setDone(m)
    setTimeout(() => setDone(''), 2200)
  }

  const d = (k, v) => setSettings({ ...settings, defaults: { ...settings.defaults, [k]: v } })

  const handleKeyChange = val => {
    const trimmed = val.trim()
    setSettings({ ...settings, apiKey: trimmed })
    if (trimmed) {
      localStorage.setItem('visionverse_gemini_api_key', trimmed)
    } else {
      localStorage.removeItem('visionverse_gemini_api_key')
    }
  }

  return (
    <div className="animate-rise max-w-2xl">
      <h1 className="font-serif text-4xl">Settings</h1>
      <p className="mt-2 text-ink/60">Configure your VisionVerse multimodal engine and workspace preferences.</p>

      {/* AI Vision Engine Card */}
      <Card className="mt-6">
        <div className="flex items-center gap-2 mb-2">
          <Key size={18} className="text-forest-700" />
          <h3 className="font-serif text-lg">Google Gemini Vision Engine</h3>
        </div>
        <p className="text-sm text-ink/70">
          VisionVerse uses Google Gemini 1.5 Flash Vision for state-of-the-art caption accuracy and zero server memory limits.
        </p>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="gemini-key" className="text-xs font-semibold uppercase tracking-wider text-ink/70">
              Gemini API Key
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-forest-700 hover:underline flex items-center gap-1 font-medium"
            >
              Get free key (no credit card) <ExternalLink size={12} />
            </a>
          </div>

          <div className="relative">
            <input
              id="gemini-key"
              type={showKey ? 'text' : 'password'}
              placeholder="Paste your Gemini API key (AIzaSy...)"
              value={settings.apiKey || ''}
              onChange={e => handleKeyChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-600/20 bg-cream-50/50 text-sm font-mono text-ink placeholder:text-ink/30 outline-none pr-16"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/50 hover:text-ink font-sans"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-xs text-ink/60">
            {settings.apiKey ? (
              <span className="flex items-center gap-1 text-forest-700 font-medium">
                <CheckCircle2 size={13} /> Active in browser
              </span>
            ) : (
              <span>Tip: You can also set <code>GEMINI_API_KEY</code> in Render Environment Variables.</span>
            )}
          </div>
        </div>
      </Card>

      {/* Generation Defaults */}
      <Card className="mt-5">
        <h3 className="font-serif text-lg">Generation defaults</h3>
        <Toggle label="Multiple captions" checked={settings.defaults.multiple} onChange={v => d('multiple', v)} />
        <Toggle label="Beam search" checked={settings.defaults.beam} onChange={v => d('beam', v)} />
        <Toggle label="Attention map" checked={settings.defaults.attention} onChange={v => d('attention', v)} />
        <label className="block mt-3 text-sm">
          Beam width: <b>{settings.beamWidth}</b>
          <input
            type="range"
            min="1"
            max="5"
            value={settings.beamWidth}
            onChange={e => setSettings({ ...settings, beamWidth: +e.target.value })}
            className="w-full accent-forest-700 mt-1"
          />
        </label>
        <p className="text-xs text-ink/50 mt-2">Defaults apply the next time you open Generate.</p>
      </Card>

      {/* History Card */}
      <Card className="mt-5">
        <h3 className="font-serif text-lg">History</h3>
        <Toggle
          label="Save generated captions automatically"
          checked={settings.autoSave}
          onChange={v => setSettings({ ...settings, autoSave: v })}
        />
        <button
          disabled={!historyCount}
          onClick={() => {
            onClear()
            flash('History cleared')
          }}
          className="mt-3 flex items-center gap-2 text-sm px-3.5 py-2 rounded-xl border border-cream-300 hover:bg-cream-100 disabled:opacity-40 transition-colors"
        >
          <Trash2 size={14} />
          Clear {historyCount} saved caption{historyCount === 1 ? '' : 's'}
        </button>
      </Card>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={() => {
            setSettings(DEFAULT_SETTINGS)
            localStorage.removeItem('visionverse_gemini_api_key')
            flash('Settings reset to defaults')
          }}
          className="flex items-center gap-2 text-sm px-3.5 py-2 rounded-xl border border-cream-300 hover:bg-cream-100 transition-colors"
        >
          <RotateCcw size={14} />
          Reset to defaults
        </button>
        {done && (
          <p role="status" className="text-sm text-forest-700 font-medium animate-fade">
            {done}
          </p>
        )}
      </div>
    </div>
  )
}
