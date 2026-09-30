import { Card, Flow, Row } from '../components/ui'
import { MODEL } from '../services/captionService'
import { Sparkles, Eye, Layers, ShieldCheck, Accessibility, Search, GraduationCap, Compass, Cpu } from 'lucide-react'

export default function About() {
  return (
    <div className="animate-rise max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs tracking-wider uppercase text-forest-600 font-semibold mb-1">About the Project</p>
        <h1 className="font-serif text-4xl md:text-5xl text-ink">VisionVerse</h1>
        <p className="mt-3 text-ink/70 text-base md:text-lg leading-relaxed max-w-2xl">
          VisionVerse is an intelligent image caption generator designed to help computers understand and describe visual scenes in natural, human-readable English.
        </p>
      </div>

      {/* What is VisionVerse? */}
      <Card>
        <h2 className="font-serif text-xl mb-3 text-ink">What is VisionVerse?</h2>
        <p className="text-sm text-ink/70 leading-relaxed">
          VisionVerse bridges computer vision and natural language processing. By analyzing the visual content of any uploaded photograph or illustration, VisionVerse produces cohesive, contextual descriptions that capture objects, actions, and environmental context—turning pixels into meaningful words in seconds.
        </p>
      </Card>

      {/* Model Information */}
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-forest-100 text-forest-800">
            <Cpu size={18} />
          </div>
          <h2 className="font-serif text-xl text-ink">Model Information</h2>
        </div>
        <p className="text-xs text-ink/60 mb-4">Detailed technical specifications of the multimodal neural network:</p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0.5 divide-y sm:divide-y-0 divide-cream-200">
          <div className="space-y-0.5">
            <Row k="Architecture" v={MODEL.architecture} />
            <Row k="Vision Encoder" v={MODEL.encoder} />
            <Row k="Text Decoder" v="Autoregressive Cross-Attention" />
            <Row k="Pretraining Data" v={MODEL.dataset} />
          </div>
          <div className="space-y-0.5">
            <Row k="Max Output Length" v={`${MODEL.maxLength} tokens`} />
            <Row k="Vocabulary Size" v={`${MODEL.vocabulary} tokens`} />
            <Row k="Beam Width" v="5 candidate hypotheses" />
            <Row k="Backend Engine" v="PyTorch + FastAPI" />
          </div>
        </div>
      </Card>

      {/* How it works */}
      <Card>
        <h2 className="font-serif text-xl mb-2 text-ink">How it works</h2>
        <p className="text-xs text-ink/50 mb-4">The end-to-end multimodal pipeline from image input to descriptive sentence:</p>
        <div className="py-2">
          <Flow />
        </div>
        <div className="mt-5 grid sm:grid-cols-2 gap-3 text-xs text-ink/70 leading-relaxed">
          <div className="bg-cream-100/60 p-3.5 rounded-xl border border-cream-200">
            <b className="text-forest-800 block text-sm mb-1 font-serif">1. Image & Vision Encoder</b>
            The input photograph is divided into spatial patches and encoded into deep visual feature embeddings using a Vision Transformer (ViT-B).
          </div>
          <div className="bg-cream-100/60 p-3.5 rounded-xl border border-cream-200">
            <b className="text-forest-800 block text-sm mb-1 font-serif">2. Features & Language Generation</b>
            Cross-attention layers connect visual tokens to language representations, and an autoregressive text decoder predicts the final natural language caption.
          </div>
        </div>
      </Card>

      {/* Key features */}
      <Card>
        <h2 className="font-serif text-xl mb-4 text-ink">Key features</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-forest-100 text-forest-800 shrink-0 mt-0.5">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-medium text-sm text-ink">Real-Time Captioning</h3>
              <p className="text-xs text-ink/60 mt-1 leading-relaxed">Generates high-fidelity descriptions for any uploaded JPG, JPEG, PNG, or WEBP image.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-forest-100 text-forest-800 shrink-0 mt-0.5">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="font-medium text-sm text-ink">Alternative Hypotheses</h3>
              <p className="text-xs text-ink/60 mt-1 leading-relaxed">Explore multiple beam search interpretations of the same scene with ranked candidate captions.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-forest-100 text-forest-800 shrink-0 mt-0.5">
              <Eye size={18} />
            </div>
            <div>
              <h3 className="font-medium text-sm text-ink">Attention Visualization</h3>
              <p className="text-xs text-ink/60 mt-1 leading-relaxed">View the authentic Vision Transformer spatial attention map over the image to inspect focus regions.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-forest-100 text-forest-800 shrink-0 mt-0.5">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-medium text-sm text-ink">Local History & Privacy</h3>
              <p className="text-xs text-ink/60 mt-1 leading-relaxed">Generated captions and image thumbnails are stored privately in your browser's local storage.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Technology Stack */}
      <Card>
        <h2 className="font-serif text-xl mb-3 text-ink">Technology</h2>
        <p className="text-xs text-ink/60 mb-4">Built with modern, open-source deep learning and web frameworks:</p>
        <div className="flex flex-wrap gap-2">
          {['Python', 'PyTorch', 'Salesforce BLIP', 'Hugging Face Transformers', 'React', 'FastAPI', 'Tailwind CSS'].map(tech => (
            <span key={tech} className="px-3 py-1.5 rounded-lg bg-forest-900 text-cream-100 text-xs font-medium tracking-wide">
              {tech}
            </span>
          ))}
        </div>
      </Card>

      {/* Applications */}
      <Card>
        <h2 className="font-serif text-xl mb-4 text-ink">Applications</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-cream-200 bg-cream-50/60">
            <div className="flex items-center gap-2 mb-1.5">
              <Accessibility size={16} className="text-forest-700" />
              <h3 className="font-medium text-sm text-ink">Accessibility</h3>
            </div>
            <p className="text-xs text-ink/60 leading-relaxed">
              Provides automated alt-text for screen readers, allowing visually impaired users to perceive visual media across the web.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-cream-200 bg-cream-50/60">
            <div className="flex items-center gap-2 mb-1.5">
              <Compass size={16} className="text-forest-700" />
              <h3 className="font-medium text-sm text-ink">Assistive Technology</h3>
            </div>
            <p className="text-xs text-ink/60 leading-relaxed">
              Assists smart glasses, robotic aids, and wearable devices in describing physical surroundings in everyday situations.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-cream-200 bg-cream-50/60">
            <div className="flex items-center gap-2 mb-1.5">
              <Search size={16} className="text-forest-700" />
              <h3 className="font-medium text-sm text-ink">Image Search & Discovery</h3>
            </div>
            <p className="text-xs text-ink/60 leading-relaxed">
              Enables semantic text search over unlabelled photo libraries, archives, and digital asset management systems.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-cream-200 bg-cream-50/60">
            <div className="flex items-center gap-2 mb-1.5">
              <GraduationCap size={16} className="text-forest-700" />
              <h3 className="font-medium text-sm text-ink">Education & Multimodal Learning</h3>
            </div>
            <p className="text-xs text-ink/60 leading-relaxed">
              Supports automated learning tools, visual vocabulary builders, and multimodal storytelling platforms.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
