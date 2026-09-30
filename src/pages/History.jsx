import {useState} from 'react'
import {Search,Trash2,ExternalLink,History as H} from 'lucide-react'
import {Card,ago} from '../components/ui'
export default function History({history,onOpen,onDelete,onClear}){
  const [q,setQ]=useState(''),[confirm,setConfirm]=useState(false)
  const list=history.filter(h=>((h.result?.captions?.[0]?.text||h.result?.caption||'')+h.name+(h.result?.objects||[]).join(' ')).toLowerCase().includes(q.toLowerCase()))
  return(<div className="animate-rise">
    <h1 className="font-serif text-4xl">History</h1><p className="mt-2 text-ink/60">Captions you generated, saved in this browser.</p>
    <div className="mt-6 flex flex-wrap gap-3">
      <label className="flex-1 min-w-[200px] flex items-center gap-2 bg-white border border-cream-200 rounded-lg px-3"><Search size={16} className="text-ink/40"/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search captions or objects" aria-label="Search history" className="w-full py-2.5 bg-transparent outline-none text-sm"/></label>
      {history.length>0&&(confirm?<div className="flex gap-2 items-center text-sm"><span>Delete all {history.length}?</span>
        <button onClick={()=>{onClear();setConfirm(false)}} className="px-3 py-2 rounded-lg bg-red-800 text-white">Delete all</button>
        <button onClick={()=>setConfirm(false)} className="px-3 py-2 rounded-lg border border-cream-300">Cancel</button></div>
        :<button onClick={()=>setConfirm(true)} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-cream-300 hover:bg-cream-100"><Trash2 size={15}/>Clear history</button>)}
    </div>
    {list.length===0?<Card className="mt-6 text-center py-14 text-ink/50"><H className="mx-auto mb-2" size={28}/><p>{history.length?'No captions match your search.':'Nothing here yet. Generate a caption and it will be saved.'}</p></Card>
    :<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(h=>(
      <Card key={h.id} className="!p-3 flex flex-col">
        <img src={h.thumb} alt={h.name} className="aspect-[4/3] w-full object-cover rounded-lg"/>
        <p className="font-serif mt-3 flex-1">{h.result?.captions?.[0]?.text || h.result?.caption}</p>
        <p className="text-xs text-ink/50 mt-1">{ago(h.result.createdAt)} · {Math.round((h.result?.captions?.[0]?.confidence ?? h.result?.confidence ?? 0.85)*100)}% confidence</p>
        <div className="flex gap-2 mt-3">
          <button onClick={()=>onOpen(h)} className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-forest-800 hover:bg-forest-700 text-cream-100 py-2 rounded-lg"><ExternalLink size={14}/>Open</button>
          <button onClick={()=>onDelete(h.id)} aria-label="Delete entry" className="px-3 rounded-lg border border-cream-300 hover:bg-cream-100"><Trash2 size={15}/></button></div>
      </Card>))}</div>}
  </div>)}
