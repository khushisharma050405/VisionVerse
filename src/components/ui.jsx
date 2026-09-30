import {MODEL} from '../services/captionService'
import {ArrowRight} from 'lucide-react'
export const Card=({className='',children})=><section className={`bg-white/80 border border-cream-200 rounded-2xl p-5 ${className}`}>{children}</section>
export const Toggle=({checked,onChange,label,hint})=>(
  <div className="flex items-center justify-between gap-3 py-2">
    <div><p className="text-sm">{label}</p>{hint&&<p className="text-xs text-ink/50">{hint}</p>}</div>
    <button role="switch" aria-checked={checked} aria-label={label} onClick={()=>onChange(!checked)}
      className={`w-10 h-6 rounded-full p-0.5 shrink-0 transition-colors ${checked?'bg-forest-700':'bg-cream-300'}`}>
      <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${checked?'translate-x-4':''}`}/></button>
  </div>)
export const Row=({k,v})=><div className="flex justify-between text-sm py-1.5"><span className="text-ink/60">{k}</span><span className="font-medium">{v}</span></div>
export function ModelPanel({maxLength}){return(
  <Card><h3 className="font-serif text-lg mb-2">Model information</h3>
    <Row k="Architecture" v={MODEL.architecture}/><Row k="Image encoder" v={MODEL.encoder}/><Row k="Dataset" v={MODEL.dataset}/>
    <Row k="Max caption length" v={`${maxLength||MODEL.maxLength} words`}/><Row k="Vocabulary size" v={MODEL.vocabulary}/></Card>)}
export const Flow=()=>(
  <div className="flex flex-wrap items-center gap-2 text-sm">
    {['Image','ViT Encoder','Features','Cross-Attn','Decoder','Caption'].map((s,i,a)=><span key={s} className="flex items-center gap-2">
      <span className="px-3 py-1.5 rounded-lg bg-forest-800 text-cream-100">{s}</span>{i<a.length-1&&<ArrowRight size={14} className="text-forest-600"/>}</span>)}
  </div>)
export const ago=t=>{const s=(Date.now()-t)/1000;if(s<60)return 'just now';if(s<3600)return `${Math.floor(s/60)} min ago`;if(s<86400)return `${Math.floor(s/3600)} hr ago`;return `${Math.floor(s/86400)} day${s>=172800?'s':''} ago`}
export const readFile=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)})
export const thumb=url=>new Promise(res=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas'),s=Math.min(1,320/i.width);c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.72))};i.onerror=()=>res(url);i.src=url})
