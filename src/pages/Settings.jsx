import { useState } from 'react'
import { RotateCcw, Trash2, Cpu } from 'lucide-react'
import { Card, Toggle } from '../components/ui'

export const DEFAULT_SETTINGS = {
  autoSave: true,
  beamWidth: 3,
  defaults: { multiple: false, beam: false, attention: false },
}

export default function Settings({ settings, setSettings, historyCount, onClear }) {
  const [done, setDone] = useState('')

  const flash = m => {
    setDone(m)
    setTimeout(() => setDone(''), 2200)
  }

  const d = (k, v) => setSettings({ ...settings, defaults: { ...settings.defaults, [k]: v } })

  return (
    <div className="animate-rise max-w-2xl">
      <h1 className="font-serif text-4xl">Settings</h1>
      <p className="mt-2 text-ink/60">Configure your VisionVerse neural vision engine and workspace preferences.</p>

      {/* Model Engine Information Card */}
      <Card className="mt-6">
        <div className="flex items-center gap-2 mb-2">
          <Cpu size={18} className="text-forest-700" />
          <h3 className="font-serif text-lg">Neural Vision Engine</h3>
        </div>
        <p className="text-sm text-ink/70">
          VisionVerse runs an on-device <b>Vision Transformer + GPT-2 (ViT-GPT2)</b> neural model fine-tuned on MS-COCO.
          Inference runs directly in your browser using optimized WebAssembly / WebGPU ONNX runtimes with zero external API dependencies.
        </p>
        <div className="mt-3 text-xs text-forest-800 bg-forest-50 p-2.5 rounded-lg border border-forest-200">
          ✓ 100% Free &amp; Offline-capable • Zero API keys required • Private and secure
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
